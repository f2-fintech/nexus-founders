"use client";
import React, { useState, useEffect, useRef } from "react";
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
/*  Photo upload widget (Light Mode - Deferred Upload)                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function PhotoUploader({
  previewUrl,
  urlValue,
  onSelectFile,
  onUrlChange,
  isSaving,
}: {
  previewUrl: string;
  urlValue: string;
  onSelectFile: (file: File) => void;
  onUrlChange: (url: string) => void;
  isSaving: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFile = (file: File) => {
    setFileError("");
    if (!file.type.startsWith("image/")) {
      setFileError("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File too large (max 10 MB).");
      return;
    }
    onSelectFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label style={{
        display: "block", fontSize: "0.8rem", fontWeight: 600,
        color: "#475569", marginBottom: "0.45rem",
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        Founder Photo
      </label>

      {/* Preview + drop zone */}
      <div
        onClick={() => !isSaving && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          position: "relative",
          width: "100%",
          height: "180px",
          borderRadius: "12px",
          border: `2px dashed ${dragOver ? "#0284c7" : previewUrl ? "#0284c7" : "#cbd5e1"}`,
          background: dragOver
            ? "rgba(2, 132, 199, 0.08)"
            : previewUrl
              ? "transparent"
              : "#f8fafc",
          cursor: isSaving ? "wait" : "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        {/* Current photo preview */}
        {previewUrl && !isSaving && (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "top center",
              }}
            />
            {/* Hover overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(15, 23, 42, 0.65)",
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
        {!previewUrl && !isSaving && (
          <div style={{ textAlign: "center", pointerEvents: "none" }}>
            <ImageIcon size={36} color="#0284c7" style={{ marginBottom: "0.6rem", opacity: 0.7 }} />
            <p style={{ color: "#334155", fontSize: "0.88rem", fontWeight: 600, margin: 0 }}>
              Click or drag & drop an image
            </p>
            <p style={{ color: "#64748b", fontSize: "0.76rem", marginTop: "0.25rem" }}>
              JPG, PNG, WEBP, GIF, etc. (up to 10 MB)
            </p>
          </div>
        )}

        {/* Uploading spinner */}
        {isSaving && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "36px", height: "36px",
              border: "3px solid #e2e8f0",
              borderTop: "3px solid #0284c7",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 0.6rem",
            }} />
            <p style={{ color: "#0284c7", fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>Uploading to S3 & saving…</p>
          </div>
        )}

        {/* Success tick */}
        {previewUrl && !isSaving && (
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            background: "#10b981", borderRadius: "50%",
            width: "24px", height: "24px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
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
        value={urlValue}
        onChange={(e) => onUrlChange(e.target.value)}
        style={{
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.65rem 0.9rem",
          background: "#ffffff",
          border: "1.5px solid #e2e8f0",
          borderRadius: "8px",
          color: "#0f172a",
          fontSize: "0.82rem",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#0284c7"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
      />

      {fileError && (
        <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <AlertCircle size={13} /> {fileError}
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
/*  Main modal (Clean Light Mode)                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function FounderModal({ founder, onSave, onClose, saveError }: Props) {
  const isEdit = !!founder;
  const [form, setForm] = useState<FormState>({
    name: "", role: "Founder", company: "", photo: "",
    linkedin: "", instagram: "", googleplus: "", twitter: "", facebook: "", youtube: "", order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(founder?.photo || "");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

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
      setPreviewUrl(founder.photo || "");
      setSelectedFile(null);
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
      setPreviewUrl("");
      setSelectedFile(null);
      setActiveSocials(new Set());
    }
  }, [founder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSelectFile = (file: File) => {
    setValidationError("");
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUrlChange = (url: string) => {
    setValidationError("");
    setSelectedFile(null);
    setPreviewUrl(url);
    setForm((p) => ({ ...p, photo: url }));
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
    setValidationError("");
    try {
      let finalPhotoUrl = form.photo;

      // 1. If an image file was selected by the admin, upload it to S3 first!
      if (selectedFile) {
        const webpFile = await convertToWebP(selectedFile, 0.9);
        const fd = new FormData();
        fd.append("file", webpFile);
        fd.append("folder", "nexus-founders/founders");

        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
          throw new Error(uploadJson.error || "Failed to upload image to S3");
        }
        finalPhotoUrl = uploadJson.url;
      }

      // 2. Both /api/upload and /api/founders run when Add to Directory is clicked
      await onSave({ ...form, photo: finalPhotoUrl } as any);
    } catch (err: any) {
      setValidationError(err?.message || "Failed to save founder.");
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
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22 }}
        style={{
          background: "#ffffff",
          border: "1px solid rgba(2, 132, 199, 0.2)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.2)",
          borderRadius: "20px",
          padding: "2rem",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            <Sparkles size={20} style={{ color: "#0284c7" }} />
            {isEdit ? "Edit Founder" : "Add New Founder"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            background: "#fef2f2", border: "1px solid #fca5a5",
            borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem",
            color: "#b91c1c", fontSize: "0.88rem",
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Required text fields */}
          {[
            { key: "name",    label: "Full Name",   placeholder: "e.g. Harpreet Singh" },
            { key: "role",    label: "Role / Title", placeholder: "e.g. Founder & CEO"  },
            { key: "company", label: "Company",      placeholder: "e.g. Nexus Founders" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {label}<span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
              </label>
              <input
                name={key}
                value={(form as any)[key] ?? ""}
                onChange={handleChange}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "#ffffff",
                  border: `1.5px solid ${!(form as any)[key]?.trim() && validationError ? "#ef4444" : "#e2e8f0"}`,
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
                  e.currentTarget.style.borderColor = !(form as any)[key]?.trim() && validationError ? "#ef4444" : "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          ))}

          {/* Photo upload widget */}
          <PhotoUploader
            previewUrl={previewUrl}
            urlValue={form.photo ?? ""}
            onSelectFile={handleSelectFile}
            onUrlChange={handleUrlChange}
            isSaving={saving}
          />

          {/* Active Social Links */}
          {activeList.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.25rem" }}>
              {activeList.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}>
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
                        fontWeight: 600,
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
                      width: "100%", padding: "0.75rem 1rem",
                      background: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px", color: "#0f172a",
                      outline: "none", fontSize: "0.92rem", boxSizing: "border-box",
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
                      background: "#f8fafc",
                      border: "1.5px dashed #0284c7",
                      color: "#0284c7",
                      borderRadius: "8px",
                      padding: "0.45rem 0.8rem",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(2, 132, 199, 0.1)";
                      e.currentTarget.style.borderColor = "#0284c7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#0284c7";
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
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "#f1f5f9",
              border: "none",
              color: "#475569",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 2,
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              border: "none",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: saving ? "wait" : "pointer",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.25)",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.95"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            {saving ? "Uploading to S3 & Saving…" : isEdit ? "Save Changes" : "Add to Directory"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}