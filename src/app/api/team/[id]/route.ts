import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PUT: Update team member (Admin protected)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, designation, description, photo, socialLinks, order } = body;

    const updated = await TeamMember.findByIdAndUpdate(
      params.id,
      {
        name: name?.trim(),
        designation: designation?.trim(),
        description: description?.trim() || "",
        photo: photo?.trim(),
        socialLinks: socialLinks || {},
        ...(typeof order === "number" ? { order } : {}),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/team/[id] error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to update team member" }, { status: 500 });
  }
}

// DELETE: Delete team member (Admin protected)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const deleted = await TeamMember.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: params.id } });
  } catch (error: any) {
    console.error("DELETE /api/team/[id] error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete team member" }, { status: 500 });
  }
}
