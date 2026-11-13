"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  MapPin,
  Phone,
  Banknote,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";

const INSTITUTION_TYPES = [
  "Bank",
  "NBFC",
  "Fintech",
  "Other financial institute",
];

const EXPERIENCE_OPTIONS = [
  "Less than 1 Year",
  "1 - 3 Years",
  "3 - 5 Years",
  "5 - 8 Years",
  "8 - 12 Years",
  "12 - 15 Years",
  "15+ Years",
];


export default function BankersLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Sign In States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up States
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    institutionType: "Bank",
    bankName: "",
    experience: "3 - 5 Years",
    designation: "",
    department: "Startup & SME Banking",
    city: "",
    phone: "",
    ticketSizeMin: "₹50 Lakhs",
    ticketSizeMax: "₹25 Crores",
    bio: "",
  });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Handle Login
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await signIn("credentials", {
        email: loginEmail.toLowerCase().trim(),
        password: loginPassword,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/bankers-connect");
        router.refresh();
      } else {
        setLoginError("Invalid official email or password. Please verify your credentials.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess("");

    const bankNameFinal = signupForm.bankName.trim();

    if (!signupForm.name.trim()) return setSignupError("Full name is required");
    if (!signupForm.email.trim()) return setSignupError("Official email address is required");
    if (!signupForm.password || signupForm.password.length < 6)
      return setSignupError("Password must be at least 6 characters long");
    if (!bankNameFinal) return setSignupError(`Please enter your ${signupForm.institutionType === "Bank" ? "Bank" : signupForm.institutionType} name`);
    if (!signupForm.designation.trim()) return setSignupError("Designation / Title is required");
    if (!signupForm.experience.trim()) return setSignupError("Please select your experience level");

    setSignupLoading(true);

    try {
      const res = await fetch("/api/bankers-connect/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...signupForm,
          bankName: bankNameFinal,
          institutionType: signupForm.institutionType,
          experience: signupForm.experience,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSignupError(data.error || "Failed to register banker profile");
      } else {
        setSignupSuccess("Registration complete! Signing you into Bankers Connect...");
        // Automatically sign in
        const autoSignIn = await signIn("credentials", {
          email: signupForm.email.toLowerCase().trim(),
          password: signupForm.password,
          redirect: false,
        });
        if (autoSignIn?.ok) {
          router.push("/bankers-connect");
          router.refresh();
        } else {
          setActiveTab("signin");
          setLoginEmail(signupForm.email);
        }
      }
    } catch (err: any) {
      setSignupError(err.message || "Registration error. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #070d1e 0%, #0c1630 50%, #050b18 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        position: "relative",
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "350px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(2, 132, 199, 0.08) 50%, transparent 80%)",
          pointerEvents: "none",
          filter: "blur(60px)",
        }}
      />

      <div style={{ width: "100%", maxWidth: activeTab === "signup" ? "680px" : "480px", position: "relative", zIndex: 2 }}>
        {/* Top Back link */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#94a3b8",
              fontSize: "0.86rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            <ArrowLeft size={16} />
            <span>Back to Nexus</span>
          </Link>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <ShieldCheck size={14} />
            <span>Bankers Connect Portal</span>
          </div>
        </div>

        {/* Card Container */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "24px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.2)",
            padding: "2.5rem 2rem",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #059669 0%, #0284c7 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                boxShadow: "0 8px 24px rgba(5, 150, 105, 0.35)",
              }}
            >
              <Building2 size={28} color="#ffffff" />
            </div>
            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: "0 0 0.4rem",
              }}
            >
              Bankers <span style={{ color: "#10b981" }}>Connect</span>
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.92rem", margin: 0 }}>
              Institutional Banking, Syndication & Direct Partner Network
            </p>
          </div>

          {/* Tab Selector */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              background: "rgba(30, 41, 59, 0.6)",
              padding: "0.35rem",
              borderRadius: "14px",
              marginBottom: "1.75rem",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("signin")}
              style={{
                padding: "0.7rem",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "signin" ? "#10b981" : "transparent",
                color: activeTab === "signin" ? "#ffffff" : "#94a3b8",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Banker Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              style={{
                padding: "0.7rem",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "signup" ? "#10b981" : "transparent",
                color: activeTab === "signup" ? "#ffffff" : "#94a3b8",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Join Network (Sign Up)
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {loginError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#fca5a5",
                    fontSize: "0.88rem",
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.45rem",
                  }}
                >
                  Official Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={18}
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#64748b",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@bank.com"
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem 0.8rem 2.8rem",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1.5px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: "12px",
                      color: "#ffffff",
                      outline: "none",
                      fontSize: "0.95rem",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#10b981")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)")}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.45rem",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={18}
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#64748b",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      padding: "0.8rem 2.8rem",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1.5px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: "12px",
                      color: "#ffffff",
                      outline: "none",
                      fontSize: "0.95rem",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#10b981")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: loginLoading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
                  marginTop: "0.5rem",
                  transition: "transform 0.15s, opacity 0.2s",
                }}
              >
                {loginLoading ? "Authenticating Banker..." : "Sign In to Bankers Connect"}
                <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Don&apos;t have a banker account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#10b981",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Register here
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {signupError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#fca5a5",
                    fontSize: "0.88rem",
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{signupError}</span>
                </div>
              )}

              {signupSuccess && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#34d399",
                    fontSize: "0.88rem",
                  }}
                >
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span>{signupSuccess}</span>
                </div>
              )}

              {/* Grid 2 cols for desktop */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1rem",
                }}
              >
                {/* Full Name */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Full Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem 0.85rem 0.75rem 2.5rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Official Email *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="email"
                      required
                      placeholder="rahul.s@hdfcbank.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem 0.85rem 0.75rem 2.5rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Institute Type */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Institute Type *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Building2 size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <select
                      required
                      value={signupForm.institutionType}
                      onChange={(e) => {
                        setSignupForm({
                          ...signupForm,
                          institutionType: e.target.value,
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                        background: "#0f172a",
                        border: "1.5px solid rgba(255, 255, 255, 0.14)",
                        borderRadius: "10px",
                        color: "#fff",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      {INSTITUTION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Institution / Bank Name - Text field as requested */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    {signupForm.institutionType === "Bank" ? "Bank Name *" : `${signupForm.institutionType} Name *`}
                  </label>
                  <div style={{ position: "relative" }}>
                    <Building2 size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      required
                      placeholder={
                        signupForm.institutionType === "Bank"
                          ? "e.g. HDFC Bank, ICICI Bank, SBI, Axis Bank"
                          : signupForm.institutionType === "NBFC"
                          ? "e.g. InCred Financial, Tata Capital, Bajaj Finance"
                          : signupForm.institutionType === "Fintech"
                          ? "e.g. Razorpay, Pine Labs, Cred, Lendingkart"
                          : "e.g. SIDBI, EXIM Bank, Venture Debt Fund"
                      }
                      value={signupForm.bankName}
                      onChange={(e) => setSignupForm({ ...signupForm, bankName: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1.5px solid rgba(255, 255, 255, 0.14)",
                        borderRadius: "10px",
                        color: "#fff",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Total Experience */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Total Experience *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Clock size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <select
                      required
                      value={signupForm.experience}
                      onChange={(e) => setSignupForm({ ...signupForm, experience: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                        background: "#0f172a",
                        border: "1.5px solid rgba(255, 255, 255, 0.14)",
                        borderRadius: "10px",
                        color: "#fff",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      {EXPERIENCE_OPTIONS.map((exp) => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Designation */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Designation / Role *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Briefcase size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. VP - Startup Banking"
                      value={signupForm.designation}
                      onChange={(e) => setSignupForm({ ...signupForm, designation: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem 0.85rem 0.75rem 2.5rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Department / Division */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Department / Focus
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Startup Banking / SME Lending"
                    value={signupForm.department}
                    onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem 0.85rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                {/* City */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    City / Location
                  </label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Delhi NCR, Bengaluru"
                      value={signupForm.city}
                      onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem 0.85rem 0.75rem 2.5rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Mobile / WhatsApp Phone */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Contact Phone
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem 0.85rem 0.75rem 2.5rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Set Password (min 6 chars) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem 2.5rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* The average ticket size that you deal in */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    The average ticket size that you deal in
                  </label>
                  <div style={{ position: "relative" }}>
                    <Banknote size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      placeholder="e.g. ₹25 Crores (or ₹50L - ₹25Cr)"
                      value={signupForm.ticketSizeMax}
                      onChange={(e) => setSignupForm({ ...signupForm, ticketSizeMax: e.target.value })}
                      style={{ width: "100%", padding: "0.75rem 0.85rem 0.75rem 2.5rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              {/* Bio & Focus */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                  Portfolio Focus / Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handling credit facilities, working capital lines, and term debt for startups from seed to pre-IPO."
                  value={signupForm.bio}
                  onChange={(e) => setSignupForm({ ...signupForm, bio: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", background: "rgba(15, 23, 42, 0.6)", border: "1.5px solid rgba(255, 255, 255, 0.14)", borderRadius: "10px", color: "#fff", outline: "none", boxSizing: "border-box", resize: "none" }}
                />
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: signupLoading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
                  marginTop: "0.5rem",
                }}
              >
                {signupLoading ? "Creating Banker Profile..." : "Complete Banker Registration"}
                <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    style={{ background: "none", border: "none", color: "#10b981", fontWeight: 700, cursor: "pointer", padding: 0 }}
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
