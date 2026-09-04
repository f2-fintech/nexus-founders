"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, CalendarCheck, RefreshCw, Trash2,
  CheckCircle, Clock, XCircle, Eye,
  BarChart2, Search, X, ArrowLeft,
} from "lucide-react";
import "./dashboard.css";

// ─── Types ────────────────────────────────────────────────────
interface EventReg {
  _id: string; name: string; email: string; contactNo: string;
  companyName: string; designation: string; eventEdition: string;
  status: "pending" | "confirmed" | "attended" | "cancelled";
  createdAt: string;
}
interface JoinSub {
  _id: string; fullName: string; email: string; companyName: string;
  designation: string; linkedin?: string; instagram?: string;
  challenges: string; risks: string; businessStage: string;
  financialStatus: string; milestone: string; visionImpact: string;
  uniqueStrengths: string; supportNeeded: string; valueContribution: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  createdAt: string;
}

// ─── Status configs ───────────────────────────────────────────
const eventStatusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  confirmed: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  icon: CheckCircle },
  attended:  { color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
};
const joinStatusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  reviewed: { color: "#6366f1", bg: "rgba(99,102,241,0.12)",  icon: Eye },
  approved: { color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle },
  rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
};

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status, config }: { status: string; config: typeof eventStatusConfig }) {
  const cfg = config[status] || { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "0.25rem 0.65rem", borderRadius: "20px",
      background: cfg.bg, color: cfg.color,
      fontSize: "0.78rem", fontWeight: 700, textTransform: "capitalize",
      border: "1px solid " + cfg.color + "33",
    }}>
      <Icon size={12} />
      {status}
    </span>
  );
}

// ─── Status Selector ─────────────────────────────────────────
function StatusSelector({ id, currentStatus, options, onUpdate, loading }: {
  id: string; currentStatus: string; options: string[];
  onUpdate: (id: string, status: string) => void; loading: boolean;
}) {
  return (
    <select value={currentStatus} disabled={loading}
      onChange={(e) => onUpdate(id, e.target.value)}
      style={{
        padding: "0.3rem 0.65rem", borderRadius: "8px",
        border: "1.5px solid #e2e8f0", background: "#f8fafc",
        fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
        color: "#334155", outline: "none", minWidth: "110px", fontFamily: "inherit",
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
      ))}
    </select>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────
function DetailModal({ item, onClose, type }: {
  item: JoinSub | EventReg | null; onClose: () => void; type: "event" | "join";
}) {
  if (!item) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "2rem",
        maxWidth: "640px", width: "100%", maxHeight: "85vh",
        overflowY: "auto", position: "relative",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
      }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: "absolute", top: "1rem", right: "1rem",
          border: "none", background: "#f1f5f9", borderRadius: "50%",
          width: "32px", height: "32px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
        }}>
          <X size={16} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #2563eb, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "1.1rem",
          }}>
            {type === "join" ? (item as JoinSub).fullName?.[0] : (item as EventReg).name?.[0]}
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {type === "join" ? (item as JoinSub).fullName : (item as EventReg).name}
          </h3>
        </div>
        <div style={{ display: "grid", gap: "0.6rem" }}>
          {Object.entries(item)
            .filter(([k]) => !["_id", "__v"].includes(k))
            .map(([key, val]) => (
              <div key={key} style={{
                display: "grid", gridTemplateColumns: "150px 1fr", gap: "0.5rem",
                padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9",
              }}>
                <span style={{ fontSize: "0.77rem", fontWeight: 600, color: "#94a3b8", textTransform: "capitalize" }}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span style={{ fontSize: "0.84rem", color: "#334155", wordBreak: "break-word" }}>
                  {String(val || "—")}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"events" | "joins">("events");
  const [eventRegs, setEventRegs] = useState<EventReg[]>([]);
  const [joinSubs, setJoinSubs] = useState<JoinSub[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailItem, setDetailItem] = useState<EventReg | JoinSub | null>(null);
  const [detailType, setDetailType] = useState<"event" | "join">("event");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/login");
    if (sessionStatus === "authenticated" && (session?.user as any)?.role !== "admin") router.push("/");
  }, [sessionStatus, session, router]);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [evRes, jnRes] = await Promise.all([
        fetch("/api/events/register"),
        fetch("/api/join"),
      ]);
      const evData = await evRes.json();
      const jnData = await jnRes.json();
      if (evData.success) setEventRegs(evData.data);
      if (jnData.success) setJoinSubs(jnData.data);
    } catch (e) { console.error(e); }
    finally { setLoadingData(false); }
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated" && (session?.user as any)?.role === "admin") fetchData();
  }, [sessionStatus, session, fetchData]);

  const updateEventStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await fetch("/api/events/register/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setEventRegs((prev) => prev.map((r) => r._id === id ? { ...r, status: status as any } : r));
    setUpdatingId(null);
  };

  const updateJoinStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await fetch("/api/join/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setJoinSubs((prev) => prev.map((r) => r._id === id ? { ...r, status: status as any } : r));
    setUpdatingId(null);
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event registration?")) return;
    setDeletingId(id);
    await fetch("/api/events/register/" + id, { method: "DELETE" });
    setEventRegs((prev) => prev.filter((r) => r._id !== id));
    setDeletingId(null);
  };

  const deleteJoin = async (id: string) => {
    if (!confirm("Delete this join submission?")) return;
    setDeletingId(id);
    await fetch("/api/join/" + id, { method: "DELETE" });
    setJoinSubs((prev) => prev.filter((r) => r._id !== id));
    setDeletingId(null);
  };

  const filteredEvents = eventRegs.filter((r) =>
    [r.name, r.email, r.companyName, r.designation].some((v) => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredJoins = joinSubs.filter((r) =>
    [r.fullName, r.email, r.companyName, r.designation].some((v) => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const eventStats = {
    total: eventRegs.length,
    pending: eventRegs.filter((r) => r.status === "pending").length,
    confirmed: eventRegs.filter((r) => r.status === "confirmed").length,
    attended: eventRegs.filter((r) => r.status === "attended").length,
    cancelled: eventRegs.filter((r) => r.status === "cancelled").length,
  };
  const joinStats = {
    total: joinSubs.length,
    pending: joinSubs.filter((r) => r.status === "pending").length,
    reviewed: joinSubs.filter((r) => r.status === "reviewed").length,
    approved: joinSubs.filter((r) => r.status === "approved").length,
    rejected: joinSubs.filter((r) => r.status === "rejected").length,
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  if (sessionStatus === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", color: "#64748b" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="db-root">
      {/* Hero Banner */}
      <div className="db-hero">
        <div className="db-hero-blob1" />
        <div className="db-hero-blob2" />
        <div className="db-hero-blob3" />
        <div className="db-container">
          <div className="db-hero-inner">
            <div className="db-hero-left">
              <div className="db-hero-badge">
                <BarChart2 size={13} />
                Admin Control Panel
              </div>
              <h1 className="db-hero-title">
                Admin <span>Dashboard</span>
              </h1>
              <p className="db-hero-subtitle">
                Manage event registrations &amp; join submissions in one place
              </p>
            </div>
            <div className="db-hero-actions">
              <a href="/" className="db-back">
                <ArrowLeft size={14} />
                Back to Website
              </a>
              <button className="db-refresh" onClick={fetchData} disabled={loadingData}>
                <RefreshCw size={14} className={loadingData ? "spin" : ""} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="db-body">
        <div className="db-container">

          {/* Stats */}
          {activeTab === "events" ? (
            <div className="db-stats">
              {[
                { label: "Total",     value: eventStats.total,     color: "#2563eb" },
                { label: "Pending",   value: eventStats.pending,   color: "#f59e0b" },
                { label: "Confirmed", value: eventStats.confirmed, color: "#3b82f6" },
                { label: "Attended",  value: eventStats.attended,  color: "#10b981" },
                { label: "Cancelled", value: eventStats.cancelled, color: "#ef4444" },
              ].map((s) => (
                <div className="db-stat" key={s.label}>
                  <div className="db-stat-num" style={{ color: s.color }}>{s.value}</div>
                  <div className="db-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="db-stats">
              {[
                { label: "Total",    value: joinStats.total,    color: "#2563eb" },
                { label: "Pending",  value: joinStats.pending,  color: "#f59e0b" },
                { label: "Reviewed", value: joinStats.reviewed, color: "#6366f1" },
                { label: "Approved", value: joinStats.approved, color: "#10b981" },
                { label: "Rejected", value: joinStats.rejected, color: "#ef4444" },
              ].map((s) => (
                <div className="db-stat" key={s.label}>
                  <div className="db-stat-num" style={{ color: s.color }}>{s.value}</div>
                  <div className="db-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="db-tabs">
            <button
              className={"db-tab" + (activeTab === "events" ? " active" : "")}
              onClick={() => { setActiveTab("events"); setSearchQuery(""); }}
            >
              <CalendarCheck size={15} />
              Event Registrations
              <span className="db-tab-count">{eventRegs.length}</span>
            </button>
            <button
              className={"db-tab" + (activeTab === "joins" ? " active" : "")}
              onClick={() => { setActiveTab("joins"); setSearchQuery(""); }}
            >
              <Users size={15} />
              Join Submissions
              <span className="db-tab-count">{joinSubs.length}</span>
            </button>
          </div>

          {/* Toolbar */}
          <div className="db-toolbar">
            <div className="db-search-wrap">
              <Search size={14} className="db-search-ico" />
              <input
                className="db-search"
                placeholder={activeTab === "events" ? "Search by name, email, company…" : "Search submissions…"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="db-count">
              {activeTab === "events" ? filteredEvents.length : filteredJoins.length} records
            </div>
          </div>

          {/* Event Registrations Table */}
          {activeTab === "events" && (
            <div className="db-card">
              {loadingData ? (
                <div className="empty"><div className="empty-ico">⏳</div>Loading…</div>
              ) : filteredEvents.length === 0 ? (
                <div className="empty"><div className="empty-ico">📭</div>No event registrations found.</div>
              ) : (
                <div className="db-table-wrap">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Registrant</th><th>Email</th>
                        <th>Contact</th><th>Event Edition</th>
                        <th>Status</th><th>Date</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((r, i) => (
                        <tr key={r._id}>
                          <td className="cell-num">{i + 1}</td>
                          <td>
                            <div className="cell-name">{r.name}</div>
                            <div className="cell-sub">{r.companyName} · {r.designation}</div>
                          </td>
                          <td className="cell-email">{r.email}</td>
                          <td>{r.contactNo}</td>
                          <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.eventEdition}
                          </td>
                          <td>
                            <div className="status-cell">
                              <StatusBadge status={r.status} config={eventStatusConfig} />
                              <StatusSelector id={r._id} currentStatus={r.status}
                                options={["pending", "confirmed", "attended", "cancelled"]}
                                onUpdate={updateEventStatus} loading={updatingId === r._id} />
                            </div>
                          </td>
                          <td className="cell-date">{formatDate(r.createdAt)}</td>
                          <td>
                            <div className="actions-wrap">
                              <button className="ib ib-eye" title="View details"
                                onClick={() => { setDetailItem(r); setDetailType("event"); }}>
                                <Eye size={14} />
                              </button>
                              <button className="ib ib-del" title="Delete"
                                disabled={deletingId === r._id} onClick={() => deleteEvent(r._id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Join Submissions Table */}
          {activeTab === "joins" && (
            <div className="db-card">
              {loadingData ? (
                <div className="empty"><div className="empty-ico">⏳</div>Loading…</div>
              ) : filteredJoins.length === 0 ? (
                <div className="empty"><div className="empty-ico">📭</div>No join submissions found.</div>
              ) : (
                <div className="db-table-wrap">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Applicant</th><th>Email</th>
                        <th>Stage</th><th>Financials</th>
                        <th>Status</th><th>Date</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJoins.map((r, i) => (
                        <tr key={r._id}>
                          <td className="cell-num">{i + 1}</td>
                          <td>
                            <div className="cell-name">{r.fullName}</div>
                            <div className="cell-sub">{r.companyName} · {r.designation}</div>
                          </td>
                          <td className="cell-email">{r.email}</td>
                          <td>{r.businessStage}</td>
                          <td>{r.financialStatus}</td>
                          <td>
                            <div className="status-cell">
                              <StatusBadge status={r.status} config={joinStatusConfig} />
                              <StatusSelector id={r._id} currentStatus={r.status}
                                options={["pending", "reviewed", "approved", "rejected"]}
                                onUpdate={updateJoinStatus} loading={updatingId === r._id} />
                            </div>
                          </td>
                          <td className="cell-date">{formatDate(r.createdAt)}</td>
                          <td>
                            <div className="actions-wrap">
                              <button className="ib ib-eye" title="View details"
                                onClick={() => { setDetailItem(r); setDetailType("join"); }}>
                                <Eye size={14} />
                              </button>
                              <button className="ib ib-del" title="Delete"
                                disabled={deletingId === r._id} onClick={() => deleteJoin(r._id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} type={detailType} />
    </div>
  );
}
