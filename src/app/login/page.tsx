"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
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
    <div className="login-page-cyber">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="login-card-cyber"
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/">
            <img src="/images/logo.webp" alt="Nexus Founders" style={{ height: "55px", margin: "0 auto 1.5rem" }} />
          </Link>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: "0.4rem" }}>
            Welcome <span className="gradient-text-cyan">Back</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Sign in to access your Nexus Founders portal
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.4)",
            borderRadius: "10px",
            padding: "0.85rem 1rem",
            color: "#fda4af",
            fontSize: "0.88rem",
            marginBottom: "1.5rem",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexusfounders.com"
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.8rem",
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "12px",
                  color: "#fff",
                  outline: "none",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.8rem",
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "12px",
                  color: "#fff",
                  outline: "none",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          >
            {loading ? "Authenticating..." : "Sign In to Portal"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{
          marginTop: "2rem",
          padding: "1.25rem",
          background: "rgba(30, 41, 59, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--neon-cyan)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.6rem" }}>
            <ShieldCheck size={16} />
            <span>QUICK CREDENTIALS</span>
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <p><strong>Admin:</strong> admin@nexusfounders.com / admin123</p>
            <p><strong>Founder:</strong> founder@nexusfounders.com / founder123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}