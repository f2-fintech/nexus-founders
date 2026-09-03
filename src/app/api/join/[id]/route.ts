import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import JoinSubmission from "@/models/JoinSubmission";

export const dynamic = "force-dynamic";

// GET single submission by ID (for edit response mode)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const submission = await JoinSubmission.findById(params.id).lean();
    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

// PUT update existing submission by ID (for edit response)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();

    const updated = await JoinSubmission.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update response" },
      { status: 500 }
    );
  }
}
