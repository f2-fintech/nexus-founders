"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  Tag,
  Link as LinkIcon,
  Plus,
  X,
  FileSpreadsheet,
  AlertCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Send,
  Zap,
} from "lucide-react";
import { ClientMatchPointSubmission, IMatchedPartner } from "@/models/MatchPointSubmission";
import { evaluateMatch, MatchEvaluation } from "@/lib/matchmaking";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Review", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  analyzed: { label: "Analyzed", color: "#6366f1", bg: "rgba(99, 102, 241, 0.12)" },
  matched: { label: "Matched", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  emailed: { label: "Email Sent", color: "#0284c7", bg: "rgba(2, 132, 199, 0.12)" },
  archived: { label: "Archived", color: "#64748b", bg: "rgba(100, 116, 139, 0.12)" },
};

export default function MatchPointManager() {
  const [submissions, setSubmissions] = useState<ClientMatchPointSubmission[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    analyzed: 0,
    matched: 0,
    emailed: 0,
    archived: 0,
  });
  const [topNeeds, setTopNeeds] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [needFilter, setNeedFilter] = useState("all");

  // Inspection modal
  const [selectedItem, setSelectedItem] = useState<ClientMatchPointSubmission | null>(null);

  // Matchmaking modal
  const [matchModalTarget, setMatchModalTarget] = useState<ClientMatchPointSubmission | null>(null);
  const [matchPartnerSubmissionId, setMatchPartnerSubmissionId] = useState<string | null>(null);
  const [matchPartnerCompany, setMatchPartnerCompany] = useState("");
  const [matchPartnerContact, setMatchPartnerContact] = useState("");
  const [matchPartnerEmail, setMatchPartnerEmail] = useState("");
  const [matchPartnerPhone, setMatchPartnerPhone] = useState("");
  const [matchPartnerCategory, setMatchPartnerCategory] = useState("");
  const [matchPartnerPercentage, setMatchPartnerPercentage] = useState<number>(88);
  const [matchPartnerScore, setMatchPartnerScore] = useState<number>(60);
  const [matchPartnerReason, setMatchPartnerReason] = useState("");
  const [matchPartnerNotes, setMatchPartnerNotes] = useState("");
  const [sendEmailNow, setSendEmailNow] = useState(true);
  const [savingMatch, setSavingMatch] = useState(false);
  const [runningAutoMatch, setRunningAutoMatch] = useState(false);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);

  // Quick notes editor
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [adminNotesText, setAdminNotesText] = useState("");

  // Fetch submissions
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (needFilter !== "all") params.set("needCategory", needFilter);

      const res = await fetch(`/api/matchpoint/admin?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
        if (data.stats) setStats(data.stats);
        if (data.topNeeds) setTopNeeds(data.topNeeds);
      }
    } catch (e) {
      console.error("Failed to fetch matchpoint submissions:", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, needFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Status Updater
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/matchpoint/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: newStatus as any } : s))
        );
        fetchData();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  // Delete submission
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete submission for ${name}?`)) return;
    try {
      const res = await fetch(`/api/matchpoint/admin?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) => prev.filter((s) => s._id !== id));
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Match partner
  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchModalTarget || !matchPartnerCompany.trim()) return;

    setSavingMatch(true);
    try {
      const payload = {
        id: matchModalTarget._id,
        addMatch: {
          submissionId: matchPartnerSubmissionId || undefined,
          companyName: matchPartnerCompany.trim(),
          contactName: matchPartnerContact.trim(),
          email: matchPartnerEmail.trim(),
          phone: matchPartnerPhone.trim(),
          matchedCategory: matchPartnerCategory.trim() || matchModalTarget.needCategories?.[0] || "General Match",
          matchPercentage: matchPartnerPercentage || 88,
          matchScore: matchPartnerScore || 60,
          matchReason: matchPartnerReason || "",
          notes: matchPartnerNotes.trim(),
          sendEmailNow,
        },
      };

      const res = await fetch("/api/matchpoint/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMatchModalTarget(null);
        setMatchPartnerSubmissionId(null);
        setMatchPartnerCompany("");
        setMatchPartnerContact("");
        setMatchPartnerEmail("");
        setMatchPartnerPhone("");
        setMatchPartnerCategory("");
        setMatchPartnerPercentage(88);
        setMatchPartnerReason("");
        setMatchPartnerNotes("");
        setSendEmailNow(true);
        fetchData();

        if (data.emailDispatched) {
          alert("Match successfully linked and introduction email dispatched to both parties!");
        } else if (data.emailError) {
          alert(`Match linked. Note regarding email: ${data.emailError}`);
        }
      }
    } catch (e) {
      console.error("Failed to link match:", e);
    } finally {
      setSavingMatch(false);
    }
  };

  // Run Bulk Auto-Match
  const handleRunAutoMatch = async () => {
    if (!confirm("Run Auto-Match across pending submissions and dispatch introduction emails to compatible companies?")) return;
    setRunningAutoMatch(true);
    try {
      const res = await fetch("/api/matchpoint/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_automatch", minPercentage: 75, sendEmails: true }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || `Connected ${data.matchedCount} pairs!`);
        fetchData();
      } else {
        alert(data.error || "Failed to execute auto-match.");
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred while executing auto-match.");
    } finally {
      setRunningAutoMatch(false);
    }
  };

  // Re-dispatch introduction email for an existing match
  const handleResendEmail = async (submissionId: string, matchIndex: number) => {
    setResendingEmailId(`${submissionId}-${matchIndex}`);
    try {
      const res = await fetch("/api/matchpoint/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId, resendEmailIndex: matchIndex }),
      });
      const data = await res.json();
      if (data.success && data.emailDispatched) {
        alert("Introduction email dispatched successfully to both parties!");
        fetchData();
      } else {
        alert(data.emailError || "Failed to dispatch email.");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending email.");
    } finally {
      setResendingEmailId(null);
    }
  };

  // Quick link from candidate with evaluation
  const handleSelectCandidate = (candidate: ClientMatchPointSubmission, evaluation?: MatchEvaluation) => {
    setMatchPartnerSubmissionId(candidate._id);
    setMatchPartnerCompany(candidate.companyName);
    setMatchPartnerContact(candidate.fullName);
    setMatchPartnerEmail(candidate.email);
    setMatchPartnerPhone(candidate.phone || "");
    setMatchPartnerCategory(evaluation?.matchedCategory || candidate.needCategories?.[0] || "Strategic Partner");
    setMatchPartnerPercentage(evaluation?.percentage || 88);
    setMatchPartnerScore(evaluation?.score || 60);
    setMatchPartnerReason(evaluation?.reason || "");
    setMatchPartnerNotes(
      evaluation?.reason
        ? `Synergy: ${evaluation.reason}`
        : `Paired based on ${candidate.companyName}'s offerings and ${matchModalTarget?.companyName}'s requirements.`
    );
  };

  // Remove linked match
  const handleRemoveMatch = async (submissionId: string, matchIndex: number) => {
    if (!confirm("Remove this match pair?")) return;
    try {
      const res = await fetch("/api/matchpoint/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId, removeMatchIndex: matchIndex }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        if (selectedItem && selectedItem._id === submissionId) {
          setSelectedItem(data.submission);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save admin notes
  const handleSaveNotes = async (id: string) => {
    try {
      const res = await fetch("/api/matchpoint/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminNotes: adminNotesText }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, adminNotes: adminNotesText } : s))
        );
        setEditingNotesId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) {
      alert("No submissions to export.");
      return;
    }

    const headers = [
      "Match-Point ID",
      "Full Name",
      "Email",
      "Phone",
      "Company Name",
      "Designation",
      "Role Category",
      "City",
      "LinkedIn",
      "Website",
      "About Company",
      "Key USPs",
      "Need Categories",
      "Looking For Details",
      "Urgency",
      "Keywords",
      "Status",
      "Matched Partners Count",
      "Matched Details",
      "Admin Notes",
      "Registered Date",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = submissions.map((s) => [
      escapeCsv(s.matchPointId),
      escapeCsv(s.fullName),
      escapeCsv(s.email),
      escapeCsv(s.phone),
      escapeCsv(s.companyName),
      escapeCsv(s.designation),
      escapeCsv(s.category),
      escapeCsv(s.city || ""),
      escapeCsv(s.linkedinUrl || ""),
      escapeCsv(s.websiteUrl || ""),
      escapeCsv(s.aboutCompany),
      escapeCsv(s.usps?.join("; ") || ""),
      escapeCsv(s.needCategories?.join("; ") || ""),
      escapeCsv(s.lookingForDetails),
      escapeCsv(s.urgency),
      escapeCsv(s.keywords?.join(", ") || ""),
      escapeCsv(s.status),
      escapeCsv(s.matchedWith?.length || 0),
      escapeCsv(
        s.matchedWith
          ?.map((m) => `${m.companyName} (${m.contactName || ""} - ${m.email || ""}) [${m.matchedCategory}]`)
          .join(" | ") || ""
      ),
      escapeCsv(s.adminNotes || ""),
      escapeCsv(new Date(s.createdAt).toLocaleDateString("en-IN")),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SFF_Match-Point_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Potential Match Suggestions for Matchmaking Modal
  const candidateMatches = useMemo(() => {
    if (!matchModalTarget) return [];

    return submissions
      .filter((s) => s._id !== matchModalTarget._id)
      .map((s) => {
        const evaluation = evaluateMatch(matchModalTarget as any, s as any);
        return { candidate: s, evaluation };
      })
      .filter((item) => item.evaluation.percentage >= 60)
      .sort((a, b) => b.evaluation.percentage - a.evaluation.percentage)
      .slice(0, 6);
  }, [matchModalTarget, submissions]);

  return (
    <div style={{ marginTop: "1rem" }}>
      {/* ─── Metric Stats ─── */}
      <div className="db-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#2563eb" }}>{stats.total}</div>
          <div className="db-stat-lbl">Total Registrations</div>
        </div>

        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#f59e0b" }}>{stats.pending}</div>
          <div className="db-stat-lbl">Pending Review</div>
        </div>

        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#10b981" }}>{stats.matched}</div>
          <div className="db-stat-lbl">Matched Pairs</div>
        </div>

        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#0284c7" }}>{stats.emailed}</div>
          <div className="db-stat-lbl">Introductions Sent</div>
        </div>
      </div>

      {/* Top Needs Bar */}
      {topNeeds.length > 0 && (
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", color: "#475569", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Sparkles size={14} color="#6366f1" /> Most Requested Business Needs at SFF
            </span>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Click to filter</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {topNeeds.map((need) => (
              <button
                key={need.name}
                type="button"
                onClick={() => setNeedFilter(needFilter === need.name ? "all" : need.name)}
                style={{
                  background: needFilter === need.name ? "rgba(2, 132, 199, 0.15)" : "#f8fafc",
                  border: `1px solid ${needFilter === need.name ? "#0284c7" : "#e2e8f0"}`,
                  color: needFilter === need.name ? "#0284c7" : "#334155",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  padding: "0.35rem 0.8rem",
                  borderRadius: "20px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span>{need.name}</span>
                <span style={{ background: "#e2e8f0", color: "#475569", borderRadius: "10px", padding: "0.1rem 0.45rem", fontSize: "0.72rem" }}>
                  {need.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Search & Controls Bar ─── */}
      <div style={{ display: "flex", gap: "0.85rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "0.75rem", flex: 1, minWidth: "300px", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by company, person, need keyword, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mp-input"
              style={{ paddingLeft: "2.4rem", height: "42px" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mp-select"
            style={{ width: "auto", minWidth: "150px", height: "42px", padding: "0.5rem 0.85rem" }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="analyzed">Analyzed</option>
            <option value="matched">Matched</option>
            <option value="emailed">Email Sent</option>
            <option value="archived">Archived</option>
          </select>

          {/* Need Category Filter */}
          <select
            value={needFilter}
            onChange={(e) => setNeedFilter(e.target.value)}
            className="mp-select"
            style={{ width: "auto", minWidth: "160px", height: "42px", padding: "0.5rem 0.85rem" }}
          >
            <option value="all">All Need Categories</option>
            {topNeeds.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name} ({n.count})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleRunAutoMatch}
            disabled={runningAutoMatch || loading}
            className="mp-btn-primary"
            style={{
              height: "42px",
              padding: "0 1.15rem",
              fontSize: "0.86rem",
              background: "linear-gradient(135deg, #0369a1, #0284c7)",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
            title="Automatically pair compatible attendees and dispatch executive introduction emails"
          >
            <Zap size={14} className={runningAutoMatch ? "spin" : ""} />
            {runningAutoMatch ? "Matching & Emailing..." : "⚡ Run Auto-Match & Send Emails"}
          </button>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="db-refresh"
            style={{ height: "42px" }}
            title="Refresh submissions"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="mp-btn-primary"
            style={{ height: "42px", padding: "0 1.25rem", fontSize: "0.88rem", background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)" }}
            title="Download CSV for Email Outreach"
          >
            <FileSpreadsheet size={16} />
            Export CSV for Outreach
          </button>
        </div>
      </div>

      {/* ─── Submissions Table / Cards ─── */}
      {submissions.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: "18px", padding: "4rem 2rem", textAlign: "center", border: "1px dashed #cbd5e1" }}>
          <Building2 size={40} color="#94a3b8" style={{ margin: "0 auto 1rem" }} />
          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155", margin: 0 }}>
            No Match-Point Submissions Found
          </h4>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.4rem 0 0" }}>
            {searchQuery || statusFilter !== "all" || needFilter !== "all"
              ? "Try adjusting your filters or search keywords."
              : "When participants scan the QR code at SFF, their submissions will appear here in real time."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {submissions.map((sub) => {
            const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
            const isEditingNotes = editingNotesId === sub._id;

            return (
              <div
                key={sub._id}
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  border: "1px solid #e2e8f0",
                  padding: "1.5rem",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #0284c7, #6366f1)",
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {sub.companyName?.[0]?.toUpperCase() || "M"}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          {sub.companyName}
                        </h3>
                        <span style={{ background: "rgba(2, 132, 199, 0.08)", color: "#0284c7", fontSize: "0.74rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "8px", border: "1px solid rgba(2, 132, 199, 0.2)" }}>
                          {sub.matchPointId}
                        </span>
                        <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
                          {sub.category}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.86rem", color: "#64748b", marginTop: "0.2rem", display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
                        <span><strong>{sub.fullName}</strong> ({sub.designation})</span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <Mail size={13} /> {sub.email}
                        </span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <Phone size={13} /> {sub.phone}
                        </span>
                        {sub.city && <span>• {sub.city}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown & Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <select
                      value={sub.status}
                      onChange={(e) => updateStatus(sub._id, e.target.value)}
                      style={{
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        border: `1px solid ${statusCfg.color}44`,
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        padding: "0.35rem 0.8rem",
                        borderRadius: "20px",
                        cursor: "pointer",
                      }}
                    >
                      <option value="pending">Pending Review</option>
                      <option value="analyzed">Analyzed</option>
                      <option value="matched">Matched</option>
                      <option value="emailed">Email Sent</option>
                      <option value="archived">Archived</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setSelectedItem(sub)}
                      className="db-action-btn view"
                      title="Inspect full details"
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(sub._id, sub.companyName)}
                      className="db-action-btn delete"
                      title="Delete submission"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Offerings vs Looking For Content Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", margin: "1rem 0" }}>
                  {/* Left: What they do */}
                  <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "1rem", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#0284c7", fontWeight: 800, display: "block", marginBottom: "0.35rem" }}>
                      🏢 What They Do & USPs
                    </span>
                    <p style={{ fontSize: "0.86rem", color: "#334155", margin: "0 0 0.5rem", lineHeight: 1.5 }}>
                      {sub.aboutCompany}
                    </p>
                    {sub.usps?.length > 0 && (
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        {sub.usps.map((usp, i) => (
                          <span key={i} style={{ fontSize: "0.72rem", background: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", padding: "0.15rem 0.5rem", borderRadius: "6px" }}>
                            ✓ {usp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: What they are looking for */}
                  <div style={{ background: "rgba(99, 102, 241, 0.04)", borderRadius: "14px", padding: "1rem", border: "1px solid rgba(99, 102, 241, 0.18)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#6366f1", fontWeight: 800 }}>
                        🎯 Looking For
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#9333ea", fontWeight: 700 }}>
                        Urgency: {sub.urgency}
                      </span>
                    </div>

                    {sub.lookingForDetails ? (
                      <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", margin: "0 0 0.5rem", lineHeight: 1.5 }}>
                        "{sub.lookingForDetails}"
                      </p>
                    ) : (
                      <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "#64748b", margin: "0 0 0.5rem" }}>
                        Open requirement across selected categories
                      </p>
                    )}

                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {sub.needCategories?.map((cat, i) => (
                        <span key={i} style={{ fontSize: "0.72rem", background: "rgba(99, 102, 241, 0.12)", color: "#4f46e5", fontWeight: 700, padding: "0.15rem 0.55rem", borderRadius: "8px" }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Matchmaking Linker Section */}
                <div style={{ background: "#fdfefe", borderRadius: "12px", border: "1px solid #edf2f7", padding: "0.85rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                      🔗 Matched Partners ({sub.matchedWith?.length || 0}):
                    </span>

                    {sub.matchedWith && sub.matchedWith.length > 0 ? (
                      sub.matchedWith.map((m, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            background: "rgba(16, 185, 129, 0.08)",
                            border: "1px solid rgba(16, 185, 129, 0.28)",
                            color: "#065f46",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            padding: "0.25rem 0.65rem",
                            borderRadius: "12px",
                          }}
                        >
                          {m.matchPercentage && (
                            <span
                              style={{
                                background: "#059669",
                                color: "#ffffff",
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                padding: "1px 5px",
                                borderRadius: "4px",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {m.matchPercentage}%
                            </span>
                          )}
                          <strong>{m.companyName}</strong>
                          <span style={{ color: "#475569", fontWeight: 600 }}>({m.matchedCategory})</span>

                          {m.emailSent ? (
                            <span
                              style={{
                                color: "#0284c7",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                background: "rgba(2, 132, 199, 0.08)",
                                padding: "1px 5px",
                                borderRadius: "4px",
                              }}
                              title={`Official introduction email dispatched${m.emailSentAt ? ` on ${new Date(m.emailSentAt).toLocaleString()}` : ""}`}
                            >
                              <Mail size={10} /> Intro Sent
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleResendEmail(sub._id, idx)}
                              disabled={resendingEmailId === `${sub._id}-${idx}`}
                              style={{
                                background: "#ffffff",
                                border: "1px solid #0284c7",
                                color: "#0284c7",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                              title="Send introduction email to both parties now"
                            >
                              <Send size={10} />
                              {resendingEmailId === `${sub._id}-${idx}` ? "Sending..." : "Send Mail"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveMatch(sub._id, idx)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }}
                            title="Remove match"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>No partner linked yet</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setMatchModalTarget(sub);
                        setMatchPartnerCategory(sub.needCategories?.[0] || "");
                      }}
                      style={{
                        background: "rgba(2, 132, 199, 0.08)",
                        border: "1px solid rgba(2, 132, 199, 0.25)",
                        color: "#0284c7",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        padding: "0.3rem 0.8rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <LinkIcon size={13} /> Link Match Partner
                    </button>
                  </div>
                </div>

                {/* Admin Notes Row */}
                <div style={{ marginTop: "0.75rem", fontSize: "0.82rem" }}>
                  {isEditingNotes ? (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.35rem" }}>
                      <input
                        type="text"
                        className="mp-input"
                        placeholder="Add internal match note (e.g. Talked with founder, intro via WhatsApp/Email on 20th)..."
                        value={adminNotesText}
                        onChange={(e) => setAdminNotesText(e.target.value)}
                        style={{ height: "36px", fontSize: "0.82rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(sub._id)}
                        className="mp-btn-primary"
                        style={{ height: "36px", padding: "0 1rem", fontSize: "0.8rem" }}
                      >
                        Save Note
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNotesId(null)}
                        className="mp-btn-secondary"
                        style={{ height: "36px", padding: "0 0.8rem", fontSize: "0.8rem" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ color: "#64748b", fontWeight: 600 }}>Notes:</span>
                      <span style={{ color: sub.adminNotes ? "#334155" : "#94a3b8", fontStyle: sub.adminNotes ? "normal" : "italic" }}>
                        {sub.adminNotes || "Click to add admin notes"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(sub._id);
                          setAdminNotesText(sub.adminNotes || "");
                        }}
                        style={{ background: "none", border: "none", color: "#0284c7", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                      >
                        {sub.adminNotes ? "Edit" : "+ Add"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL: MATCHMAKING LINKER ─── */}
      {matchModalTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setMatchModalTarget(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "22px",
              padding: "2rem",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMatchModalTarget(null)}
              style={{
                position: "absolute",
                top: "1.2rem",
                right: "1.2rem",
                border: "none",
                background: "#f1f5f9",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              <X size={16} />
            </button>

            <div style={{ marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.76rem", textTransform: "uppercase", color: "#0284c7", fontWeight: 800 }}>
                Interactive Matchmaker
              </span>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0.2rem 0" }}>
                Pair a Partner for {matchModalTarget.companyName}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                Looking for: <strong>{matchModalTarget.lookingForDetails ? `"${matchModalTarget.lookingForDetails}"` : matchModalTarget.needCategories?.join(", ")}</strong>
              </p>
            </div>

            {/* Smart Suggested Candidates */}
            {candidateMatches.length > 0 && (
              <div style={{ background: "rgba(2, 132, 199, 0.04)", borderRadius: "14px", padding: "1.1rem", border: "1px solid rgba(2, 132, 199, 0.2)", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "#0284c7", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.65rem", letterSpacing: "0.04em" }}>
                  <Zap size={14} /> Executive Compatibility Matches (Verified Attendees)
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  {candidateMatches.map(({ candidate, evaluation }) => (
                    <div
                      key={candidate._id}
                      style={{
                        background: "#ffffff",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>{candidate.companyName}</strong>
                          <span
                            style={{
                              background: "#059669",
                              color: "#ffffff",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: "6px",
                            }}
                          >
                            {evaluation.percentage}% Synergy
                          </span>
                          <span style={{ fontSize: "0.76rem", color: "#64748b" }}>
                            ({candidate.fullName} &bull; {candidate.designation})
                          </span>
                        </div>
                        <p style={{ fontSize: "0.78rem", color: "#475569", margin: "0.25rem 0 0", lineHeight: 1.4 }}>
                          {evaluation.reason}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCandidate(candidate, evaluation)}
                        style={{
                          background: "#0284c7",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          padding: "0.4rem 0.85rem",
                          borderRadius: "8px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Select & Fill
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Partner Form */}
            <form onSubmit={handleSaveMatch}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "1rem" }}>
                <div>
                  <label className="mp-label" style={{ fontSize: "0.8rem" }}>
                    Matching Company Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="mp-input"
                    placeholder="e.g. HR Solutions Pro / Acme Talent"
                    value={matchPartnerCompany}
                    onChange={(e) => setMatchPartnerCompany(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mp-label" style={{ fontSize: "0.8rem" }}>Contact Person Name</label>
                  <input
                    type="text"
                    className="mp-input"
                    placeholder="e.g. Sarah Jenkins"
                    value={matchPartnerContact}
                    onChange={(e) => setMatchPartnerContact(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mp-label" style={{ fontSize: "0.8rem" }}>Official Email</label>
                  <input
                    type="email"
                    className="mp-input"
                    placeholder="e.g. sarah@hrsolutions.com"
                    value={matchPartnerEmail}
                    onChange={(e) => setMatchPartnerEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mp-label" style={{ fontSize: "0.8rem" }}>Phone / WhatsApp</label>
                  <input
                    type="tel"
                    className="mp-input"
                    placeholder="e.g. +91 98765 00000"
                    value={matchPartnerPhone}
                    onChange={(e) => setMatchPartnerPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mp-label" style={{ fontSize: "0.8rem" }}>Matched Service Category</label>
                  <input
                    type="text"
                    className="mp-input"
                    placeholder="e.g. HR & Recruitment Agency / Technology Partner"
                    value={matchPartnerCategory}
                    onChange={(e) => setMatchPartnerCategory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mp-label" style={{ fontSize: "0.8rem" }}>Match Compatibility (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    className="mp-input"
                    value={matchPartnerPercentage}
                    onChange={(e) => setMatchPartnerPercentage(parseInt(e.target.value) || 85)}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="mp-label" style={{ fontSize: "0.8rem" }}>Executive Alignment Summary</label>
                  <input
                    type="text"
                    className="mp-input"
                    placeholder="e.g. High synergy in HR & Recruitment with focus on sales talent hiring"
                    value={matchPartnerReason}
                    onChange={(e) => setMatchPartnerReason(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="mp-label" style={{ fontSize: "0.8rem" }}>Introduction / Match Notes</label>
                  <textarea
                    className="mp-textarea"
                    placeholder="Notes for email introduction (e.g. Connecting F2 Fintech with Acme HR for their sales hiring requirement)..."
                    value={matchPartnerNotes}
                    onChange={(e) => setMatchPartnerNotes(e.target.value)}
                    style={{ minHeight: "65px" }}
                  />
                </div>

                {/* Instant Email Trigger Checkbox */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "rgba(2, 132, 199, 0.05)",
                    border: "1px solid rgba(2, 132, 199, 0.2)",
                    borderRadius: "10px",
                    padding: "0.8rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <input
                    type="checkbox"
                    id="sendEmailCheckbox"
                    checked={sendEmailNow}
                    onChange={(e) => setSendEmailNow(e.target.checked)}
                    style={{ width: "17px", height: "17px", cursor: "pointer", accentColor: "#0284c7" }}
                  />
                  <label htmlFor="sendEmailCheckbox" style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                    Dispatch Official Executive Introduction Email to both founders immediately (via partners@f2fintech.com)
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  className="mp-btn-secondary"
                  onClick={() => setMatchModalTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mp-btn-primary"
                  disabled={savingMatch}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  {savingMatch ? <RefreshCw size={15} className="spin" /> : sendEmailNow ? <Send size={15} /> : <LinkIcon size={15} />}
                  {sendEmailNow ? "Confirm Match & Send Intro Email" : "Confirm Match & Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: INSPECT SUBMISSION DETAILS ─── */}
      {selectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "22px",
              padding: "2rem",
              maxWidth: "720px",
              width: "100%",
              maxHeight: "88vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                position: "absolute",
                top: "1.2rem",
                right: "1.2rem",
                border: "none",
                background: "#f1f5f9",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #0284c7, #6366f1)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedItem.companyName?.[0]}
              </div>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {selectedItem.companyName}
                </h3>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {selectedItem.fullName} ({selectedItem.designation}) • Pass ID: <strong>{selectedItem.matchPointId}</strong>
                </span>
              </div>
            </div>

            {/* Profile Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", background: "#f8fafc", padding: "1rem", borderRadius: "14px", marginBottom: "1.25rem" }}>
              <div><strong>Email:</strong> {selectedItem.email}</div>
              <div><strong>Phone:</strong> {selectedItem.phone}</div>
              <div><strong>Role Category:</strong> {selectedItem.category}</div>
              <div><strong>Location:</strong> {selectedItem.city || "Not specified"}</div>
              {selectedItem.linkedinUrl && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <strong>LinkedIn:</strong>{" "}
                  <a href={selectedItem.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: "#0284c7" }}>
                    {selectedItem.linkedinUrl}
                  </a>
                </div>
              )}
              {selectedItem.websiteUrl && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <strong>Website:</strong>{" "}
                  <a href={selectedItem.websiteUrl} target="_blank" rel="noreferrer" style={{ color: "#0284c7" }}>
                    {selectedItem.websiteUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Offerings */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0284c7", marginBottom: "0.4rem" }}>
                🏢 About the Business & USPs
              </h4>
              <p style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>
                {selectedItem.aboutCompany}
              </p>
              {selectedItem.usps?.length > 0 && (
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {selectedItem.usps.map((u, i) => (
                    <span key={i} style={{ fontSize: "0.75rem", background: "rgba(2, 132, 199, 0.1)", color: "#0284c7", padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: 600 }}>
                      ✓ {u}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What they need */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#6366f1", marginBottom: "0.4rem" }}>
                🎯 Looking For & Opportunities
              </h4>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.5 }}>
                {selectedItem.lookingForDetails ? `"${selectedItem.lookingForDetails}"` : <span style={{ color: "#64748b", fontStyle: "italic" }}>No specific description provided</span>}
              </p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {selectedItem.needCategories?.map((c, i) => (
                  <span key={i} style={{ fontSize: "0.75rem", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: 700 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Linked Matches */}
            {selectedItem.matchedWith && selectedItem.matchedWith.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#059669", marginBottom: "0.4rem" }}>
                  🤝 Linked Match Partners
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedItem.matchedWith.map((m, idx) => (
                    <div key={idx} style={{ background: "rgba(5, 150, 105, 0.06)", border: "1px solid rgba(5, 150, 105, 0.2)", borderRadius: "10px", padding: "0.75rem" }}>
                      <strong>{m.companyName}</strong> ({m.contactName} • {m.email} • {m.phone})
                      <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.2rem" }}>
                        Category: {m.matchedCategory} {m.notes ? `• Note: ${m.notes}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="mp-btn-primary"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
