import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MatchPointSubmission from "@/models/MatchPointSubmission";
import { findBestMatchesForSubmission } from "@/lib/matchmaking";
import { sendMatchIntroductionEmail } from "@/lib/mailer";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Helper to generate a clean MatchPoint ID
function generateMatchPointId(): string {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `MP-26-${code}`;
}

// Helper to extract keywords from text and tags
function extractKeywords(texts: string[], existingTags: string[] = []): string[] {
  const stopWords = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't",
    "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself",
    "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not",
    "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
    "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
    "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're",
    "you've", "your", "yours", "yourself", "yourselves", "help", "need", "looking", "want", "provide", "services"
  ]);

  const set = new Set<string>();

  existingTags.forEach((t) => {
    const clean = t.trim().toLowerCase();
    if (clean && clean.length > 2) set.add(clean);
  });

  texts.forEach((txt) => {
    if (!txt) return;
    const words = txt
      .toLowerCase()
      .replace(/[^a-z0-9+#]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
    words.forEach((w) => set.add(w));
  });

  return Array.from(set).slice(0, 25);
}

// GET: Retrieve a submission by ID or email
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: "MatchPoint ID or email is required" },
        { status: 400 }
      );
    }

    const query = id
      ? { matchPointId: id.toUpperCase().trim() }
      : { email: email!.toLowerCase().trim() };

    const submission = await MatchPointSubmission.findOne(query).lean();

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "MatchPoint registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error("GET MatchPoint submission error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve MatchPoint pass" },
      { status: 500 }
    );
  }
}

// POST: Register or update submission
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      fullName,
      email,
      phone = "",
      organisationType = "",
      companyName,
      designation,
      category = "Visitor",
      city = "",
      linkedinUrl = "",
      websiteUrl = "",
      aboutCompany,
      usps = [],
      offeringsDescription = "",
      needCategories = [],
      lookingForDetails = "",
      urgency = "Immediate",
      userKeywords = [],
      source = "QR-Venue",
    } = body;

    // Basic validation (Name, Email, Company, Designation are required; phone is optional)
    if (!fullName || !email || !companyName || !designation) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required profile fields (Name, Email, Company, Designation)." },
        { status: 400 }
      );
    }

    if (!aboutCompany) {
      return NextResponse.json(
        { success: false, error: "Please tell us what your company does in the 'What You Do & Offer' section." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();
    const cleanLookingFor = (lookingForDetails || "").trim();
    const cleanUrgency = (urgency || "").includes("1-2")
      ? "Next 1-2 Months"
      : (urgency || "").includes("Explor")
      ? "Exploring Options"
      : "Immediate";

    const cleanUrl = (val?: string) => {
      const trimmed = (val || "").trim().replace(/^https?:\/\//i, "");
      return trimmed ? `https://${trimmed}` : "";
    };
    const cleanLinkedinUrl = cleanUrl(linkedinUrl);
    const cleanWebsiteUrl = cleanUrl(websiteUrl);

    // Auto-extract keywords for fast keyword matchmaking
    const uspArray = Array.isArray(usps) ? usps.filter((u: string) => Boolean(u?.trim())) : [];
    const needArray = Array.isArray(needCategories) ? needCategories : [];
    const userKeywordArray = Array.isArray(userKeywords) ? userKeywords : [];

    const computedKeywords = extractKeywords(
      [aboutCompany, cleanLookingFor, offeringsDescription, ...needArray, ...uspArray],
      userKeywordArray
    );

    // Check if user has already registered
    let submission = await MatchPointSubmission.findOne({ email: cleanEmail });

    if (submission) {
      // Update existing submission with new details
      submission.fullName = fullName.trim();
      submission.phone = cleanPhone;
      submission.organisationType = organisationType.trim();
      submission.companyName = companyName.trim();
      submission.designation = designation.trim();
      submission.category = category;
      submission.city = city.trim();
      submission.linkedinUrl = cleanLinkedinUrl;
      submission.websiteUrl = cleanWebsiteUrl;
      submission.aboutCompany = aboutCompany.trim();
      submission.usps = uspArray;
      submission.offeringsDescription = offeringsDescription.trim();
      submission.needCategories = needArray;
      submission.lookingForDetails = cleanLookingFor;
      submission.urgency = cleanUrgency;
      submission.keywords = computedKeywords;

      await submission.save();

      return NextResponse.json({
        success: true,
        isUpdate: true,
        message: "Your SFF MatchPoint details have been successfully updated!",
        submission,
      });
    }

    // Generate unique ID
    let newId = generateMatchPointId();
    let collision = await MatchPointSubmission.findOne({ matchPointId: newId });
    while (collision) {
      newId = generateMatchPointId();
      collision = await MatchPointSubmission.findOne({ matchPointId: newId });
    }

    const newSubmission = await MatchPointSubmission.create({
      matchPointId: newId,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      organisationType: organisationType.trim(),
      companyName: companyName.trim(),
      designation: designation.trim(),
      category,
      city: city.trim(),
      linkedinUrl: cleanLinkedinUrl,
      websiteUrl: cleanWebsiteUrl,
      aboutCompany: aboutCompany.trim(),
      usps: uspArray,
      offeringsDescription: offeringsDescription.trim(),
      needCategories: needArray,
      lookingForDetails: cleanLookingFor,
      urgency: cleanUrgency,
      keywords: computedKeywords,
      status: "pending",
      matchedWith: [],
      source,
    });

    // Robust automated matchmaking on registration
    try {
      const existingPool = await MatchPointSubmission.find({ _id: { $ne: newSubmission._id } }).sort({ createdAt: -1 });
      const bestMatches = findBestMatchesForSubmission(newSubmission, existingPool, 1, 78);

      if (bestMatches.length > 0) {
        const { candidate: partner, evaluation } = bestMatches[0];

        let emailSent = false;
        let emailSentAt: Date | undefined;

        if (newSubmission.email && partner.email) {
          const mailRes = await sendMatchIntroductionEmail({
            seeker: {
              fullName: newSubmission.fullName,
              email: newSubmission.email,
              companyName: newSubmission.companyName,
              designation: newSubmission.designation,
              phone: newSubmission.phone,
              city: newSubmission.city,
              linkedinUrl: newSubmission.linkedinUrl,
              websiteUrl: newSubmission.websiteUrl,
              aboutCompany: newSubmission.aboutCompany,
              lookingForDetails: newSubmission.lookingForDetails,
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
          }
        }

        // Link partner to newSubmission
        newSubmission.matchedWith.push({
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
        newSubmission.status = emailSent ? "emailed" : "matched";
        await newSubmission.save();

        // Bilateral link on partner
        partner.matchedWith.push({
          submissionId: newSubmission._id,
          companyName: newSubmission.companyName,
          contactName: newSubmission.fullName,
          email: newSubmission.email,
          phone: newSubmission.phone || "",
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
      }
    } catch (matchErr) {
      console.error("Auto-match on registration notice:", matchErr);
    }

    return NextResponse.json({
      success: true,
      isUpdate: false,
      message: "You have successfully registered for SFF MatchPoint!",
      submission: newSubmission,
    });
  } catch (error: any) {
    console.error("POST MatchPoint submit error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit MatchPoint registration" },
      { status: 500 }
    );
  }
}
