"use client";
import React from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Handshake, BookOpen, DollarSign, Network } from "lucide-react";

export function FosteringGrowth() {
  const { isEditMode } = useAdmin();
  return (
    <section className="section-wrapper" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{
          background: "linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(99, 102, 241, 0.08))",
          border: "1px solid rgba(2, 132, 199, 0.2)",
          borderRadius: "var(--radius-lg)",
          padding: "3.5rem 2rem",
          boxShadow: "0 4px 30px rgba(2, 132, 199, 0.06)",
        }}
      >
        <h2
          className="section-heading"
          style={{ marginBottom: 0, fontSize: "clamp(2rem, 3.5vw, 2.8rem)" }}
          contentEditable={isEditMode}
          suppressContentEditableWarning
        >
          Fostering <span className="gradient-text-cyan">Growth</span> and <span className="gradient-text-purple">Collaboration</span> in Noida
        </h2>
      </motion.div>
    </section>
  );
}

export function MentorshipSection() {
  const { isEditMode } = useAdmin();
  return (
    <section className="section-wrapper" style={{ padding: "3rem 1.5rem" }}>
      <div className="split-story-grid" style={{ alignItems: "center" }}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag"><Handshake size={16} /> Mentorship Programs</span>
          <h2
            className="section-heading"
            contentEditable={isEditMode}
            suppressContentEditableWarning
            style={{ marginTop: "0.5rem" }}
          >
            Mentorship and <span className="gradient-text-cyan">Networking</span>
          </h2>
          <p
            className="section-subtext"
            style={{ marginBottom: "2rem", lineHeight: 1.7 }}
            contentEditable={isEditMode}
            suppressContentEditableWarning
          >
            Nexus Founder facilitates mentorship programs and networking events to connect founders and CEOs, providing valuable support and guidance.
          </p>
          <Link
            href="/join"
            style={{
              background: "#0284c7",
              color: "#ffffff",
              padding: "0.75rem 1.8rem",
              borderRadius: "6px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
            }}
          >
            <span>Contact Us</span>
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="story-img-card"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <img
            src="https://nexusfounders.com/wp-content/uploads/2024/12/Nexus-Founders-F2-Fintech--1024x682.jpg"
            alt="Mentorship and Networking"
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#f1f5f9" }}
          />
        </motion.div>
      </div>
    </section>
  );
}

export function KnowledgeSection() {
  const { isEditMode } = useAdmin();
  return (
    <section className="section-wrapper" style={{ padding: "3rem 1.5rem" }}>
      <div className="split-story-grid reverse" style={{ alignItems: "center" }}>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag"><BookOpen size={16} /> Industry Insights</span>
          <h2
            className="section-heading"
            contentEditable={isEditMode}
            suppressContentEditableWarning
            style={{ marginTop: "0.5rem" }}
          >
            Knowledge <span className="gradient-text-purple">Sharing</span>
          </h2>
          <p
            className="section-subtext"
            style={{ marginBottom: "2rem", lineHeight: 1.7 }}
            contentEditable={isEditMode}
            suppressContentEditableWarning
          >
            The platform hosts workshops, seminars, and webinars to share industry insights, best practices, and innovative solutions.
          </p>
          <a
            href="#events"
            style={{
              background: "#ffffff",
              color: "#1e293b",
              border: "1.5px solid #1e293b",
              padding: "0.75rem 1.8rem",
              borderRadius: "6px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
            }}
          >
            <span>Learn More</span>
            <Sparkles size={16} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="story-img-card"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <img
            src="https://nexusfounders.com/wp-content/uploads/2024/11/Nexus-Founders-images-1024x767.jpg"
            alt="Knowledge Sharing Workshop"
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#f1f5f9" }}
          />
        </motion.div>
      </div>
    </section>
  );
}

export function InvestmentSection() {
  const { isEditMode } = useAdmin();
  return (
    <section className="section-wrapper" style={{ padding: "3rem 1.5rem" }}>
      <div className="split-story-grid" style={{ alignItems: "center" }}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag"><DollarSign size={16} /> Capital Access</span>
          <h2
            className="section-heading"
            contentEditable={isEditMode}
            suppressContentEditableWarning
            style={{ marginTop: "0.5rem" }}
          >
            Investment <span className="gradient-text-gold">Opportunities</span>
          </h2>
          <p
            className="section-subtext"
            style={{ marginBottom: "2rem", lineHeight: 1.7 }}
            contentEditable={isEditMode}
            suppressContentEditableWarning
          >
            Nexus Founder connects startups with potential investors, fostering a robust ecosystem for funding and growth.
          </p>
          <Link
            href="/join"
            style={{
              background: "#0284c7",
              color: "#ffffff",
              padding: "0.75rem 1.8rem",
              borderRadius: "6px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
            }}
          >
            <span>Contact Us</span>
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="story-img-card"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <img
            src="https://nexusfounders.com/wp-content/uploads/2024/11/Nexus-Founder-Event-1024x683.jpg"
            alt="Investment Opportunities"
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#f1f5f9" }}
          />
        </motion.div>
      </div>
    </section>
  );
}

export function CommunitySection() {
  const { isEditMode } = useAdmin();
  return (
    <section className="section-wrapper" style={{ padding: "3rem 1.5rem" }}>
      <div className="split-story-grid reverse" style={{ alignItems: "center" }}>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag"><Network size={16} /> Connected Leaders</span>
          <h2
            className="section-heading"
            contentEditable={isEditMode}
            suppressContentEditableWarning
            style={{ marginTop: "0.5rem" }}
          >
            Community <span className="gradient-text-cyan">Engagement</span>
          </h2>
          <p
            className="section-subtext"
            style={{ marginBottom: "2rem", lineHeight: 1.7 }}
            contentEditable={isEditMode}
            suppressContentEditableWarning
          >
            The platform hosts workshops, seminars, and webinars to share industry insights, best practices, and innovative solutions.
          </p>
          <a
            href="#events"
            style={{
              background: "#ffffff",
              color: "#1e293b",
              border: "1.5px solid #1e293b",
              padding: "0.75rem 1.8rem",
              borderRadius: "6px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
            }}
          >
            <span>Learn More</span>
            <Sparkles size={16} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="story-img-card"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <img
            src="https://nexusfounders.com/wp-content/uploads/2024/11/Nexus-Founders-1024x766.jpg"
            alt="Community Engagement"
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#f1f5f9" }}
          />
        </motion.div>
      </div>
    </section>
  );
}