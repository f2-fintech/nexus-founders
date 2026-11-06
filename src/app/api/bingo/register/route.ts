import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BingoParticipant, { IBingoTile } from "@/models/BingoParticipant";
import BingoConfig from "@/models/BingoConfig";
import BingoSession from "@/models/BingoSession";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET: Fetch or restore participant session by token
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const participant = await BingoParticipant.findOne({ sessionToken: token }).lean();
    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participant session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, participant });
  } catch (error: any) {
    console.error("GET bingo registration error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

// POST: Register new participant or restore in CURRENT active session
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check config and active session
    let config = await BingoConfig.findOne({ key: "sff_bingo_config" });
    if (!config) {
      config = await BingoConfig.create({
        key: "sff_bingo_config",
        isGameActive: true,
        gameState: "running",
        currentSessionNumber: 1,
      });
    }

    // Resolve active session
    let activeSession = null;
    if (config.activeSessionId) {
      activeSession = await BingoSession.findById(config.activeSessionId);
    }
    if (!activeSession) {
      activeSession = await BingoSession.findOne().sort({ sessionNumber: -1 });
      if (!activeSession) {
        activeSession = await BingoSession.create({
          sessionNumber: config.currentSessionNumber || 1,
          title: `Game Session #${config.currentSessionNumber || 1}`,
          status: "running",
          startedAt: new Date(),
        });
      }
      config.activeSessionId = activeSession._id;
      config.currentSessionNumber = activeSession.sessionNumber;
      await config.save();
    }

    // If game or session is stopped
    if (config.gameState === "stopped" || activeSession.status === "stopped") {
      return NextResponse.json(
        {
          success: false,
          error: "No game is currently in process. Please wait for organizers to start the round!",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      fullName,
      email,
      designation,
      companyName,
      category,
      ownVisitingCardUrl,
    } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: "Name and Email are required to play Nexus Bingo" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if player already registered in THIS active game session
    let participant = await BingoParticipant.findOne({
      email: cleanEmail,
      sessionId: activeSession._id,
    });

    if (participant) {
      // Restore player for current game session
      return NextResponse.json({
        success: true,
        participant,
        sessionId: activeSession._id.toString(),
        sessionNumber: activeSession.sessionNumber,
        resumed: true,
        message: "Welcome back! Your game session for this round has been restored.",
      });
    }

    // Initialize 20 challenge tiles
    const initialTiles: IBingoTile[] = Array.from({ length: 20 }, (_, i) => ({
      tileNumber: i + 1,
      completed: false,
      cardPhotoUrl: "",
      contactName: "",
      contactCompany: "",
    }));

    // Generate unique session token
    const sessionToken = crypto.randomBytes(24).toString("hex");

    participant = await BingoParticipant.create({
      sessionId: activeSession._id,
      sessionNumber: activeSession.sessionNumber,
      fullName: fullName.trim(),
      email: cleanEmail,
      designation: (designation || "").trim(),
      companyName: (companyName || "").trim(),
      category: category || "Visitor",
      ownVisitingCardUrl: ownVisitingCardUrl || "",
      sessionToken,
      status: "playing",
      startedAt: new Date(),
      completedCount: 0,
      progressPercent: 0,
      tiles: initialTiles,
    });

    // Update session participant counter
    activeSession.totalParticipants = (activeSession.totalParticipants || 0) + 1;
    await activeSession.save();

    return NextResponse.json({
      success: true,
      participant,
      sessionId: activeSession._id.toString(),
      sessionNumber: activeSession.sessionNumber,
      resumed: false,
      message: `Registration successful! Welcome to ${activeSession.title}. Timer started.`,
    });
  } catch (error: any) {
    console.error("POST bingo registration error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to register participant" },
      { status: 500 }
    );
  }
}
