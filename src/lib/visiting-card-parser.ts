export interface ParsedVisitingCard {
  isValidCard: boolean;
  contactName: string;
  contactCompany: string;
  email: string;
  phone: string;
  designation: string;
  rawText: string;
}

/**
 * Intelligent heuristics to parse extracted OCR text from a visiting / business card.
 */
export function parseVisitingCardText(text: string): ParsedVisitingCard {
  if (!text || text.trim().length === 0) {
    return {
      isValidCard: false,
      contactName: "",
      contactCompany: "",
      email: "",
      phone: "",
      designation: "",
      rawText: "",
    };
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  let contactName = "";
  let contactCompany = "";
  let email = "";
  let phone = "";
  let designation = "";

  // 1. Extract email address
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  for (const line of lines) {
    const match = line.match(emailRegex);
    if (match) {
      email = match[1].toLowerCase();
      break;
    }
  }

  // 2. Extract telephone / mobile / WhatsApp number
  const phoneRegex = /(?:tel|ph|phone|mobile|mob|m|p|call|cell|office)?[:.\s]*(\+?[\d\s\-()]{8,18}\d)/i;
  for (const line of lines) {
    const match = line.match(phoneRegex);
    if (match && match[1].replace(/\D/g, "").length >= 7) {
      phone = match[1].trim();
      break;
    }
  }

  // Common corporate designations & job titles
  const designationRegex =
    /\b(ceo|cto|cfo|coo|cmo|founder|co-founder|director|managing director|partner|managing partner|vp|vice president|president|head of|manager|lead|consultant|advisor|architect|engineer|specialist|officer|executive|associate)\b/i;

  // Company indicator keywords typical in business cards
  const companyKeywordsRegex =
    /\b(pte|ltd|limited|inc|incorporated|llc|corp|corporation|technologies|tech|fintech|solutions|ventures|capital|bank|banking|group|consulting|services|global|international|enterprises|holdings|labs|network|digital|software|systems|finance|wealth|credit|payments|pay)\b/i;

  const addressNoiseRegex =
    /\b(email|tel|fax|phone|mobile|website|web|address|road|street|st|ave|avenue|tower|building|singapore|india|malaysia|indonesia|hong kong|usa|uk|floor|level|block|unit|www|http|https|com|org|net|sg|in|my)\b/i;

  // Find Designation if present
  for (const line of lines) {
    if (designationRegex.test(line) && !line.includes("@")) {
      designation = line.replace(/^[^\w]+|[^\w]+$/g, "").trim();
      break;
    }
  }

  // 3. Search lines for Company Name
  for (const line of lines) {
    if (companyKeywordsRegex.test(line) && !line.includes("@") && !phoneRegex.test(line)) {
      const cleanLine = line.replace(/^[^\w]+|[^\w]+$/g, "").trim();
      if (cleanLine.length >= 3 && cleanLine.length <= 55) {
        contactCompany = cleanLine;
        break;
      }
    }
  }

  // Fallback for Company Name from business email domain (e.g. user@nexusfintech.com -> Nexusfintech)
  if (!contactCompany && email) {
    const domain = email.split("@")[1];
    const commonFreeProviders = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "live.com",
      "zoho.com",
      "proton.me",
      "protonmail.com",
    ];
    if (domain && !commonFreeProviders.includes(domain.toLowerCase())) {
      const brand = domain.split(".")[0];
      if (brand && brand.length >= 3) {
        contactCompany = brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }
  }

  // 4. Search lines for Contact Person's Name
  for (const line of lines) {
    // Skip if it contains email or phone
    if (line.includes("@") || phoneRegex.test(line)) continue;
    // Skip if it matches company
    if (contactCompany && line.toLowerCase() === contactCompany.toLowerCase()) continue;
    // Skip if it matches designation
    if (designation && line.toLowerCase() === designation.toLowerCase()) continue;
    // Skip if it contains pure address / noise
    if (addressNoiseRegex.test(line)) continue;

    // Check if line looks like a person's name (2 to 4 capitalized/letter words)
    const words = line.split(/\s+/).filter((w) => w.length > 0);
    const isLettersOnly = /^[A-Za-z.\s'-]+$/.test(line);

    if (words.length >= 2 && words.length <= 4 && isLettersOnly && line.length >= 4 && line.length <= 36) {
      contactName = line.replace(/^[^\w]+|[^\w]+$/g, "").trim();
      break;
    }
  }

  // Secondary name fallback if not found
  if (!contactName) {
    for (const line of lines) {
      if (line.includes("@") || phoneRegex.test(line) || line === contactCompany || line === designation) continue;
      if (addressNoiseRegex.test(line)) continue;
      const clean = line.replace(/[^A-Za-z\s]/g, "").trim();
      const words = clean.split(/\s+/).filter(Boolean);
      if (words.length >= 2 && words.length <= 4 && clean.length >= 4 && clean.length <= 30) {
        contactName = clean;
        break;
      }
    }
  }

  // Strict validation: A genuine visiting card must have verifiable business card attributes
  const hasStrongCardIdentity = Boolean(
    (contactName && (contactCompany || email || phone || designation)) ||
    (contactCompany && (email || phone)) ||
    (email && phone)
  );

  const meaningfulLines = lines.filter((l) => l.length >= 3 && !/^[^\w]+$/.test(l));
  const hasNameAndDetails = Boolean(
    contactName && (contactCompany || meaningfulLines.length >= 3)
  );

  const isValidCard = Boolean(hasStrongCardIdentity || hasNameAndDetails);

  return {
    isValidCard,
    contactName,
    contactCompany,
    email,
    phone,
    designation,
    rawText: text,
  };
}
