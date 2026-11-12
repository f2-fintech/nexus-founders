import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MatchPointSubmission from "@/models/MatchPointSubmission";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { evaluateMatch, findBestMatchesForSubmission } from "@/lib/matchmaking";
import { sendMatchIntroductionEmail } from "@/lib/mailer";

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
    const { id, status, adminNotes, addMatch, removeMatchIndex, resendEmailIndex } = body;

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
    let emailDispatched = false;
    let emailError: string | undefined;

    if (addMatch && addMatch.companyName) {
      const matchScore = addMatch.matchScore || 60;
      const matchPercentage = addMatch.matchPercentage || 88;
      const matchReason = addMatch.matchReason || `Strategic alignment in ${addMatch.matchedCategory || "Partnership"}`;
      const partnerEmail = (addMatch.email || "").trim();

      let emailSent = false;
      let emailSentAt: Date | undefined;

      // Dispatch introduction email if enabled and emails are present
      if (addMatch.sendEmailNow !== false && partnerEmail && submission.email) {
        const mailRes = await sendMatchIntroductionEmail({
          seeker: {
            fullName: submission.fullName,
            email: submission.email,
            companyName: submission.companyName,
            designation: submission.designation,
            phone: submission.phone,
            city: submission.city,
            linkedinUrl: submission.linkedinUrl,
            websiteUrl: submission.websiteUrl,
            aboutCompany: submission.aboutCompany,
            lookingForDetails: submission.lookingForDetails,
          },
          provider: {
            fullName: addMatch.contactName || addMatch.companyName,
            email: partnerEmail,
            companyName: addMatch.companyName,
            designation: addMatch.designation || "Leadership Team",
            phone: addMatch.phone,
            city: addMatch.city,
            linkedinUrl: addMatch.linkedinUrl,
            aboutCompany: addMatch.aboutCompany || addMatch.notes,
          },
          matchedCategory: addMatch.matchedCategory || "General Match",
          matchPercentage,
          matchReason,
          customNotes: addMatch.notes || "",
        });

        if (mailRes.success) {
          emailSent = true;
          emailSentAt = new Date();
          emailDispatched = true;
        } else {
          emailError = mailRes.error;
          console.warn("Match intro email warning:", mailRes.error);
        }
      }

      submission.matchedWith.push({
        submissionId: addMatch.submissionId || undefined,
        companyName: addMatch.companyName,
        contactName: addMatch.contactName || "",
        email: partnerEmail,
        phone: addMatch.phone || "",
        matchedCategory: addMatch.matchedCategory || "General Match",
        matchScore,
        matchPercentage,
        matchReason,
        notes: addMatch.notes || "",
        emailSent,
        emailSentAt,
        matchedAt: new Date(),
      });

      // Update status to emailed if email was sent, or matched
      submission.status = emailSent ? "emailed" : "matched";

      // If partner is also a registered submission in DB, reciprocally link them!
      if (addMatch.submissionId) {
        try {
          const partnerSub = await MatchPointSubmission.findById(addMatch.submissionId);
          if (partnerSub) {
            const alreadyLinked = partnerSub.matchedWith.some(
              (m) => m.submissionId?.toString() === submission._id.toString()
            );
            if (!alreadyLinked) {
              partnerSub.matchedWith.push({
                submissionId: submission._id,
                companyName: submission.companyName,
                contactName: submission.fullName,
                email: submission.email,
                phone: submission.phone || "",
                matchedCategory: addMatch.matchedCategory || "General Match",
                matchScore,
                matchPercentage,
                matchReason,
                notes: addMatch.notes || "",
                emailSent,
                emailSentAt,
                matchedAt: new Date(),
              });
              partnerSub.status = emailSent ? "emailed" : "matched";
              await partnerSub.save();
            }
          }
        } catch (recipErr) {
          console.error("Failed to link reciprocal partner:", recipErr);
        }
      }
    }

    // Resend email for an existing match
    if (typeof resendEmailIndex === "number" && resendEmailIndex >= 0 && submission.matchedWith[resendEmailIndex]) {
      const match = submission.matchedWith[resendEmailIndex];
      if (match.email && submission.email) {
        const mailRes = await sendMatchIntroductionEmail({
          seeker: {
            fullName: submission.fullName,
            email: submission.email,
            companyName: submission.companyName,
            designation: submission.designation,
            phone: submission.phone,
            city: submission.city,
            linkedinUrl: submission.linkedinUrl,
            aboutCompany: submission.aboutCompany,
            lookingForDetails: submission.lookingForDetails,
          },
          provider: {
            fullName: match.contactName || match.companyName,
            email: match.email,
            companyName: match.companyName,
            designation: "Executive Contact",
            phone: match.phone,
            aboutCompany: match.notes,
          },
          matchedCategory: match.matchedCategory,
          matchPercentage: match.matchPercentage || 88,
          matchReason: match.matchReason,
          customNotes: match.notes,
        });

        if (mailRes.success) {
          match.emailSent = true;
          match.emailSentAt = new Date();
          submission.status = "emailed";
          emailDispatched = true;
        } else {
          emailError = mailRes.error;
        }
      }
    }

    // Remove matched partner by index
    if (typeof removeMatchIndex === "number" && removeMatchIndex >= 0) {
      submission.matchedWith.splice(removeMatchIndex, 1);
      if (submission.matchedWith.length === 0 && (submission.status === "matched" || submission.status === "emailed")) {
        submission.status = "pending";
      }
    }

    await submission.save();

    return NextResponse.json({
      success: true,
      submission,
      emailDispatched,
      emailError,
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

// POST: Run automated matchmaking across submissions or candidate recommendations
export async function POST(req: NextRequest) {
  try {
    const isAuthed = await checkAdminAuth();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { action, targetId, minPercentage = 75, sendEmails = true } = body;

    // Action 1: Get live ranked candidates for a specific submission
    if (action === "get_candidates") {
      if (!targetId) {
        return NextResponse.json({ success: false, error: "targetId is required" }, { status: 400 });
      }

      const target = await MatchPointSubmission.findById(targetId);
      if (!target) {
        return NextResponse.json({ success: false, error: "Target submission not found" }, { status: 404 });
      }

      const pool = await MatchPointSubmission.find({ _id: { $ne: target._id } }).lean();
      const candidates = findBestMatchesForSubmission(target, pool as any, 6, minPercentage);

      return NextResponse.json({
        success: true,
        candidates: candidates.map((c) => ({
          _id: c.candidate._id,
          companyName: c.candidate.companyName,
          fullName: c.candidate.fullName,
          designation: c.candidate.designation,
          email: c.candidate.email,
          phone: c.candidate.phone,
          category: c.candidate.category,
          aboutCompany: c.candidate.aboutCompany,
          usps: c.candidate.usps,
          needCategories: c.candidate.needCategories,
          lookingForDetails: c.candidate.lookingForDetails,
          matchPercentage: c.evaluation.percentage,
          matchScore: c.evaluation.score,
          matchedCategory: c.evaluation.matchedCategory,
          matchReason: c.evaluation.reason,
          isMutual: c.evaluation.isMutual,
        })),
      });
    }

    // Action 2: Run bulk auto-match across all unmatched submissions
    if (action === "run_automatch") {
      const allSubmissions = await MatchPointSubmission.find({}).sort({ createdAt: -1 });
      const matchedPairs: Array<{
        seekerCompany: string;
        providerCompany: string;
        percentage: number;
        category: string;
        emailSent: boolean;
      }> = [];

      let totalEmailed = 0;

      // Filter submissions that don't have matches yet
      for (const target of allSubmissions) {
        if (target.matchedWith && target.matchedWith.length > 0) continue;

        const bestMatches = findBestMatchesForSubmission(target, allSubmissions, 1, minPercentage);
        if (bestMatches.length > 0) {
          const { candidate: partner, evaluation } = bestMatches[0];

          let emailSent = false;
          let emailSentAt: Date | undefined;

          if (sendEmails && target.email && partner.email) {
            const mailRes = await sendMatchIntroductionEmail({
              seeker: {
                fullName: target.fullName,
                email: target.email,
                companyName: target.companyName,
                designation: target.designation,
                phone: target.phone,
                city: target.city,
                linkedinUrl: target.linkedinUrl,
                websiteUrl: target.websiteUrl,
                aboutCompany: target.aboutCompany,
                lookingForDetails: target.lookingForDetails,
              },
              provider: {
                fullName: partner.fullName,
                email: partner.email,
                companyName: partner.companyName,
                designation: partner.designation,
                phone: partner.phone,
                city: partner.city,
                linkedinUrl: partner.linkedinUrl,
                aboutCompany: partner.aboutCompany,
                usps: partner.usps,
              },
              matchedCategory: evaluation.matchedCategory,
              matchPercentage: evaluation.percentage,
              matchReason: evaluation.reason,
            });

            if (mailRes.success) {
              emailSent = true;
              emailSentAt = new Date();
              totalEmailed++;
            }
          }

          // Link Partner to Target
          target.matchedWith.push({
            submissionId: partner._id,
            companyName: partner.companyName,
            contactName: partner.fullName,
            email: partner.email,
            phone: partner.phone || "",
            matchedCategory: evaluation.matchedCategory,
            matchScore: evaluation.score,
            matchPercentage: evaluation.percentage,
            matchReason: evaluation.reason,
            emailSent,
            emailSentAt,
            matchedAt: new Date(),
          });
          target.status = emailSent ? "emailed" : "matched";
          await target.save();

          // Bilateral link: Target to Partner
          partner.matchedWith.push({
            submissionId: target._id,
            companyName: target.companyName,
            contactName: target.fullName,
            email: target.email,
            phone: target.phone || "",
            matchedCategory: evaluation.matchedCategory,
            matchScore: evaluation.score,
            matchPercentage: evaluation.percentage,
            matchReason: evaluation.reason,
            emailSent,
            emailSentAt,
            matchedAt: new Date(),
          });
          partner.status = emailSent ? "emailed" : "matched";
          await partner.save();

          matchedPairs.push({
            seekerCompany: target.companyName,
            providerCompany: partner.companyName,
            percentage: evaluation.percentage,
            category: evaluation.matchedCategory,
            emailSent,
          });
        }
      }

      return NextResponse.json({
        success: true,
        matchedCount: matchedPairs.length,
        emailedCount: totalEmailed,
        pairs: matchedPairs,
        message: `Successfully connected ${matchedPairs.length} business pair(s) with ${totalEmailed} introduction email(s) dispatched.`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST MatchPoint admin error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process matchmaking request" },
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
