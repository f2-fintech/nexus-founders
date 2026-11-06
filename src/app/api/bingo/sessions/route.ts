import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import BingoSession from "@/models/BingoSession";
import BingoConfig from "@/models/BingoConfig";

export const dynamic = "force-dynamic";

// GET: List all sessions (for admin selector and historical reports)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const config = await BingoConfig.findOne({ key: "sff_bingo_config" }).lean();
    const sessions = await BingoSession.find({})
      .sort({ sessionNumber: -1 })
      .lean();

    const serializedSessions = sessions.map((s: any) => ({
      ...s,
      _id: s._id.toString(),
      sessionId: s._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      sessions: serializedSessions,
      activeSessionId: config?.activeSessionId ? config.activeSessionId.toString() : null,
      currentSessionNumber: config?.currentSessionNumber || 1,
    });
  } catch (error: any) {
    console.error("GET bingo sessions error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load sessions" },
      { status: 500 }
    );
  }
}
