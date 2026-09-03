"use client";
import React from "react";

export function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = "8px",
  className = "",
  style = {},
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

/**
 * Founder Card Skeleton matching the exact cyber-glass dimensions of FounderCard
 */
export function FounderCardSkeleton() {
  return (
    <div className="founder-cyber-card" style={{ pointerEvents: "none" }}>
      {/* Top photo area skeleton */}
      <div className="founder-photo-container">
        <Skeleton width="100%" height="100%" borderRadius="0px" />
      </div>

      {/* Card body skeleton */}
      <div className="founder-cyber-body" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {/* Name */}
        <Skeleton width="75%" height="22px" borderRadius="6px" style={{ margin: "0 auto" }} />
        {/* Role */}
        <Skeleton width="50%" height="15px" borderRadius="12px" style={{ margin: "0 auto" }} />
        {/* Company */}
        <Skeleton width="60%" height="14px" borderRadius="4px" style={{ margin: "0 auto" }} />

        {/* Social Icons row */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.75rem" }}>
          <Skeleton width="34px" height="34px" borderRadius="50%" />
          <Skeleton width="34px" height="34px" borderRadius="50%" />
          <Skeleton width="34px" height="34px" borderRadius="50%" />
        </div>
      </div>
    </div>
  );
}

/**
 * Coordination Team Member Skeleton matching CoordinationTeam cards
 */
export function TeamMemberSkeleton() {
  return (
    <div
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
      }}
    >
      {/* Circle Photo */}
      <Skeleton
        width="124px"
        height="124px"
        borderRadius="50%"
        style={{ marginBottom: "1.25rem" }}
      />
      {/* Name */}
      <Skeleton width="65%" height="22px" borderRadius="6px" style={{ marginBottom: "0.5rem" }} />
      {/* Designation */}
      <Skeleton width="45%" height="16px" borderRadius="10px" style={{ marginBottom: "1rem" }} />
      {/* Description lines */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.5rem" }}>
        <Skeleton width="100%" height="12px" borderRadius="4px" />
        <Skeleton width="90%" height="12px" borderRadius="4px" style={{ margin: "0 auto" }} />
        <Skeleton width="75%" height="12px" borderRadius="4px" style={{ margin: "0 auto" }} />
      </div>
      {/* Social links */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <Skeleton width="32px" height="32px" borderRadius="50%" />
        <Skeleton width="32px" height="32px" borderRadius="50%" />
        <Skeleton width="32px" height="32px" borderRadius="50%" />
      </div>
    </div>
  );
}
