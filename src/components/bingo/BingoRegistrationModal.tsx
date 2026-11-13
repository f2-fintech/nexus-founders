"use client";
import React, { useState } from "react";
import { User, Mail, Briefcase, Building, Camera, CheckCircle, X, Sparkles } from "lucide-react";
import BingoCameraModal from "./BingoCameraModal";
import { ClientBingoParticipant } from "@/models/BingoParticipant";

interface BingoRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (participant: ClientBingoParticipant) => void;
}

export default function BingoRegistrationModal({
  isOpen,
  onClose,
  onRegistered,
}: BingoRegistrationModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState<"Visitor" | "Exhibitor" | "Co-Exhibitor" | "Organiser">("Visitor");
  const [ownVisitingCardUrl, setOwnVisitingCardUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim()) {
      setError("Please provide your name and email to play.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bingo/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          designation,
          companyName,
          category,
          ownVisitingCardUrl,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      // Save token in localStorage for session restoration
      if (typeof window !== "undefined" && data.participant?.sessionToken) {
        localStorage.setItem("nexus_bingo_token", data.participant.sessionToken);
      }

      onRegistered(data.participant);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to register for the game.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(10, 15, 29, 0.8)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "1rem 0.75rem",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !loading) onClose();
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            margin: "auto",
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            color: "#0f172a",
            maxHeight: "calc(100dvh - 2rem)",
            display: "flex",
            flexDirection: "column",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1.25rem 1.5rem",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "20px",
                  marginBottom: "0.35rem",
                }}
              >
                <Sparkles size={12} />
                SFF Networking Game
              </div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>
                Join Nexus Bingo
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "1.5rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "0.35rem",
                }}
              >
                Full Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={17}
                  style={{
                    position: "absolute",
                    left: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.9rem 0.7rem 2.4rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "0.35rem",
                }}
              >
                Official Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={17}
                  style={{
                    position: "absolute",
                    left: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@fintechcorp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.9rem 0.7rem 2.4rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Participant Category */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "0.35rem",
                }}
              >
                Participant Category <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {(["Visitor", "Exhibitor", "Co-Exhibitor", "Organiser"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: "0.6rem",
                      borderRadius: "10px",
                      border: category === cat ? "2px solid #0284c7" : "1.5px solid #e2e8f0",
                      background: category === cat ? "rgba(2, 132, 199, 0.08)" : "#ffffff",
                      color: category === cat ? "#0284c7" : "#475569",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Designation & Company (2 columns) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.35rem",
                  }}
                >
                  Designation (Optional)
                </label>
                <div style={{ position: "relative" }}>
                  <Briefcase
                    size={15}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="e.g. Founder / VP"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.75rem 0.65rem 2.2rem",
                      borderRadius: "10px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "0.85rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.35rem",
                  }}
                >
                  Company (Optional)
                </label>
                <div style={{ position: "relative" }}>
                  <Building
                    size={15}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="e.g. Nexus Tech"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.75rem 0.65rem 2.2rem",
                      borderRadius: "10px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "0.85rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Scan Own Visiting Card */}
            <div
              style={{
                border: "1.5px dashed #cbd5e1",
                borderRadius: "12px",
                padding: "0.85rem",
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {ownVisitingCardUrl ? (
                  <img
                    src={ownVisitingCardUrl}
                    alt="Your visiting card"
                    style={{
                      width: "48px",
                      height: "34px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1.5px solid #10b981",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "rgba(2, 132, 199, 0.1)",
                      color: "#0284c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Camera size={20} />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                    {ownVisitingCardUrl ? "Your Visiting Card Scanned" : "Scan Your Visiting Card"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    {ownVisitingCardUrl
                      ? "Card image linked to your profile"
                      : "Optional: Snap a quick photo of your badge/card"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                style={{
                  background: ownVisitingCardUrl ? "rgba(16, 185, 129, 0.12)" : "rgba(2, 132, 199, 0.1)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.5rem 0.8rem",
                  color: ownVisitingCardUrl ? "#059669" : "#0284c7",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  flexShrink: 0,
                }}
              >
                {ownVisitingCardUrl ? <CheckCircle size={14} /> : <Camera size={14} />}
                {ownVisitingCardUrl ? "Re-scan" : "Scan Card"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                width: "100%",
                padding: "0.9rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                border: "none",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 4px 16px rgba(2, 132, 199, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {loading ? "Starting Your Game..." : "Start The Game (120 Mins)"}
            </button>
          </form>
        </div>
      </div>

      {/* Camera Modal for Scanning Own Card */}
      <BingoCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        title="Scan Your Visiting Card"
        subtitle="Align your business card or attendee badge inside the frame and snap a photo."
        onCaptureComplete={({ photoUrl }) => {
          setOwnVisitingCardUrl(photoUrl);
        }}
      />
    </>
  );
}
