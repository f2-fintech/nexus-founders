import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UpcomingEvent from "@/models/UpcomingEvent";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Revalidate every 60 seconds — events rarely change
export const revalidate = 60;

// GET all active events — public
export async function GET() {
  try {
    await connectDB();
    const events = await UpcomingEvent.find({ isActive: true })
      .select("title day month eventDate desc address btnText registrationLink")
      .sort({ eventDate: 1 })
      .lean();

    const response = NextResponse.json({ success: true, data: events });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
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
