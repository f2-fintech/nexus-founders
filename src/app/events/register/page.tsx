"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Play,
  Users,
  TrendingUp,
  Award,
  Video,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Zap,
} from "lucide-react";

interface FormData {
  name: string;
  contactNo: string;
  email: string;
  companyName: string;
  designation: string;
}

const initialForm: FormData = {
  name: "",
  contactNo: "",
  email: "",
  companyName: "",
  designation: "",
};

const editions = [
  { name: "1st Edition", url: "https://youtu.be/tuwzvorehqM?si=G0UwKYDsD9OMsg1V", type: "YouTube" },
  { name: "2nd Edition", url: "https://youtu.be/1NRjgtUv-jw?si=3ohosTBbKnwwt8VN", type: "YouTube" },
  { name: "3rd Edition", url: "https://youtu.be/0JLg6DHOhnw?si=Cngtm6YkMoXCdwg5", type: "YouTube" },
  { name: "4th Edition", url: "https://youtu.be/pKNw9uvzv_I?si=XG62uREi0lnaefE9", type: "YouTube" },
  { name: "5th Edition", url: "https://youtu.be/jwA8g2VSiio?si=1wVfDYBU3bJAS_UT", type: "YouTube" },
  { name: "6th Edition", url: "https://youtube.com/shorts/9_rqrl2FBl8?si=9A8iHGMZl6sARSmX", type: "Shorts" },
  { name: "7th Edition", url: "https://www.instagram.com/p/DKWWSyQyO72/", type: "Instagram" },
];

const benefits = [
  {
    icon: <Users size={18} className="text-cyan-500" />,
    text: "You'll have the opportunity to learn and collaborate with other founders and CEOs.",
  },
  {
    icon: <TrendingUp size={18} className="text-indigo-500" />,
    text: "You will experience continuous growth by connecting and sharing insights with other business leaders.",
  },
  {
    icon: <Award size={18} className="text-purple-500" />,
    text: "You'll become part of a community with like-minded members focused on growth and innovation.",
  },
  {
    icon: <Zap size={18} className="text-amber-500" />,
    text: "You'll have access to exclusive events, workshops, and networking opportunities designed to help your business succeed.",
  },
  {
    icon: <Briefcase size={18} className="text-emerald-500" />,
    text: "You'll have the chance to connect with experts and investors interested in funding or financing your innovative ventures.",
  },
];

export default function EventRegisterPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((p) => ({ ...p, [name]: "" }));
    }
    setErrorMsg("");
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "This is a required question";
    if (!form.contactNo.trim()) errors.contactNo = "This is a required question";
    if (!form.email.trim()) {
      errors.email = "This is a required question";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!form.companyName.trim()) errors.companyName = "This is a required question";
    if (!form.designation.trim()) errors.designation = "This is a required question";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Registration failed");

      window.scrollTo({ top: 0, behavior: "smooth" });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm("Clear all entries in the form?")) {
      setForm(initialForm);
      setFieldErrors({});
      setErrorMsg("");
    }
  };

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: "85vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
        padding: "3rem 1.5rem 5rem",
        position: "relative",
      }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>

          {/* ── SUCCESS STATE ──────────────────────────────────────────────── */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                maxWidth: "760px",
                margin: "3rem auto",
                background: "#ffffff",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(2, 132, 199, 0.15)",
              }}
            >
              <div style={{ height: "10px", background: "linear-gradient(90deg, #0284c7, #4f46e5, #9333ea)" }} />
              <div style={{ padding: "3.5rem 2.5rem", textAlign: "center" }}>
                <div style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#10b981",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)",
                }}>
                  <Check size={36} />
                </div>

                <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.85rem" }}>
                  Registration Submitted Successfully!
                </h1>
                <p style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 2.5rem" }}>
                  Thank you for taking the step to become part of the <strong>Nexus Founders Community</strong>. Our coordination team will review your application and reach out shortly.
                </p>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm(initialForm);
                    }}
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #cbd5e1",
                      color: "#334155",
                      padding: "0.75rem 1.6rem",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                    }}
                  >
                    Submit another response
                  </button>
                  <Link
                    href="/"
                    style={{
                      background: "#0284c7",
                      color: "#ffffff",
                      padding: "0.75rem 1.8rem",
                      borderRadius: "8px",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
                    }}
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── 65% / 35% SPLIT PRESENTATION ───────────────────────────────── */
            <div className="event-register-grid">

              {/* ── LEFT COLUMN (65%): VALUE PROPOSITIONS & PAST EDITIONS ──────── */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "2.75rem 2.5rem",
                  boxShadow: "0 10px 40px rgba(15, 23, 42, 0.05)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                {/* Logo & Tag */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
                  <img
                    src="/images/logo.webp"
                    alt="Nexus Founders"
                    style={{ height: "48px", objectFit: "contain" }}
                  />
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 1rem",
                    background: "rgba(2, 132, 199, 0.08)",
                    border: "1px solid rgba(2, 132, 199, 0.25)",
                    borderRadius: "50px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#0284c7",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}>
                    <Sparkles size={14} />
                    Exclusive Network
                  </span>
                </div>

                <h1 style={{
                  fontSize: "clamp(2rem, 2.8vw, 2.6rem)",
                  fontWeight: 900,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  marginBottom: "1.25rem",
                  letterSpacing: "-0.02em",
                }}>
                  Become part of Nexus Founders Community
                </h1>

                <p style={{ fontSize: "1.02rem", color: "#475569", lineHeight: 1.7, marginBottom: "2rem" }}>
                  We are building a community of CEOs and founders to connect, collaborate, and grow together. By joining the group, you will be part of the Nexus Founders Community, where:
                </p>

                {/* 5 Benefits Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "2rem" }}>
                  {benefits.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1rem",
                        padding: "1rem 1.25rem",
                        background: "rgba(248, 250, 252, 0.85)",
                        borderRadius: "14px",
                        border: "1px solid rgba(0, 0, 0, 0.04)",
                        transition: "transform 0.2s ease, background 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(241, 245, 249, 1)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(248, 250, 252, 0.85)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div style={{
                        marginTop: "2px",
                        flexShrink: 0,
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.6, fontWeight: 500 }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Highlights from Past Editions */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(2, 132, 199, 0.05), rgba(99, 102, 241, 0.05))",
                  border: "1px solid rgba(2, 132, 199, 0.18)",
                  borderRadius: "16px",
                  padding: "1.75rem",
                  marginBottom: "1.75rem",
                }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Video size={18} className="text-cyan-600" />
                    <span>Highlights from Past Nexus Founders Editions:</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                    {editions.map((ed) => (
                      <a
                        key={ed.name}
                        href={ed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          padding: "0.5rem 1rem",
                          borderRadius: "10px",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "#1e293b",
                          textDecoration: "none",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#0284c7";
                          e.currentTarget.style.color = "#0284c7";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 10px rgba(2, 132, 199, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#cbd5e1";
                          e.currentTarget.style.color = "#1e293b";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                        }}
                      >
                        <Play size={12} className="text-red-500" />
                        <span>{ed.name}</span>
                        <ExternalLink size={12} className="text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: "1.1rem 1.4rem",
                  borderRadius: "14px",
                  background: "rgba(99, 102, 241, 0.06)",
                  borderLeft: "4px solid #6366f1",
                  fontSize: "0.95rem",
                  color: "#4f46e5",
                  fontWeight: 600,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}>
                  Let’s disrupt, innovate, and grow together - it’s your stage to shine &amp; let’s make your vision unstoppable!
                </div>
              </motion.div>

              {/* ── RIGHT COLUMN (35%): JOIN THE NETWORK FORM ────────────────── */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 15px 45px rgba(15, 23, 42, 0.07)",
                  border: "1px solid rgba(2, 132, 199, 0.2)",
                  position: "sticky",
                  top: "100px",
                }}
              >
                {/* Header Strip */}
                <div style={{ height: "10px", background: "linear-gradient(90deg, #0284c7, #6366f1)" }} />

                <div style={{ padding: "2.25rem 2rem" }}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem" }}>
                      Join the Network
                    </h2>
                    <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.5 }}>
                      Please fill out the form below with your details to be part of the community
                    </p>
                    <div style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "#dc2626", fontWeight: 600 }}>
                      * Indicates required question
                    </div>
                  </div>

                  {/* Error Alert */}
                  {errorMsg && (
                    <div style={{
                      background: "#fef2f2",
                      border: "1px solid #fca5a5",
                      borderRadius: "10px",
                      padding: "0.85rem 1.1rem",
                      marginBottom: "1.25rem",
                      color: "#b91c1c",
                      fontSize: "0.88rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}>
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Name */}
                    <div style={formGroupStyle(!!fieldErrors.name)}>
                      <label style={labelStyle}>
                        Name <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        style={inputFieldStyle(!!fieldErrors.name)}
                      />
                      {fieldErrors.name && <p style={errorStyle}>{fieldErrors.name}</p>}
                    </div>

                    {/* Contact No. */}
                    <div style={formGroupStyle(!!fieldErrors.contactNo)}>
                      <label style={labelStyle}>
                        Contact No. <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        name="contactNo"
                        value={form.contactNo}
                        onChange={handleChange}
                        placeholder="+91 Phone number"
                        style={inputFieldStyle(!!fieldErrors.contactNo)}
                      />
                      {fieldErrors.contactNo && <p style={errorStyle}>{fieldErrors.contactNo}</p>}
                    </div>

                    {/* Email ID */}
                    <div style={formGroupStyle(!!fieldErrors.email)}>
                      <label style={labelStyle}>
                        Email ID <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Official email address"
                        style={inputFieldStyle(!!fieldErrors.email)}
                      />
                      {fieldErrors.email && <p style={errorStyle}>{fieldErrors.email}</p>}
                    </div>

                    {/* Company Name */}
                    <div style={formGroupStyle(!!fieldErrors.companyName)}>
                      <label style={labelStyle}>
                        Company Name <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="Company / Startup name"
                        style={inputFieldStyle(!!fieldErrors.companyName)}
                      />
                      {fieldErrors.companyName && <p style={errorStyle}>{fieldErrors.companyName}</p>}
                    </div>

                    {/* Designation */}
                    <div style={formGroupStyle(!!fieldErrors.designation)}>
                      <label style={labelStyle}>
                        Designation <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                        placeholder="e.g. Founder &amp; CEO"
                        style={inputFieldStyle(!!fieldErrors.designation)}
                      />
                      {fieldErrors.designation && <p style={errorStyle}>{fieldErrors.designation}</p>}
                    </div>

                    {/* Submit Actions */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "1rem",
                      paddingTop: "1.2rem",
                      borderTop: "1px solid #f1f5f9",
                    }}>
                      <button
                        type="button"
                        onClick={handleClear}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#64748b",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "0.5rem 0.2rem",
                          transition: "color 0.15s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
                      >
                        Clear form
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          background: "linear-gradient(135deg, #0284c7, #2563eb)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.85rem 2.2rem",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          cursor: loading ? "wait" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          boxShadow: "0 4px 16px rgba(2, 132, 199, 0.35)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Submit Application
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>

            </div>
          )}

        </div>
      </main>
      <Footer />

      <style jsx>{`
        .event-register-grid {
          display: grid;
          grid-template-columns: 65fr 35fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 1080px) {
          .event-register-grid {
            grid-template-columns: 60fr 40fr;
            gap: 2rem;
          }
        }
        @media (max-width: 860px) {
          .event-register-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </>
  );
}

const formGroupStyle = (hasError: boolean): React.CSSProperties => ({
  background: "#f8fafc",
  borderRadius: "10px",
  padding: "1rem 1.25rem",
  border: hasError ? "1px solid #ef4444" : "1px solid #e2e8f0",
  transition: "all 0.2s ease",
});

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.88rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const inputFieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "0.5rem 0",
  background: "transparent",
  border: "none",
  borderBottom: `1.5px solid ${hasError ? "#ef4444" : "#cbd5e1"}`,
  color: "#0f172a",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
});

const errorStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "0.78rem",
  marginTop: "0.4rem",
  fontWeight: 500,
};
