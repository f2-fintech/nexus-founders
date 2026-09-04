"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid email or password. Please check your credentials.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid rgba(2, 132, 199, 0.15)",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
          padding: "2.5rem 2.25rem",
          position: "relative",
        }}
      >
        {/* Back to Home Link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#64748b",
            fontSize: "0.85rem",
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: "1.5rem",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0284c7")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: "1.25rem" }}>
            <img
              src="/images/logo.webp"
              alt="Nexus Founders"
              style={{ height: "52px", objectFit: "contain", margin: "0 auto" }}
            />
          </Link>
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "0.4rem",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome <span style={{ color: "#0284c7" }}>Back</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.92rem", margin: 0 }}>
            Sign in to access your Nexus Founders portal
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              color: "#b91c1c",
              fontSize: "0.88rem",
              marginBottom: "1.5rem",
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Email field */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "0.45rem",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexusfounders.com"
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem 0.8rem 2.75rem",
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  color: "#0f172a",
                  outline: "none",
                  fontSize: "0.92rem",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0284c7";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(2, 132, 199, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "0.45rem",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
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
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem 0.8rem 2.75rem",
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  color: "#0f172a",
                  outline: "none",
                  fontSize: "0.92rem",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0284c7";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(2, 132, 199, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.5rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              border: "none",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.25)",
              marginTop: "0.5rem",
              transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.opacity = "0.95";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(2, 132, 199, 0.35)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(2, 132, 199, 0.25)";
            }}
          >
            {loading ? "Authenticating..." : "Sign In to Portal"}
            <ArrowRight size={17} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}