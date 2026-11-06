import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BingoParticipant from "@/models/BingoParticipant";
import BingoConfig from "@/models/BingoConfig";
import BingoSession from "@/models/BingoSession";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    // Check if game is active
    const config = await BingoConfig.findOne({ key: "sff_bingo_config" });
    if (config && (!config.isGameActive || config.gameState !== "running")) {
      return NextResponse.json(
        {
          success: false,
          error:
            config.gameState === "stopped"
              ? "No game is currently in process."
              : "Nexus Bingo is currently paused. Please wait for the round to resume!",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { sessionToken, participantId, tileNumber, cardPhotoUrl, contactName, contactCompany } = body;

    if (!sessionToken && !participantId) {
      return NextResponse.json(
        { success: false, error: "Session token or participant ID is required" },
        { status: 400 }
      );
    }

    if (!tileNumber || tileNumber < 1 || tileNumber > 20) {
      return NextResponse.json(
        { success: false, error: "Valid tile number (1-20) is required" },
        { status: 400 }
      );
    }

    if (!cardPhotoUrl) {
      return NextResponse.json(
        { success: false, error: "Scanned visiting card photo is required to complete this challenge" },
        { status: 400 }
      );
    }

    const query = sessionToken ? { sessionToken } : { _id: participantId };
    const participant = await BingoParticipant.findOne(query);

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participant not found" },
        { status: 404 }
      );
    }

    // Find the specific tile
    const tileIndex = participant.tiles.findIndex((t) => t.tileNumber === Number(tileNumber));
    if (tileIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Tile #${tileNumber} does not exist` },
        { status: 404 }
      );
    }

    // Update tile details
    participant.tiles[tileIndex].completed = true;
    participant.tiles[tileIndex].cardPhotoUrl = cardPhotoUrl;
    participant.tiles[tileIndex].contactName = contactName || "";
    participant.tiles[tileIndex].contactCompany = contactCompany || "";
    participant.tiles[tileIndex].completedAt = new Date();

    // Recalculate completed count and progress %
    const completedCount = participant.tiles.filter((t) => t.completed).length;
    participant.completedCount = completedCount;
    participant.progressPercent = Math.round((completedCount / 20) * 100);

    let justWon = false;
    let isSessionWinner = false;

    // Check if player completed all 20 tiles!
    if (completedCount === 20 && participant.status !== "completed") {
      participant.status = "completed";
      const now = new Date();
      participant.completedAt = now;
      const startMs = new Date(participant.startedAt).getTime();
      participant.timeTakenSeconds = Math.max(1, Math.round((now.getTime() - startMs) / 1000));
      justWon = true;

      // Track session total completed count
      if (participant.sessionId) {
        const session = await BingoSession.findById(participant.sessionId);
        if (session) {
          session.totalCompleted = (session.totalCompleted || 0) + 1;
          await session.save();
        }
      }
    }

    await participant.save();

    return NextResponse.json({
      success: true,
      participant,
      tileNumber,
      completedCount,
      progressPercent: participant.progressPercent,
      justWon,
      isSessionWinner,
    });
  } catch (error: any) {
    console.error("PATCH bingo tile error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update tile" },
      { status: 500 }
    );
  }
}
