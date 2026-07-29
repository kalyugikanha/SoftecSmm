"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Globe, Save, Building2, Users, Palette, MessageSquare, CheckCircle } from "lucide-react";

const TONES = ["Professional", "Casual", "Inspirational", "Educational", "Humorous", "Bold"];
const INDUSTRIES = [
  "Technology / AI",
  "Software Development",
  "Digital Marketing",
  "E-commerce",
  "Finance",
  "Healthcare",
  "Education",
  "Real Estate",
  "Other",
];
const PLATFORMS = ["instagram", "facebook", "linkedin", "pinterest", "youtube", "whatsapp"];

const BRAND_ID = "softecai"; // Fixed brand for POC

export default function BrandPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "Softecai",
    tagline: "Building Intelligent Solutions",
    industry: "Technology / AI",
    targetAudience: "SMEs, startups, and enterprises looking to leverage AI and software solutions",
    tone: "Professional",
    platforms: ["instagram", "facebook", "linkedin"],
    websiteUrl: "https://softecai.com",
    colors: ["#8B0000", "#ffffff"],
    vision: "",
    mission: "",
    usp: "",
  });

  useEffect(() => {
    const fetchBrand = async () => {
      const q = query(collection(db, "brands"), where("brandKey", "==", BRAND_ID));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setDocId(snap.docs[0].id);
        setForm((prev) => ({ ...prev, ...data }));
      }
    };
    fetchBrand();
  }, []);

  const togglePlatform = (p: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = { ...form, brandKey: BRAND_ID, updatedAt: serverTimestamp() };
      if (docId) {
        await updateDoc(doc(db, "brands", docId), data);
      } else {
        const ref = await addDoc(collection(db, "brands"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setDocId(ref.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Brand Identity</h1>
            <p className="page-subtitle">Define your brand so AI can create perfectly aligned content</p>
          </div>
          <button
            className={`btn ${saved ? "btn-success" : "btn-primary"}`}
            onClick={handleSave}
            disabled={loading}
            id="save-brand-btn"
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
            ) : saved ? (
              <><CheckCircle size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Brand</>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
        {/* Basic Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Building2 size={16} /> Basic Information</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input
                id="brand-name"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Softecai"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline / Slogan</label>
              <input
                id="brand-tagline"
                className="form-input"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Building Intelligent Solutions"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select
                id="brand-industry"
                className="form-select"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              >
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input
                id="brand-website"
                className="form-input"
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://softecai.com"
              />
            </div>
          </div>
        </div>

        {/* Audience & Tone */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Users size={16} /> Audience & Tone</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <textarea
                id="brand-audience"
                className="form-textarea"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                placeholder="Describe your ideal customer..."
                style={{ minHeight: 80 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Brand Tone</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, tone: t })}
                    className={`platform-chip ${form.tone === t ? "selected" : ""}`}
                    id={`tone-${t.toLowerCase()}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Brand Vision */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><MessageSquare size={16} /> Brand Story</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Vision</label>
              <textarea
                id="brand-vision"
                className="form-textarea"
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                placeholder="What future are you building toward?"
                style={{ minHeight: 70 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mission</label>
              <textarea
                id="brand-mission"
                className="form-textarea"
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                placeholder="What do you do and for whom?"
                style={{ minHeight: 70 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unique Value Proposition (USP)</label>
              <textarea
                id="brand-usp"
                className="form-textarea"
                value={form.usp}
                onChange={(e) => setForm({ ...form, usp: e.target.value })}
                placeholder="What makes you different from competitors?"
                style={{ minHeight: 70 }}
              />
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Globe size={16} /> Active Platforms</h3>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
            Select platforms where Softecai is active
          </p>
          <div className="platform-selector">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`platform-chip ${form.platforms.includes(p) ? "selected" : ""}`}
                id={`platform-toggle-${p}`}
              >
                <span
                  className="platform-dot"
                  style={{ background: `var(--platform-${p})` }}
                />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Brand Colors */}
          <div style={{ marginTop: "var(--space-6)" }}>
            <div className="form-label" style={{ marginBottom: "var(--space-3)" }}>
              <Palette size={14} style={{ display: "inline", marginRight: 6 }} />
              Brand Colors
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
              {form.colors.map((color, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...form.colors];
                      newColors[idx] = e.target.value;
                      setForm({ ...form, colors: newColors });
                    }}
                    style={{
                      width: 36, height: 36, borderRadius: "var(--radius-md)",
                      border: "1px solid var(--bg-border)", cursor: "pointer",
                      background: "transparent", padding: 2,
                    }}
                    id={`color-picker-${idx}`}
                  />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {color}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
