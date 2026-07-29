"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { CheckSquare, CheckCircle, XCircle, Edit3, Clock, Save } from "lucide-react";

const BRAND_ID = "softecai";

const PLATFORMS = [
  { id: "all", label: "All Platforms" },
  { id: "instagram", label: "📸 Instagram" },
  { id: "facebook", label: "👍 Facebook" },
  { id: "linkedin", label: "💼 LinkedIn" },
  { id: "pinterest", label: "📌 Pinterest" },
  { id: "youtube", label: "▶️ YouTube" },
  { id: "whatsapp", label: "💬 WhatsApp" },
];

interface Idea {
  id: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  platform: string;
  status: string;
  suggestedImagePrompt?: string;
  referenceImageUrl?: string;
  createdAt: { seconds: number } | null;
}

export default function ApprovalsPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        await updateDoc(doc(db, "ideas", id), { referenceImageUrl: data.url, updatedAt: new Date() });
        await fetchIdeas();
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setUploadingId(null);
    }
  };

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "ideas"),
        where("brandId", "==", BRAND_ID),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Idea));
      setIdeas(data);
      setCounts({
        pending: data.filter((i) => i.status === "pending_approval").length,
        approved: data.filter((i) => i.status === "approved").length,
        rejected: data.filter((i) => i.status === "rejected").length,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "ideas", id), { status, updatedAt: new Date() });
    await fetchIdeas();
  };

  const saveEdit = async (id: string) => {
    await updateDoc(doc(db, "ideas", id), { body: editBody, updatedAt: new Date() });
    setEditingId(null);
    await fetchIdeas();
  };

  const filteredIdeas = ideas.filter(
    (i) => filter === "all" || i.platform === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "var(--status-success)";
      case "rejected": return "var(--status-error)";
      case "pending_approval": return "var(--status-warning)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Approval Queue</h1>
            <p className="page-subtitle">Review, edit, and approve AI-generated post ideas</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchIdeas} id="refresh-approvals-btn">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: "var(--space-6)" }}>
        <div className="stat-card" id="approval-pending-count">
          <div className="stat-icon" style={{ background: "var(--status-warning-subtle)", color: "var(--status-warning)" }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-value">{counts.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
        <div className="stat-card" id="approval-approved-count">
          <div className="stat-icon" style={{ background: "var(--status-success-subtle)", color: "var(--status-success)" }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{counts.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card" id="approval-rejected-count">
          <div className="stat-icon" style={{ background: "var(--status-error-subtle)", color: "var(--status-error)" }}>
            <XCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{counts.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="tabs" style={{ marginBottom: "var(--space-6)" }}>
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            className={`tab-item ${filter === p.id ? "active" : ""}`}
            onClick={() => setFilter(p.id)}
            id={`filter-${p.id}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Ideas List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 180, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CheckSquare size={28} /></div>
          <p className="empty-state-title">No ideas to review</p>
          <p className="empty-state-desc">
            Generate new content ideas using the AI Generator, then come back here to approve them.
          </p>
          <a href="/dashboard/generate" className="btn btn-primary" id="go-generate-from-approvals">
            Generate Ideas
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="idea-card" id={`approval-idea-${idea.id}`}>
              <div className="idea-card-header">
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                    <span className={`badge badge-${idea.platform}`}>
                      {idea.platform}
                    </span>
                    <span className="badge" style={{ background: "transparent", border: "1px solid", borderColor: getStatusColor(idea.status), color: getStatusColor(idea.status) }}>
                      {idea.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="idea-card-title">{idea.title}</div>
                </div>
              </div>

              <div className="idea-card-hook">"{idea.hook}"</div>

              {editingId === idea.id ? (
                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    style={{ minHeight: 100 }}
                    id={`edit-body-${idea.id}`}
                  />
                  <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(idea.id)} id={`save-edit-${idea.id}`}>
                      <Save size={13} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="idea-card-body">{idea.body}</p>
              )}

              <div style={{ fontSize: "0.8rem", color: "var(--brand-crimson-bright)", fontWeight: 600 }}>
                👉 {idea.cta}
              </div>

              <div className="idea-card-hashtags">
                {idea.hashtags?.slice(0, 8).map((tag, i) => (
                  <span key={i} className="hashtag-chip">#{tag}</span>
                ))}
              </div>

              <div className="idea-card-actions">
                <div style={{ flex: 1, display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <input 
                    type="file" 
                    id={`ref-image-${idea.id}`} 
                    style={{ display: "none" }} 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(idea.id, e)}
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => document.getElementById(`ref-image-${idea.id}`)?.click()}
                    disabled={uploadingId === idea.id || idea.status !== "pending_approval"}
                    id={`attach-${idea.id}`}
                  >
                    {uploadingId === idea.id ? "Uploading..." : "📎 Attach Reference"}
                  </button>
                  {idea.referenceImageUrl && (
                    <span style={{ fontSize: "0.8rem", color: "var(--status-success)", fontWeight: 600 }}>
                      ✓ Image Attached
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-success btn-sm"
                  onClick={() => updateStatus(idea.id, "approved")}
                  disabled={idea.status === "approved"}
                  id={`approve-${idea.id}`}
                >
                  <CheckCircle size={14} />
                  {idea.status === "approved" ? "Approved ✓" : "Approve"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setEditingId(idea.id);
                    setEditBody(idea.body);
                  }}
                  id={`edit-${idea.id}`}
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => updateStatus(idea.id, "rejected")}
                  disabled={idea.status === "rejected"}
                  id={`reject-${idea.id}`}
                >
                  <XCircle size={14} />
                  {idea.status === "rejected" ? "Rejected" : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
