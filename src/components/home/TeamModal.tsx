"use client";
import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Loader2,
  Trash2,
  Plus,
  Mail,
  User,
} from "lucide-react";
import {
  LinkedinIcon,
  GmailIcon,
  MailIcon,
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  YoutubeIcon,
  GlobeIcon,
} from "@/components/common/SocialIcons";
import { convertToWebP } from "@/lib/imageUtils";

export interface TeamMemberData {
  _id?: string;
  name: string;
  designation: string;
  description: string;
  photo: string;
  socialLinks: {
    linkedin?: string;
    email?: string;
    gmail?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    facebook?: string;
    youtube?: string;
  };
  order?: number;
}

interface TeamModalProps {
  member: TeamMemberData | null;
  onSave: (data: TeamMemberData) => Promise<void>;
  onClose: () => void;
  saveError?: string;
}

const ALL_SOCIAL_KEYS = [
  { key: "linkedin", label: "LinkedIn", icon: <LinkedinIcon size={14} />, placeholder: "https://linkedin.com/in/..." },
  { key: "gmail", label: "Gmail", icon: <GmailIcon size={14} />, placeholder: "username@gmail.com" },
  { key: "email", label: "Email / Mail", icon: <MailIcon size={14} />, placeholder: "mailto:name@example.com or name@example.com" },
  { key: "instagram", label: "Instagram", icon: <InstagramIcon size={14} />, placeholder: "https://instagram.com/..." },
  { key: "twitter", label: "Twitter / X", icon: <TwitterIcon size={14} />, placeholder: "https://x.com/..." },
  { key: "website", label: "Website", icon: <GlobeIcon size={14} />, placeholder: "https://example.com" },
  { key: "facebook", label: "Facebook", icon: <FacebookIcon size={14} />, placeholder: "https://facebook.com/..." },
  { key: "youtube", label: "YouTube", icon: <YoutubeIcon size={14} />, placeholder: "https://youtube.com/..." },
];

export default function TeamModal({ member, onSave, onClose, saveError }: TeamModalProps) {
  const [name, setName] = useState(member?.name || "");
  const [designation, setDesignation] = useState(member?.designation || "");
  const [description, setDescription] = useState(member?.description || "");
  const [photo, setPhoto] = useState(member?.photo || "");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {};
    if (member?.socialLinks) {
      Object.entries(member.socialLinks).forEach(([k, v]) => {
        if (typeof v === "string" && v.trim()) s[k] = v;
      });
    }
    if (!member) {
      s.linkedin = "";
      s.email = "";
    }
    return s;
  });

  const [activeKeys, setActiveKeys] = useState<string[]>(() => {
    if (member?.socialLinks) {
      const keys = Object.keys(member.socialLinks).filter((k) => (member.socialLinks as any)[k]);
      return keys.length > 0 ? keys : ["linkedin", "email"];
    }
    return ["linkedin", "email"];
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10 MB).");
      return;
    }

    setError("");
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPhoto(localUrl);
    e.target.value = "";
  };

  const handleAddSocialField = (key: string) => {
    if (!activeKeys.includes(key)) {
      setActiveKeys((prev: string[]) => [...prev, key]);
      setSocialLinks((prev: Record<string, string>) => ({ ...prev, [key]: "" }));
    }
  };

  const handleRemoveSocialField = (key: string) => {
    setActiveKeys((prev: string[]) => prev.filter((k: string) => k !== key));
    setSocialLinks((prev: Record<string, string>) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSocialChange = (key: string, val: string) => {
    setSocialLinks((prev: Record<string, string>) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!designation.trim()) {
      setError("Designation is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let finalPhoto = photo;

      // 1. If a local file was selected, upload to S3 now on form submission
      if (selectedFile) {
        setUploading(true);
        const webpFile = await convertToWebP(selectedFile, 0.9);
        const formData = new FormData();
        formData.append("file", webpFile);
        formData.append("folder", "nexus-founders/team");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Upload failed");
        finalPhoto = json.url;
        setPhoto(json.url);
      }

      const cleanSocial: Record<string, string> = {};
      Object.entries(socialLinks).forEach(([k, v]) => {
        if (typeof v === "string" && v.trim()) {
          const strVal = v.trim();
          if ((k === "email" || k === "gmail") && !strVal.startsWith("mailto:") && strVal.includes("@")) {
            cleanSocial[k] = `mailto:${strVal}`;
          } else {
            cleanSocial[k] = strVal;
          }
        }
      });

      // 2. Both /api/upload and /api/team run when Save Member is clicked
      await onSave({
        ...(member?._id ? { _id: member._id } : {}),
        name: name.trim(),
        designation: designation.trim(),
        description: description.trim(),
        photo: finalPhoto.trim() || "/images/avatar-placeholder.webp",
        socialLinks: cleanSocial,
        order: member?.order ?? 0,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to save team member.");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const availableToAdd = ALL_SOCIAL_KEYS.filter((s) => !activeKeys.includes(s.key));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(2, 132, 199, 0.2)",
          padding: "2rem",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem" }}>
          {member ? "Edit Team Member" : "Add Coordination Team Member"}
        </h2>
        <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "1.5rem" }}>
          Upload photo and configure details for the Nexus Founders coordination team
        </p>

        {(error || saveError) && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              color: "#b91c1c",
              fontSize: "0.88rem",
            }}
          >
            {error || saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* Photo Upload from Any Device */}
          <div>
            <label style={fieldLabelStyle}>Photo / Avatar</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              {/* Preview Circle */}
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: photo ? "2.5px solid #0284c7" : "2px dashed #cbd5e1",
                  flexShrink: 0,
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: photo ? "0 4px 12px rgba(2, 132, 199, 0.15)" : "none",
                }}
              >
                {photo ? (
                  <img
                    src={photo}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setPhoto("")}
                  />
                ) : (
                  <User size={32} color="#94a3b8" />
                )}
              </div>

              {/* Upload & Clear Button */}
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.55rem 1.1rem",
                      background: "rgba(2, 132, 199, 0.08)",
                      border: "1px solid rgba(2, 132, 199, 0.3)",
                      borderRadius: "8px",
                      color: "#0284c7",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      cursor: uploading ? "wait" : "pointer",
                    }}
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span>{uploading ? "Uploading..." : photo ? "Change Photo" : "Upload from Device"}</span>
                  </button>

                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto("")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.35rem" }}>
                  Supports PNG, JPG, JPEG, WEBP from any device
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={fieldLabelStyle}>
              Full Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amit Negi"
              required
              style={inputStyle}
            />
          </div>

          {/* Designation */}
          <div>
            <label style={fieldLabelStyle}>
              Designation / Role <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Video Editor / Graphic Designer"
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={fieldLabelStyle}>Description / Bio</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of their role and contribution..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Dynamic Social Links */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <label style={{ ...fieldLabelStyle, marginBottom: 0 }}>Social &amp; Contact Links</label>
            </div>

            {/* Active Social Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "0.75rem" }}>
              {activeKeys.map((key: string) => {
                const conf = ALL_SOCIAL_KEYS.find((s) => s.key === key);
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        minWidth: "115px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#475569",
                        background: "#f1f5f9",
                        padding: "0.5rem 0.65rem",
                        borderRadius: "8px",
                      }}
                    >
                      {conf?.icon}
                      <span>{conf?.label}</span>
                    </div>

                    <input
                      type="text"
                      value={socialLinks[key] || ""}
                      onChange={(e) => handleSocialChange(key, e.target.value)}
                      placeholder={conf?.placeholder || "URL"}
                      style={{ ...inputStyle, flex: 1 }}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveSocialField(key)}
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fee2e2",
                        color: "#ef4444",
                        borderRadius: "8px",
                        padding: "0.5rem 0.6rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Remove field"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add More Social Links Chips */}
            {availableToAdd.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "#64748b", marginRight: "0.25rem" }}>Add link:</span>
                {availableToAdd.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleAddSocialField(s.key)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.3rem 0.65rem",
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                      borderRadius: "20px",
                      fontSize: "0.78rem",
                      color: "#475569",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={12} />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: "8px",
                padding: "0.65rem 1.4rem",
                color: "#475569",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, #0284c7, #2563eb)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0.65rem 1.8rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: saving ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
              }}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <span>{member ? "Save Changes" : "Add Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "0.45rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.85rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};
