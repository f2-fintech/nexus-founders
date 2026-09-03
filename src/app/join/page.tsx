"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles, Edit3 } from "lucide-react";

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

export default function JoinMeetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    if (!form.fullName.trim()) errors.fullName = "This is a required question";
    if (!form.companyName.trim()) errors.companyName = "This is a required question";
    if (!form.designation.trim()) errors.designation = "This is a required question";
    if (!form.email.trim()) {
      errors.email = "This is a required question";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!form.challenges.trim()) errors.challenges = "This is a required question";
    if (!form.risks.trim()) errors.risks = "This is a required question";
    if (!form.businessStage) errors.businessStage = "This is a required question";
    if (!form.financialStatus) errors.financialStatus = "This is a required question";
    if (!form.milestone.trim()) errors.milestone = "This is a required question";
    if (!form.visionImpact.trim()) errors.visionImpact = "This is a required question";
    if (!form.uniqueStrengths.trim()) errors.uniqueStrengths = "This is a required question";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!form.supportNeeded.trim()) errors.supportNeeded = "This is a required question";
    if (!form.valueContribution.trim()) errors.valueContribution = "This is a required question";
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
        // Update existing record
        const res = await fetch(`/api/join/${submissionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to update response");
      } else {
        // Create new submission
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
      setStep(4); // Success screen
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred while saving your response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0ebf8", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p style={{ color: "#4b5563", fontWeight: 600 }}>Loading your response...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#e8edf5", padding: "1.5rem 1rem 4rem", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Top Logo Banner */}
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "1.5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}>
          <img
            src="/images/logo.webp"
            alt="Nexus Founders"
            style={{ maxHeight: "64px", objectFit: "contain" }}
          />
        </div>

        {/* ── STEP 4: SUCCESS CONFIRMATION SCREEN ───────────────────────────── */}
        {step === 4 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            {/* Top Accent Stripe */}
            <div style={{ height: "10px", background: "#2563eb" }} />

            <div style={{ padding: "2.5rem 2rem" }}>
              <h1 style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "1.5rem",
                lineHeight: 1.3,
              }}>
                Nexus Founders 11th Edition – CEO & Founder Meetup
              </h1>

              <div style={{
                fontSize: "1.05rem",
                color: "#334155",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}>
                <p style={{ marginBottom: "1rem" }}>
                  Thank you for sharing your journey! 🚀
                </p>
                <p style={{ marginBottom: "1.5rem" }}>
                  Your insights will help us build a stronger Nexus Founders Community where leaders support leaders. Together, we&apos;ll create connections, opportunities, and growth beyond limits.
                </p>
                <p style={{ fontWeight: 600, color: "#1e293b" }}>
                  ✨ Welcome to the Nexus Founders Circle — where ideas turn into impact.
                </p>
              </div>

              {/* Edit your response Link */}
              <div style={{ marginBottom: "2rem" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "0.98rem",
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <Edit3 size={16} />
                  Edit your response
                </button>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "1.5rem 0" }} />

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link
                  href="/"
                  style={{
                    background: "#2563eb",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "0.65rem 1.4rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    display: "inline-block",
                  }}
                >
                  Return to Home
                </Link>
                <Link
                  href="/directory"
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    textDecoration: "none",
                    padding: "0.65rem 1.4rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    display: "inline-block",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  Explore Directory
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── STEPS 1, 2, 3: FORM CARDS ──────────────────────────────────── */
          <div>
            {/* Main Form Title Card */}
            <div style={{
              background: "#ffffff",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "1rem",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}>
              {/* Top Accent Stripe */}
              <div style={{ height: "10px", background: "#2563eb" }} />

              <div style={{ padding: "1.75rem 1.5rem 1.25rem" }}>
                <h1 style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "0.75rem",
                  lineHeight: 1.3,
                }}>
                  Nexus Founders 11th Edition – CEO & Founder Meetup
                </h1>
                <p style={{
                  fontSize: "0.95rem",
                  color: "#475569",
                  lineHeight: 1.6,
                  marginBottom: "1.25rem",
                }}>
                  Thank you for being part of the Nexus Founders community. This short form is designed to understand your business journey, challenges, and vision so we can create meaningful exchanges among leaders. (Takes less than 5 minutes to complete.)
                </p>

                <div style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem",
                }}>
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>* Indicates required question</span>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>
                    Section {step} of 3
                  </span>
                </div>
              </div>
            </div>

            {/* Division Explanation Banner */}
            <div style={{
              background: "#ffffff",
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              marginBottom: "1rem",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.92rem",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              borderLeft: "4px solid #2563eb",
            }}>
              This form is divided into 3 sections: Basic Information, Business Insights, and Nexus Community Support Exchange
            </div>

            {/* General Error Banner */}
            {errorMsg && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "10px",
                padding: "0.9rem 1.25rem",
                marginBottom: "1rem",
                color: "#b91c1c",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ── SECTION 1: BASIC INFORMATION ────────────────────────────── */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                {/* Full Name */}
                <div className="form-card" style={cardStyle(!!fieldErrors.fullName)}>
                  <label style={labelStyle}>
                    Full Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={inputStyle(!!fieldErrors.fullName)}
                  />
                  {fieldErrors.fullName && <p style={errorStyle}>{fieldErrors.fullName}</p>}
                </div>

                {/* Company / Startup Name */}
                <div className="form-card" style={cardStyle(!!fieldErrors.companyName)}>
                  <label style={labelStyle}>
                    Company / Startup Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={inputStyle(!!fieldErrors.companyName)}
                  />
                  {fieldErrors.companyName && <p style={errorStyle}>{fieldErrors.companyName}</p>}
                </div>

                {/* Designation */}
                <div className="form-card" style={cardStyle(!!fieldErrors.designation)}>
                  <label style={labelStyle}>
                    Designation <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={inputStyle(!!fieldErrors.designation)}
                  />
                  {fieldErrors.designation && <p style={errorStyle}>{fieldErrors.designation}</p>}
                </div>

                {/* Official Email Address */}
                <div className="form-card" style={cardStyle(!!fieldErrors.email)}>
                  <label style={labelStyle}>
                    Official Email Address <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={inputStyle(!!fieldErrors.email)}
                  />
                  {fieldErrors.email && <p style={errorStyle}>{fieldErrors.email}</p>}
                </div>

                {/* LinkedIn ID URL */}
                <div className="form-card" style={cardStyle(false)}>
                  <label style={labelStyle}>LinkedIn ID URL</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={inputStyle(false)}
                  />
                </div>

                {/* Instagram ID URL */}
                <div className="form-card" style={cardStyle(false)}>
                  <label style={labelStyle}>Instagram ID URL</label>
                  <input
                    type="url"
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={inputStyle(false)}
                  />
                </div>
              </motion.div>
            )}

            {/* ── SECTION 2: BUSINESS INSIGHTS & CHALLENGES ─────────────────── */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                {/* Header Banner for Challenges */}
                <div style={sectionBannerStyle}>Current Business Challenges :</div>

                {/* Top 2 challenges */}
                <div className="form-card" style={cardStyle(!!fieldErrors.challenges)}>
                  <label style={labelStyle}>
                    What are the top 2 challenges currently holding back your business growth? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    name="challenges"
                    value={form.challenges}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={textareaStyle(!!fieldErrors.challenges)}
                  />
                  {fieldErrors.challenges && <p style={errorStyle}>{fieldErrors.challenges}</p>}
                </div>

                {/* Risks in 6-12 months */}
                <div className="form-card" style={cardStyle(!!fieldErrors.risks)}>
                  <label style={labelStyle}>
                    If unresolved, what risks do you foresee in the next 6–12 months? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    name="risks"
                    value={form.risks}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={textareaStyle(!!fieldErrors.risks)}
                  />
                  {fieldErrors.risks && <p style={errorStyle}>{fieldErrors.risks}</p>}
                </div>

                {/* Header Banner for Business Insights */}
                <div style={sectionBannerStyle}>Business Insights :</div>

                {/* Business Stage */}
                <div className="form-card" style={cardStyle(!!fieldErrors.businessStage)}>
                  <label style={labelStyle}>
                    At what stage is your business currently? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    name="businessStage"
                    value={form.businessStage}
                    onChange={handleChange}
                    style={selectStyle(!!fieldErrors.businessStage)}
                  >
                    <option value="">Choose -</option>
                    {STAGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.businessStage && <p style={errorStyle}>{fieldErrors.businessStage}</p>}
                </div>

                {/* Financial Status */}
                <div className="form-card" style={cardStyle(!!fieldErrors.financialStatus)}>
                  <label style={labelStyle}>
                    Which of these best describes your current financial status? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    name="financialStatus"
                    value={form.financialStatus}
                    onChange={handleChange}
                    style={selectStyle(!!fieldErrors.financialStatus)}
                  >
                    <option value="">Choose -</option>
                    {FINANCIAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.financialStatus && <p style={errorStyle}>{fieldErrors.financialStatus}</p>}
                </div>

                {/* Header Banner for Vision & Goals */}
                <div style={sectionBannerStyle}>Vision &amp; Goals :</div>

                {/* 12 Months Milestone */}
                <div className="form-card" style={cardStyle(!!fieldErrors.milestone)}>
                  <label style={labelStyle}>
                    What is the most important milestone you aim to achieve in the next 12 months? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    name="milestone"
                    value={form.milestone}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={textareaStyle(!!fieldErrors.milestone)}
                  />
                  {fieldErrors.milestone && <p style={errorStyle}>{fieldErrors.milestone}</p>}
                </div>

                {/* 3-5 Years Vision / Impact */}
                <div className="form-card" style={cardStyle(!!fieldErrors.visionImpact)}>
                  <label style={labelStyle}>
                    In the Next 3-5 Years ? What is the Larger Vision or Impact you Want your Business Create ? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    name="visionImpact"
                    value={form.visionImpact}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={textareaStyle(!!fieldErrors.visionImpact)}
                  />
                  {fieldErrors.visionImpact && <p style={errorStyle}>{fieldErrors.visionImpact}</p>}
                </div>

                {/* Unique Strengths */}
                <div className="form-card" style={cardStyle(!!fieldErrors.uniqueStrengths)}>
                  <label style={labelStyle}>
                    What unique strengths set your business apart from competitors? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    name="uniqueStrengths"
                    value={form.uniqueStrengths}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={textareaStyle(!!fieldErrors.uniqueStrengths)}
                  />
                  {fieldErrors.uniqueStrengths && <p style={errorStyle}>{fieldErrors.uniqueStrengths}</p>}
                </div>
              </motion.div>
            )}

            {/* ── SECTION 3: NEXUS COMMUNITY SUPPORT EXCHANGE ──────────────── */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                {/* Header Banner for Community Exchange */}
                <div style={sectionBannerStyle}>Nexus Community Exchange :</div>

                {/* Support Sought */}
                <div className="form-card" style={cardStyle(!!fieldErrors.supportNeeded)}>
                  <label style={labelStyle}>
                    What support do you seek from the Nexus Founders community? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="supportNeeded"
                    value={form.supportNeeded}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={textareaStyle(!!fieldErrors.supportNeeded)}
                  />
                  {fieldErrors.supportNeeded && <p style={errorStyle}>{fieldErrors.supportNeeded}</p>}
                </div>

                {/* Value / Contribution */}
                <div className="form-card" style={cardStyle(!!fieldErrors.valueContribution)}>
                  <label style={labelStyle}>
                    What value, knowledge, or resources can you contribute to fellow founders? <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="valueContribution"
                    value={form.valueContribution}
                    onChange={handleChange}
                    placeholder="Your answer"
                    style={textareaStyle(!!fieldErrors.valueContribution)}
                  />
                  {fieldErrors.valueContribution && <p style={errorStyle}>{fieldErrors.valueContribution}</p>}
                </div>
              </motion.div>
            )}

            {/* ── FORM NAVIGATION BUTTONS ──────────────────────────────────── */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.5rem",
              padding: "0 0.5rem",
            }}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      background: "#ffffff",
                      color: "#1e293b",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "0.6rem 1.4rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.65rem 1.6rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
                    }}
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      background: "#1e3a8a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.65rem 1.8rem",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: loading ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 2px 8px rgba(30,58,138,0.4)",
                    }}
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {submissionId ? "Update Response" : "Submit"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Form CSS Styles Helper Functions                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
const cardStyle = (hasError: boolean): React.CSSProperties => ({
  background: "#ffffff",
  borderRadius: "10px",
  padding: "1.4rem 1.5rem",
  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  border: hasError ? "1px solid #ef4444" : "1px solid rgba(0,0,0,0.04)",
  transition: "border-color 0.2s ease",
});

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.98rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
  lineHeight: 1.4,
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "0.6rem 0",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${hasError ? "#ef4444" : "#cbd5e1"}`,
  color: "#0f172a",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
});

const textareaStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "0.6rem 0",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${hasError ? "#ef4444" : "#cbd5e1"}`,
  color: "#0f172a",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  resize: "vertical",
});

const selectStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  maxWidth: "320px",
  padding: "0.65rem 0.8rem",
  background: "#ffffff",
  border: `1px solid ${hasError ? "#ef4444" : "#cbd5e1"}`,
  borderRadius: "6px",
  color: "#1e293b",
  fontSize: "0.92rem",
  outline: "none",
  cursor: "pointer",
});

const sectionBannerStyle: React.CSSProperties = {
  background: "#2a3b5c",
  color: "#ffffff",
  padding: "0.75rem 1.25rem",
  borderRadius: "8px 8px 0 0",
  fontSize: "0.95rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
};

const errorStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "0.8rem",
  marginTop: "0.5rem",
  fontWeight: 500,
};
