import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Founder from "@/models/Founder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { invalidateFoundersCache } from "@/lib/foundersCache";

export const dynamic = "force-dynamic";

function isAdmin(session: any) {
  return session && session.user?.role === "admin";
}

// PUT update founder
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const body = await req.json();
    const founder = await Founder.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!founder) return NextResponse.json({ success: false, error: "Founder not found" }, { status: 404 });
    invalidateFoundersCache();
    return NextResponse.json({ success: true, data: founder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update founder" }, { status: 500 });
  }
}

// DELETE founder (permanently remove from database)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const deleted = await Founder.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ success: false, error: "Founder not found" }, { status: 404 });
    invalidateFoundersCache();
    return NextResponse.json({ success: true, message: "Founder deleted from database", data: { _id: params.id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete founder" }, { status: 500 });
  }
}