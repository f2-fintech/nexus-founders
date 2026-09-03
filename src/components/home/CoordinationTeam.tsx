"use client";
import React, { useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Loader2,
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
import { TeamMemberSkeleton } from "@/components/common/Skeleton";
import TeamModal, { TeamMemberData } from "./TeamModal";

export default function CoordinationTeam() {
  const { isEditMode } = useAdmin();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);
  const [saveError, setSaveError] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/team");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMembers(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openAdd = () => {
    setSelectedMember(null);
    setSaveError("");
    setModalOpen(true);
  };

  const openEdit = (member: TeamMemberData) => {
    setSelectedMember(member);
    setSaveError("");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the Coordination Team?`)) return;

    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMembers((prev) => prev.filter((m) => m._id !== id));
      } else {
        alert(json.error || "Failed to delete team member");
      }
    } catch (err: any) {
      alert(err?.message || "Error deleting team member");
    }
  };

  const handleSave = async (data: TeamMemberData) => {
    setSaveError("");
    try {
      if (data._id) {
        // Update
        const res = await fetch(`/api/team/${data._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Update failed");
        setMembers((prev) => prev.map((m) => (m._id === data._id ? json.data : m)));
      } else {
        // Create
        const res = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Creation failed");
        setMembers((prev) => [...prev, json.data]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save team member.");
    }
  };

  return (
    <section className="section-wrapper" style={{ padding: "4rem 1.5rem 5rem", position: "relative" }}>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "3.5rem" }}
      >
        <span className="section-tag" style={{ justifyContent: "center" }}>
          <Users size={16} /> Community Coordination Team
        </span>
        <h2 className="section-heading" style={{ marginTop: "0.5rem" }}>
          Nexus Founders | <span className="gradient-text-cyan">Coordination Team</span>
        </h2>

        {/* Add Button when in Edit Mode */}
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginTop: "1.5rem" }}
          >
            <button
              onClick={openAdd}
              className="btn-neon-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.5rem",
                fontSize: "0.9rem",
                borderRadius: "50px",
              }}
            >
              <UserPlus size={16} />
              <span>+ Add Team Member</span>
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "2rem" }}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <TeamMemberSkeleton key={`team-skeleton-${idx}`} />
          ))}
        </div>
      ) : (
        /* Team Grid */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "2rem" }}>
          {members.map((member, i) => {
            const links = member.socialLinks || {};
            return (
              <motion.div
                key={member._id || member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "18px",
                  padding: "2.25rem 1.6rem 1.8rem",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 14px 35px rgba(2, 132, 199, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.04)";
                }}
              >
                {/* Admin Quick Edit & Delete Controls */}
                {isEditMode && (
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      display: "flex",
                      gap: "0.4rem",
                      zIndex: 20,
                    }}
                  >
                    <button
                      onClick={() => openEdit(member)}
                      style={{
                        background: "rgba(2, 132, 199, 0.1)",
                        border: "1px solid rgba(2, 132, 199, 0.3)",
                        color: "#0284c7",
                        borderRadius: "8px",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Edit Member"
                    >
                      <Edit2 size={13} />
                    </button>
                    {member._id && (
                      <button
                        onClick={() => handleDelete(member._id!, member.name)}
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          color: "#ef4444",
                          borderRadius: "8px",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        title="Delete Member"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* Photo Circle */}
                <div
                  style={{
                    width: "124px",
                    height: "124px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    marginBottom: "1.25rem",
                    border: "3px solid #0284c7",
                    boxShadow: "0 6px 20px rgba(2, 132, 199, 0.25)",
                    background: "#f8fafc",
                  }}
                >
                  <img
                    src={member.photo || "/images/avatar-placeholder.webp"}
                    alt={member.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://nexusfounders.com/wp-content/uploads/2026/08/amit.jpg_cropped-300x300.jpeg";
                    }}
                  />
                </div>

                {/* Name */}
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.3rem" }}>
                  {member.name}
                </h3>

                {/* Designation */}
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0284c7", marginBottom: "0.9rem" }}>
                  {member.designation}
                </p>

                {/* Description */}
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                    marginBottom: "1.5rem",
                    flex: 1,
                  }}
                >
                  {member.description}
                </p>

                {/* Only Show Icons for Provided Links */}
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                  {links.linkedin && (
                    <a
                      href={links.linkedin.startsWith("http") ? links.linkedin : `https://${links.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-neon-btn in"
                      title="LinkedIn"
                    >
                      <LinkedinIcon size={14} />
                    </a>
                  )}

                  {links.gmail && (
                    <a
                      href={links.gmail.startsWith("mailto:") ? links.gmail : `mailto:${links.gmail}`}
                      className="social-neon-btn gp"
                      title="Gmail"
                    >
                      <GmailIcon size={14} />
                    </a>
                  )}

                  {links.email && (
                    <a
                      href={links.email.startsWith("mailto:") ? links.email : `mailto:${links.email}`}
                      className="social-neon-btn gp"
                      title="Email"
                    >
                      <MailIcon size={14} />
                    </a>
                  )}

                  {links.instagram && (
                    <a
                      href={links.instagram.startsWith("http") ? links.instagram : `https://${links.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-neon-btn ig"
                      title="Instagram"
                    >
                      <InstagramIcon size={14} />
                    </a>
                  )}

                  {links.twitter && (
                    <a
                      href={links.twitter.startsWith("http") ? links.twitter : `https://${links.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-neon-btn tw"
                      title="Twitter / X"
                    >
                      <TwitterIcon size={14} />
                    </a>
                  )}

                  {links.website && (
                    <a
                      href={links.website.startsWith("http") ? links.website : `https://${links.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-neon-btn web"
                      title="Website"
                    >
                      <GlobeIcon size={14} />
                    </a>
                  )}

                  {links.facebook && (
                    <a
                      href={links.facebook.startsWith("http") ? links.facebook : `https://${links.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-neon-btn fb"
                      title="Facebook"
                    >
                      <FacebookIcon size={14} />
                    </a>
                  )}

                  {links.youtube && (
                    <a
                      href={links.youtube.startsWith("http") ? links.youtube : `https://${links.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-neon-btn yt"
                      title="YouTube"
                    >
                      <YoutubeIcon size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <TeamModal
          member={selectedMember}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setSaveError("");
          }}
          saveError={saveError}
        />
      )}
    </section>
  );
}
