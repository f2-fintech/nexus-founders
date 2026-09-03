import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import JoinSubmission from "@/models/JoinSubmission";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST create new submission
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const requiredFields = [
      "fullName",
      "companyName",
      "designation",
      "email",
      "challenges",
      "risks",
      "businessStage",
      "financialStatus",
      "milestone",
      "visionImpact",
      "uniqueStrengths",
      "supportNeeded",
      "valueContribution",
    ];

    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const submission = await JoinSubmission.create(body);
    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating join submission:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit form" },
      { status: 500 }
    );
  }
}

// GET all submissions (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const submissions = await JoinSubmission.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: submissions });
  } catch (error: any) {
    console.error("Error fetching join submissions:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
