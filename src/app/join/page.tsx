"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Edit3,
  User,
  Building2,
  Briefcase,
  Mail,
  Target,
  TrendingUp,
  HeartHandshake,
  Compass,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// Inline Brand Icons to avoid external library mismatches
const LinkedinIcon = ({ size = 18, color = "#0077b5" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ size = 18, color = "#e1306c" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface FormData {
  fullName: string;
  companyName: string;
  designation: string;
  email: string;
  linkedin: string;
  instagram: string;
  challenges: string;
  risks: string;
  businessStage: string;
  financialStatus: string;
  milestone: string;
  visionImpact: string;
  uniqueStrengths: string;
  supportNeeded: string;
  valueContribution: string;
}

const initialForm: FormData = {
  fullName: "",
  companyName: "",
  designation: "",
  email: "",
  linkedin: "",
  instagram: "",
  challenges: "",
  risks: "",
  businessStage: "",
  financialStatus: "",
  milestone: "",
  visionImpact: "",
  uniqueStrengths: "",
  supportNeeded: "",
  valueContribution: "",
};

const STAGE_OPTIONS = [
  "Idea / Conceptual Stage",
  "Early Stage / Prototype / MVP",
  "Pre-Revenue with Traction",
  "Revenue Generating / Scaling",
  "Growth Stage / Expanding Market",
  "Profitable & Self-Sustaining",
  "Other",
];

const FINANCIAL_OPTIONS = [
  "Bootstrapped (Self-Funded)",
  "Pre-Seed / Angel Funded",
  "Seed Funded",
  "Series A or Beyond",
  "Currently Seeking Investment / In Talks",
  "Profitable & Cash-Flow Positive",
  "Other",
];

function JoinMeetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark, toggleTheme } = useTheme();
  const editId = searchParams.get("edit");

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submissionId, setSubmissionId] = useState<string | null>(editId || null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch existing response if in edit mode
  useEffect(() => {
    if (editId) {
      setFetchingData(true);
      fetch(`/api/join/${editId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setForm({
              fullName: json.data.fullName || "",
              companyName: json.data.companyName || "",
              designation: json.data.designation || "",
              email: json.data.email || "",
              linkedin: json.data.linkedin || "",
              instagram: json.data.instagram || "",
              challenges: json.data.challenges || "",
              risks: json.data.risks || "",
              businessStage: json.data.businessStage || "",
              financialStatus: json.data.financialStatus || "",
              milestone: json.data.milestone || "",
              visionImpact: json.data.visionImpact || "",
              uniqueStrengths: json.data.uniqueStrengths || "",
              supportNeeded: json.data.supportNeeded || "",
              valueContribution: json.data.valueContribution || "",
            });
            setSubmissionId(editId);
          }
        })
        .catch((err) => console.error("Error fetching submission:", err))
        .finally(() => setFetchingData(false));
    }
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setErrorMsg("");
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all form fields?")) {
      setForm(initialForm);
      setFieldErrors({});
      setErrorMsg("");
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!form.fullName.trim()) errors.fullName = "Please enter your full name";
    if (!form.companyName.trim()) errors.companyName = "Please enter your company or startup name";
    if (!form.designation.trim()) errors.designation = "Please enter your designation";
    if (!form.email.trim()) {
      errors.email = "Please enter your official email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!form.challenges.trim()) errors.challenges = "Please share the top 2 challenges holding back your business";
    if (!form.risks.trim()) errors.risks = "Please specify the risks you foresee in the next 6-12 months";
    if (!form.businessStage) errors.businessStage = "Please select your current business stage";
    if (!form.financialStatus) errors.financialStatus = "Please select your current financial status";
    if (!form.milestone.trim()) errors.milestone = "Please share your most important 12-month milestone";
    if (!form.visionImpact.trim()) errors.visionImpact = "Please share your 3-5 year vision or impact";
    if (!form.uniqueStrengths.trim()) errors.uniqueStrengths = "Please share what unique strengths set your business apart";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!form.supportNeeded.trim()) errors.supportNeeded = "Please describe the support you seek from the community";
    if (!form.valueContribution.trim()) errors.valueContribution = "Please describe the value or knowledge you can contribute";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStep(1);
    } else if (step === 3) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (submissionId) {
        const res = await fetch(`/api/join/${submissionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to update response");
      } else {
        const res = await fetch("/api/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to submit form");
        if (json.data?._id) {
          setSubmissionId(json.data._id);
        }
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      setStep(4);
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred while saving your response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <Loader2 size={42} className="animate-spin text-indigo-600" />
        <p style={{ color: "#475569", fontWeight: 600, fontSize: "1.05rem" }}>Loading your application details...</p>
      </div>
    );
  }

  return (
    <div
      className="join-root"
      style={{
        minHeight: "100vh",
        background: isDark
          ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.1), transparent 70%), linear-gradient(180deg, #090d16 0%, #0d1527 100%)"
          : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.12), transparent 70%), linear-gradient(180deg, #f8fafc 0%, #edf2f9 100%)",
        padding: "2rem 1.25rem 5rem",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: isDark ? "#f8fafc" : "#0f172a",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>

        {/* ── TOP HEADER / BRAND BAR ────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          padding: "0.25rem 0.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <div
              className="join-logo-card"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 245, 255, 0.94) 100%)"
                  : "#ffffff",
                padding: "0.5rem 1.4rem",
                borderRadius: "9999px",
                boxShadow: isDark
                  ? "0 4px 20px rgba(0, 0, 0, 0.35), 0 0 18px rgba(56, 189, 248, 0.28)"
                  : "0 2px 10px rgba(0, 0, 0, 0.04)",
                border: isDark
                  ? "1.5px solid rgba(56, 189, 248, 0.4)"
                  : "1px solid rgba(226, 232, 240, 0.8)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/images/logo.webp"
                alt="Nexus Founders"
                style={{ height: "46px", width: "auto", objectFit: "contain", display: "block" }}
              />
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="join-theme-toggle"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "10px",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #cbd5e1",
                background: isDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff",
                color: isDark ? "#f8fafc" : "#334155",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              title="Toggle theme"
            >
              {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>

            <Link
              href="/"
              className="join-exit-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                color: isDark ? "#94a3b8" : "#64748b",
                fontSize: "0.88rem",
                fontWeight: 600,
                textDecoration: "none",
                padding: "0.4rem 0.8rem",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
            >
              Exit to Home
            </Link>
          </div>
        </div>

        {/* ── STEP 4: SUCCESS CONFIRMATION SCREEN ─────────────────────────── */}
        {step === 4 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="join-card"
            style={{
              background: isDark ? "#111827" : "#ffffff",
              borderRadius: "20px",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.09)" : "1px solid rgba(226, 232, 240, 0.9)",
              boxShadow: isDark ? "0 10px 40px rgba(0, 0, 0, 0.5)" : "0 10px 40px -10px rgba(15, 23, 42, 0.08)",
              overflow: "hidden",
            }}
          >
            <div style={{
              height: "6px",
              background: "linear-gradient(90deg, #4f46e5, #06b6d4, #10b981)",
            }} />

            <div style={{ padding: "3.5rem 2.5rem", textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.35)",
                marginBottom: "1.5rem",
              }}>
                <Check size={36} strokeWidth={2.6} />
              </div>

              <h1 style={{
                fontSize: "2.1rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: isDark ? "#f8fafc" : "#0f172a",
                marginBottom: "1rem",
                lineHeight: 1.25,
              }}>
                Application Submitted Successfully!
              </h1>
              <p style={{
                fontSize: "1.1rem",
                color: isDark ? "#94a3b8" : "#475569",
                lineHeight: 1.65,
                marginBottom: "2rem",
              }}>
                Thank you for sharing your journey with us. Your insights help craft curated founder interactions and meaningful exchanges for the <strong>Nexus Founders 18th Edition</strong>.
              </p>

              <div
                className="join-info-box"
                style={{
                  background: isDark ? "#1a2234" : "#f8fafc",
                  borderRadius: "14px",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                  padding: "1.5rem",
                  marginBottom: "2.5rem",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", color: isDark ? "#f8fafc" : "#1e293b", fontWeight: 700 }}>
                  <ShieldCheck size={20} color="#059669" />
                  What happens next?
                </div>
                <p style={{ fontSize: "0.92rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.6 }}>
                  Our committee reviews applications to ensure relevant peer matches and high-impact dialogue. You will receive an official confirmation and event invite details via your registered email shortly.
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: isDark ? "#1e293b" : "#ffffff",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #cbd5e1",
                    color: isDark ? "#f8fafc" : "#334155",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    borderRadius: "10px",
                    padding: "0.75rem 1.4rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <Edit3 size={16} />
                  Edit your response
                </button>

                <Link
                  href="/"
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "0.75rem 1.6rem",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                  }}
                >
                  Return to Home
                </Link>

                <Link
                  href="/directory"
                  style={{
                    background: isDark ? "#1e293b" : "#f1f5f9",
                    color: isDark ? "#f8fafc" : "#1e293b",
                    textDecoration: "none",
                    padding: "0.75rem 1.6rem",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #cbd5e1",
                  }}
                >
                  Explore Directory
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── STEPS 1, 2, 3: FORM WORKFLOW ────────────────────────────────── */
          <div>
            {/* ── MAIN HERO CARD ─────────────────────────────────────────── */}
            <div
              className="join-card"
              style={{
                background: isDark ? "#111827" : "#ffffff",
                borderRadius: "18px",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.09)" : "1px solid rgba(226, 232, 240, 0.9)",
                boxShadow: isDark ? "0 10px 30px rgba(0, 0, 0, 0.4)" : "0 6px 20px -3px rgba(15, 23, 42, 0.05)",
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{
                height: "6px",
                background: "linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #06b6d4 100%)",
              }} />

              <div style={{ padding: "2rem 2.25rem" }}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <span style={{
                    display: "inline-block",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: isDark ? "#818cf8" : "#4f46e5",
                    marginBottom: "0.4rem",
                  }}>
                    Nexus Founders - CEO &amp; Founder Community
                  </span>
                  <h1 style={{
                    fontSize: "1.95rem",
                    fontWeight: 800,
                    color: isDark ? "#f8fafc" : "#0f172a",
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}>
                    Welcome to Nexus Founders - where ambitious founders connect, collaborate, and grow together.
                  </h1>
                </div>

                <p style={{
                  fontSize: "1rem",
                  color: isDark ? "#94a3b8" : "#475569",
                  lineHeight: 1.65,
                  margin: 0,
                  maxWidth: "880px",
                }}>
                  This short form helps us understand you, your business, expertise, and growth goals, enabling us to create meaningful conversations, relevant connections, and valuable collaboration opportunities within the Nexus Founders community.
                </p>

                <div style={{
                  borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #f1f5f9",
                  marginTop: "1.25rem",
                  paddingTop: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#ef4444", fontWeight: 600 }}>
                    <span>*</span>
                    <span>Indicates required fields</span>
                  </div>
                  <div style={{
                    color: isDark ? "#38bdf8" : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    background: isDark ? "rgba(56, 189, 248, 0.12)" : "#f1f5f9",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "6px",
                  }}>
                    {step === 1 && "Section 1: Basic Information"}
                    {step === 2 && "Section 2: Business Insights & Strategy"}
                    {step === 3 && "Section 3: Community Support Exchange"}
                  </div>
                </div>
              </div>
            </div>

            {/* General Error Banner */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.5rem",
                  color: "#b91c1c",
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  boxShadow: "0 2px 8px rgba(220, 38, 38, 0.08)",
                }}
              >
                <AlertCircle size={20} />
                <span style={{ fontWeight: 500 }}>{errorMsg}</span>
              </motion.div>
            )}

            {/* ── SECTION 1: BASIC INFORMATION ────────────────────────────── */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
              >
                <div
                  className="join-card"
                  style={{
                    background: isDark ? "#111827" : "#ffffff",
                    borderRadius: "18px",
                    padding: "1.75rem 2rem",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.09)" : "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow: isDark ? "0 4px 20px -3px rgba(0, 0, 0, 0.4)" : "0 4px 20px -3px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1.5rem",
                    paddingBottom: "0.75rem",
                    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #f1f5f9",
                  }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(37, 99, 235, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}>
                      <User size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", margin: 0 }}>
                        Founder &amp; Company Overview
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", margin: 0 }}>
                        Help fellow attendees identify your profile and ventures
                      </p>
                    </div>
                  </div>

                  {/* 2-Column Responsive Grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                    gap: "1.5rem",
                  }}>
                    {/* Full Name */}
                    <div>
                      <label style={labelStyle}>
                        Full Name <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <div style={inputIconWrapStyle}>
                          <User size={17} color="#64748b" />
                        </div>
                        <input
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Alex Henderson"
                          style={inputFieldStyle(!!fieldErrors.fullName)}
                        />
                      </div>
                      {fieldErrors.fullName && <p style={errorStyle}>{fieldErrors.fullName}</p>}
                    </div>

                    {/* Official Email */}
                    <div>
                      <label style={labelStyle}>
                        Official Email Address <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <div style={inputIconWrapStyle}>
                          <Mail size={17} color="#64748b" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="alex@company.com"
                          style={inputFieldStyle(!!fieldErrors.email)}
                        />
                      </div>
                      {fieldErrors.email && <p style={errorStyle}>{fieldErrors.email}</p>}
                    </div>

                    {/* Company / Startup Name */}
                    <div>
                      <label style={labelStyle}>
                        Company / Startup Name <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <div style={inputIconWrapStyle}>
                          <Building2 size={17} color="#64748b" />
                        </div>
                        <input
                          type="text"
                          name="companyName"
                          value={form.companyName}
                          onChange={handleChange}
                          placeholder="e.g. Apex Technologies"
                          style={inputFieldStyle(!!fieldErrors.companyName)}
                        />
                      </div>
                      {fieldErrors.companyName && <p style={errorStyle}>{fieldErrors.companyName}</p>}
                    </div>

                    {/* Designation */}
                    <div>
                      <label style={labelStyle}>
                        Designation <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <div style={inputIconWrapStyle}>
                          <Briefcase size={17} color="#64748b" />
                        </div>
                        <input
                          type="text"
                          name="designation"
                          value={form.designation}
                          onChange={handleChange}
                          placeholder="e.g. Founder &amp; CEO"
                          style={inputFieldStyle(!!fieldErrors.designation)}
                        />
                      </div>
                      {fieldErrors.designation && <p style={errorStyle}>{fieldErrors.designation}</p>}
                    </div>

                    {/* LinkedIn ID URL */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>LinkedIn Profile URL</label>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Optional</span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <div style={inputIconWrapStyle}>
                          <LinkedinIcon size={17} color="#0077b5" />
                        </div>
                        <input
                          type="url"
                          name="linkedin"
                          value={form.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                          style={inputFieldStyle(false)}
                        />
                      </div>
                    </div>

                    {/* Instagram ID URL */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Instagram Handle / URL</label>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Optional</span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <div style={inputIconWrapStyle}>
                          <InstagramIcon size={17} color="#e1306c" />
                        </div>
                        <input
                          type="url"
                          name="instagram"
                          value={form.instagram}
                          onChange={handleChange}
                          placeholder="https://instagram.com/username"
                          style={inputFieldStyle(false)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SECTION 2: BUSINESS INSIGHTS & CHALLENGES ─────────────────── */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
              >
                {/* Challenges & Risks Card */}
                <div
                  className="join-card"
                  style={{
                    background: isDark ? "#111827" : "#ffffff",
                    borderRadius: "18px",
                    padding: "1.75rem 2rem",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.09)" : "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow: isDark ? "0 4px 20px -3px rgba(0, 0, 0, 0.4)" : "0 4px 20px -3px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1.5rem",
                    paddingBottom: "0.75rem",
                    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #f1f5f9",
                  }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#dc2626",
                    }}>
                      <Target size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", margin: 0 }}>
                        Current Challenges &amp; Horizon Risks
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", margin: 0 }}>
                        Honest insights help match discussions with peers who conquered identical bottlenecks
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Top 2 challenges */}
                    <div>
                      <label style={labelStyle}>
                        What are the top 2 challenges currently holding back your business growth? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        rows={3}
                        name="challenges"
                        value={form.challenges}
                        onChange={handleChange}
                        placeholder="e.g. Scaling enterprise sales cycles, hiring high-calibre senior engineers, optimizing CAC..."
                        style={textareaFieldStyle(!!fieldErrors.challenges)}
                      />
                      {fieldErrors.challenges && <p style={errorStyle}>{fieldErrors.challenges}</p>}
                    </div>

                    {/* Risks in 6-12 months */}
                    <div>
                      <label style={labelStyle}>
                        If unresolved, what risks do you foresee in the next 6–12 months? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        rows={3}
                        name="risks"
                        value={form.risks}
                        onChange={handleChange}
                        placeholder="e.g. Runway compression, losing market share to competitors, operational delays..."
                        style={textareaFieldStyle(!!fieldErrors.risks)}
                      />
                      {fieldErrors.risks && <p style={errorStyle}>{fieldErrors.risks}</p>}
                    </div>
                  </div>
                </div>

                {/* Business Stage & Financial Status Card */}
                <div
                  className="join-card"
                  style={{
                    background: isDark ? "#111827" : "#ffffff",
                    borderRadius: "18px",
                    padding: "1.75rem 2rem",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.09)" : "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow: isDark ? "0 4px 20px -3px rgba(0, 0, 0, 0.4)" : "0 4px 20px -3px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1.5rem",
                    paddingBottom: "0.75rem",
                    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #f1f5f9",
                  }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(79, 70, 229, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4f46e5",
                    }}>
                      <Compass size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", margin: 0 }}>
                        Maturity &amp; Capitalization
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", margin: 0 }}>
                        Where your venture currently stands in lifecycle and funding
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                    gap: "1.5rem",
                  }}>
                    {/* Business Stage */}
                    <div>
                      <label style={labelStyle}>
                        At what stage is your business currently? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        name="businessStage"
                        value={form.businessStage}
                        onChange={handleChange}
                        style={selectFieldStyle(!!fieldErrors.businessStage)}
                      >
                        <option value="">Select your business stage...</option>
                        {STAGE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.businessStage && <p style={errorStyle}>{fieldErrors.businessStage}</p>}
                    </div>

                    {/* Financial Status */}
                    <div>
                      <label style={labelStyle}>
                        Which best describes your current financial status? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        name="financialStatus"
                        value={form.financialStatus}
                        onChange={handleChange}
                        style={selectFieldStyle(!!fieldErrors.financialStatus)}
                      >
                        <option value="">Select financial status...</option>
                        {FINANCIAL_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.financialStatus && <p style={errorStyle}>{fieldErrors.financialStatus}</p>}
                    </div>
                  </div>
                </div>

                {/* Vision & Milestones Card */}
                <div
                  className="join-card"
                  style={{
                    background: isDark ? "#111827" : "#ffffff",
                    borderRadius: "18px",
                    padding: "1.75rem 2rem",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.09)" : "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow: isDark ? "0 4px 20px -3px rgba(0, 0, 0, 0.4)" : "0 4px 20px -3px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1.5rem",
                    paddingBottom: "0.75rem",
                    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #f1f5f9",
                  }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(16, 185, 129, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10b981",
                    }}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", margin: 0 }}>
                        Vision &amp; Strategic Ambition
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", margin: 0 }}>
                        Your north star goals and defensive moats
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* 12 Months Milestone */}
                    <div>
                      <label style={labelStyle}>
                        What is the most important milestone you aim to achieve in the next 12 months? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        rows={3}
                        name="milestone"
                        value={form.milestone}
                        onChange={handleChange}
                        placeholder="e.g. Reach $1M ARR, launch v2 platform, expand to UAE market, close Series A..."
                        style={textareaFieldStyle(!!fieldErrors.milestone)}
                      />
                      {fieldErrors.milestone && <p style={errorStyle}>{fieldErrors.milestone}</p>}
                    </div>

                    {/* 3-5 Years Vision / Impact */}
                    <div>
                      <label style={labelStyle}>
                        In the Next 3–5 Years, what is the larger vision or impact you want your business to create? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        rows={3}
                        name="visionImpact"
                        value={form.visionImpact}
                        onChange={handleChange}
                        placeholder="e.g. Empowering 100,000 small businesses with automated credit scoring..."
                        style={textareaFieldStyle(!!fieldErrors.visionImpact)}
                      />
                      {fieldErrors.visionImpact && <p style={errorStyle}>{fieldErrors.visionImpact}</p>}
                    </div>

                    {/* Unique Strengths */}
                    <div>
                      <label style={labelStyle}>
                        What unique strengths set your business apart from competitors? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        rows={3}
                        name="uniqueStrengths"
                        value={form.uniqueStrengths}
                        onChange={handleChange}
                        placeholder="e.g. Proprietary distribution channel, proprietary ML model, 10x faster implementation..."
                        style={textareaFieldStyle(!!fieldErrors.uniqueStrengths)}
                      />
                      {fieldErrors.uniqueStrengths && <p style={errorStyle}>{fieldErrors.uniqueStrengths}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SECTION 3: NEXUS COMMUNITY SUPPORT EXCHANGE ──────────────── */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
              >
                <div
                  className="join-card"
                  style={{
                    background: isDark ? "#111827" : "#ffffff",
                    borderRadius: "18px",
                    padding: "1.75rem 2rem",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.09)" : "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow: isDark ? "0 4px 20px -3px rgba(0, 0, 0, 0.4)" : "0 4px 20px -3px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1.5rem",
                    paddingBottom: "0.75rem",
                    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #f1f5f9",
                  }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(99, 102, 241, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4f46e5",
                    }}>
                      <HeartHandshake size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", margin: 0 }}>
                        Nexus Community Support Exchange
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", margin: 0 }}>
                        Nexus is founded on reciprocal value creation: giving and receiving high-leverage peer support
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                    {/* Support Sought */}
                    <div>
                      <label style={labelStyle}>
                        What support do you seek from the Nexus Founders community? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <p style={{ fontSize: "0.84rem", color: "#64748b", marginTop: "-0.3rem", marginBottom: "0.6rem" }}>
                        Be as specific as possible (e.g. introductions to FinTech angel investors, advice on US entity formation, fractional CMO recommendations)
                      </p>
                      <textarea
                        rows={4}
                        name="supportNeeded"
                        value={form.supportNeeded}
                        onChange={handleChange}
                        placeholder="Detail the specific guidance, networks, or operational intros that would unlock your next milestone..."
                        style={textareaFieldStyle(!!fieldErrors.supportNeeded)}
                      />
                      {fieldErrors.supportNeeded && <p style={errorStyle}>{fieldErrors.supportNeeded}</p>}
                    </div>

                    {/* Value / Contribution */}
                    <div>
                      <label style={labelStyle}>
                        What value, knowledge, or resources can you contribute to fellow founders? <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <p style={{ fontSize: "0.84rem", color: "#64748b", marginTop: "-0.3rem", marginBottom: "0.6rem" }}>
                        Every founder has unique superpowers (e.g. B2B sales playbooks, deep tech architecture, fundraising experience, distribution networks)
                      </p>
                      <textarea
                        rows={4}
                        name="valueContribution"
                        value={form.valueContribution}
                        onChange={handleChange}
                        placeholder="Share the domains, connections, or lessons learned where you can mentor or support others..."
                        style={textareaFieldStyle(!!fieldErrors.valueContribution)}
                      />
                      {fieldErrors.valueContribution && <p style={errorStyle}>{fieldErrors.valueContribution}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ACTION FOOTER / NAVIGATION BAR ───────────────────────────── */}
            <div
              className="join-card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "2rem",
                background: isDark ? "#111827" : "#ffffff",
                padding: "1.25rem 1.75rem",
                borderRadius: "16px",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.09)" : "1px solid rgba(226, 232, 240, 0.9)",
                boxShadow: isDark ? "0 4px 15px -3px rgba(0, 0, 0, 0.4)" : "0 4px 15px -3px rgba(15, 23, 42, 0.04)",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: isDark ? "#64748b" : "#94a3b8",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "6px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "#64748b" : "#94a3b8")}
                >
                  Clear all fields
                </button>
              </div>

              <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="join-prev-btn"
                    style={{
                      background: isDark ? "#1e293b" : "#ffffff",
                      color: isDark ? "#e2e8f0" : "#334155",
                      border: isDark ? "1.5px solid #334155" : "1.5px solid #cbd5e1",
                      borderRadius: "10px",
                      padding: "0.75rem 1.4rem",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <ArrowLeft size={16} />
                    Previous Step
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.75rem 1.8rem",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                    }}
                  >
                    Proceed to Next Step
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.8rem 2.2rem",
                      fontWeight: 700,
                      fontSize: "1rem",
                      cursor: loading ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        {submissionId ? "Update Application" : "Complete & Submit Application"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinMeetupPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
          <Loader2 size={40} className="animate-spin text-indigo-600" />
        </div>
      }
    >
      <JoinMeetupContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Form CSS Styles Helper Constants                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.92rem",
  fontWeight: 700,
  color: "var(--text-primary, #1e293b)",
  marginBottom: "0.55rem",
  lineHeight: 1.35,
};

const inputIconWrapStyle: React.CSSProperties = {
  position: "absolute",
  left: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const inputFieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "0.8rem 1rem 0.8rem 2.85rem",
  background: hasError ? "var(--input-error-bg, #fffafa)" : "var(--bg-input, #f8fafc)",
  border: `1.5px solid ${hasError ? "#ef4444" : "var(--border-input, #e2e8f0)"}`,
  borderRadius: "11px",
  color: "var(--text-primary, #0f172a)",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
  fontFamily: "inherit",
});

const textareaFieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "0.9rem 1.1rem",
  background: hasError ? "var(--input-error-bg, #fffafa)" : "var(--bg-input, #f8fafc)",
  border: `1.5px solid ${hasError ? "#ef4444" : "var(--border-input, #e2e8f0)"}`,
  borderRadius: "11px",
  color: "var(--text-primary, #0f172a)",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  resize: "vertical",
  lineHeight: 1.55,
  transition: "all 0.2s ease",
});

const selectFieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "0.85rem 1rem",
  background: hasError ? "var(--input-error-bg, #fffafa)" : "var(--bg-input, #f8fafc)",
  border: `1.5px solid ${hasError ? "#ef4444" : "var(--border-input, #e2e8f0)"}`,
  borderRadius: "11px",
  color: "var(--text-primary, #0f172a)",
  fontSize: "0.95rem",
  outline: "none",
  cursor: "pointer",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "all 0.2s ease",
});

const errorStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "0.82rem",
  marginTop: "0.4rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
};
