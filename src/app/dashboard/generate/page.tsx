"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Sparkles, Loader2, Instagram, Facebook, Linkedin, Youtube, MessageSquare } from "lucide-react";

const BRAND_ID = "softecai";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", color: "var(--platform-instagram)" },
  { id: "facebook", label: "Facebook", icon: "👍", color: "var(--platform-facebook)" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "var(--platform-linkedin)" },
  { id: "pinterest", label: "Pinterest", icon: "📌", color: "var(--platform-pinterest)" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "var(--platform-youtube)" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", color: "var(--platform-whatsapp)" },
];

interface Pillar { id: string; name: string; emoji: string; }
interface Idea {
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  suggestedImagePrompt?: string;
}

export default function GeneratePage() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["pinterest"]);
  const [selectedPillar, setSelectedPillar] = useState("");
  const [count, setCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Record<string, Idea[]>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPillars = async () => {
      const q = query(collection(db, "pillars"), where("brandId", "==", BRAND_ID));
      const snap = await getDocs(q);
      setPillars(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pillar)));
    };
    
    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/brand/config?brandId=${BRAND_ID}`);
        const data = await res.json();
        if (data.success && data.connectedPlatforms) {
          setConnectedPlatforms(data.connectedPlatforms);
          // Auto-select only valid platforms from defaults
          setSelectedPlatforms(prev => prev.filter(p => data.connectedPlatforms.includes(p)));
        }
      } catch (err) {
        console.error("Failed to fetch connected platforms", err);
      }
    };

    fetchPillars();
    fetchConfig();
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform.");
      return;
    }
    setError("");
    setGenerating(true);
    setResults({});
    try {
      const requests = selectedPlatforms.map((platform) =>
        fetch("/api/ai/generate-ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId: BRAND_ID,
            platform,
            pillarId: selectedPillar || null,
            count,
          }),
        }).then((r) => r.json())
      );
      const responses = await Promise.all(requests);
      const newResults: Record<string, Idea[]> = {};
      selectedPlatforms.forEach((platform, i) => {
        newResults[platform] = responses[i].ideas || [];
      });
      setResults(newResults);
    } catch (err) {
      console.error(err);
      setError("Generation failed. Please check your Gemini API key in .env.local");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">AI Content Generator</h1>
        <p className="page-subtitle">Generate platform-specific post ideas using Gemini AI</p>
      </div>

      {/* Config Panel */}
      <div className="ai-panel" style={{ marginBottom: "var(--space-6)" }}>
        <div className="ai-panel-header">
          <div className="ai-badge"><Sparkles size={10} /> Gemini AI Powered</div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Configure Generation</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-6)" }}>
          {/* Platform Select */}
          <div className="form-group">
            <label className="form-label">Target Platforms (Connected only)</label>
            <div className="platform-selector" style={{ marginTop: "var(--space-2)" }}>
              {PLATFORMS.map((p) => {
                const isConnected = connectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => isConnected && togglePlatform(p.id)}
                    className={`platform-chip ${selectedPlatforms.includes(p.id) ? "selected" : ""}`}
                    style={{ opacity: isConnected ? 1 : 0.4, cursor: isConnected ? "pointer" : "not-allowed" }}
                    id={`gen-platform-${p.id}`}
                    title={isConnected ? "" : "Not connected. Configure in settings."}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pillar Select */}
          <div className="form-group">
            <label className="form-label">Content Pillar (optional)</label>
            <select
              className="form-select"
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              id="gen-pillar-select"
            >
              <option value="">— Any Pillar (AI decides) —</option>
              {pillars.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
            {pillars.length === 0 && (
              <p className="form-hint">
                💡 Set up content pillars first for better results
              </p>
            )}
          </div>

          {/* Count Select */}
          <div className="form-group">
            <label className="form-label">Ideas per Platform: {count}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              id="gen-count-slider"
              style={{ width: "100%", accentColor: "var(--brand-crimson-bright)", marginTop: 8 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)" }}>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
              {selectedPlatforms.length * count} total ideas will be generated
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: "var(--space-4)",
            background: "var(--status-error-subtle)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            color: "var(--status-error)",
            fontSize: "0.85rem",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-6)" }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={generating || selectedPlatforms.length === 0}
            id="run-generation-btn"
          >
            {generating ? (
              <><Loader2 size={18} style={{ animation: "spin 0.7s linear infinite" }} /> Generating with Gemini AI...</>
            ) : (
              <><Sparkles size={18} /> Generate {selectedPlatforms.length * count} Ideas</>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {generating && (
        <div style={{ textAlign: "center", padding: "var(--space-12)" }}>
          <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto var(--space-4)" }}>
            <div className="spinner" style={{ width: 60, height: 60, borderWidth: 3 }} />
            <Sparkles
              size={24}
              style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                color: "var(--brand-crimson-bright)",
              }}
            />
          </div>
          <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Gemini is crafting your content ideas...</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: 4 }}>
            Analyzing your brand, audience, and platform best practices
          </p>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          {Object.entries(results).map(([platform, ideas]) => {
            const p = PLATFORMS.find((x) => x.id === platform);
            return (
              <div key={platform}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                  <span style={{ fontSize: "1.5rem" }}>{p?.icon}</span>
                  <h3 style={{ fontWeight: 700, color: p?.color }}>{p?.label} Ideas</h3>
                  <span className={`badge badge-${platform}`}>
                    {ideas.length} ideas
                  </span>
                  <span className="badge badge-pending">Pending Approval</span>
                </div>
                <div className="grid-3">
                  {ideas.map((idea, idx) => (
                    <div key={idx} className="idea-card" id={`idea-${platform}-${idx}`}>
                      <div className="idea-card-header">
                        <div>
                          <div className="idea-card-title">{idea.title}</div>
                          <div style={{ marginTop: "var(--space-2)" }}>
                            <div className="idea-card-hook">"{idea.hook}"</div>
                          </div>
                        </div>
                        <span style={{
                          background: "var(--bg-surface)",
                          borderRadius: "var(--radius-sm)",
                          padding: "2px 8px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                        }}>
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="idea-card-body">{idea.body}</p>
                      <div style={{ fontSize: "0.8rem", color: "var(--brand-crimson-bright)", fontWeight: 600 }}>
                        👉 {idea.cta}
                      </div>
                      <div className="idea-card-hashtags">
                        {idea.hashtags.slice(0, 5).map((tag, i) => (
                          <span key={i} className="hashtag-chip">#{tag}</span>
                        ))}
                        {idea.hashtags.length > 5 && (
                          <span className="hashtag-chip" style={{ background: "var(--bg-border)", color: "var(--text-muted)" }}>
                            +{idea.hashtags.length - 5}
                          </span>
                        )}
                      </div>
                      {idea.suggestedImagePrompt && (
                        <div style={{
                          background: "var(--bg-surface)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--space-3)",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          borderLeft: "2px solid var(--bg-border)",
                        }}>
                          <strong style={{ color: "var(--text-secondary)" }}>🖼 Image Prompt:</strong>{" "}
                          {idea.suggestedImagePrompt}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", justifyContent: "center", paddingTop: "var(--space-4)" }}>
            <a href="/dashboard/approvals" className="btn btn-primary btn-lg" id="go-to-approvals-btn">
              Review & Approve Ideas →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
