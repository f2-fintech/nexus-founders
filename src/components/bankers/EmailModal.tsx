"use client";
import React, { useState } from "react";
import { X, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface EmailModalProps {
  banker: {
    _id: string;
    name: string;
    email: string;
    bankerProfile: {
      bankName: string;
      designation: string;
    };
  } | null;
  currentBankerName?: string;
  currentBankerBank?: string;
  onClose: () => void;
}

export default function EmailModal({
  banker,
  currentBankerName = "Fellow Banker",
  currentBankerBank = "Partner Institution",
  onClose,
}: EmailModalProps) {
  const [subject, setSubject] = useState(
    `Nexus Bankers Connect: Syndication & Partnership Inquiry with ${banker?.bankerProfile?.bankName || "your team"}`
  );
  const [message, setMessage] = useState(
    `Dear ${banker?.name || "Colleague"},\n\nI came across your profile on Nexus Bankers Connect. I would like to explore collaborative lending, venture debt syndication, and joint co-origination opportunities.\n\nLooking forward to hearing from you.\n\nBest regards,\n${currentBankerName}\n${currentBankerBank}`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!banker) return null;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/bankers-connect/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: banker._id,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to dispatch email");
      } else {
        setSuccess(data.message || "Email delivered successfully! The banker can reply directly.");
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bc-modal-overlay" onClick={onClose}>
      <div className="bc-modal-card" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <Mail size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Connect Over Email</h3>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              To: {banker.name} &bull; {banker.email} ({banker.bankerProfile.bankName})
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "8px",
              padding: "0.6rem 0.85rem",
              color: "#fca5a5",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: "8px",
              padding: "0.6rem 0.85rem",
              color: "#34d399",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
              Email Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "0.92rem",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem", textTransform: "uppercase" }}>
              Message Content
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "0.92rem",
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ background: "rgba(2, 132, 199, 0.1)", border: "1px solid rgba(2, 132, 199, 0.25)", borderRadius: "8px", padding: "0.6rem 0.85rem", fontSize: "0.78rem", color: "#38bdf8" }}>
            The recipient will receive an official invitation with your email as reply-to, plus F2 Fintech Singapore EXPO booth location.
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.65rem 1.25rem",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "transparent",
                color: "#cbd5e1",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.65rem 1.5rem",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                color: "#ffffff",
                cursor: loading ? "wait" : "pointer",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {loading ? "Sending Email..." : "Send Official Email"}
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
