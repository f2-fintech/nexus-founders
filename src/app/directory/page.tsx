"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FounderCard from "@/components/directory/FounderCard";
import FounderModal from "@/components/directory/FounderModal";
import { FounderCardSkeleton } from "@/components/common/Skeleton";
import { Founder, useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { Search, UserPlus, Sparkles, Users, MapPin, Calendar, Loader2, Edit3 } from "lucide-react";

const PAGE_SIZE = 12;

// In-memory module cache for instant client-side route transitions
let cachedDirectoryFounders: Founder[] = [];
let cachedDirectoryTotal = 0;
let cachedDirectoryHasMore = true;

function formatOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatEventDisplayDate(dayStr?: string, monthStr?: string, eventDate?: string | Date): string {
  if (eventDate) {
    const d = new Date(eventDate);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${formatOrdinal(day)} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    }
  }
  if (dayStr && monthStr) {
    const dNum = parseInt(dayStr, 10);
    const day = isNaN(dNum) ? dayStr : formatOrdinal(dNum);
    const month = monthStr
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    return `${day} ${month}`;
  }
  return "26th September 2026";
}

// Helper to evaluate whether an event date string has passed or is upcoming
function evaluateEventStatus(dateString: string): { isUpcoming: boolean; label: string } {
  if (!dateString) {
    return { isUpcoming: false, label: "Latest Edition Date" };
  }

  // Remove ordinal suffixes like "26th" -> "26"
  const clean = dateString.replace(/(\d+)(st|nd|rd|th)/i, "$1").trim();
  const parsed = new Date(clean);

  if (isNaN(parsed.getTime())) {
    return { isUpcoming: false, label: "Latest Edition Date" };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const eventMidnight = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();

  // If event is today or in the future: Next Edition Date. If in the past: Latest Edition Date.
  const isUpcoming = eventMidnight >= today;
  return {
    isUpcoming,
    label: isUpcoming ? "Next Edition Date" : "Latest Edition Date",
  };
}

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

  // Dynamic Edition Date State
  const [eventDateStr, setEventDateStr] = useState<string>("26th September 2026");
  const [eventVenue, setEventVenue] = useState<string>("Moonlight Infra");
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editDateInput, setEditDateInput] = useState("26th September 2026");
  const [editVenueInput, setEditVenueInput] = useState("Moonlight Infra");

  // Automatically fetch and synchronize with the latest event from Upcoming Events
  const loadUpcomingEvent = useCallback(async () => {
    try {
      const res = await fetch("/api/upcoming-events");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const eventsWithDates = json.data.map((ev: any) => {
          let d: Date | null = null;
          if (ev.eventDate) {
            d = new Date(ev.eventDate);
          } else if (ev.day && ev.month) {
            const clean = `${ev.day} ${ev.month}`.replace(/(\d+)(st|nd|rd|th)/i, "$1").trim();
            d = new Date(clean);
          }
          return {
            ...ev,
            timestamp: d && !isNaN(d.getTime()) ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() : 0,
            parsedDate: d,
          };
        });

        // 1. Look for upcoming events (eventDate >= today)
        const upcoming = eventsWithDates
          .filter((e: any) => e.timestamp >= today)
          .sort((a: any, b: any) => a.timestamp - b.timestamp);

        if (upcoming.length > 0) {
          const ev = upcoming[0];
          const dateFormatted = formatEventDisplayDate(ev.day, ev.month, ev.eventDate);
          setEventDateStr(dateFormatted);
          setEditDateInput(dateFormatted);
          if (ev.address) {
            setEventVenue(ev.address);
            setEditVenueInput(ev.address);
          }
          return;
        }

        // 2. If all events have passed, pick the most recent past event
        const past = eventsWithDates
          .filter((e: any) => e.timestamp > 0 && e.timestamp < today)
          .sort((a: any, b: any) => b.timestamp - a.timestamp);

        if (past.length > 0) {
          const ev = past[0];
          const dateFormatted = formatEventDisplayDate(ev.day, ev.month, ev.eventDate);
          setEventDateStr(dateFormatted);
          setEditDateInput(dateFormatted);
          if (ev.address) {
            setEventVenue(ev.address);
            setEditVenueInput(ev.address);
          }
          return;
        }

        // 3. Fallback to latest item in array
        const latest = json.data[json.data.length - 1];
        const dateFormatted = formatEventDisplayDate(latest.day, latest.month, latest.eventDate);
        setEventDateStr(dateFormatted);
        setEditDateInput(dateFormatted);
        if (latest.address) {
          setEventVenue(latest.address);
          setEditVenueInput(latest.address);
        }
      }
    } catch (err) {
      console.error("Failed to load upcoming event for directory", err);
    }
  }, []);

  useEffect(() => {
    loadUpcomingEvent();
    window.addEventListener("focus", loadUpcomingEvent);
    return () => window.removeEventListener("focus", loadUpcomingEvent);
  }, [loadUpcomingEvent]);

  const handleSaveEvent = async () => {
    setEventDateStr(editDateInput);
    setEventVenue(editVenueInput);
    setIsEditingEvent(false);
  };

  const editionStatus = evaluateEventStatus(eventDateStr);

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
      <main style={{ minHeight: "80vh", position: "relative", zIndex: 2, paddingBottom: "5rem", overflowX: "hidden", maxWidth: "100%" }}>
        {/* ── Directory Hero Section ────────────────────────────────────────── */}
        <section style={{
          padding: "5rem 1.5rem 2.5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          maxWidth: "100%",
        }}>
          {/* Subtle Ambient Glow */}
          <div style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(600px, 92vw)",
            maxWidth: "100%",
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
              <span className="directory-hero-badge" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 1rem",
                borderRadius: "50px",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                <Sparkles size={14} className="text-cyan-500" />
                Exclusive Directory
              </span>
            </div>

            {/* Main Hero Title */}
            <h1 className="directory-hero-title">
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
              fontSize: "1rem",
              fontWeight: 500,
            }}>
              <span className="directory-live-badge" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                padding: "0.2rem 0.65rem",
                borderRadius: "20px",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                Live Network
              </span>
            </div>
          </motion.div>
        </section>

        {/* ── Stats Highlights Card ────────────────────────────────────────── */}
        <section style={{ maxWidth: "1080px", width: "100%", margin: "0 auto", padding: "0 1.5rem", boxSizing: "border-box" }}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="directory-stats-highlights"
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              alignItems: "center",
              gap: "1.5rem",
            }}>
              {/* Stat 1: Total Founders */}
              <div
                className="directory-stat-item"
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div className="directory-stat-icon-wrap cyan">
                  <Users size={22} />
                </div>
                <div className="directory-stat-label">
                  Total Founders
                </div>
                <div className="directory-stat-val val-cyan" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
                  {totalFounders > 0 ? `${totalFounders}+` : ""}
                </div>
                <div className="directory-stat-sub">
                  Verified CEOs &amp; Leaders
                </div>
              </div>

              {/* Stat 2: Active Locations */}
              <div
                className="directory-stat-item stat-border-x"
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div className="directory-stat-icon-wrap purple">
                  <MapPin size={22} />
                </div>
                <div className="directory-stat-label">
                  Active Locations
                </div>
                <div className="directory-stat-val val-purple" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
                  7+
                </div>
                <div className="directory-stat-sub">
                  NCR, Noida &amp; Regional
                </div>
              </div>

              {/* Stat 3: Next / Latest Edition */}
              <div
                className="directory-stat-item"
                style={{ position: "relative" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {isEditMode && !isEditingEvent && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditDateInput(eventDateStr);
                      setEditVenueInput(eventVenue);
                      setIsEditingEvent(true);
                    }}
                    title="Edit Edition Date & Venue"
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      background: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      color: "#f59e0b",
                      borderRadius: "6px",
                      padding: "0.25rem 0.5rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                )}

                {isEditingEvent ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", padding: "0.25rem 0" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f59e0b" }}>
                      Edit Edition Details
                    </div>
                    <input
                      type="text"
                      value={editDateInput}
                      onChange={(e) => setEditDateInput(e.target.value)}
                      placeholder="e.g. 26th September 2026"
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        width: "100%",
                        boxSizing: "border-box",
                        background: "var(--bg-input, #ffffff)",
                        color: "var(--text-primary, #0f172a)",
                      }}
                    />
                    <input
                      type="text"
                      value={editVenueInput}
                      onChange={(e) => setEditVenueInput(e.target.value)}
                      placeholder="e.g. Moonlight Infra"
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        width: "100%",
                        boxSizing: "border-box",
                        background: "var(--bg-input, #ffffff)",
                        color: "var(--text-primary, #0f172a)",
                      }}
                    />
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setIsEditingEvent(false)}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.3rem 0.6rem",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          color: "#64748b",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEvent}
                        style={{
                          background: "#f59e0b",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.3rem 0.75rem",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "#ffffff",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="directory-stat-icon-wrap amber">
                      <Calendar size={22} />
                    </div>
                    <div className="directory-stat-label">
                      {editionStatus.label}
                    </div>
                    <div className="directory-stat-val val-amber" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
                      {eventDateStr}
                    </div>
                    <div className="directory-stat-sub">
                      {eventVenue}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Directory Content & Search Bar ───────────────────────────────── */}
        <div className="section-wrapper" style={{ paddingTop: "1.5rem", maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
          {/* Toolbar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isEditMode ? "space-between" : "flex-end",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
            width: "100%",
            boxSizing: "border-box",
          }}>
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

            <div className="search-input-wrapper" style={{
              position: "relative",
              width: "100%",
              maxWidth: "360px",
              marginLeft: isEditMode ? "0" : "auto",
              boxSizing: "border-box",
            }}>
              <Search className="search-icon" size={17} />
              <input
                type="text"
                placeholder="Search leaders by name, role, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="search-clear-btn"
                  title="Clear search"
                >
                  ✕
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
                  color: "var(--text-muted)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  minHeight: "90px",
                }}
              >
                {loadingMore && (
                  <div className="directory-loading-badge">
                    <Loader2 size={18} className="animate-spin text-cyan-600" />
                    <span>Loading more leaders ({founders.length} / {totalFounders})...</span>
                  </div>
                )}
                {!hasMore && founders.length > 0 && (
                  <div className="directory-loaded-badge">
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