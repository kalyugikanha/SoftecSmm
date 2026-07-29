"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { Layers, Sparkles, Trash2, Plus, Loader2 } from "lucide-react";

interface Pillar {
  id: string;
  name: string;
  description: string;
  emoji: string;
  percentage: number;
  examples: string[];
}

const BRAND_ID = "softecai";

export default function PillarsPage() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", emoji: "📌", percentage: 20 });

  const fetchPillars = async () => {
    setLoading(true);
    const q = query(collection(db, "pillars"), where("brandId", "==", BRAND_ID));
    const snap = await getDocs(q);
    setPillars(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pillar)));
    setLoading(false);
  };

  useEffect(() => { fetchPillars(); }, []);

  const handleAIGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: BRAND_ID }),
      });
      if (!res.ok) throw new Error("AI generation failed");
      await fetchPillars();
    } catch (err) {
      console.error(err);
      alert("AI generation failed. Make sure Gemini API key is set.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddManual = async () => {
    if (!form.name) return;
    await addDoc(collection(db, "pillars"), {
      ...form,
      brandId: BRAND_ID,
      examples: [],
      createdAt: serverTimestamp(),
    });
    setForm({ name: "", description: "", emoji: "📌", percentage: 20 });
    setShowForm(false);
    await fetchPillars();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pillar?")) return;
    await deleteDoc(doc(db, "pillars", id));
    await fetchPillars();
  };

  const totalPct = pillars.reduce((a, p) => a + (p.percentage || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Content Pillars</h1>
            <p className="page-subtitle">Define the content themes that guide all AI-generated posts</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(true)}
              id="add-pillar-btn"
            >
              <Plus size={16} /> Add Manually
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAIGenerate}
              disabled={generating}
              id="ai-generate-pillars-btn"
            >
              {generating ? (
                <><Loader2 size={16} className="spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> AI Generate Pillars</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Distribution bar */}
      {pillars.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700 }}>Content Distribution</h4>
            <span style={{ fontSize: "0.78rem", color: totalPct === 100 ? "var(--status-success)" : "var(--status-warning)" }}>
              {totalPct}% / 100%
            </span>
          </div>
          <div style={{ display: "flex", height: 12, borderRadius: "var(--radius-full)", overflow: "hidden", gap: 2 }}>
            {pillars.map((p, i) => (
              <div
                key={p.id}
                style={{
                  width: `${p.percentage}%`,
                  background: `hsl(${i * 45}, 70%, 50%)`,
                  borderRadius: i === 0 ? "var(--radius-full) 0 0 var(--radius-full)" : i === pillars.length - 1 ? "0 var(--radius-full) var(--radius-full) 0" : 0,
                }}
                title={`${p.name}: ${p.percentage}%`}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
            {pillars.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: `hsl(${i * 45}, 70%, 50%)` }} />
                <span style={{ color: "var(--text-secondary)" }}>{p.emoji} {p.name} ({p.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pillars Grid */}
      {loading ? (
        <div className="grid-3">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      ) : pillars.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Layers size={28} /></div>
          <p className="empty-state-title">No content pillars yet</p>
          <p className="empty-state-desc">
            Click "AI Generate Pillars" to let Gemini analyze your brand and create content themes, or add them manually.
          </p>
          <button className="btn btn-primary" onClick={handleAIGenerate} id="empty-ai-pillars-btn">
            <Sparkles size={16} /> Generate with AI
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="pillar-card" id={`pillar-${pillar.id}`}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span className="pillar-emoji">{pillar.emoji}</span>
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  onClick={() => handleDelete(pillar.id)}
                  id={`delete-pillar-${pillar.id}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div>
                <div className="pillar-name">{pillar.name}</div>
                <div className="pillar-desc">{pillar.description}</div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                    Content Share
                  </span>
                  <span className="pillar-pct">{pillar.percentage}%</span>
                </div>
                <div className="pillar-progress-bar">
                  <div className="pillar-progress-fill" style={{ width: `${pillar.percentage}%` }} />
                </div>
              </div>
              {pillar.examples && pillar.examples.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Examples
                  </span>
                  {pillar.examples.slice(0, 2).map((ex, i) => (
                    <div key={i} style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", gap: 6 }}>
                      <span style={{ color: "var(--brand-crimson-bright)" }}>→</span>
                      {ex}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Manual Add Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Content Pillar</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "var(--space-3)" }}>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <input
                    className="form-input"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    style={{ textAlign: "center", fontSize: "1.5rem" }}
                    id="pillar-emoji-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pillar Name</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Educational Content"
                    id="pillar-name-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What kind of content falls under this pillar?"
                  id="pillar-desc-input"
                  style={{ minHeight: 80 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content Share: {form.percentage}%</label>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={form.percentage}
                  onChange={(e) => setForm({ ...form, percentage: parseInt(e.target.value) })}
                  id="pillar-pct-slider"
                  style={{ width: "100%", accentColor: "var(--brand-crimson-bright)" }}
                />
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddManual} id="save-pillar-btn">
                  <Plus size={16} /> Add Pillar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
