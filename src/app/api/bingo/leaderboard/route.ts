import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BingoParticipant from "@/models/BingoParticipant";
import BingoConfig from "@/models/BingoConfig";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      const config = await BingoConfig.findOne({ key: "sff_bingo_config" }).lean();
      if (config?.activeSessionId) {
        sessionId = config.activeSessionId.toString();
      }
    }

    const query: any = { status: { $ne: "disqualified" } };
    if (sessionId && sessionId !== "all" && mongoose.isValidObjectId(sessionId)) {
      query.sessionId = new mongoose.Types.ObjectId(sessionId);
    }

    // Query participants, excluding heavy tile arrays for light-speed polling
    const participants = await BingoParticipant.find(
      query,
      {
        fullName: 1,
        companyName: 1,
        designation: 1,
        category: 1,
        completedCount: 1,
        progressPercent: 1,
        status: 1,
        startedAt: 1,
        completedAt: 1,
        timeTakenSeconds: 1,
        ownVisitingCardUrl: 1,
      }
    )
      .sort({
        completedCount: -1,
        timeTakenSeconds: 1,
        startedAt: 1,
      })
      .limit(50)
      .lean();

    // Custom sorting: Completed players ordered by fastest timeTakenSeconds
    const sorted = [...participants].sort((a: any, b: any) => {
      if (a.status === "completed" && b.status === "completed") {
        return (a.timeTakenSeconds || 999999) - (b.timeTakenSeconds || 999999);
      }
      if (a.status === "completed") return -1;
      if (b.status === "completed") return 1;
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }
      return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
    });

    const totalParticipants = await BingoParticipant.countDocuments(query);
    const totalCompleted = await BingoParticipant.countDocuments({ ...query, status: "completed" });

    // Aggregate total cards scanned across this session
    const cardsScannedAgg = await BingoParticipant.aggregate([
      { $match: query },
      { $unwind: "$tiles" },
      { $match: { "tiles.completed": true } },
      { $count: "total" },
    ]);
    const totalCardsScanned = cardsScannedAgg[0]?.total || 0;

    return NextResponse.json(
      {
        success: true,
        leaderboard: sorted,
        stats: {
          totalParticipants,
          totalCompleted,
          totalCardsScanned,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET bingo leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
