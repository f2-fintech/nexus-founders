"use client";

import React, { useState, useEffect, Suspense, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  CheckCircle2,
  Briefcase,
  Users,
  Search,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Building2,
  Calendar,
  Zap,
  Info,
  Tag,
  Clock,
  Plus,
  X,
  RefreshCw,
  Mail,
  Phone,
  User,
  Edit3,
  HelpCircle,
  Lightbulb,
  PlusCircle,
  ExternalLink,
  Loader2,
  ChevronDown,
} from "lucide-react";
import "./matchpoint.css";
import SFF_ORGANISATIONS_DATA from "@/data/sff_organisations.json";

const ORGANISATION_TYPE_OPTIONS = [
  { id: "ai_machine_learning", label: "AI & Machine Learning", icon: "🤖" },
  { id: "banking_technology", label: "Banking Technology", icon: "🏦" },
  { id: "payments_wallets_and_cards", label: "Payments, Wallets and Cards", icon: "💳" },
  { id: "associations_accelerators_and_incubators", label: "Associations, Accelerators and Incubators", icon: "🤝" },
  { id: "financial_infrastructure", label: "Financial Infrastructure", icon: "🏗️" },
  { id: "digital_assets", label: "Digital Assets", icon: "₿" },
  { id: "government_multilateral_agencies", label: "Government / Multilateral Agencies", icon: "🌐" },
  { id: "blockchain_web3", label: "Blockchain & Web3", icon: "🔗" },
  { id: "asset_or_wealth_management", label: "Asset or Wealth Management", icon: "💰" },
  { id: "cybersecurity", label: "Cybersecurity", icon: "🔐" },
  { id: "regtech", label: "RegTech", icon: "⚖️" },
  { id: "central_banks_regulators", label: "Central Banks & Regulators", icon: "🏛️" },
  { id: "embedded_finance_baas", label: "Embedded Finance & BAAS", icon: "🔌" },
  { id: "lending", label: "Lending", icon: "📄" },
  { id: "cloud_computing", label: "Cloud Computing", icon: "☁️" },
  { id: "trading_investments", label: "Trading & Investments", icon: "📈" },
  { id: "capital_markets", label: "Capital Markets", icon: "📊" },
  { id: "finance_research_analytics", label: "Finance Research & Analytics", icon: "🔎" },
  { id: "legal", label: "Legal", icon: "⚖️" },
  { id: "executive_search_firm_recruitment", label: "Executive Search Firm (Recruitment)", icon: "👥" },
  { id: "insurtech", label: "InsurTech", icon: "🛡️" },
  { id: "commercial_or_corporate_bank", label: "Commercial or Corporate Bank", icon: "🏢" },
  { id: "sustainable_finance", label: "Sustainable Finance", icon: "🌱" },
  { id: "telecommunications_mobile", label: "Telecommunications & Mobile", icon: "📱" },
  { id: "financial_training", label: "Financial Training", icon: "🎓" },
  { id: "industry_association_or_nonprofit", label: "Industry Association or Nonprofit", icon: "🤲" },
  { id: "trade", label: "Trade", icon: "🌍" },
  { id: "wholesale_banking", label: "Wholesale Banking", icon: "🏦" },
  { id: "challenger_or_neobank", label: "Challenger or Neobank", icon: "🏦" }
];

const CATEGORY_OPTIONS = [
  "Founder / Co-Founder",
  "Exhibitor",
  "Visitor",
  "Investor",
  "Service Provider",
  "Enterprise Partner",
  "Other",
];

const INDUSTRY_OPTIONS = [
  { id: "fintech", label: "Fintech & Lending", icon: "🏦" },
  { id: "saas", label: "B2B SaaS & Tech", icon: "💻" },
  { id: "hr", label: "HR & Recruitment", icon: "👥" },
  { id: "marketing", label: "Marketing & Growth", icon: "📈" },
  { id: "investor", label: "Investment & VC", icon: "💰" },
  { id: "services", label: "Services & Other", icon: "🤝" },
];

const NEED_CATEGORY_OPTIONS = [
  { id: "hr", label: "HR & Recruitment", icon: "👥" },
  { id: "clients", label: "Clients & B2B Leads", icon: "🎯" },
  { id: "tech", label: "Tech & Software", icon: "💻" },
  { id: "investors", label: "Investors & VC", icon: "💰" },
  { id: "banking", label: "Banking & Alliances", icon: "🏦" },
  { id: "vendors", label: "Vendors & Partners", icon: "🤝" },
];

// Industry-specific USP & Strength recommendations
const INDUSTRY_USP_MAP: Record<string, string[]> = {
  "Fintech & Lending": [
    "Tech-Driven Platform",
    "API & Embedded Finance",
    "Instant Turnaround",
    "Regulatory Compliant (MAS / RBI)",
    "Pan-India / Regional Reach",
    "AI Risk Assessment",
    "High Approval Ratios",
    "Secure Digital KYC & Escrow",
  ],
  "B2B SaaS & Tech": [
    "Enterprise Ready & Scalable",
    "99.99% Uptime SLA",
    "Plug-and-Play REST APIs",
    "SOC2 & ISO 27001 Compliant",
    "AI-Powered Automation",
    "Seamless CRM & ERP Integrations",
    "Self-Serve Onboarding",
    "Zero Downtime Deployment",
  ],
  "HR & Recruitment": [
    "Pre-Vetted Talent Pool",
    "Rapid 48-Hour Shortlisting",
    "Specialized Tech & Fintech Hiring",
    "Global Remote Payroll Support",
    "AI Candidate Matching",
    "Performance-Backed Guarantee",
    "Executive & CXO Search",
    "Cost-Effective Staffing",
  ],
  "Marketing & Growth": [
    "Performance ROI Focus",
    "B2B High-Intent Lead Gen",
    "Full-Funnel Growth Strategy",
    "Brand & PR Positioning",
    "Data-Driven Attribution",
    "Global Market Expansion",
    "Omnichannel Automation",
    "CAC Reduction Strategy",
  ],
  "Investment & VC": [
    "Early-Stage Seed & Pre-Series A",
    "High-Conviction Thesis",
    "Active Portfolio Support",
    "Cross-Border Market Access",
    "Follow-on Funding Syndicate",
    "Fast-Track Due Diligence",
    "Global LP Network",
    "Strategic Mentorship",
  ],
  "Services & Other": [
    "Dedicated Account Manager",
    "Flexible Engagement Models",
    "Rapid Turnaround Delivery",
    "Cost-Effective Pricing",
    "End-to-End Solutions",
    "Proven Track Record",
    "Global Delivery Capabilities",
  ],
};

const CUSTOM_DOMAIN_USP_KEYWORDS: Record<string, string[]> = {
  ai: [
    "Proprietary LLM / Agent Models",
    "Enterprise Data Privacy",
    "Real-Time Inference",
    "Zero Training Data Retention",
  ],
  wealth: [
    "Algorithmic Portfolio Management",
    "Automated Rebalancing",
    "Multi-Asset Aggregation",
    "Direct Indexing",
  ],
  crypto: [
    "Audited Smart Contracts",
    "Non-Custodial Architecture",
    "Multi-Chain Interoperability",
    "Institutional Custody Support",
  ],
  web3: [
    "Audited Smart Contracts",
    "Non-Custodial Architecture",
    "Multi-Chain Interoperability",
    "Institutional Custody Support",
  ],
  security: [
    "Zero-Trust Architecture",
    "Real-Time Threat Detection",
    "Penetration Tested",
    "24/7 SOC Monitoring",
  ],
  cyber: [
    "Zero-Trust Architecture",
    "Real-Time Threat Detection",
    "Penetration Tested",
    "24/7 SOC Monitoring",
  ],
  legal: [
    "Cross-Border Regulatory Advisory",
    "Fintech & Licensing Specialist",
    "Fast Contract Review",
    "IP & Patent Protection",
  ],
  health: [
    "HIPAA / Data Compliant",
    "Telehealth Infrastructure",
    "Patient-First UX",
    "Clinical Verification",
  ],
};

const DEFAULT_USP_SUGGESTIONS = [
  "Tech-Driven Platform",
  "Enterprise Ready & Scalable",
  "Instant Turnaround",
  "Pan-India Reach",
  "API & Embedded Integration",
  "High Security Standards",
];

const POPULAR_KEYWORD_SUGGESTIONS = [
  "Sales Hiring",
  "Fintech Alliances",
  "Growth Partners",
  "Seed Funding",
];

const READINESS_OPTIONS = [
  "Immediate Availability",
  "Ready in 1-2 Months",
  "Exploring Collaborations",
] as const;

const URGENCY_OPTIONS = [
  "Immediate Need",
  "Next 1-2 Months",
  "Exploring Options",
] as const;

function MatchPointContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passParam = searchParams.get("pass") || searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User Profile State (handled in Modal)
  const [organisationType, setOrganisationType] = useState("");
  const [selectedOrganisation, setSelectedOrganisation] = useState("");
  const [isCustomOrg, setIsCustomOrg] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [category, setCategory] = useState("Founder / Co-Founder");
  const [city, setCity] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Autocomplete search states & refs for the two dropdowns
  const [orgTypeSearch, setOrgTypeSearch] = useState("");
  const [isOrgTypeOpen, setIsOrgTypeOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  const orgTypeRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const orgTypeInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);

  const availableOrganisations: string[] =
    organisationType ? (SFF_ORGANISATIONS_DATA as Record<string, string[]>)[organisationType] || [] : [];

  // Close autocomplete menus when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgTypeRef.current && !orgTypeRef.current.contains(e.target as Node)) {
        setIsOrgTypeOpen(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setIsCompanyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Profile modal visibility & modal error
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalPrompt, setProfileModalPrompt] = useState<string | null>(null);
  const [modalErrorMsg, setModalErrorMsg] = useState<string | null>(null);

  // Sync search fields when modal opens or profile changes
  useEffect(() => {
    if (showProfileModal) {
      if (organisationType) setOrgTypeSearch(organisationType);
      if (companyName) setCompanySearch(companyName);
    }
  }, [showProfileModal, organisationType, companyName]);

  // Real-time filtered options for autocomplete
  const filteredOrgTypes = ORGANISATION_TYPE_OPTIONS.filter((t) =>
    t.label.toLowerCase().includes(orgTypeSearch.toLowerCase())
  );

  const filteredOrganisations = availableOrganisations.filter((org) =>
    org.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Column 1 (Left): What you do & Offer (Symmetrical)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["Fintech & Lending"]);
  const [customIndustries, setCustomIndustries] = useState<string[]>([]);
  const [customIndustryInput, setCustomIndustryInput] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [usps, setUsps] = useState<string[]>([]);
  const [customUspInput, setCustomUspInput] = useState("");
  const [readiness, setReadiness] = useState("Immediate Availability");

  // Column 2 (Right): What you are looking for (Symmetrical)
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(["HR & Recruitment"]);
  const [customNeeds, setCustomNeeds] = useState<string[]>([]);
  const [customNeedInput, setCustomNeedInput] = useState("");
  const [lookingForDetails, setLookingForDetails] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<"Immediate Need" | "Next 1-2 Months" | "Exploring Options">("Immediate Need");

  // Storage and Pass State: Owner's cached pass vs active pass
  const [myOwnPass, setMyOwnPass] = useState<any | null>(null);
  const [activePass, setActivePass] = useState<any | null>(null);
  const [isViewingShared, setIsViewingShared] = useState(false);
  const [isCreatingOwnPass, setIsCreatingOwnPass] = useState(false);

  const [copiedId, setCopiedId] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isUpdateNotice, setIsUpdateNotice] = useState(false);

  // Lookup modal
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Check if profile is complete (Organisation Type, Name, Email, Company, Designation are required; phone is optional)
  const isProfileComplete = Boolean(
    organisationType.trim() &&
    fullName.trim() &&
    email.trim() &&
    companyName.trim() &&
    designation.trim()
  );

  const [refreshingPass, setRefreshingPass] = useState(false);
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);

  // Mobile navigation helper
  const handleNextToStep2 = () => {
    setErrorMsg(null);
    if (!isProfileComplete) {
      requireProfileFirst(undefined, "Please enter your profile details first before proceeding to step 2:");
      return;
    }
    if (selectedIndustries.length === 0) {
      setErrorMsg("Please select or add at least one industry/domain under 'What You Do & Offer'.");
      window.scrollTo({ top: 320, behavior: "smooth" });
      return;
    }
    if (!aboutCompany.trim() || aboutCompany.length < 10) {
      setErrorMsg("Please tell us briefly what your company does in the 'What You Do & Offer' section.");
      window.scrollTo({ top: 320, behavior: "smooth" });
      return;
    }
    setMobileStep(2);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 280, behavior: "smooth" });
    }
  };

  // Dynamically compute suggested USPs based on selectedIndustries
  const dynamicUspSuggestions = useMemo(() => {
    const list: string[] = [];
    const added = new Set<string>();

    const addSuggestion = (usp: string) => {
      const clean = usp.trim();
      const lower = clean.toLowerCase();
      if (!added.has(lower) && !usps.some((u) => u.toLowerCase().trim() === lower)) {
        added.add(lower);
        list.push(clean);
      }
    };

    if (selectedIndustries.length === 0) {
      DEFAULT_USP_SUGGESTIONS.forEach(addSuggestion);
      return list.slice(0, 8);
    }

    // 1. Gather USPs from standard industry selections
    selectedIndustries.forEach((ind) => {
      const standardList = INDUSTRY_USP_MAP[ind];
      if (standardList) {
        standardList.forEach(addSuggestion);
      } else {
        // Check custom domain keyword matches
        const lowerInd = ind.toLowerCase();
        let matched = false;
        for (const [kw, kwList] of Object.entries(CUSTOM_DOMAIN_USP_KEYWORDS)) {
          if (lowerInd.includes(kw)) {
            kwList.forEach(addSuggestion);
            matched = true;
          }
        }
        if (!matched) {
          addSuggestion(`Specialized in ${ind}`);
          addSuggestion("Proprietary Methodology");
          addSuggestion("Enterprise Scalability");
        }
      }
    });

    // If still less than 4, fill with default high-quality USPs
    if (list.length < 4) {
      DEFAULT_USP_SUGGESTIONS.forEach(addSuggestion);
    }

    return list.slice(0, 8);
  }, [selectedIndustries, usps]);

  // Sync pass from server
  const syncPassFromServer = useCallback(
    async (passIdOrEmail: string, isOwnerSync = true, showSpinner = false) => {
      if (!passIdOrEmail) return;
      if (showSpinner) setRefreshingPass(true);
      try {
        const isEmail = passIdOrEmail.includes("@");
        const param = isEmail
          ? `email=${encodeURIComponent(passIdOrEmail.trim())}`
          : `id=${encodeURIComponent(passIdOrEmail.trim().toUpperCase())}`;
        const res = await fetch(`/api/matchpoint/submit?${param}`);
        const data = await res.json();
        if (data.success && data.submission) {
          setActivePass(data.submission);
          if (isOwnerSync) {
            setMyOwnPass(data.submission);
            localStorage.setItem("sff_matchpoint_pass", JSON.stringify(data.submission));
          }
        }
      } catch (e) {
        console.error("Failed to sync pass from server:", e);
      } finally {
        if (showSpinner) setRefreshingPass(false);
      }
    },
    []
  );

  // Restore own pass from localStorage & evaluate shared vs owner view
  useEffect(() => {
    let localPass: any = null;
    try {
      const saved = localStorage.getItem("sff_matchpoint_pass");
      if (saved) {
        localPass = JSON.parse(saved);
        setMyOwnPass(localPass);
      }
    } catch (e) {
      console.error("Failed to parse saved pass from localStorage:", e);
    }

    if (passParam) {
      const paramClean = passParam.trim();
      const paramUpper = paramClean.toUpperCase();
      const isParamMyOwn =
        localPass &&
        ((localPass.matchPointId && localPass.matchPointId.toUpperCase() === paramUpper) ||
          (localPass.email && localPass.email.toLowerCase() === paramClean.toLowerCase()));

      if (isParamMyOwn) {
        // Owner opened their own link or refreshed!
        setIsViewingShared(false);
        setActivePass(localPass);
        setIsCreatingOwnPass(false);
        syncPassFromServer(localPass.matchPointId || localPass.email, true);
      } else {
        // Someone else opened a shared link (User B viewing User A's card)
        setIsViewingShared(true);
        setIsCreatingOwnPass(false);
        syncPassFromServer(paramClean, false, true);
      }
    } else if (localPass) {
      // User opened /matchpoint with no param, but their pass is cached on this device
      setIsViewingShared(false);
      setActivePass(localPass);
      setIsCreatingOwnPass(false);
      syncPassFromServer(localPass.matchPointId || localPass.email, true);
    } else {
      // First-time user, no cached pass and no URL param
      setActivePass(null);
      setIsViewingShared(false);
      setIsCreatingOwnPass(false);
    }
  }, [passParam, syncPassFromServer]);

  // Live polling every 4 seconds when viewing an active pass
  useEffect(() => {
    if (!activePass?.matchPointId && !activePass?.email) return;

    const isOwner =
      myOwnPass &&
      ((myOwnPass.matchPointId &&
        myOwnPass.matchPointId.toUpperCase() === activePass.matchPointId?.toUpperCase()) ||
        (myOwnPass.email &&
          myOwnPass.email.toLowerCase() === activePass.email?.toLowerCase()));

    const interval = setInterval(() => {
      syncPassFromServer(activePass.matchPointId || activePass.email, Boolean(isOwner));
    }, 4000);
    return () => clearInterval(interval);
  }, [activePass?.matchPointId, activePass?.email, myOwnPass, syncPassFromServer]);

  // Universal interceptor: ANY button or interaction checks profile completion first!
  const requireProfileFirst = (callback?: () => void, promptMessage?: string): boolean => {
    if (!isProfileComplete) {
      setProfileModalPrompt(
        promptMessage || "👋 Please enter your contact details first so SFF attendees know who they are connecting with!"
      );
      setModalErrorMsg(null);
      setShowProfileModal(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Pre-fill F2 Fintech example
  const handlePreFillExample = () => {
    setFullName("F2 Fintech Team");
    setEmail("partnerships@f2fintech.in");
    setPhone("+91 98765 43210");
    setOrganisationType("Embedded Finance & BAAS");
    setSelectedOrganisation("F2 Fintech");
    setIsCustomOrg(true);
    setCompanyName("F2 Fintech");
    setDesignation("Founding Team");
    setCategory("Exhibitor");
    setCity("Bengaluru & Delhi");
    setWebsiteUrl("https://f2fintech.in");

    setSelectedIndustries(["Fintech & Lending", "B2B SaaS & Tech"]);
    setCustomIndustries([]);
    setCustomIndustryInput("");
    setAboutCompany(
      "F2 Fintech connects customers with 40+ banks & NBFCs through tech-driven loan distribution and digital lending APIs."
    );
    setUsps([
      "Tech-Driven Platform",
      "API & Embedded Finance",
      "Pan-India Reach",
    ]);
    setReadiness("Immediate Availability");

    setSelectedNeeds(["HR & Recruitment", "Banking & Alliances"]);
    setCustomNeeds([]);
    setCustomNeedInput("");
    setLookingForDetails(
      "An HR recruitment agency to help us hire skilled, efficient and cost-effective employees, particularly for sales and operations roles."
    );
    setKeywords(["Fintech & Lending", "B2B SaaS & Tech", "HR & Recruitment", "Banking & Alliances"]);
    setUrgency("Immediate Need");

    setErrorMsg(null);
    setModalErrorMsg(null);
    setMobileStep(1);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  // Tag helper for USPs
  const handleAddUsp = (uspText: string) => {
    const text = uspText.trim();
    if (!text || usps.includes(text)) return;
    setUsps((prev) => [...prev, text]);
    setCustomUspInput("");
  };

  const handleRemoveUsp = (indexToRemove: number) => {
    setUsps((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Industry multi-toggle & custom add
  const toggleIndustry = (label: string) => {
    if (selectedIndustries.includes(label)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== label));
    } else {
      setSelectedIndustries([...selectedIndustries, label]);
    }
  };

  const handleAddCustomIndustry = (name?: string) => {
    const val = (name || customIndustryInput).trim();
    if (!val) return;
    if (!customIndustries.includes(val) && !INDUSTRY_OPTIONS.some((o) => o.label.toLowerCase() === val.toLowerCase())) {
      setCustomIndustries((prev) => [...prev, val]);
    }
    if (!selectedIndustries.includes(val)) {
      setSelectedIndustries((prev) => [...prev, val]);
    }
    setCustomIndustryInput("");
  };

  const handleRemoveCustomIndustry = (label: string) => {
    setCustomIndustries((prev) => prev.filter((i) => i !== label));
    setSelectedIndustries((prev) => prev.filter((i) => i !== label));
  };

  // Need category multi-toggle & custom add
  const toggleNeedCategory = (label: string) => {
    if (selectedNeeds.includes(label)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== label));
    } else {
      setSelectedNeeds([...selectedNeeds, label]);
    }
  };

  const handleAddCustomNeed = (name?: string) => {
    const val = (name || customNeedInput).trim();
    if (!val) return;
    if (!customNeeds.includes(val) && !NEED_CATEGORY_OPTIONS.some((o) => o.label.toLowerCase() === val.toLowerCase())) {
      setCustomNeeds((prev) => [...prev, val]);
    }
    if (!selectedNeeds.includes(val)) {
      setSelectedNeeds((prev) => [...prev, val]);
    }
    setCustomNeedInput("");
  };

  const handleRemoveCustomNeed = (label: string) => {
    setCustomNeeds((prev) => prev.filter((n) => n !== label));
    setSelectedNeeds((prev) => prev.filter((n) => n !== label));
  };

  // Save profile from modal
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveCompany = (companyName || companySearch).trim();
    const effectiveOrgType = (organisationType || orgTypeSearch).trim();

    if (!effectiveOrgType) {
      setModalErrorMsg("Please select an Organisation Type from SFF 2026 categories.");
      return;
    }
    if (!effectiveCompany) {
      setModalErrorMsg("Please enter or select your Organisation / Company Name.");
      return;
    }
    if (!fullName.trim() || !email.trim() || !designation.trim()) {
      setModalErrorMsg("Please complete all required fields: Full Name, Work Email, and Designation.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setModalErrorMsg("Please enter a valid official work email address.");
      return;
    }
    setCompanyName(effectiveCompany);
    setCompanySearch(effectiveCompany);
    setOrganisationType(effectiveOrgType);
    setOrgTypeSearch(effectiveOrgType);
    setModalErrorMsg(null);
    setErrorMsg(null);
    setShowProfileModal(false);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If profile is not complete, open modal first!
    if (!isProfileComplete) {
      requireProfileFirst(undefined, "Please complete your profile and contact details before generating your pass.");
      return;
    }

    if (selectedIndustries.length === 0) {
      setErrorMsg("Please select or add at least one industry/domain under 'What You Do & Offer'.");
      setMobileStep(1);
      window.scrollTo({ top: 380, behavior: "smooth" });
      return;
    }

    if (!aboutCompany.trim() || aboutCompany.length < 10) {
      setErrorMsg("Please tell us briefly what your company does in the 'What You Do & Offer' section.");
      setMobileStep(1);
      window.scrollTo({ top: 380, behavior: "smooth" });
      return;
    }

    if (selectedNeeds.length === 0) {
      setErrorMsg("Please select at least one partner category under 'What You Are Looking For'.");
      setMobileStep(2);
      window.scrollTo({ top: 380, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      const allUsps = readiness ? [...usps, `Readiness: ${readiness}`] : usps;
      const cleanUrgency = urgency.includes("Immediate")
        ? "Immediate"
        : urgency.includes("1-2")
          ? "Next 1-2 Months"
          : "Exploring Options";

      // Auto-generate keywords directly from top selections (Industries + Looking For Categories)
      const autoKeywords = Array.from(
        new Set([
          ...selectedIndustries.map((i) => i.trim()),
          ...selectedNeeds.map((n) => n.trim()),
        ].filter(Boolean))
      );

      const industryString = selectedIndustries.join(", ");
      const finalAboutCompany = industryString ? `[${industryString}] ${aboutCompany}` : aboutCompany;

      const payload = {
        fullName,
        email,
        phone,
        organisationType,
        companyName,
        designation,
        category,
        city,
        linkedinUrl,
        websiteUrl,
        aboutCompany: finalAboutCompany,
        usps: allUsps,
        offeringsDescription: aboutCompany,
        needCategories: selectedNeeds,
        lookingForDetails,
        urgency: cleanUrgency,
        userKeywords: autoKeywords,
        source: "QR-Venue",
      };

      const res = await fetch("/api/matchpoint/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit MatchPoint registration");
      }

      setMyOwnPass(data.submission);
      setActivePass(data.submission);
      setIsViewingShared(false);
      setIsCreatingOwnPass(false);
      setIsUpdateNotice(Boolean(data.isUpdate));
      localStorage.setItem("sff_matchpoint_pass", JSON.stringify(data.submission));

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("pass", data.submission.matchPointId);
        window.history.pushState({}, "", url.toString());
      }
      window.scrollTo({ top: 180, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Lookup existing pass
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setLookupLoading(true);
    setLookupError(null);

    try {
      const isEmail = lookupQuery.includes("@");
      const param = isEmail ? `email=${encodeURIComponent(lookupQuery.trim())}` : `id=${encodeURIComponent(lookupQuery.trim().toUpperCase())}`;
      const res = await fetch(`/api/matchpoint/submit?${param}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No MatchPoint registration found.");
      }

      setMyOwnPass(data.submission);
      setActivePass(data.submission);
      setIsViewingShared(false);
      setIsCreatingOwnPass(false);
      localStorage.setItem("sff_matchpoint_pass", JSON.stringify(data.submission));
      setShowLookupModal(false);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("pass", data.submission.matchPointId);
        window.history.pushState({}, "", url.toString());
      }
      window.scrollTo({ top: 180, behavior: "smooth" });
    } catch (err: any) {
      setLookupError(err.message || "Pass not found. Please verify your email or Match ID.");
    } finally {
      setLookupLoading(false);
    }
  };

  // Copy ID
  const handleCopyId = () => {
    if (!activePass?.matchPointId) return;
    navigator.clipboard.writeText(activePass.matchPointId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Share or Copy Pass Link
  const handleSharePass = async () => {
    if (!activePass?.matchPointId) return;
    const shareUrl = `${window.location.origin}/matchpoint?pass=${activePass.matchPointId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SFF MatchPoint Pass - ${activePass.fullName} (${activePass.companyName})`,
          text: `Check out ${activePass.companyName}'s SFF MatchPoint Card! Let's connect at Singapore FinTech Festival.`,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // Fallback to clipboard if share was dismissed
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  // Start "Add Yours" flow for visitor
  const handleStartAddYours = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setOrganisationType("");
    setOrgTypeSearch("");
    setSelectedOrganisation("");
    setIsCustomOrg(false);
    setCompanyName("");
    setCompanySearch("");
    setDesignation("");
    setCategory("Founder / Co-Founder");
    setCity("");
    setLinkedinUrl("");
    setWebsiteUrl("");
    setSelectedIndustries(["Fintech & Lending"]);
    setCustomIndustries([]);
    setCustomIndustryInput("");
    setAboutCompany("");
    setUsps([]);
    setCustomUspInput("");
    setReadiness("Immediate Availability");
    setSelectedNeeds([]);
    setCustomNeeds([]);
    setCustomNeedInput("");
    setLookingForDetails("");
    setUrgency("Immediate Need");
    setErrorMsg(null);
    setMobileStep(1);
    setIsCreatingOwnPass(true);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  // Switch to My Own Pass
  const handleSwitchToMyPass = () => {
    if (!myOwnPass) return;
    setIsViewingShared(false);
    setIsCreatingOwnPass(false);
    setActivePass(myOwnPass);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("pass", myOwnPass.matchPointId);
      window.history.pushState({}, "", url.toString());
    }
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  // Edit Submission (Owner)
  const handleEditSubmission = () => {
    if (!activePass) return;
    setFullName(activePass.fullName || "");
    setEmail(activePass.email || "");
    setPhone(activePass.phone || "");
    const orgType = activePass.organisationType || "FinTech & Technology";
    setOrganisationType(orgType);
    setOrgTypeSearch(orgType);
    setSelectedOrganisation(activePass.companyName || "");
    const matchingList = (SFF_ORGANISATIONS_DATA as Record<string, string[]>)[orgType] || [];
    setIsCustomOrg(Boolean(activePass.companyName && !matchingList.includes(activePass.companyName)));
    setCompanyName(activePass.companyName || "");
    setCompanySearch(activePass.companyName || "");
    setDesignation(activePass.designation || "");
    setCategory(activePass.category || "Founder / Co-Founder");
    setCity(activePass.city || "");
    setLinkedinUrl(activePass.linkedinUrl || "");
    setWebsiteUrl(activePass.websiteUrl || "");

    // Extract industries if encoded in aboutCompany
    const rawAbout = activePass.aboutCompany || "";
    const industryMatch = rawAbout.match(/^\[(.*?)\]\s*(.*)$/);
    if (industryMatch) {
      const parsedInds = industryMatch[1].split(",").map((s: string) => s.trim()).filter(Boolean);
      setSelectedIndustries(parsedInds.length > 0 ? parsedInds : ["Fintech & Lending"]);
      const customs = parsedInds.filter(
        (p: string) => !INDUSTRY_OPTIONS.some((o) => o.label.toLowerCase() === p.toLowerCase())
      );
      setCustomIndustries(customs);
      setAboutCompany(industryMatch[2]);
    } else {
      setSelectedIndustries(["Fintech & Lending"]);
      setCustomIndustries([]);
      setAboutCompany(rawAbout);
    }

    setUsps(activePass.usps || []);
    const needs = activePass.needCategories || [];
    setSelectedNeeds(needs);
    const customN = needs.filter(
      (n: string) => !NEED_CATEGORY_OPTIONS.some((o) => o.label.toLowerCase() === n.toLowerCase())
    );
    setCustomNeeds(customN);
    setLookingForDetails(activePass.lookingForDetails || "");

    const rawUrg = activePass.urgency || "Immediate Need";
    setUrgency(
      rawUrg.includes("1-2")
        ? "Next 1-2 Months"
        : rawUrg.includes("Explor")
          ? "Exploring Options"
          : "Immediate Need"
    );

    setMobileStep(1);
    setIsCreatingOwnPass(true);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  return (
    <div className="mp-wrapper">
      <Navbar />

      {/* Ambient Blobs */}
      <div className="mp-blob-1" />
      <div className="mp-blob-2" />
      <div className="mp-blob-3" />

      <div className="mp-container">
        {/* ─── Hero Section (Minimal Space + Official SFF Logo) ─── */}
        <header className="mp-hero">
          <div className="mp-hero-brand-row">

            <h1 className="mp-title">
              <span className="mp-title-gradient">Nexus Founders MatchPoint</span>
            </h1>
          </div>
          <span className="mp-badge-tag-compact">
            <Sparkles size={12} /> Powered by F2fintech
          </span>

          <p className="mp-subtitle">
            <strong>Where Needs Meet Opportunities.</strong> Share what your business offers on the left and what you need on the right to get matched at SFF.
          </p>

          <div className="mp-event-banner">
            <Calendar size={13} />
            <span>Registration Active at SFF Venue • Introductions Emailed <strong>Nov 20th–21st</strong></span>
          </div>
        </header>

        {/* ─── DIGITAL MATCHPOINT PASS (Shown if pass exists and not creating) ─── */}
        {activePass && !isCreatingOwnPass ? (
          <div className="mp-pass-container">
            <div className="mp-pass-card">
              {/* Top Banner: Shared Card vs Owner Welcome */}
              {isViewingShared ? (
                <div className="mp-shared-banner">
                  <div className="mp-shared-banner-info">
                    <Sparkles size={16} color="#0284c7" />
                    <span>
                      You are viewing <strong>{activePass.fullName}</strong>'s SFF MatchPoint Card ({activePass.companyName})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartAddYours}
                    className="mp-add-yours-btn-top"
                  >
                    <PlusCircle size={15} /> Add Yours
                  </button>
                </div>
              ) : (
                <div className="mp-owner-welcome-badge">
                  <CheckCircle2 size={15} color="#059669" />
                  <span>Your SFF MatchPoint Pass is active & saved in your device cache</span>
                </div>
              )}

              {isUpdateNotice && !isViewingShared && (
                <div style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669", padding: "0.6rem 1rem", borderRadius: "12px", marginBottom: "1.25rem", fontSize: "0.86rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} /> Details successfully updated for your SFF MatchPoint registration!
                </div>
              )}

              <div className="mp-pass-top">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", fontWeight: 800 }}>
                      SFF Venue Networking Pass
                    </span>
                    {activePass.status === "matched" || (activePass.matchedWith && activePass.matchedWith.length > 0) ? (
                      <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.35)", fontSize: "0.75rem", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <Sparkles size={12} /> Match Found!
                      </span>
                    ) : activePass.status === "emailed" ? (
                      <span style={{ background: "rgba(2, 132, 199, 0.15)", color: "#0284c7", border: "1px solid rgba(2, 132, 199, 0.35)", fontSize: "0.75rem", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <Mail size={12} /> Intro Emailed
                      </span>
                    ) : activePass.status === "analyzed" ? (
                      <span style={{ background: "rgba(99, 102, 241, 0.15)", color: "#6366f1", border: "1px solid rgba(99, 102, 241, 0.35)", fontSize: "0.75rem", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontWeight: 800 }}>
                        🔍 In Analysis
                      </span>
                    ) : (
                      <span style={{ background: "rgba(5, 150, 105, 0.1)", color: "#059669", fontSize: "0.75rem", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontWeight: 800 }}>
                        ✓ Registered
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: "0.2rem 0 0" }}>
                    {activePass.fullName}
                  </h2>
                  <span style={{ fontSize: "0.92rem", color: "#64748b", fontWeight: 600 }}>
                    {activePass.designation} at <strong>{activePass.companyName}</strong>
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block", marginBottom: "0.2rem" }}>MATCHPOINT ID</span>
                  <div className="mp-pass-id" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                    <span>{activePass.matchPointId}</span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      style={{ background: "none", border: "none", cursor: "pointer", color: copiedId ? "#059669" : "#0284c7" }}
                      title="Copy Match ID"
                    >
                      {copiedId ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Requirement Summary */}
              <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#0284c7", fontWeight: 800 }}>
                    {isViewingShared ? "🎯 What They Are Looking For" : "🎯 What You Are Looking For"}
                  </span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(2, 132, 199, 0.1)", color: "#0284c7", padding: "0.2rem 0.6rem", borderRadius: "20px", fontWeight: 700 }}>
                    Urgency: {activePass.urgency}
                  </span>
                </div>

                {activePass.lookingForDetails ? (
                  <p style={{ fontSize: "0.95rem", color: "#1e293b", fontWeight: 600, lineHeight: 1.5, margin: "0 0 0.75rem" }}>
                    "{activePass.lookingForDetails}"
                  </p>
                ) : (
                  <p style={{ fontSize: "0.88rem", color: "#64748b", fontStyle: "italic", margin: "0 0 0.75rem" }}>
                    Looking to connect with partners in the selected categories.
                  </p>
                )}

                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {activePass.needCategories?.map((need: string) => (
                    <span key={need} style={{ fontSize: "0.75rem", background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontWeight: 600 }}>
                      {need}
                    </span>
                  ))}
                </div>
              </div>

              {/* Company & USPs */}
              <div style={{ marginTop: "1rem", padding: "0.75rem 0.25rem" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: 800, display: "block", marginBottom: "0.35rem" }}>
                  {isViewingShared ? "🏢 About Their Business & USPs" : "🏢 About Your Business & USPs"}
                </span>
                <p style={{ fontSize: "0.88rem", color: "#475569", margin: "0 0 0.5rem" }}>
                  {activePass.aboutCompany}
                </p>
                {activePass.usps?.length > 0 && (
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {activePass.usps.map((usp: string, i: number) => (
                      <span key={i} style={{ fontSize: "0.74rem", background: "rgba(99, 102, 241, 0.08)", color: "#4f46e5", padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: 600 }}>
                        ✓ {usp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched Partner Celebration Card */}
              {(activePass.status === "matched" || (activePass.matchedWith && activePass.matchedWith.length > 0)) && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)",
                  border: "1.5px solid rgba(16, 185, 129, 0.35)",
                  borderRadius: "18px",
                  padding: "1.25rem 1.35rem",
                  margin: "1.25rem 0",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Sparkles size={18} color="#059669" />
                      <strong style={{ fontSize: "1.05rem", color: "#065f46" }}>
                        {isViewingShared ? "Active Match Identified! 🎉" : "Match Found for Your Business! 🎉"}
                      </strong>
                    </div>
                    <span style={{ fontSize: "0.74rem", background: "#10b981", color: "#ffffff", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontWeight: 800 }}>
                      Active Match
                    </span>
                  </div>

                  <p style={{ fontSize: "0.86rem", color: "#047857", margin: "0 0 0.85rem", lineHeight: 1.5 }}>
                    The F2 Fintech matchmaking team has connected this requirement with the following partner at SFF:
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {activePass.matchedWith?.map((m: any, idx: number) => (
                      <div key={idx} style={{ background: "#ffffff", padding: "0.85rem 1.1rem", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.3)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
                          <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{m.companyName}</strong>
                          <span style={{ fontSize: "0.78rem", background: "rgba(16, 185, 129, 0.12)", color: "#059669", padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: 700 }}>
                            {m.matchedCategory}
                          </span>
                        </div>
                        {m.contactName && (
                          <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.25rem" }}>
                            Contact: <strong>{m.contactName}</strong>
                          </div>
                        )}
                        {m.notes && (
                          <p style={{ fontSize: "0.82rem", color: "#334155", margin: "0.35rem 0 0", fontStyle: "italic" }}>
                            "{m.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.85rem", fontSize: "0.8rem", color: "#047857" }}>
                    <Mail size={14} />
                    <span>Official introduction emails with direct contact coordinates will be shared on <strong>Nov 20th–21st</strong>.</span>
                  </div>
                </div>
              )}

              {/* Status Roadmap */}
              <div className="mp-pass-timeline">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "#475569" }}>
                    Matchmaking Status & Schedule
                  </span>
                  <button
                    type="button"
                    onClick={() => syncPassFromServer(activePass.matchPointId || activePass.email, !isViewingShared, true)}
                    disabled={refreshingPass}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0284c7",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                    title="Check latest status from server"
                  >
                    <RefreshCw size={12} className={refreshingPass ? "spin" : ""} />
                    {refreshingPass ? "Refreshing..." : "Refresh Status"}
                  </button>
                </div>

                {/* Step 1 */}
                <div className="mp-timeline-item">
                  <div className="mp-timeline-dot done">
                    <Check size={12} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>1. Registration Recorded</strong>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Profile and requirements are securely captured in the SFF MatchPoint registry.</span>
                  </div>
                </div>

                {/* Step 2 */}
                {(() => {
                  const isMatchedNow = activePass.status === "matched" || (activePass.matchedWith && activePass.matchedWith.length > 0);
                  const isEmailedNow = activePass.status === "emailed";
                  const isAnalyzedNow = activePass.status === "analyzed" || isMatchedNow || isEmailedNow;

                  return (
                    <>
                      <div className="mp-timeline-item">
                        <div className={`mp-timeline-dot ${isAnalyzedNow ? "done" : "current"}`}>
                          {isAnalyzedNow ? <Check size={12} /> : <Search size={12} />}
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.85rem", color: isAnalyzedNow ? "#0f172a" : "#0284c7", display: "block" }}>
                            2. Keyword & Requirement Analysis {isAnalyzedNow ? "(Completed ✓)" : "(In Progress)"}
                          </strong>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {isAnalyzedNow
                              ? "Requirements screened! Compatible organizations and keywords analyzed across SFF attendees."
                              : "F2 Fintech team is screening all attendees' offerings and requirements for ideal matches."}
                          </span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="mp-timeline-item">
                        <div className={`mp-timeline-dot ${isEmailedNow ? "done" : isMatchedNow ? "done" : "current"}`}>
                          {isMatchedNow || isEmailedNow ? <Check size={12} /> : <Sparkles size={12} />}
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.85rem", color: isMatchedNow ? "#059669" : "#64748b", display: "block" }}>
                            3. Business Match Identified {isMatchedNow ? "(Match Found! 🎉)" : "(In Progress)"}
                          </strong>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {isMatchedNow
                              ? `Congratulations! Relevant match identified with ${activePass.matchedWith?.[0]?.companyName || "a matching partner"}.`
                              : "F2 Fintech team is matching complementary business needs with service providers."}
                          </span>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="mp-timeline-item">
                        <div className={`mp-timeline-dot ${isEmailedNow ? "done" : "future"}`}>
                          {isEmailedNow ? <Check size={12} /> : <Mail size={12} />}
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.85rem", color: isEmailedNow ? "#0284c7" : "#64748b", display: "block" }}>
                            4. Email Connections (Nov 20th–21st) {isEmailedNow ? "(Sent! ✉️)" : "(Scheduled)"}
                          </strong>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {isEmailedNow
                              ? "Personalized introduction email has been dispatched to official email address!"
                              : "Participants will receive personalized introduction emails directly connecting matching partners."}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Pass Actions: Viewer vs Owner */}
              {isViewingShared ? (
                <div style={{ width: "100%" }}>
                  {/* Add Yours Call-To-Action Box */}
                  <div className="mp-add-yours-cta-box">
                    <div className="mp-add-yours-text">
                      <h3>Connect with Opportunities at SFF 🚀</h3>
                      <p>
                        Want potential clients, investors, vendors, or partners to discover your business? Create your own SFF MatchPoint Pass in 1 minute!
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                      {myOwnPass && (
                        <button
                          type="button"
                          onClick={handleSwitchToMyPass}
                          className="mp-switch-pass-btn"
                        >
                          <User size={15} /> View My Own Pass ({myOwnPass.fullName})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleStartAddYours}
                        className="mp-btn-primary mp-add-yours-main-btn"
                      >
                        <PlusCircle size={18} /> Add Yours / Create Your Pass
                      </button>
                    </div>
                  </div>

                  <div className="mp-pass-actions" style={{ marginTop: "1rem" }}>
                    <button
                      type="button"
                      onClick={handleSharePass}
                      className="mp-btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Share2 size={16} /> {copiedShareLink ? "✓ Link Copied!" : "Share This Card Link"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mp-pass-actions">
                    <button
                      type="button"
                      onClick={handleEditSubmission}
                      className="mp-btn-secondary"
                      style={{ flex: 1 }}
                    >
                      <RefreshCw size={15} /> Edit My Requirements
                    </button>

                    <button
                      type="button"
                      onClick={handleSharePass}
                      className="mp-btn-primary"
                      style={{ flex: 1 }}
                    >
                      <Share2 size={16} /> {copiedShareLink ? "✓ Link Copied!" : "Share / Copy Pass Link"}
                    </button>
                  </div>

                  {copiedShareLink && (
                    <div style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669", padding: "0.6rem 1rem", borderRadius: "12px", marginTop: "1rem", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                      <CheckCircle2 size={16} /> Pass link copied to clipboard! Anyone opening this link can view your card and add their own.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* ─── SIDE-BY-SIDE MATCHPOINT BOARD ─── */
          <div className="mp-board-wrap">
            {/* If user is editing or adding their own while viewing shared card */}
            {isCreatingOwnPass && activePass && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", padding: "0.85rem 1.25rem", background: "rgba(2, 132, 199, 0.08)", border: "1px solid rgba(2, 132, 199, 0.2)", borderRadius: "16px", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ fontSize: "0.88rem", color: "#0369a1", fontWeight: 600 }}>
                  {isViewingShared
                    ? `Adding your own pass • Currently viewing ${activePass.fullName}'s shared card`
                    : "Editing your SFF MatchPoint registration"}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingOwnPass(false)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#0f172a",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "9999px",
                  }}
                >
                  ← {isViewingShared ? `Back to ${activePass.fullName}'s Card` : "Cancel & View My Saved Pass"}
                </button>
              </div>
            )}

            {/* Step 1 Profile Status Banner */}
            <div className={`mp-step1-banner ${isProfileComplete ? "completed" : "pending"}`}>
              <div className="mp-step1-left">
                <div className="mp-step1-icon">
                  {isProfileComplete ? <CheckCircle2 size={24} /> : <User size={24} />}
                </div>
                <div className="mp-step1-info">
                  <div className="mp-step1-tag">
                    <span className={`mp-step1-badge-pill ${isProfileComplete ? "completed" : "pending"}`}>
                      {isProfileComplete ? "✓ Step 1 Completed" : "Step 1 • Required"}
                    </span>
                  </div>
                  <h4 className="mp-step1-title">
                    {isProfileComplete ? (
                      <>Profile Set: <strong>{fullName}</strong> ({companyName})</>
                    ) : (
                      "Please Introduce Yourself First"
                    )}
                  </h4>
                  <p className="mp-step1-sub">
                    {isProfileComplete ? (
                      <>{designation || category} • {email}{phone ? ` • ${phone}` : ""}</>
                    ) : (
                      "Your contact details will connect you directly with matching partners at SFF."
                    )}
                  </p>
                </div>
              </div>

              <div className="mp-step1-actions-row">
                <button
                  type="button"
                  className="mp-step1-btn"
                  onClick={() => {
                    setProfileModalPrompt(
                      isProfileComplete
                        ? "Update your profile and contact details:"
                        : "👋 Introduce yourself so matching partners know who they are connecting with:"
                    );
                    setModalErrorMsg(null);
                    setShowProfileModal(true);
                  }}
                >
                  <Edit3 size={15} />
                  <span>{isProfileComplete ? "Edit Profile" : "Enter Your Details First →"}</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "14px", padding: "0.85rem 1.15rem", marginBottom: "1.5rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Info size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Mobile 2-Step Wizard Indicator (Visible only on mobile <= 768px) */}
              <div className="mp-mobile-step-nav">
                <button
                  type="button"
                  className={`mp-mobile-step-tab step-1 ${mobileStep === 1 ? "active" : "completed"}`}
                  onClick={() => setMobileStep(1)}
                >
                  <span className="mp-step-badge">{mobileStep === 2 ? "✓" : "1"}</span>
                  <span className="mp-step-name">1. What You Offer</span>
                </button>
                <button
                  type="button"
                  className={`mp-mobile-step-tab step-2 ${mobileStep === 2 ? "active" : ""}`}
                  onClick={handleNextToStep2}
                >
                  <span className="mp-step-badge">2</span>
                  <span className="mp-step-name">2. What You Need</span>
                </button>
              </div>

              <div className="mp-side-by-side">
                {/* ─── LEFT COLUMN: WHAT YOU DO & OFFER ─── */}
                <div className={`mp-col-card offerings ${mobileStep === 1 ? "mobile-active" : "mobile-hidden"}`}>
                  <div className="mp-col-header">
                    <h3 className="mp-col-title">
                      <Building2 size={20} color="#0284c7" />
                      What You Do & Offer
                    </h3>
                    <p className="mp-col-subtitle">
                      Introduce your venture, core capabilities & what you offer at SFF.
                    </p>
                  </div>

                  {/* Row 1: Industry / Primary Domain (Multi-select + Custom Add) */}
                  <div className="mp-field-group">
                    <label className="mp-label">
                      <span>Industry / Primary Domain <span style={{ color: "#ef4444" }}>*</span></span>
                      <span className="mp-label-hint">Select multiple or add custom</span>
                    </label>
                    <div className="mp-pills-grid">
                      {INDUSTRY_OPTIONS.map((item) => {
                        const isSelected = selectedIndustries.includes(item.label);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`mp-pill-btn ${isSelected ? "blue-selected" : ""}`}
                            onClick={() => requireProfileFirst(() => toggleIndustry(item.label))}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                            {isSelected && <Check size={13} />}
                          </button>
                        );
                      })}

                      {customIndustries.map((cust) => {
                        const isSelected = selectedIndustries.includes(cust);
                        return (
                          <button
                            key={cust}
                            type="button"
                            className={`mp-pill-btn ${isSelected ? "blue-selected" : ""}`}
                            onClick={() => requireProfileFirst(() => toggleIndustry(cust))}
                          >
                            <span>✨</span>
                            <span>{cust}</span>
                            {isSelected && <Check size={13} />}
                            <span
                              className="mp-pill-del"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCustomIndustry(cust);
                              }}
                              title="Delete custom domain"
                            >
                              <X size={12} />
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom industry input */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.55rem" }}>
                      <input
                        type="text"
                        className="mp-input"
                        style={{ padding: "0.55rem 0.85rem", fontSize: "0.85rem" }}
                        placeholder="+ Add custom domain (e.g. AI, WealthTech)"
                        value={customIndustryInput}
                        onFocus={() => {
                          if (!isProfileComplete) {
                            requireProfileFirst(undefined, "Please enter your profile details first before adding a custom domain:");
                          }
                        }}
                        onChange={(e) => setCustomIndustryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            requireProfileFirst(() => handleAddCustomIndustry());
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="mp-btn-secondary"
                        style={{ padding: "0.55rem 1rem", fontSize: "0.82rem", whiteSpace: "nowrap" }}
                        onClick={() => requireProfileFirst(() => handleAddCustomIndustry())}
                      >
                        <Plus size={15} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Brief Introduction & Pitch (120px) */}
                  <div className="mp-field-group">
                    <label className="mp-label">
                      Brief Introduction about you and your business <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      required
                      className="mp-textarea mp-textarea-symmetrical"
                      placeholder="e.g. F2 Fintech is a loan aggregation company connecting customers with 40+ banks and NBFCs through technology-driven lending solutions..."
                      value={aboutCompany}
                      onFocus={() => {
                        if (!isProfileComplete) {
                          requireProfileFirst(undefined, "Please enter your profile details first before writing your introduction:");
                        }
                      }}
                      onChange={(e) => setAboutCompany(e.target.value)}
                    />
                  </div>

                  {/* Row 3: Key USPs & Strengths (Tag builder + 4 suggestions) */}
                  <div className="mp-field-group">
                    <label className="mp-label">
                      Key USPs & Strengths
                      <span className="mp-label-hint">What sets you apart?</span>
                    </label>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        className="mp-input"
                        placeholder="Add USP or key capability (e.g. 99.9% Uptime, API-First)..."
                        value={customUspInput}
                        onFocus={() => {
                          if (!isProfileComplete) {
                            requireProfileFirst(undefined, "Please enter your profile details first before adding USPs:");
                          }
                        }}
                        onChange={(e) => setCustomUspInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            requireProfileFirst(() => handleAddUsp(customUspInput));
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="mp-btn-secondary"
                        onClick={() => requireProfileFirst(() => handleAddUsp(customUspInput))}
                        style={{ padding: "0.75rem 1.1rem", whiteSpace: "nowrap" }}
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>

                    {/* Active USPs */}
                    {usps.length > 0 && (
                      <div className="mp-tag-chips">
                        {usps.map((usp, idx) => (
                          <div key={idx} className="mp-chip">
                            <span>✓ {usp}</span>
                            <button
                              type="button"
                              className="mp-chip-remove"
                              onClick={() => handleRemoveUsp(idx)}
                              title="Remove"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick suggestion pills */}
                    {dynamicUspSuggestions.length > 0 && (
                      <div className="mp-quick-tags">
                        <div className="mp-quick-tag-label">
                          Suggested USPs for your domain (click to add):
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {dynamicUspSuggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              className="mp-tag-suggestion"
                              onClick={() => requireProfileFirst(() => handleAddUsp(sug))}
                            >
                              + {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 4: Service Readiness (3 pills 3x1) */}
                  <div className="mp-field-group">
                    <label className="mp-label">
                      Service / Capability Readiness
                    </label>
                    <div className="mp-time-grid">
                      {READINESS_OPTIONS.map((opt) => {
                        const isSelected = readiness === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={`mp-pill-btn ${isSelected ? "blue-selected" : ""}`}
                            onClick={() => requireProfileFirst(() => setReadiness(opt))}
                          >
                            <Clock size={13} />
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Only: Next Step Action */}
                  <div className="mp-mobile-nav-bar">
                    <button
                      type="button"
                      className="mp-btn-primary mp-mobile-next-btn"
                      onClick={handleNextToStep2}
                    >
                      <span>Next: What You Need</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                {/* ─── RIGHT COLUMN: WHAT YOU ARE LOOKING FOR ─── */}
                <div className={`mp-col-card needs ${mobileStep === 2 ? "mobile-active" : "mobile-hidden"}`}>
                  <div className="mp-col-header">
                    <h3 className="mp-col-title">
                      <Search size={20} color="#9333ea" />
                      What You Are Looking For
                    </h3>
                    <p className="mp-col-subtitle">
                      Specify the business requirements, partners, or providers you want.
                    </p>
                  </div>

                  {/* Row 1: Target Categories (Multi-select + Custom Add) */}
                  <div className="mp-field-group">
                    <label className="mp-label">
                      <span>Categories You Wish to Connect With <span style={{ color: "#ef4444" }}>*</span></span>
                      <span className="mp-label-hint">Select multiple or add custom</span>
                    </label>
                    <div className="mp-pills-grid">
                      {NEED_CATEGORY_OPTIONS.map((item) => {
                        const isSelected = selectedNeeds.includes(item.label);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`mp-pill-btn ${isSelected ? "purple-selected" : ""}`}
                            onClick={() => requireProfileFirst(() => toggleNeedCategory(item.label))}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                            {isSelected && <Check size={13} />}
                          </button>
                        );
                      })}

                      {customNeeds.map((cust) => {
                        const isSelected = selectedNeeds.includes(cust);
                        return (
                          <button
                            key={cust}
                            type="button"
                            className={`mp-pill-btn ${isSelected ? "purple-selected" : ""}`}
                            onClick={() => requireProfileFirst(() => toggleNeedCategory(cust))}
                          >
                            <span>✨</span>
                            <span>{cust}</span>
                            {isSelected && <Check size={13} />}
                            <span
                              className="mp-pill-del"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCustomNeed(cust);
                              }}
                              title="Delete custom requirement"
                            >
                              <X size={12} />
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom category input */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.55rem" }}>
                      <input
                        type="text"
                        className="mp-input"
                        style={{ padding: "0.55rem 0.85rem", fontSize: "0.85rem" }}
                        placeholder="+ Add custom requirement (e.g. Legal, Cloud, M&A)"
                        value={customNeedInput}
                        onFocus={() => {
                          if (!isProfileComplete) {
                            requireProfileFirst(undefined, "Please enter your profile details first before adding a custom requirement:");
                          }
                        }}
                        onChange={(e) => setCustomNeedInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            requireProfileFirst(() => handleAddCustomNeed());
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="mp-btn-secondary"
                        style={{ padding: "0.55rem 1rem", fontSize: "0.82rem", whiteSpace: "nowrap" }}
                        onClick={() => requireProfileFirst(() => handleAddCustomNeed())}
                      >
                        <Plus size={15} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Specific Requirement (120px) */}
                  <div className="mp-field-group">
                    <label className="mp-label">
                      Specific Business Requirement & Details <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500, marginLeft: "0.4rem" }}>(Optional)</span>
                    </label>
                    <textarea
                      className="mp-textarea mp-textarea-symmetrical"
                      placeholder="e.g. An HR recruitment agency that can help us hire skilled, efficient and cost-effective sales and operations employees..."
                      value={lookingForDetails}
                      onFocus={() => {
                        if (!isProfileComplete) {
                          requireProfileFirst(undefined, "Please enter your profile details first before describing your requirement:");
                        }
                      }}
                      onChange={(e) => setLookingForDetails(e.target.value)}
                    />
                  </div>

                  {/* Row 4: Urgency Timeline (3 pills 3x1) */}
                  <div className="mp-field-group">
                    <label className="mp-label">
                      Requirement Timeline / Urgency
                    </label>
                    <div className="mp-time-grid">
                      {URGENCY_OPTIONS.map((urg) => {
                        const isSelected = urgency === urg;
                        return (
                          <button
                            key={urg}
                            type="button"
                            className={`mp-pill-btn ${isSelected ? "purple-selected" : ""}`}
                            onClick={() => requireProfileFirst(() => setUrgency(urg))}
                          >
                            <Clock size={13} />
                            <span>{urg}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Only: Back & Submit Actions */}
                  <div className="mp-mobile-nav-bar mp-mobile-nav-split">
                    <button
                      type="button"
                      className="mp-btn-secondary mp-mobile-back-btn"
                      onClick={() => {
                        setMobileStep(1);
                        window.scrollTo({ top: 280, behavior: "smooth" });
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="mp-btn-primary mp-mobile-submit-btn"
                      disabled={loading}
                      onClick={(e) => {
                        if (!isProfileComplete) {
                          e.preventDefault();
                          requireProfileFirst(undefined, "Please complete your profile details first before generating your pass.");
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="mp-spinner" />
                          <span>Matching...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          <span>Generate Pass</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Submit Bar (Desktop Only) */}
              <div className="mp-bottom-cta mp-desktop-only">
                <div>
                  <strong style={{ fontSize: "1.05rem", color: "#0f172a", display: "block" }}>
                    Ready to Connect at SFF?
                  </strong>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {isProfileComplete ? (
                      <>Profile set for <strong>{fullName}</strong> ({companyName}). Click below to generate your pass.</>
                    ) : (
                      "Please fill your profile details first before generating your MatchPoint Pass."
                    )}
                  </span>
                </div>

                <button
                  type="submit"
                  className="mp-btn-primary"
                  disabled={loading}
                  onClick={(e) => {
                    if (!isProfileComplete) {
                      e.preventDefault();
                      requireProfileFirst(undefined, "Please complete your profile details first before generating your pass.");
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spin" /> Generating Pass...
                    </>
                  ) : (
                    <>
                      <Zap size={18} /> Generate My MatchPoint Pass
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── CASE STUDY & EXAMPLES (Moved Below the Matchmaking Board) ─── */}
        <div className="mp-example-box">
          <div className="mp-example-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="mp-example-tag">
                <Building2 size={13} /> Case Study
              </span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                How F2 Fintech Uses MatchPoint
              </h3>
            </div>

            {(!activePass || isCreatingOwnPass) && (
              <button
                type="button"
                onClick={handlePreFillExample}
                style={{
                  background: "rgba(2, 132, 199, 0.1)",
                  border: "1px solid rgba(2, 132, 199, 0.3)",
                  color: "#0284c7",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "20px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
                title="Click to pre-fill the form with this example"
              >
                <Zap size={13} /> Auto-fill with this Example
              </button>
            )}
          </div>

          <div className="mp-example-grid">
            <div className="mp-example-card">
              <h4>
                <Building2 size={16} color="#0284c7" />
                About Us (F2 Fintech)
              </h4>
              <p>
                F2 Fintech is a loan aggregation company connecting customers with 40+ banks and NBFCs through technology-driven lending solutions.
              </p>
              <div style={{ marginTop: "0.75rem" }}>
                <strong style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: "0.3rem" }}>
                  Our USPs:
                </strong>
                <ul className="mp-usp-list">
                  <li>✓ Extensive lending partner network</li>
                  <li>✓ Technology-driven loan distribution</li>
                  <li>✓ Solutions for individuals, professionals & businesses</li>
                </ul>
              </div>
            </div>

            <div className="mp-example-card">
              <h4>
                <Search size={16} color="#9333ea" />
                What We Are Looking For
              </h4>
              <p style={{ fontWeight: 600, color: "#334155" }}>
                "An HR recruitment agency that can help us hire skilled, efficient and cost-effective employees, particularly for sales and operations roles."
              </p>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.72rem", background: "rgba(147, 51, 234, 0.1)", color: "#9333ea", padding: "0.2rem 0.55rem", borderRadius: "10px", fontWeight: 700 }}>
                  #HR-Recruitment
                </span>
                <span style={{ fontSize: "0.72rem", background: "rgba(147, 51, 234, 0.1)", color: "#9333ea", padding: "0.2rem 0.55rem", borderRadius: "10px", fontWeight: 700 }}>
                  #Sales-Talent
                </span>
                <span style={{ fontSize: "0.72rem", background: "rgba(147, 51, 234, 0.1)", color: "#9333ea", padding: "0.2rem 0.55rem", borderRadius: "10px", fontWeight: 700 }}>
                  #Operations
                </span>
              </div>
            </div>
          </div>

          <div className="mp-match-arrow">
            <CheckCircle2 size={18} color="#059669" />
            <span>
              <strong>How MatchPoint Helps:</strong> The F2 Fintech team finds another attendee offering HR Recruitment, and connects both parties via a personalized email on the 20th–21st!
            </span>
          </div>
        </div>

        {/* ─── Highlights Cards (Moved Below) ─── */}
        <div className="mp-highlights-grid">
          <div className="mp-highlight-card">
            <div className="mp-highlight-icon" style={{ background: "rgba(2, 132, 199, 0.12)", color: "#0284c7" }}>
              <Zap size={20} />
            </div>
            <div style={{ textAlign: "left" }}>
              <strong style={{ fontSize: "0.95rem", display: "block", color: "#0f172a" }}>60-Second Setup</strong>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Quick QR access right from your mobile at the venue.</span>
            </div>
          </div>

          <div className="mp-highlight-card">
            <div className="mp-highlight-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}>
              <Lightbulb size={20} />
            </div>
            <div style={{ textAlign: "left" }}>
              <strong style={{ fontSize: "0.95rem", display: "block", color: "#0f172a" }}>Keyword & Need Matching</strong>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>F2 Fintech team analyzes offerings & needs to pair ideal partners.</span>
            </div>
          </div>

          <div className="mp-highlight-card">
            <div className="mp-highlight-icon" style={{ background: "rgba(5, 150, 105, 0.12)", color: "#059669" }}>
              <Mail size={20} />
            </div>
            <div style={{ textAlign: "left" }}>
              <strong style={{ fontSize: "0.95rem", display: "block", color: "#0f172a" }}>Personalized Email Intro</strong>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Direct 1-on-1 introductions delivered around the 20th or 21st.</span>
            </div>
          </div>
        </div>

        {/* Pass Lookup Drawer / Trigger */}
        <div className="mp-lookup-box">
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#475569" }}>
            Already registered at an SFF stall or another venue location?
          </p>
          <button
            type="button"
            onClick={() => setShowLookupModal(true)}
            style={{
              background: "none",
              border: "1.5px solid #cbd5e1",
              borderRadius: "20px",
              padding: "0.45rem 1.15rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#0284c7",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Search size={14} /> Find My MatchPoint Pass
          </button>
        </div>
      </div>

      {/* ─── MODAL: USER PROFILE & CONTACT DETAILS ─── */}
      {showProfileModal && (
        <div
          className="mp-modal-backdrop"
          onClick={() => {
            setShowProfileModal(false);
            setModalErrorMsg(null);
          }}
        >
          <div className="mp-modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="mp-modal-close-btn"
              onClick={() => {
                setShowProfileModal(false);
                setModalErrorMsg(null);
              }}
              aria-label="Close"
              title="Close modal"
            >
              <X size={18} />
            </button>

            <div className="mp-modal-header">
              <div className="mp-modal-header-icon">
                <User size={22} />
              </div>
              <div className="mp-modal-header-text">
                <h3 className="mp-modal-title">
                  Who Are You?
                </h3>
                <p className="mp-modal-subtitle">
                  Tell us who you are & your company details so matching partners at SFF know who they are connecting with.
                </p>
              </div>
            </div>

            {profileModalPrompt && (
              <div className="mp-modal-prompt-banner">
                {profileModalPrompt}
              </div>
            )}

            {modalErrorMsg && (
              <div className="mp-modal-error-banner">
                <Info size={15} />
                <span>{modalErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="mp-modal-form-grid">

                {/* ─── 1. Organisation Type (Autocomplete Combobox) ─── */}
                <div className="mp-field-group" style={{ gridColumn: "1 / -1", position: "relative", zIndex: 100 }}>
                  <label className="mp-label">
                    <span>Organisation Type <span style={{ color: "#ef4444" }}>*</span></span>
                    <span className="mp-label-hint">SFF 2026 Category</span>
                  </label>
                  <div
                    className="mp-autocomplete-wrap"
                    ref={orgTypeRef}
                    onClick={() => {
                      if (!isOrgTypeOpen) setIsOrgTypeOpen(true);
                    }}
                  >
                    <div className="mp-autocomplete-input-box">
                      <div className="mp-autocomplete-icon-left">
                        <Search size={16} />
                      </div>
                      <input
                        ref={orgTypeInputRef}
                        type="text"
                        className="mp-autocomplete-input"
                        placeholder="Select or search category (e.g. FinTech, Banks, Investors...)"
                        value={orgTypeSearch}
                        onFocus={() => setIsOrgTypeOpen(true)}
                        onClick={() => setIsOrgTypeOpen(true)}
                        onChange={(e) => {
                          setOrgTypeSearch(e.target.value);
                          setIsOrgTypeOpen(true);
                        }}
                      />
                      <div className="mp-autocomplete-actions-right">
                        {orgTypeSearch && (
                          <button
                            type="button"
                            className="mp-autocomplete-btn-icon"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOrgTypeSearch("");
                              setOrganisationType("");
                              setSelectedOrganisation("");
                              setCompanyName("");
                              setCompanySearch("");
                              setIsOrgTypeOpen(true);
                            }}
                            title="Clear"
                          >
                            <X size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="mp-autocomplete-btn-icon"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOrgTypeOpen((prev) => !prev);
                          }}
                          title="Toggle options"
                        >
                          <ChevronDown
                            size={16}
                            style={{
                              transform: isOrgTypeOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    {isOrgTypeOpen && (
                      <div className="mp-autocomplete-dropdown">
                        {filteredOrgTypes.length > 0 ? (
                          filteredOrgTypes.map((t) => {
                            const isSelected = organisationType === t.label;
                            return (
                              <div
                                key={t.id}
                                className={`mp-autocomplete-item ${isSelected ? "selected" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrganisationType(t.label);
                                  setOrgTypeSearch(t.label);
                                  setIsOrgTypeOpen(false);
                                  // Reset selected company when switching category
                                  setSelectedOrganisation("");
                                  setCompanyName("");
                                  setCompanySearch("");
                                  // Open company dropdown automatically so user instantly sees the organisations
                                  setIsCompanyOpen(true);
                                  setTimeout(() => companyInputRef.current?.focus(), 60);
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                                  <span>{t.icon}</span>
                                  <span>{t.label}</span>
                                </div>
                                {isSelected && <Check size={16} style={{ color: "#0284c7" }} />}
                              </div>
                            );
                          })
                        ) : (
                          <div className="mp-autocomplete-empty">
                            No category found for "{orgTypeSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── 2. Organisation / Company Name (Autocomplete Combobox with Live Search & Free Entry) ─── */}
                <div className="mp-field-group" style={{ gridColumn: "1 / -1", position: "relative", zIndex: 90 }}>
                  <label className="mp-label">
                    <span>Organisation / Company Name <span style={{ color: "#ef4444" }}>*</span></span>
                    {availableOrganisations.length > 0 && (
                      <span className="mp-label-hint">
                        {availableOrganisations.length} attending organisations
                      </span>
                    )}
                  </label>
                  <div
                    className="mp-autocomplete-wrap"
                    ref={companyRef}
                    onClick={() => {
                      if (!isCompanyOpen) setIsCompanyOpen(true);
                    }}
                  >
                    <div className="mp-autocomplete-input-box">
                      <div className="mp-autocomplete-icon-left">
                        <Building2 size={16} />
                      </div>
                      <input
                        ref={companyInputRef}
                        type="text"
                        required
                        className="mp-autocomplete-input"
                        placeholder={
                          !organisationType
                            ? "← Select Organisation Type above first..."
                            : availableOrganisations.length > 0
                              ? `Click to view ${availableOrganisations.length} organisations or search...`
                              : "Type your organisation / company name..."
                        }
                        value={companySearch}
                        onFocus={() => setIsCompanyOpen(true)}
                        onClick={() => setIsCompanyOpen(true)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCompanySearch(val);
                          setCompanyName(val);
                          setSelectedOrganisation(val);
                          setIsCompanyOpen(true);
                        }}
                      />
                      <div className="mp-autocomplete-actions-right">
                        {companySearch && (
                          <button
                            type="button"
                            className="mp-autocomplete-btn-icon"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCompanySearch("");
                              setCompanyName("");
                              setSelectedOrganisation("");
                              setIsCompanyOpen(true);
                            }}
                            title="Clear"
                          >
                            <X size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="mp-autocomplete-btn-icon"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCompanyOpen((prev) => !prev);
                          }}
                          title="Toggle options"
                        >
                          <ChevronDown
                            size={16}
                            style={{
                              transform: isCompanyOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    {isCompanyOpen && (
                      <div className="mp-autocomplete-dropdown">
                        {!organisationType ? (
                          <div className="mp-autocomplete-empty" style={{ padding: "0.9rem", color: "#64748b" }}>
                            ⚠️ Please select an <strong>Organisation Type</strong> above first to see attending organisations.
                          </div>
                        ) : (
                          <>
                            {availableOrganisations.length > 0 && (
                              <div
                                style={{
                                  padding: "0.45rem 0.75rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  color: "#64748b",
                                  background: "#f8fafc",
                                  borderRadius: "8px",
                                  marginBottom: "0.35rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span>{availableOrganisations.length} Attending Organisations</span>
                                <span style={{ color: "#0284c7" }}>{organisationType}</span>
                              </div>
                            )}

                            {/* If user typed custom text that is not in the official list, show 1-click button */}
                            {companySearch.trim() &&
                              !availableOrganisations.some(
                                (org) => org.toLowerCase() === companySearch.trim().toLowerCase()
                              ) && (
                                <button
                                  type="button"
                                  className="mp-autocomplete-custom-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const val = companySearch.trim();
                                    setCompanyName(val);
                                    setSelectedOrganisation(val);
                                    setIsCompanyOpen(false);
                                  }}
                                >
                                  <Plus size={16} />
                                  <span>
                                    Use <strong>"{companySearch.trim()}"</strong> as my organisation
                                  </span>
                                </button>
                              )}

                            {filteredOrganisations.length > 0 ? (
                              filteredOrganisations.map((org) => {
                                const isSelected = companyName === org;
                                return (
                                  <div
                                    key={org}
                                    className={`mp-autocomplete-item ${isSelected ? "selected" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCompanyName(org);
                                      setCompanySearch(org);
                                      setSelectedOrganisation(org);
                                      setIsCompanyOpen(false);
                                    }}
                                  >
                                    <span>{org}</span>
                                    {isSelected && <Check size={16} style={{ color: "#0284c7" }} />}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="mp-autocomplete-empty">
                                {companySearch.trim() ? (
                                  <span>
                                    Not found in official SFF list. Click option above or keep your custom name.
                                  </span>
                                ) : (
                                  <span>No organisations found in this category. You can type freely above!</span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── 3. Full Name (Required) ─── */}
                <div className="mp-field-group">
                  <label className="mp-label">
                    Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="mp-input"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* ─── 4. Work Email (Required) ─── */}
                <div className="mp-field-group">
                  <label className="mp-label">
                    Official Work Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="mp-input"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* ─── 5. Designation (Required) ─── */}
                <div className="mp-field-group">
                  <label className="mp-label">
                    Designation / Title <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="mp-input"
                    placeholder="e.g. Founder, CEO, VP"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>

                {/* ─── 6. Phone / WhatsApp (Optional) ─── */}
                <div className="mp-field-group">
                  <label className="mp-label">
                    <span>Phone Number</span>
                    <span className="mp-label-hint">Optional</span>
                  </label>
                  <input
                    type="tel"
                    className="mp-input"
                    placeholder="+91 / +65 / international (Optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* ─── 7. Attendee Role (Optional) ─── */}
                <div className="mp-field-group">
                  <label className="mp-label">
                    <span>Attendee Role at SFF</span>
                    <span className="mp-label-hint">Optional</span>
                  </label>
                  <select
                    className="mp-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ─── 8. City / Base Location (Optional) ─── */}
                <div className="mp-field-group">
                  <label className="mp-label">
                    <span>City / Location</span>
                    <span className="mp-label-hint">Optional</span>
                  </label>
                  <input
                    type="text"
                    className="mp-input"
                    placeholder="e.g. Singapore, Bengaluru (Optional)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                {/* ─── 9. LinkedIn Profile (Optional) ─── */}
                <div className="mp-field-group">
                  <label className="mp-label">
                    <span>LinkedIn Profile</span>
                    <span className="mp-label-hint">Optional</span>
                  </label>
                  <input
                    type="url"
                    className="mp-input"
                    placeholder="https://linkedin.com/in/username (Optional)"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>

                {/* ─── 10. Website URL (Optional) ─── */}
                <div className="mp-field-group">
                  <label className="mp-label">
                    <span>Website URL</span>
                    <span className="mp-label-hint">Optional</span>
                  </label>
                  <input
                    type="url"
                    className="mp-input"
                    placeholder="https://yourcompany.com (Optional)"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="mp-modal-actions">
                <button
                  type="button"
                  className="mp-btn-secondary"
                  onClick={() => {
                    setShowProfileModal(false);
                    setModalErrorMsg(null);
                  }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="mp-btn-primary"
                >
                  <Check size={16} /> Save Profile & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: LOOKUP PASS BY EMAIL OR ID ─── */}
      {showLookupModal && (
        <div
          className="mp-modal-backdrop"
          onClick={() => setShowLookupModal(false)}
        >
          <div className="mp-modal-box mp-modal-box-sm" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="mp-modal-close-btn"
              onClick={() => setShowLookupModal(false)}
              aria-label="Close"
              title="Close modal"
            >
              <X size={16} />
            </button>

            <div className="mp-modal-header">
              <div className="mp-modal-header-icon" style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)" }}>
                <Search size={20} />
              </div>
              <div className="mp-modal-header-text">
                <h3 className="mp-modal-title" style={{ fontSize: "1.25rem" }}>
                  Find Your MatchPoint Pass
                </h3>
                <p className="mp-modal-subtitle">
                  Enter the email address you registered with or your MatchPoint ID (e.g., MP-26-XXXX).
                </p>
              </div>
            </div>

            {lookupError && (
              <div className="mp-modal-error-banner">
                <Info size={15} />
                <span>{lookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookup}>
              <input
                type="text"
                required
                className="mp-input"
                placeholder="Enter email or MatchPoint ID..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                style={{ marginBottom: "1.25rem" }}
              />

              <div className="mp-modal-actions">
                <button
                  type="button"
                  className="mp-btn-secondary"
                  onClick={() => setShowLookupModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mp-btn-primary"
                  disabled={lookupLoading}
                >
                  {lookupLoading ? <RefreshCw size={15} className="spin" /> : <Search size={15} />}
                  Find Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function MatchPointPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <Loader2 size={44} style={{ color: "#0284c7" }} className="spin" />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#64748b" }}>Loading SFF MatchPoint...</span>
          </div>
        </div>
      }
    >
      <MatchPointContent />
    </Suspense>
  );
}

