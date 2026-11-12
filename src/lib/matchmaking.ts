import { IMatchPointSubmission } from "@/models/MatchPointSubmission";

export interface MatchEvaluation {
  score: number;
  percentage: number;
  matchedCategory: string;
  reason: string;
  isMutual: boolean;
}

export interface MatchCandidateResult {
  candidate: IMatchPointSubmission;
  evaluation: MatchEvaluation;
}

// Category keywords for semantic matching
const CATEGORY_DOMAIN_MAP: Record<string, string[]> = {
  "HR & Recruitment": [
    "hr", "recruitment", "hiring", "talent", "staffing", "payroll", "headhunting",
    "executive search", "talent acquisition", "sales hiring", "candidates", "recruiter"
  ],
  "Clients & B2B Leads": [
    "client", "lead", "sales", "b2b", "customer", "growth", "distribution",
    "enterprise sales", "market expansion", "business development", "pipeline", "gtm"
  ],
  "Tech & Software": [
    "tech", "software", "saas", "api", "cloud", "ai", "machine learning", "platform",
    "cybersecurity", "web3", "blockchain", "infrastructure", "developer", "automation"
  ],
  "Investors & VC": [
    "investor", "investment", "vc", "venture capital", "seed", "angel", "pre-series a",
    "fundraise", "funding", "equity", "lp", "syndicate"
  ],
  "Banking & Alliances": [
    "bank", "banking", "nbfc", "fintech", "lending", "embedded finance", "baas",
    "payments", "wallets", "cards", "mas", "rbi", "compliance", "alliances"
  ],
  "Vendors & Partners": [
    "vendor", "partner", "partnership", "outsourcing", "legal", "agency", "consulting",
    "solutions provider", "service provider"
  ]
};

function normalizeTokens(text: string): string[] {
  if (!text) return [];
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "to", "for", "in", "at", "of", "on", "is", "we", "are",
    "our", "with", "from", "that", "this", "help", "need", "want", "looking", "seeking", "provide"
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/**
 * Calculates compatibility score and percentage between a seeker (who needs something)
 * and a potential provider (who offers something).
 */
export function evaluateMatch(
  seeker: IMatchPointSubmission,
  provider: IMatchPointSubmission
): MatchEvaluation {
  let score = 0;
  const seekerNeeds = seeker.needCategories || [];
  const seekerKeywords = seeker.keywords || [];
  const seekerRequirement = (seeker.lookingForDetails || "").toLowerCase();

  const providerOfferText = [
    provider.companyName,
    provider.organisationType || "",
    provider.category || "",
    provider.aboutCompany || "",
    provider.offeringsDescription || "",
    ...(provider.usps || []),
    ...(provider.keywords || []),
  ]
    .join(" ")
    .toLowerCase();

  const providerNeedsText = [
    ...(provider.needCategories || []),
    provider.lookingForDetails || "",
    ...(provider.keywords || []),
  ]
    .join(" ")
    .toLowerCase();

  const seekerOfferText = [
    seeker.companyName,
    seeker.organisationType || "",
    seeker.category || "",
    seeker.aboutCompany || "",
    seeker.offeringsDescription || "",
    ...(seeker.usps || []),
  ]
    .join(" ")
    .toLowerCase();

  // 1. Primary Category Alignment (up to 40 points)
  let bestMatchedCategory = seekerNeeds[0] || "General Partnership";
  let categoryScore = 0;

  for (const need of seekerNeeds) {
    const domainKeywords = CATEGORY_DOMAIN_MAP[need] || [need.toLowerCase()];
    let hits = 0;

    for (const kw of domainKeywords) {
      if (providerOfferText.includes(kw)) {
        hits++;
      }
    }

    if (hits > 0) {
      const currentCategoryScore = Math.min(40, 20 + hits * 4);
      if (currentCategoryScore > categoryScore) {
        categoryScore = currentCategoryScore;
        bestMatchedCategory = need;
      }
    }
  }

  score += categoryScore;

  // 2. Specific Requirement & Keyword Overlap (up to 35 points)
  const reqTokens = normalizeTokens(seekerRequirement);
  let keywordHits = 0;

  for (const token of reqTokens) {
    if (providerOfferText.includes(token)) {
      keywordHits++;
    }
  }

  for (const kw of seekerKeywords) {
    if (kw && providerOfferText.includes(kw.toLowerCase())) {
      keywordHits += 2;
    }
  }

  const keywordScore = Math.min(35, keywordHits * 5);
  score += keywordScore;

  // 3. Mutual / Reciprocal Synergy (up to 15 points)
  // Check if provider also needs something that seeker offers
  let isMutual = false;
  let mutualHits = 0;
  for (const pNeed of provider.needCategories || []) {
    const domainKws = CATEGORY_DOMAIN_MAP[pNeed] || [pNeed.toLowerCase()];
    for (const kw of domainKws) {
      if (seekerOfferText.includes(kw)) {
        mutualHits++;
      }
    }
  }

  if (mutualHits > 0) {
    isMutual = true;
    score += Math.min(15, 8 + mutualHits * 3);
  }

  // 4. Urgency & Readiness Alignment (up to 10 points)
  const seekerUrgent = (seeker.urgency || "").includes("Immediate");
  const providerUrgent = (provider.urgency || "").includes("Immediate");
  if (seekerUrgent && providerUrgent) {
    score += 10;
  } else if (seekerUrgent || providerUrgent) {
    score += 5;
  }

  // Calculate realistic, executive match percentage
  // If score is too low (< 22), it's not a viable match
  let percentage = 0;
  if (score >= 22) {
    if (score >= 75) {
      percentage = Math.min(98, Math.round(92 + (score - 75) * 0.24));
    } else if (score >= 50) {
      percentage = Math.min(91, Math.round(83 + (score - 50) * 0.32));
    } else {
      percentage = Math.min(82, Math.round(72 + (score - 22) * 0.35));
    }
  }

  // Construct natural, professional business justification
  let reason = `Aligned under ${bestMatchedCategory}`;
  if (keywordHits >= 3) {
    reason += ` with strong overlap in ${bestMatchedCategory.toLowerCase()} capabilities`;
  }
  if (isMutual) {
    reason += " and reciprocal bilateral synergy";
  }

  return {
    score,
    percentage,
    matchedCategory: bestMatchedCategory,
    reason,
    isMutual,
  };
}

/**
 * Searches a pool of submissions for the top matching partners for a target submission.
 */
export function findBestMatchesForSubmission(
  target: IMatchPointSubmission,
  pool: IMatchPointSubmission[],
  limit = 5,
  minPercentage = 68
): MatchCandidateResult[] {
  const targetIdStr = target._id ? target._id.toString() : "";
  const alreadyMatchedIds = new Set(
    (target.matchedWith || [])
      .map((m) => (m.submissionId ? m.submissionId.toString() : ""))
      .filter(Boolean)
  );

  const results: MatchCandidateResult[] = [];

  for (const candidate of pool) {
    const candidateIdStr = candidate._id ? candidate._id.toString() : "";
    if (!candidateIdStr || candidateIdStr === targetIdStr) continue;
    if (alreadyMatchedIds.has(candidateIdStr)) continue;

    // Evaluate both directions: Target as seeker, or Candidate as seeker
    const evalTargetNeeds = evaluateMatch(target, candidate);
    const evalCandidateNeeds = evaluateMatch(candidate, target);

    const evaluation =
      evalTargetNeeds.percentage >= evalCandidateNeeds.percentage
        ? evalTargetNeeds
        : evalCandidateNeeds;

    if (evaluation.percentage >= minPercentage) {
      results.push({
        candidate,
        evaluation,
      });
    }
  }

  return results.sort((a, b) => b.evaluation.percentage - a.evaluation.percentage).slice(0, limit);
}

