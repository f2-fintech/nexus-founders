import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UpcomingEvent from "@/models/UpcomingEvent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all active events — public
export async function GET() {
  try {
    await connectDB();
    const events = await UpcomingEvent.find({ isActive: true })
      .sort({ eventDate: 1 })
      .lean();
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST create event — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const count = await UpcomingEvent.countDocuments();
    const event = await UpcomingEvent.create({ ...body, order: count + 1 });
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
