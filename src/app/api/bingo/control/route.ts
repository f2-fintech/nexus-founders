import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import BingoConfig from "@/models/BingoConfig";
import BingoSession from "@/models/BingoSession";
import BingoParticipant, { IBingoTile } from "@/models/BingoParticipant";

export const dynamic = "force-dynamic";

async function getOrCreateConfigAndSession() {
  let config = await BingoConfig.findOne({ key: "sff_bingo_config" });
  if (!config) {
    config = await BingoConfig.create({
      key: "sff_bingo_config",
      isGameActive: true,
      gameState: "running",
      eventTitle: "SFF Nexus Networking Bingo",
      timeLimitMinutes: 120,
      allowRegistration: true,
      roundNumber: 1,
      currentSessionNumber: 1,
    });
  }

  // Ensure active session exists
  let activeSession: any = null;
  if (config.activeSessionId) {
    activeSession = await BingoSession.findById(config.activeSessionId);
  }

  if (!activeSession) {
    // Check if there are existing sessions
    activeSession = await BingoSession.findOne().sort({ sessionNumber: -1 });

    if (!activeSession) {
      // First session initialization
      activeSession = await BingoSession.create({
        sessionNumber: config.roundNumber || 1,
        title: `Game Session #${config.roundNumber || 1}`,
        status: config.gameState || "running",
        startedAt: new Date(),
        timeLimitMinutes: config.timeLimitMinutes || 120,
      });

      // Migrate any legacy participants without a sessionId to this initial session
      await BingoParticipant.updateMany(
        { sessionId: { $exists: false } },
        {
          $set: {
            sessionId: activeSession._id,
            sessionNumber: activeSession.sessionNumber,
          },
        }
      );
    }

    config.activeSessionId = activeSession._id;
    config.currentSessionNumber = activeSession.sessionNumber;
    await config.save();
  }

  return { config, activeSession };
}

// GET: Fetch game config and active session (polled by player devices and admin)
export async function GET() {
  try {
    await connectDB();
    const { config, activeSession } = await getOrCreateConfigAndSession();
    const configObj = config.toObject ? config.toObject() : { ...config };
    configObj.activeSessionId = activeSession?._id?.toString() || config.activeSessionId?.toString() || null;
    configObj.gameState = activeSession?.status || config.gameState;

    return NextResponse.json({
      success: true,
      config: configObj,
      activeSession,
      winner: activeSession?.winner || null,
      activeSessionId: activeSession?._id?.toString() || null,
    });
  } catch (error: any) {
    console.error("GET bingo control error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load config" },
      { status: 500 }
    );
  }
}

// POST: Admin game lifecycle controls
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { action, participantId, gameState, title } = body;

    const { config, activeSession } = await getOrCreateConfigAndSession();

    // 1. START NEW GAME (Archives old game with all data intact and creates fresh session)
    if (action === "start_new_game") {
      // Finalize current active session
      if (activeSession) {
        if (activeSession.status !== "stopped" && activeSession.status !== "completed") {
          activeSession.status = "completed";
          activeSession.endedAt = new Date();
        }

        // Tally final stats for the completed session
        const totalParticipants = await BingoParticipant.countDocuments({ sessionId: activeSession._id });
        const totalCompleted = await BingoParticipant.countDocuments({
          sessionId: activeSession._id,
          status: "completed",
        });
        const cardsAgg = await BingoParticipant.aggregate([
          { $match: { sessionId: activeSession._id } },
          { $unwind: "$tiles" },
          { $match: { "tiles.completed": true } },
          { $count: "total" },
        ]);
        activeSession.totalParticipants = totalParticipants;
        activeSession.totalCompleted = totalCompleted;
        activeSession.totalCardsScanned = cardsAgg[0]?.total || 0;
        await activeSession.save();
      }

      // Compute next session number
      const highestSession = await BingoSession.findOne().sort({ sessionNumber: -1 });
      const nextNumber = (highestSession?.sessionNumber || config.currentSessionNumber || 1) + 1;
      const sessionTitle = title && title.trim() ? title.trim() : `Game Session #${nextNumber}`;

      // Create brand new session with clean slate (0 participants)
      const newSession = await BingoSession.create({
        sessionNumber: nextNumber,
        title: sessionTitle,
        status: "running",
        startedAt: new Date(),
        timeLimitMinutes: config.timeLimitMinutes || 120,
        totalParticipants: 0,
        totalCompleted: 0,
        totalCardsScanned: 0,
      });

      // Update config pointer to point to new active session
      config.activeSessionId = newSession._id;
      config.currentSessionNumber = newSession.sessionNumber;
      config.roundNumber = newSession.sessionNumber;
      config.gameState = "running";
      config.isGameActive = true;
      await config.save();

      return NextResponse.json({
        success: true,
        message: `🎉 ${sessionTitle} is now LIVE with a clean slate! Previous game has been safely archived.`,
        config,
        activeSession: newSession,
      });
    }

    // 2. SET STATUS: "running" | "paused" | "stopped"
    if (action === "set_status") {
      const targetState = gameState as "running" | "paused" | "stopped";
      if (!["running", "paused", "stopped"].includes(targetState)) {
        return NextResponse.json(
          { success: false, error: "Invalid gameState. Must be 'running', 'paused', or 'stopped'." },
          { status: 400 }
        );
      }

      config.gameState = targetState;
      config.isGameActive = targetState === "running";
      await config.save();

      if (activeSession) {
        activeSession.status = targetState;
        if (targetState === "stopped") {
          activeSession.endedAt = new Date();
        }
        await activeSession.save();
      }

      const label = targetState === "running" ? "STARTED & LIVE" : targetState === "paused" ? "PAUSED" : "STOPPED";
      return NextResponse.json({
        success: true,
        message: `Nexus Bingo (${activeSession?.title || "Session"}) is now ${label}`,
        config,
        activeSession,
      });
    }

    // 3. DECLARE MULTIPLE WINNERS (Admin selection)
    if (action === "declare_winners" || action === "declare_winner") {
      const participantIds: string[] = Array.isArray(body.participantIds)
        ? body.participantIds
        : participantId
        ? [participantId]
        : [];

      if (!participantIds || participantIds.length === 0) {
        return NextResponse.json({ success: false, error: "No participant IDs provided" }, { status: 400 });
      }

      const targetSessionId = body.sessionId || activeSession?._id;
      const targetSession = targetSessionId
        ? await BingoSession.findById(targetSessionId)
        : activeSession;

      // Find participants
      const participants = await BingoParticipant.find({
        _id: { $in: participantIds },
      });

      if (!participants || participants.length === 0) {
        return NextResponse.json({ success: false, error: "No matching participants found" }, { status: 404 });
      }

      // Mark participants as winners
      const updatedWinners: any[] = [];
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        p.isWinner = true;
        p.winnerRank = i + 1;
        await p.save();

        updatedWinners.push({
          participantId: p._id,
          fullName: p.fullName,
          email: p.email,
          companyName: p.companyName || "",
          designation: p.designation || "",
          completedAt: p.completedAt || new Date(),
          timeTakenSeconds: p.timeTakenSeconds || 0,
          cardPhotoUrl: p.ownVisitingCardUrl || "",
          rank: i + 1,
          emailSent: !!p.winnerEmailSentAt,
          emailSentAt: p.winnerEmailSentAt,
        });
      }

      if (targetSession) {
        // Save winners array in the session
        targetSession.winners = updatedWinners as any;
        if (updatedWinners.length > 0) {
          targetSession.winner = updatedWinners[0]; // backward compatibility
        }
        await targetSession.save();
      }

      // Optionally send emails immediately if requested
      let emailsSent = 0;
      let emailErrors: string[] = [];
      if (body.sendEmailNow) {
        const { sendWinnerEmail } = await import("@/lib/mailer");
        for (const w of updatedWinners) {
          if (w.email) {
            const res = await sendWinnerEmail({
              to: w.email,
              fullName: w.fullName,
              rank: w.rank,
              sessionTitle: targetSession?.title,
            });
            if (res.success) {
              emailsSent++;
              await BingoParticipant.findByIdAndUpdate(w.participantId, {
                $set: { winnerEmailSentAt: new Date() },
              });
              w.emailSent = true;
              w.emailSentAt = new Date();
            } else if (res.error) {
              emailErrors.push(`${w.email}: ${res.error}`);
            }
          }
        }
        if (targetSession) {
          targetSession.winners = updatedWinners as any;
          await targetSession.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: `🏆 Successfully declared ${updatedWinners.length} winner(s)!${
          body.sendEmailNow ? ` Sent ${emailsSent} email(s).` : ""
        }`,
        winners: updatedWinners,
        emailsSent,
        emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
        activeSession: targetSession,
      });
    }

    // 3B. SEND WINNER EMAILS EXPLICITLY (Manual trigger by Admin)
    if (action === "send_winner_emails") {
      const targetSessionId = body.sessionId || activeSession?._id;
      const targetSession = targetSessionId
        ? await BingoSession.findById(targetSessionId)
        : activeSession;

      const participantIds: string[] = Array.isArray(body.participantIds)
        ? body.participantIds
        : [];

      const query: any = { isWinner: true };
      if (participantIds.length > 0) {
        query._id = { $in: participantIds };
      } else if (targetSession?._id) {
        query.sessionId = targetSession._id;
      }

      const winners = await BingoParticipant.find(query);
      if (winners.length === 0) {
        return NextResponse.json(
          { success: false, error: "No declared winners found to send emails to." },
          { status: 404 }
        );
      }

      const { sendWinnerEmail } = await import("@/lib/mailer");
      let sentCount = 0;
      const errors: string[] = [];

      for (const w of winners) {
        if (!w.email) continue;
        const res = await sendWinnerEmail({
          to: w.email,
          fullName: w.fullName,
          rank: w.winnerRank,
          sessionTitle: targetSession?.title,
        });

        if (res.success) {
          sentCount++;
          w.winnerEmailSentAt = new Date();
          await w.save();
        } else {
          errors.push(`${w.email}: ${res.error}`);
        }
      }

      // Sync session winners list
      if (targetSession && targetSession.winners) {
        targetSession.winners = targetSession.winners.map((sw: any) => {
          const match = winners.find((w) => w._id.toString() === sw.participantId?.toString());
          if (match && match.winnerEmailSentAt) {
            return {
              ...sw,
              emailSent: true,
              emailSentAt: match.winnerEmailSentAt,
            };
          }
          return sw;
        });
        await targetSession.save();
      }

      return NextResponse.json({
        success: true,
        message: `📧 Sent winner notifications to ${sentCount}/${winners.length} winners.`,
        sentCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    // 4. RESET SINGLE PLAYER (within current session)
    if (action === "reset_player" && participantId) {
      const resetTiles: IBingoTile[] = Array.from({ length: 20 }, (_, i) => ({
        tileNumber: i + 1,
        completed: false,
        cardPhotoUrl: "",
        contactName: "",
        contactCompany: "",
      }));

      const player = await BingoParticipant.findByIdAndUpdate(
        participantId,
        {
          $set: {
            tiles: resetTiles,
            completedCount: 0,
            progressPercent: 0,
            status: "playing",
            startedAt: new Date(),
            completedAt: null,
            timeTakenSeconds: 0,
          },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: `Player ${player?.fullName}'s game has been reset to 0/20.`,
        player,
      });
    }

    // 5. WIPE TEST ENTRIES (Current session or all)
    if (action === "wipe_session") {
      const count = await BingoParticipant.countDocuments({ sessionId: activeSession._id });
      await BingoParticipant.deleteMany({ sessionId: activeSession._id });
      if (activeSession) {
        activeSession.winner = null as any;
        activeSession.totalParticipants = 0;
        activeSession.totalCompleted = 0;
        activeSession.totalCardsScanned = 0;
        await activeSession.save();
      }
      return NextResponse.json({
        success: true,
        message: `Wiped all ${count} participant test entries for ${activeSession?.title}. Ready for live game!`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST bingo control error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Control action failed" },
      { status: 500 }
    );
  }
}
