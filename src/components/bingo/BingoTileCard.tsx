"use client";
import React from "react";
import { CheckCircle, Camera } from "lucide-react";
import { BingoChallenge } from "@/lib/bingo-challenges";
import { IBingoTile } from "@/models/BingoParticipant";

interface BingoTileCardProps {
  challenge: BingoChallenge;
  tileData?: IBingoTile;
  onScanClick: () => void;
  onViewCardClick: (url: string) => void;
}

export default function BingoTileCard({
  challenge,
  tileData,
  onScanClick,
  onViewCardClick,
}: BingoTileCardProps) {
  const isCompleted = !!tileData?.completed;

  return (
    <div
      className={`bingo-tile ${isCompleted ? "completed" : ""}`}
      style={{
        position: "relative",
        background: "#ffffff",
        border: isCompleted
          ? "2px solid #10b981"
          : "1.5px solid var(--bingo-card-border, #cbd5e1)",
        borderRadius: "16px",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "220px",
        boxShadow: isCompleted
          ? "0 10px 25px rgba(16, 185, 129, 0.22), 0 2px 6px rgba(0, 0, 0, 0.05)"
          : "0 4px 16px rgba(15, 23, 42, 0.06)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Top Bar: Number badge + Bonus / Verified status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <div
          className="bingo-tile-number"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: isCompleted ? "#10b981" : "#0284c7",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.88rem",
            fontWeight: 800,
            flexShrink: 0,
            boxShadow: isCompleted
              ? "0 2px 8px rgba(16, 185, 129, 0.4)"
              : "0 2px 8px rgba(2, 132, 199, 0.3)",
          }}
        >
          {challenge.id}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {challenge.isBonus && (
            <span
              className="bingo-tile-badge"
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                padding: "0.2rem 0.55rem",
                borderRadius: "12px",
                background: "#0284c7",
                color: "#ffffff",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              BONUS
            </span>
          )}

          {isCompleted && (
            <span
              className="bingo-tile-badge"
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.22rem 0.65rem",
                borderRadius: "12px",
                background: "#ecfdf5",
                color: "#047857",
                border: "1px solid #a7f3d0",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <CheckCircle size={13} />
              <span className="bingo-verified-lbl">Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Center Icon & Statement */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "0.45rem",
          margin: "0.25rem 0",
        }}
      >
        <div
          className="bingo-tile-icon-box"
          style={{
            background: isCompleted
              ? "#ecfdf5"
              : "rgba(2, 132, 199, 0.08)",
            border: isCompleted ? "1px solid #d1fae5" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        >
          <img
            src={`/images/bingo/challenge-${challenge.id}.png`}
            alt={`Challenge ${challenge.id}`}
            className="bingo-tile-icon-img"
            style={{
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        <p
          className="bingo-tile-statement"
          style={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: 700,
            lineHeight: 1.35,
            color: "#0f172a",
          }}
        >
          {challenge.statement}
        </p>
      </div>

      {/* Bottom Area: Scan Button / Completed Card Preview */}
      <div
        className="bingo-tile-bottom"
        style={{
          borderTop: isCompleted
            ? "1px dashed #a7f3d0"
            : "1px dashed #e2e8f0",
          paddingTop: "0.5rem",
          marginTop: "0.35rem",
        }}
      >
        {!isCompleted ? (
          <div>
            <div
              className="bingo-tile-sign-hint"
              style={{
                fontSize: "0.68rem",
                color: "#94a3b8",
                textAlign: "center",
                marginBottom: "0.35rem",
                fontWeight: 500,
              }}
            >
              Name / Signature
            </div>

            <button
              type="button"
              onClick={onScanClick}
              className="bingo-tile-scan-btn"
              style={{
                width: "100%",
                padding: "0.55rem 0.65rem",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                border: "none",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "0.8rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(2, 132, 199, 0.2)",
                transition: "opacity 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Camera size={14} className="bingo-scan-ico" />
              <span className="bingo-scan-lbl-full">Scan Visiting Card</span>
              <span className="bingo-scan-lbl-short">Scan</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.3rem",
            }}
          >
            {/* Scanned card thumbnail */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                overflow: "hidden",
              }}
            >
              {tileData?.cardPhotoUrl && (
                <button
                  type="button"
                  onClick={() => onViewCardClick(tileData.cardPhotoUrl!)}
                  title="Click to view card"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={tileData.cardPhotoUrl}
                    alt="Visiting card"
                    className="bingo-tile-thumb"
                    style={{
                      width: "36px",
                      height: "26px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1.5px solid #10b981",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                      display: "block",
                    }}
                  />
                </button>
              )}

              <div style={{ textAlign: "left", overflow: "hidden" }}>
                <div
                  className="bingo-tile-contact-name"
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "90px",
                  }}
                >
                  {tileData?.contactName || "Verified"}
                </div>
                {tileData?.contactCompany && (
                  <div
                    className="bingo-tile-contact-comp"
                    style={{
                      fontSize: "0.68rem",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "90px",
                    }}
                  >
                    {tileData.contactCompany}
                  </div>
                )}
              </div>
            </div>

            {/* Re-scan or view button */}
            <button
              type="button"
              onClick={onScanClick}
              title="Rescan card if needed"
              className="bingo-tile-rescan-btn"
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: "8px",
                padding: "0.35rem 0.55rem",
                color: "#047857",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#d1fae5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ecfdf5")}
            >
              <Camera size={12} />
              <span className="bingo-rescan-lbl-full">Re-scan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
