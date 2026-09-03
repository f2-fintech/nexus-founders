import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Founder from "@/models/Founder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all founders
export async function GET() {
  try {
    await connectDB();
    const founders = await Founder.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: founders });
  } catch (error: any) {
    console.error("Error in GET /api/founders:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch founders" },
      { status: 500 }
    );
  }
}

// POST create founder (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const count = await Founder.countDocuments();
    const founder = await Founder.create({ ...body, order: count + 1 });
    return NextResponse.json({ success: true, data: founder }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/founders:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create founder" },
      { status: 500 }
    );
  }
}