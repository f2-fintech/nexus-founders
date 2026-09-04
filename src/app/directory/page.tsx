"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FounderCard from "@/components/directory/FounderCard";
import FounderModal from "@/components/directory/FounderModal";
import { FounderCardSkeleton } from "@/components/common/Skeleton";
import { Founder, useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { Search, UserPlus, Sparkles, Users, MapPin, Calendar, Loader2 } from "lucide-react";

const PAGE_SIZE = 16;

// In-memory module cache for instant client-side route transitions
let cachedDirectoryFounders: Founder[] = [];
let cachedDirectoryTotal = 0;
let cachedDirectoryHasMore = true;

export default function DirectoryPage() {
  const { isEditMode, addFounder, updateFounder } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editFounder, setEditFounder] = useState<Founder | null>(null);
  const [saveError, setSaveError] = useState("");

  const [founders, setFounders] = useState<Founder[]>(() => cachedDirectoryFounders);
  const [totalFounders, setTotalFounders] = useState<number>(() => cachedDirectoryTotal);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(() => cachedDirectoryHasMore);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(() => cachedDirectoryFounders.length === 0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce search input by 350ms so user typing doesn't spam backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch page from backend (16 items per page)
  const fetchPage = useCallback(async (pageNum: number, search: string, isInitial: boolean) => {
    // Only show skeleton on initial load if no cached data exists
    if (isInitial && cachedDirectoryFounders.length === 0) {
      setLoadingInitial(true);
    } else if (!isInitial) {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: PAGE_SIZE.toString(),
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/founders?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        if (isInitial || pageNum === 1) {
          setFounders(json.data);
          if (!search) {
            cachedDirectoryFounders = json.data;
            cachedDirectoryTotal = json.pagination?.total ?? 0;
            cachedDirectoryHasMore = Boolean(json.pagination?.hasMore);
          }
        } else {
          // Avoid duplicate keys if items shifted
          setFounders((prev) => {
            const existingIds = new Set(prev.map((f) => f._id));
            const newItems = json.data.filter((f: Founder) => !existingIds.has(f._id));
            return [...prev, ...newItems];
          });
        }
        setPage(pageNum);
        setHasMore(Boolean(json.pagination?.hasMore));
        setTotalFounders(json.pagination?.total ?? 0);
      }
    } catch (err) {
      console.error("Failed to load founders", err);
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch first page on mount or whenever search query changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPage(1, debouncedSearch, true);
  }, [debouncedSearch, fetchPage]);

  // Infinite scroll IntersectionObserver: loads next 10 founders when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingInitial && !loadingMore) {
          fetchPage(page + 1, debouncedSearch, false);
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingInitial, loadingMore, page, debouncedSearch, fetchPage]);

  const openAdd = () => { setEditFounder(null); setModalOpen(true); };
  const openEdit = (f: Founder) => { setEditFounder(f); setModalOpen(true); };

  const handleSave = async (f: Founder | Omit<Founder, "_id">): Promise<void> => {
    setSaveError("");
    try {
      if ("_id" in f && f._id) {
        const updated = await updateFounder(f as Founder);
        setFounders((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      } else {
        const created = await addFounder(f as Omit<Founder, "_id">);
        setFounders((prev) => [created, ...prev]);
        setTotalFounders((prev) => prev + 1);
      }
      setModalOpen(false);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save. Please try again.");
    }
  };

  const handleDeleteFounder = (id: string) => {
    setFounders((prev) => prev.filter((f) => f._id !== id));
    setTotalFounders((prev) => Math.max(0, prev - 1));
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", position: "relative", zIndex: 2, paddingBottom: "5rem" }}>
        {/* ── Directory Hero Section ────────────────────────────────────────── */}
        <section style={{
          padding: "5rem 1.5rem 2.5rem",
          textAlign: "center",
          position: "relative",
        }}>
          {/* Subtle Ambient Glow */}
          <div style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "220px",
            background: "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.08), transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 0,
          }} />

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}
          >
            {/* Top Pill Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.2rem" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 1rem",
                background: "linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(99, 102, 241, 0.08))",
                border: "1px solid rgba(2, 132, 199, 0.25)",
                borderRadius: "50px",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#0284c7",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                boxShadow: "0 2px 10px rgba(2, 132, 199, 0.08)",
              }}>
                <Sparkles size={14} className="text-cyan-500" />
                Exclusive Directory
              </span>
            </div>

            {/* Main Hero Title */}
            <h1 style={{
              fontSize: "clamp(2.5rem, 5.5vw, 4.2rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#0f172a",
              lineHeight: 1.15,
              marginBottom: "1rem",
            }}>
              Nexus Founders <span style={{
                background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 50%, #9333ea 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Directory</span>
            </h1>

            {/* Subtitle with live indicator */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              color: "#64748b",
              fontSize: "1rem",
              fontWeight: 500,
            }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "#10b981",
                fontSize: "0.85rem",
                fontWeight: 700,
                background: "rgba(16, 185, 129, 0.1)",
                padding: "0.2rem 0.65rem",
                borderRadius: "20px",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                Live Network
              </span>
              <span>•</span>
              <span>Page Last Updated on 30th June 2026</span>
            </div>
          </motion.div>
        </section>

        {/* ── Stats Highlights Card ────────────────────────────────────────── */}
        <section style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(2, 132, 199, 0.15)",
              borderRadius: "24px",
              padding: "2rem 1.5rem",
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06), 0 0 30px rgba(2, 132, 199, 0.05)",
            }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              alignItems: "center",
              gap: "1.5rem",
            }}>
              {/* Stat 1: Total Founders */}
              <div style={{
                textAlign: "center",
                padding: "1rem",
                borderRadius: "16px",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "rgba(2, 132, 199, 0.1)",
                  color: "#0284c7",
                  marginBottom: "0.75rem",
                }}>
                  <Users size={22} />
                </div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                  Total Founders
                </div>
                <div style={{
                  fontSize: "clamp(2.4rem, 3.5vw, 3rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #0284c7, #0369a1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}>
                  {totalFounders > 0 ? `${totalFounders}+` : "180+"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                  Verified CEOs &amp; Leaders
                </div>
              </div>

              {/* Stat 2: Active Locations */}
              <div style={{
                textAlign: "center",
                padding: "1rem",
                borderRadius: "16px",
                transition: "transform 0.2s ease",
                borderLeft: "1px solid rgba(0, 0, 0, 0.06)",
                borderRight: "1px solid rgba(0, 0, 0, 0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "rgba(147, 51, 234, 0.1)",
                  color: "#9333ea",
                  marginBottom: "0.75rem",
                }}>
                  <MapPin size={22} />
                </div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                  Active Locations
                </div>
                <div style={{
                  fontSize: "clamp(2.4rem, 3.5vw, 3rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #9333ea, #6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}>
                  7+
                </div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                  NCR, Noida &amp; Regional
                </div>
              </div>

              {/* Stat 3: Next Edition */}
              <div style={{
                textAlign: "center",
                padding: "1rem",
                borderRadius: "16px",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "rgba(217, 119, 6, 0.1)",
                  color: "#d97706",
                  marginBottom: "0.75rem",
                }}>
                  <Calendar size={22} />
                </div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                  Next Edition Date
                </div>
                <div style={{
                  fontSize: "clamp(1.9rem, 2.8vw, 2.5rem)",
                  fontWeight: 900,
                  lineHeight: 1.2,
                  background: "linear-gradient(135deg, #d97706, #ea580c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}>
                  1st Aug 2026
                </div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                  IIM Lucknow Noida Campus
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Directory Content & Search Bar ───────────────────────────────── */}
        <div className="section-wrapper" style={{ paddingTop: "3rem" }}>
          {/* Toolbar */}
          <div className="directory-toolbar" style={{
            position: "relative",
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "18px",
            marginBottom: "2.5rem",
            padding: "1rem 1.4rem",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
          }}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search leaders by name, role, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                Showing <strong style={{ color: "#0f172a" }}>{founders.length}</strong> of <strong style={{ color: "#0f172a" }}>{totalFounders}</strong> leaders
              </span>

              {isEditMode && (
                <button
                  onClick={openAdd}
                  className="btn-neon-primary"
                  style={{ padding: "0.65rem 1.4rem", fontSize: "0.9rem", whiteSpace: "nowrap" }}
                >
                  <UserPlus size={16} />
                  <span>Add Founder</span>
                </button>
              )}
            </div>
          </div>

          {/* Initial loading skeletons */}
          {loadingInitial ? (
            <div className="founder-cyber-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                <FounderCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          ) : founders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "6rem 2rem", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>No founders found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <>
              <div className="founder-cyber-grid">
                {founders.map((f, i) => (
                  <FounderCard
                    key={f._id}
                    founder={f}
                    onEdit={openEdit}
                    onDelete={handleDeleteFounder}
                    index={i}
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel & bottom loader */}
              <div
                ref={sentinelRef}
                style={{
                  textAlign: "center",
                  padding: "3.5rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.8rem",
                  color: "#64748b",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  minHeight: "90px",
                }}
              >
                {loadingMore && (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.7rem",
                    padding: "0.6rem 1.4rem",
                    background: "rgba(2, 132, 199, 0.08)",
                    border: "1px solid rgba(2, 132, 199, 0.2)",
                    borderRadius: "30px",
                    color: "#0284c7",
                  }}>
                    <Loader2 size={18} className="animate-spin text-cyan-600" />
                    <span>Loading more leaders ({founders.length} / {totalFounders})...</span>
                  </div>
                )}
                {!hasMore && founders.length > 0 && (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1.4rem",
                    background: "rgba(2, 132, 199, 0.05)",
                    border: "1px solid rgba(2, 132, 199, 0.15)",
                    borderRadius: "30px",
                    color: "#0369a1",
                    fontSize: "0.85rem",
                  }}>
                    <Sparkles size={14} className="text-cyan-600" />
                    <span>All {totalFounders} leaders loaded</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Floating Add button — always visible in edit mode while scrolling */}
      {isEditMode && (
        <button
          onClick={openAdd}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 500,
            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "0.9rem 1.6rem",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 8px 30px rgba(14,165,233,0.4)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px) scale(1.04)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 40px rgba(14,165,233,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(14,165,233,0.4)";
          }}
        >
          <UserPlus size={18} />
          Add Founder
        </button>
      )}

      {modalOpen && (
        <FounderModal
          founder={editFounder}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setSaveError(""); }}
          saveError={saveError}
        />
      )}
    </>
  );
}