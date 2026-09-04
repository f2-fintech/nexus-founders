import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UpcomingEvent from "@/models/UpcomingEvent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all events including inactive — admin only
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const events = await UpcomingEvent.find({}).sort({ eventDate: 1 }).lean();
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}
