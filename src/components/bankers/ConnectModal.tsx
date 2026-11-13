"use client";
import React, { useState } from "react";
import { X, Send, UserCheck, Building2 } from "lucide-react";

interface ConnectModalProps {
  banker: {
    _id: string;
    name: string;
    email: string;
    bankerProfile: {
      bankName: string;
      designation: string;
      department?: string;
    };
  } | null;
  onClose: () => void;
  onSuccess: (targetId: string, introMessage: string) => void;
}

export default function ConnectModal({ banker, onClose, onSuccess }: ConnectModalProps) {
  const [introMessage, setIntroMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!banker) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bankers-connect/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: banker._id,
          introMessage: introMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to send connection request");
      } else {
        onSuccess(banker._id, introMessage.trim());
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bc-modal-overlay" onClick={onClose}>
      <div className="bc-modal-card" onClick={(e) => e.stopPropagation()}>
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
              background: "linear-gradient(135deg, #10b981 0%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
            }}
          >
            <UserCheck size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Connect with Banker</h3>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              {banker.name} &bull; {banker.bankerProfile.bankName}
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
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSend}>
          <label
            style={{
              display: "block",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#cbd5e1",
              marginBottom: "0.4rem",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            Add an Optional Introduction Note
          </label>
          <textarea
            rows={3}
            value={introMessage}
            onChange={(e) => setIntroMessage(e.target.value)}
            placeholder={`Hi ${banker.name}, I would love to connect regarding venture debt syndication and startup credit lines in our region.`}
            maxLength={500}
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
              resize: "none",
              marginBottom: "0.4rem",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
            <span>A custom note increases accept rate by 3x</span>
            <span>{introMessage.length}/500</span>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
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
                background: "#10b981",
                color: "#ffffff",
                cursor: loading ? "wait" : "pointer",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {loading ? "Sending..." : "Send Request"}
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
