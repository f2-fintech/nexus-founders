"use client";
import React, { useState } from "react";
import { X, Mail, Copy, Check, ExternalLink, Send, ArrowUpRight } from "lucide-react";

interface EmailChooserModalProps {
  banker: {
    name: string;
    email: string;
    bankerProfile?: {
      bankName?: string;
      designation?: string;
    };
  } | null;
  onClose: () => void;
}

export default function EmailChooserModal({ banker, onClose }: EmailChooserModalProps) {
  const [copied, setCopied] = useState(false);

  if (!banker || !banker.email) return null;

  const targetEmail = banker.email.trim();
  const targetName = banker.name || "Banker";
  const targetBank = banker.bankerProfile?.bankName || "";

  // 1. Gmail Web & Mobile App Link
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}`;

  // 2. Default System mailto URL
  const mailtoUrl = `mailto:${targetEmail}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetEmail);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = targetEmail;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleOpenGmail = () => {
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleOpenDefaultMail = () => {
    window.location.href = mailtoUrl;
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(10, 15, 29, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "bcFadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1e293b",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
          color: "#f8fafc",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                Send Email
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                Choose your preferred email application
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "none",
              color: "#94a3b8",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Banker Recipient Preview */}
        <div style={{ padding: "1.25rem 1.5rem 0.75rem" }}>
          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "0.85rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff" }}>
                {targetName}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: 600 }}>
                {targetBank ? `${targetBank} • ` : ""}{targetEmail}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                border: copied ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255, 255, 255, 0.12)",
                color: copied ? "#34d399" : "#e2e8f0",
                padding: "0.45rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              title="Copy email to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Options List */}
        <div style={{ padding: "0.5rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Option 1: Gmail */}
          <button
            type="button"
            onClick={handleOpenGmail}
            style={{
              width: "100%",
              padding: "0.95rem 1.1rem",
              borderRadius: "12px",
              border: "1.5px solid rgba(239, 68, 68, 0.35)",
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.04) 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.7)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#ea4335",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 12px rgba(234, 67, 53, 0.35)",
                }}
              >
                M
              </div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                  Open with Gmail
                </div>
                <div style={{ fontSize: "0.77rem", color: "#fca5a5" }}>
                  Opens Gmail in browser or Gmail App on mobile
                </div>
              </div>
            </div>
            <ArrowUpRight size={18} color="#fca5a5" />
          </button>

          {/* Option 2: Default System Mail Client */}
          <button
            type="button"
            onClick={handleOpenDefaultMail}
            style={{
              width: "100%",
              padding: "0.95rem 1.1rem",
              borderRadius: "12px",
              border: "1.5px solid rgba(59, 130, 246, 0.35)",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.04) 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.7)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                }}
              >
                <Send size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                  Default Mail App
                </div>
                <div style={{ fontSize: "0.77rem", color: "#93c5fd" }}>
                  Apple Mail, Microsoft Outlook, Samsung Mail
                </div>
              </div>
            </div>
            <ArrowUpRight size={18} color="#93c5fd" />
          </button>

          {/* Option 3: Copy Email Directly */}
          <button
            type="button"
            onClick={handleCopy}
            style={{
              width: "100%",
              padding: "0.85rem 1.1rem",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                }}
              >
                {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
              </div>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: copied ? "#34d399" : "#e2e8f0" }}>
                  {copied ? "Email Copied to Clipboard!" : "Copy Email Address"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                  {targetEmail}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
