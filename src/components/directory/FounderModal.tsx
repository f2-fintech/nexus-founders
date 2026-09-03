"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Founder } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { X, Sparkles, AlertCircle, Upload, ImageIcon, Check, Plus, Trash2 } from "lucide-react";
import { convertToWebP } from "@/lib/imageUtils";

interface Props {
  founder?: Founder | null;
  onSave: (f: Founder | Omit<Founder, "_id">) => Promise<void>;
  onClose: () => void;
  saveError?: string;
}

type FormState = Omit<Founder, "_id"> & { _id?: string };

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Photo upload widget                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function PhotoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const doUpload = useCallback(async (file: File) => {
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large (max 10 MB).");
      return;
    }

    setUploading(true);
    try {
      // Convert image to WebP in browser first
      const webpFile = await convertToWebP(file, 0.9);
      const fd = new FormData();
      fd.append("file", webpFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");
      onChange(json.url);
    } catch (err: any) {
      setUploadError(err?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  };

  return (
    <div>
      <label style={{
        display: "block", fontSize: "0.8rem", fontWeight: 600,
        color: "#94a3b8", marginBottom: "0.5rem",
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        Founder Photo
      </label>

      {/* Preview + drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          position: "relative",
          width: "100%",
          height: "180px",
          borderRadius: "12px",
          border: `2px dashed ${dragOver ? "#22d3ee" : value ? "rgba(34,211,238,0.4)" : "rgba(99,102,241,0.35)"}`,
          background: dragOver
            ? "rgba(34,211,238,0.08)"
            : value
              ? "transparent"
              : "rgba(30,41,59,0.5)",
          cursor: uploading ? "wait" : "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        {/* Current photo preview */}
        {value && !uploading && (
          <>
            <img
              src={value}
              alt="Preview"
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "top center",
              }}
            />
            {/* Hover overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "0.4rem",
              opacity: 0, transition: "opacity 0.2s",
            }}
              className="photo-hover-overlay"
            >
              <Upload size={22} color="#fff" />
              <span style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>Click or drag to replace</span>
            </div>
          </>
        )}

        {/* Upload placeholder */}
        {!value && !uploading && (
          <div style={{ textAlign: "center", pointerEvents: "none" }}>
            <ImageIcon size={36} color="rgba(99,102,241,0.5)" style={{ marginBottom: "0.6rem" }} />
            <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
              Click or drag & drop an image
            </p>
            <p style={{ color: "#475569", fontSize: "0.76rem", marginTop: "0.25rem" }}>
              JPG, PNG, WEBP, GIF, etc. (up to 10 MB)
            </p>
          </div>
        )}

        {/* Uploading spinner */}
        {uploading && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "36px", height: "36px",
              border: "3px solid rgba(34,211,238,0.2)",
              borderTop: "3px solid #22d3ee",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 0.6rem",
            }} />
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>Uploading image…</p>
          </div>
        )}

        {/* Success tick */}
        {value && !uploading && (
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            background: "#10b981", borderRadius: "50%",
            width: "24px", height: "24px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}>
            <Check size={14} color="#fff" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileInput}
      />

      {/* Manual URL entry */}
      <input
        type="text"
        placeholder="…or paste image URL directly"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.6rem 0.9rem",
          background: "rgba(30,41,59,0.6)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "8px",
          color: "#94a3b8",
          fontSize: "0.8rem",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; }}
      />

      {uploadError && (
        <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <AlertCircle size={13} /> {uploadError}
        </p>
      )}

      <style>{`
        .photo-hover-overlay { pointer-events: none; }
        div:hover > .photo-hover-overlay { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Social configuration list                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const ALL_SOCIAL: { key: keyof FormState; label: string; placeholder: string; badge: string }[] = [
  { key: "linkedin",   label: "LinkedIn URL",       placeholder: "https://linkedin.com/in/...",  badge: "LinkedIn" },
  { key: "instagram",  label: "Instagram URL",      placeholder: "https://instagram.com/...",    badge: "Instagram" },
  { key: "googleplus", label: "Website / Email",    placeholder: "https://... or mailto:...",    badge: "Website / Email" },
  { key: "twitter",    label: "Twitter / X URL",    placeholder: "https://x.com/...",            badge: "Twitter / X" },
  { key: "facebook",   label: "Facebook URL",       placeholder: "https://facebook.com/...",     badge: "Facebook" },
  { key: "youtube",    label: "YouTube URL",        placeholder: "https://youtube.com/...",      badge: "YouTube" },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main modal                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function FounderModal({ founder, onSave, onClose, saveError }: Props) {
  const isEdit = !!founder;
  const [form, setForm] = useState<FormState>({
    name: "", role: "Founder", company: "", photo: "",
    linkedin: "", instagram: "", googleplus: "", twitter: "", facebook: "", youtube: "", order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Only show social inputs if they are already filled or manually activated
  const [activeSocials, setActiveSocials] = useState<Set<keyof FormState>>(() => {
    const filled = new Set<keyof FormState>();
    if (founder) {
      ALL_SOCIAL.forEach(({ key }) => {
        if ((founder as any)[key] && String((founder as any)[key]).trim() !== "") {
          filled.add(key);
        }
      });
    }
    return filled;
  });

  useEffect(() => {
    if (founder) {
      setForm({ ...founder });
      const filled = new Set<keyof FormState>();
      ALL_SOCIAL.forEach(({ key }) => {
        if ((founder as any)[key] && String((founder as any)[key]).trim() !== "") {
          filled.add(key);
        }
      });
      setActiveSocials(filled);
    } else {
      setForm({
        name: "", role: "Founder", company: "", photo: "",
        linkedin: "", instagram: "", googleplus: "", twitter: "", facebook: "", youtube: "", order: 0,
      });
      setActiveSocials(new Set());
    }
  }, [founder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const addSocialField = (key: keyof FormState) => {
    setActiveSocials((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const removeSocialField = (key: keyof FormState) => {
    setActiveSocials((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setForm((p) => ({ ...p, [key]: "" }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim() || !form.company.trim()) {
      setValidationError("Name, role, and company are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form as any);
    } catch {
      // error shown via saveError prop
    } finally {
      setSaving(false);
    }
  };

  const activeList = ALL_SOCIAL.filter(({ key }) => activeSocials.has(key));
  const hiddenList = ALL_SOCIAL.filter(({ key }) => !activeSocials.has(key));
  const error = validationError || saveError;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(3, 7, 18, 0.82)",
        backdropFilter: "blur(12px)",
        zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.28 }}
        style={{
          background: "rgba(15, 23, 42, 0.97)",
          border: "1px solid rgba(6, 182, 212, 0.35)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.9), 0 0 40px rgba(6,182,212,0.15)",
          borderRadius: "20px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            <Sparkles size={20} style={{ color: "#22d3ee" }} />
            {isEdit ? "Edit Founder" : "Add New Founder"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", borderRadius: "8px", padding: "0.4rem", display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem",
            color: "#fca5a5", fontSize: "0.88rem",
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Required text fields */}
          {[
            { key: "name",    label: "Full Name",   placeholder: "e.g. Harpreet Singh" },
            { key: "role",    label: "Role / Title", placeholder: "e.g. Founder & CEO"  },
            { key: "company", label: "Company",      placeholder: "e.g. Nexus Founders" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {label}<span style={{ color: "#f87171", marginLeft: "2px" }}>*</span>
              </label>
              <input
                name={key}
                value={(form as any)[key] ?? ""}
                onChange={handleChange}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  background: "rgba(30,41,59,0.7)",
                  border: `1px solid ${key !== "name" ? "rgba(99,102,241,0.25)" : !(form as any)[key]?.trim() && validationError ? "rgba(239,68,68,0.5)" : "rgba(99,102,241,0.25)"}`,
                  borderRadius: "10px", color: "#e2e8f0", outline: "none",
                  fontSize: "0.9rem", boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"; }}
              />
            </div>
          ))}

          {/* Photo upload widget */}
          <PhotoUploader
            value={form.photo ?? ""}
            onChange={(url) => setForm((p) => ({ ...p, photo: url }))}
          />

          {/* Active Social Links */}
          {activeList.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.25rem" }}>
              {activeList.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {label}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSocialField(key)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.75rem",
                        padding: "0.1rem 0.3rem",
                      }}
                      title="Remove field"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                  <input
                    name={key}
                    value={(form as any)[key] ?? ""}
                    onChange={handleChange}
                    placeholder={placeholder}
                    style={{
                      width: "100%", padding: "0.7rem 1rem",
                      background: "rgba(30,41,59,0.7)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      borderRadius: "10px", color: "#e2e8f0",
                      outline: "none", fontSize: "0.9rem", boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.6)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"; }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* "+ Add Social Link" Pills */}
          {hiddenList.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                + Add Social Links / Profiles
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {hiddenList.map(({ key, badge }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addSocialField(key)}
                    style={{
                      background: "rgba(30, 41, 59, 0.8)",
                      border: "1px dashed rgba(6, 182, 212, 0.4)",
                      color: "#38bdf8",
                      borderRadius: "8px",
                      padding: "0.4rem 0.75rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(6, 182, 212, 0.15)";
                      e.currentTarget.style.borderColor = "#22d3ee";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(30, 41, 59, 0.8)";
                      e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.4)";
                    }}
                  >
                    <Plus size={13} />
                    <span>{badge}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
          <button onClick={onClose} disabled={saving} className="btn-neon-secondary" style={{ flex: 1, justifyContent: "center" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-neon-primary" style={{ flex: 2, justifyContent: "center" }}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add to Directory"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}