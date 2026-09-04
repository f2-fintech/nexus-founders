import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SiteContent from "@/models/SiteContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all site content
export async function GET() {
  try {
    await connectDB();
    // Only fetch key+value — client never needs type/section/label/updatedBy
    const content = await SiteContent.find({}).select("key value").lean();
    const map: Record<string, string> = {};
    content.forEach((c: any) => { map[c.key] = c.value; });
    const response = NextResponse.json({ success: true, data: map });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to fetch content" }, { status: 500 });
  }
}

// PUT update site content (admin only)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json(); // { key, value }
    const updated = await SiteContent.findOneAndUpdate(
      { key: body.key },
      { value: body.value, updatedBy: session.user?.email },
      { new: true, upsert: true }
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update content" }, { status: 500 });
  }
}