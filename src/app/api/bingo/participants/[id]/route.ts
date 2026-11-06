import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import BingoParticipant from "@/models/BingoParticipant";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { status } = body;

    const participant = await BingoParticipant.findByIdAndUpdate(
      params.id,
      { $set: { status } },
      { new: true }
    );

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, participant });
  } catch (error: any) {
    console.error("PATCH admin bingo participant error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update participant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const participant = await BingoParticipant.findByIdAndDelete(params.id);

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Participant removed successfully" });
  } catch (error: any) {
    console.error("DELETE admin bingo participant error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete participant" },
      { status: 500 }
    );
  }
}
