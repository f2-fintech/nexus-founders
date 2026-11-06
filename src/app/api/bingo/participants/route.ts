import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import BingoParticipant from "@/models/BingoParticipant";
import BingoConfig from "@/models/BingoConfig";
import BingoSession from "@/models/BingoSession";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    let sessionId = searchParams.get("sessionId");

    const config = await BingoConfig.findOne({ key: "sff_bingo_config" }).lean();

    // If no sessionId specified, default to activeSessionId (or latest session)
    if (!sessionId && config?.activeSessionId) {
      sessionId = config.activeSessionId.toString();
    }

    const query: any = {};

    if (sessionId && sessionId !== "all" && mongoose.isValidObjectId(sessionId)) {
      query.sessionId = new mongoose.Types.ObjectId(sessionId);
    }

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    const participants = await BingoParticipant.find(query)
      .sort({ completedCount: -1, timeTakenSeconds: 1, createdAt: -1 })
      .lean();

    // Scoped stats for the selected session
    const statMatch: any = {};
    if (query.sessionId) statMatch.sessionId = query.sessionId;

    const totalCount = await BingoParticipant.countDocuments(statMatch);
    const completedCount = await BingoParticipant.countDocuments({ ...statMatch, status: "completed" });
    const playingCount = await BingoParticipant.countDocuments({ ...statMatch, status: "playing" });

    // Count all scanned visiting cards across this session
    const cardsAgg = await BingoParticipant.aggregate([
      { $match: statMatch },
      { $unwind: "$tiles" },
      { $match: { "tiles.completed": true } },
      { $count: "total" },
    ]);
    const totalCardsScanned = cardsAgg[0]?.total || 0;

    // Fetch session details if specific session queried
    let selectedSession = null;
    if (query.sessionId) {
      selectedSession = await BingoSession.findById(query.sessionId).lean();
    }

    return NextResponse.json({
      success: true,
      participants,
      selectedSession,
      stats: {
        totalCount,
        completedCount,
        playingCount,
        totalCardsScanned,
      },
    });
  } catch (error: any) {
    console.error("GET admin bingo participants error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
