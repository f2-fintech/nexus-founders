"use client";
import React, { useState, useRef, useCallback } from "react";
import { Founder, useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { Globe, Edit2, Trash2 } from "lucide-react";
import { GmailIcon, MailIcon } from "@/components/common/SocialIcons";

function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.37 9.74V9.93H5.09v8.57h2.74z" />
    </svg>
  );
}

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TwitterIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface Props {
  founder: Founder;
  onEdit: (f: Founder) => void;
  index: number;
}

export default function FounderCard({ founder, onEdit, index }: Props) {
  const { isEditMode, deleteFounder } = useAdmin();
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleDelete = async () => {
    if (!confirm(`Remove ${founder.name} from directory?`)) return;
    try {
      await deleteFounder(founder._id);
    } catch (err: any) {
      alert(err?.message || "Failed to delete founder. Please try again.");
    }
  };

  const photoSrc = imgError || !founder.photo ? "/images/logo.webp" : founder.photo;

  /* ── CSS 3D tilt on the whole card ───────────────────────────── */
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 18}deg) rotateX(${-y * 14}deg) scale3d(1.04,1.04,1.04)`;
      card.style.boxShadow = `
        ${-x * 20}px ${y * 20}px 40px rgba(14,165,233,0.18),
        0 20px 60px rgba(0,0,0,0.15)
      `;
    });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s ease";
    card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    card.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
    setTimeout(() => {
      if (card) card.style.transition = "";
    }, 560);
  }, []);

  const handleCardMouseEnter = useCallback(() => {
    const card = cardRef.current;
    if (card) card.style.transition = "none";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min((index % 8) * 0.08, 0.6) }}
      className="founder-cyber-card"
      ref={cardRef}
      onMouseMove={handleCardMouseMove}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      style={{ willChange: "transform" }}
    >
      {isEditMode && (
        <div style={{
          position: "absolute",
          top: "0.75rem",
          right: "0.75rem",
          zIndex: 20,
          display: "flex",
          gap: "0.4rem",
        }}>
          <button
            onClick={() => onEdit(founder)}
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid var(--neon-cyan)",
              color: "var(--neon-cyan)",
              padding: "0.4rem",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid var(--neon-rose)",
              color: "var(--neon-rose)",
              padding: "0.4rem",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* ── Founder Photo ───────────────────────────────────── */}
      <div className="founder-photo-container">
        <img
          src={photoSrc}
          alt={founder.name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />
      </div>

      {/* ── Card body ────────────────────────────────────────── */}
      <div className="founder-cyber-body">
        <h3 className="founder-cyber-name">{founder.name}</h3>
        <p className="founder-cyber-role">{founder.role}</p>
        <p className="founder-cyber-company">{founder.company}</p>

        <div className="founder-socials-row">
          {founder.linkedin && (
            <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="social-neon-btn in" title="LinkedIn">
              <LinkedinIcon size={15} />
            </a>
          )}
          {founder.instagram && (
            <a href={founder.instagram} target="_blank" rel="noopener noreferrer" className="social-neon-btn ig" title="Instagram">
              <InstagramIcon size={15} />
            </a>
          )}
          {founder.googleplus && (
            <a
              href={founder.googleplus.startsWith("mailto:") || founder.googleplus.startsWith("http") ? founder.googleplus : `https://${founder.googleplus}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-neon-btn gp"
              title={founder.googleplus.includes("@") ? "Email / Gmail" : "Website / Profile"}
            >
              {founder.googleplus.toLowerCase().includes("gmail") ? (
                <GmailIcon size={15} />
              ) : founder.googleplus.includes("@") || founder.googleplus.startsWith("mailto:") ? (
                <MailIcon size={15} />
              ) : (
                <Globe size={15} />
              )}
            </a>
          )}
          {founder.twitter && (
            <a href={founder.twitter} target="_blank" rel="noopener noreferrer" className="social-neon-btn tw" title="Twitter / X">
              <TwitterIcon size={14} />
            </a>
          )}
          {founder.facebook && (
            <a href={founder.facebook} target="_blank" rel="noopener noreferrer" className="social-neon-btn fb" title="Facebook">
              <FacebookIcon size={14} />
            </a>
          )}
          {founder.youtube && (
            <a href={founder.youtube} target="_blank" rel="noopener noreferrer" className="social-neon-btn yt" title="YouTube">
              <YoutubeIcon size={14} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}