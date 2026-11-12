import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MatchPointSubmission from "@/models/MatchPointSubmission";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Helper: Check admin authorization
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return false;
  }
  return true;
}

// GET: Admin list with search, filter, and analytics
export async function GET(req: NextRequest) {
  try {
    const isAuthed = await checkAdminAuth();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const needCategory = searchParams.get("needCategory")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const filter: Record<string, any> = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (needCategory && needCategory !== "all") {
      filter.needCategories = needCategory;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { matchPointId: regex },
        { fullName: regex },
        { email: regex },
        { companyName: regex },
        { designation: regex },
        { aboutCompany: regex },
        { lookingForDetails: regex },
        { keywords: regex },
        { usps: regex },
        { city: regex },
      ];
    }

    const submissions = await MatchPointSubmission.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate aggregated statistics
    const all = await MatchPointSubmission.find({}, { status: 1, needCategories: 1 }).lean();
    const stats = {
      total: all.length,
      pending: all.filter((s) => s.status === "pending").length,
      analyzed: all.filter((s) => s.status === "analyzed").length,
      matched: all.filter((s) => s.status === "matched").length,
      emailed: all.filter((s) => s.status === "emailed").length,
      archived: all.filter((s) => s.status === "archived").length,
    };

    // Calculate top needs breakdown
    const needFreq: Record<string, number> = {};
    all.forEach((s) => {
      s.needCategories?.forEach((cat: string) => {
        needFreq[cat] = (needFreq[cat] || 0) + 1;
      });
    });

    const topNeeds = Object.entries(needFreq)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      submissions,
      stats,
      topNeeds,
    });
  } catch (error: any) {
    console.error("GET MatchPoint admin error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch MatchPoint data" },
      { status: 500 }
    );
  }
}

// PATCH: Update status, match partner, or admin notes
export async function PATCH(req: NextRequest) {
  try {
    const isAuthed = await checkAdminAuth();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { id, status, adminNotes, addMatch, removeMatchIndex } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Submission ID is required" }, { status: 400 });
    }

    const submission = await MatchPointSubmission.findById(id);
    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    if (status) {
      submission.status = status;
    }

    if (adminNotes !== undefined) {
      submission.adminNotes = adminNotes;
    }

    // Add matched partner
    if (addMatch && addMatch.companyName) {
      submission.matchedWith.push({
        submissionId: addMatch.submissionId || undefined,
        companyName: addMatch.companyName,
        contactName: addMatch.contactName || "",
        email: addMatch.email || "",
        phone: addMatch.phone || "",
        matchedCategory: addMatch.matchedCategory || "General Match",
        notes: addMatch.notes || "",
        matchedAt: new Date(),
      });
      // Automatically advance status to matched if it's currently pending
      if (submission.status === "pending" || submission.status === "analyzed") {
        submission.status = "matched";
      }
    }

    // Remove matched partner by index
    if (typeof removeMatchIndex === "number" && removeMatchIndex >= 0) {
      submission.matchedWith.splice(removeMatchIndex, 1);
      if (submission.matchedWith.length === 0 && submission.status === "matched") {
        submission.status = "pending";
      }
    }

    await submission.save();

    return NextResponse.json({
      success: true,
      submission,
      message: "Submission updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH MatchPoint admin error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update MatchPoint submission" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a submission
export async function DELETE(req: NextRequest) {
  try {
    const isAuthed = await checkAdminAuth();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await MatchPointSubmission.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Submission deleted" });
  } catch (error: any) {
    console.error("DELETE MatchPoint admin error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete submission" },
      { status: 500 }
    );
  }
}
