"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection, query, where, getDocs, doc,
  onSnapshot, updateDoc, serverTimestamp,
} from "firebase/firestore";
import {
  Sparkles, Image as ImageIcon, Send, Loader2,
  Instagram, Facebook, Linkedin, Youtube, CheckCircle,
  ExternalLink, Pin, ChevronRight, Zap, Palette,
  Brain, Layers, Eye, ArrowRight, RefreshCw,
} from "lucide-react";
import type { CreativeBrief, DesignDNA, CreativeConcept } from "@/lib/creative/types";

// ═══════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════
const PLATFORM_CONFIG: Record<string, { color: string; label: string; icon: any }> = {
  instagram: { color: "#E1306C", label: "Instagram", icon: Instagram },
  facebook:  { color: "#1877F2", label: "Facebook",  icon: Facebook  },
  linkedin:  { color: "#0A66C2", label: "LinkedIn",  icon: Linkedin  },
  youtube:   { color: "#FF0000", label: "YouTube",   icon: Youtube   },
  pinterest: { color: "#E60023", label: "Pinterest", icon: Pin       },
  whatsapp:  { color: "#25D366", label: "WhatsApp",  icon: Sparkles  },
};

const CONCEPT_STYLES: Record<string, { label: string; desc: string; color: string; icon: string }> = {
  minimal_saas:    { label: "Premium Minimal",  desc: "Apple · Stripe · Linear", color: "#6366f1", icon: "◆" },
  bold_marketing:  { label: "Bold Marketing",   desc: "High Contrast · Scroll-Stop", color: "#ef4444", icon: "▲" },
  editorial:       { label: "Editorial Premium", desc: "Magazine · Luxury · Story", color: "#f59e0b", icon: "❖" },
};

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════
interface Idea {
  id: string; title: string; platform: string;
  hook: string; body: string; cta: string;
  hashtags: string[]; status: string;
  imageUrl?: string; suggestedImagePrompt?: string;
  brandId: string; publishedAt?: string; pinterestPinId?: string;
  referenceImageUrl?: string;
}

type Phase = "select" | "briefing" | "brief_ready" | "generating" | "concepts_ready" | "published";

interface ConceptSet {
  A: CreativeConcept;
  B: CreativeConcept;
  C: CreativeConcept;
}

// ═══════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════
function StepBadge({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: done || active ? 1 : 0.35 }}>
      <div style={{
        width: "24px", height: "24px", borderRadius: "50%",
        background: done ? "#16a34a" : active ? "#8B0000" : "#e2e8f0",
        color: done || active ? "#fff" : "#94a3b8",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: 700, flexShrink: 0,
      }}>
        {done ? "✓" : step}
      </div>
      <span style={{ fontSize: "12px", fontWeight: active ? 700 : 500, color: active ? "#8B0000" : "#64748b" }}>
        {label}
      </span>
    </div>
  );
}

function BriefCard({ brief }: { brief: CreativeBrief }) {
  const fields = [
    { icon: "🎯", label: "Objective",     value: brief.campaignObjective },
    { icon: "🎭", label: "Visual Story",  value: brief.visualStory       },
    { icon: "⭐", label: "Visual Concept", value: brief.visualConcept    },
    { icon: "🚫", label: "Anti-Cliche",    value: brief.antiCliche       },
    { icon: "💫", label: "Mood",          value: brief.mood               },
    { icon: "🎨", label: "Design Style",  value: brief.designStyle        },
    { icon: "💡", label: "Colour Psych",  value: brief.colourPsychology   },
    { icon: "❌", label: "Avoid",         value: brief.negativePrompt     },
  ];
  return (
    <div style={{
      background: "linear-gradient(135deg,#0f0f1a 0%,#1a0a0a 100%)",
      border: "1px solid #8B000033",
      borderRadius: "16px", padding: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <Brain size={18} color="#8B0000" />
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Creative Brief</span>
        <div style={{
          marginLeft: "auto", padding: "3px 10px",
          background: "#8B000022", border: "1px solid #8B000044",
          borderRadius: "20px", fontSize: "10px", fontWeight: 700,
          color: "#ef4444", letterSpacing: "0.1em",
        }}>AI DIRECTOR</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {fields.map((f) => (
          <div key={f.label} style={{
            background: "#ffffff08", borderRadius: "10px",
            padding: "12px", border: "1px solid #ffffff08",
          }}>
            <div style={{ fontSize: "10px", color: "#8B0000", fontWeight: 700,
              letterSpacing: "0.1em", marginBottom: "6px" }}>
              {f.icon} {f.label.toUpperCase()}
            </div>
            <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConceptCard({
  concept, selected, onSelect, onPublish, publishing,
}: {
  concept: CreativeConcept;
  selected: boolean;
  onSelect: () => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  // Normalize URL — strip any external host (localtunnel etc.) and always load from localhost
  const normalizePreviewUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return `http://localhost:3000${parsed.pathname}${parsed.search}`;
    } catch {
      return url;
    }
  };

  const [imgError, setImgError] = useState(false);
  const styleInfo = CONCEPT_STYLES[concept.style] || CONCEPT_STYLES.minimal_saas;
  const isCarousel = concept.slides !== undefined;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      border: selected ? "2px solid #8B0000" : "1px solid #e2e8f0",
      borderRadius: "16px", overflow: "hidden",
      background: selected ? "#fff" : "#fafafa",
      boxShadow: selected ? "0 8px 32px #8B000022" : "0 2px 8px #0000000a",
      transition: "all 0.2s",
    }}>
      {/* Concept Header */}
      <div style={{
        padding: "14px 16px", display: "flex",
        alignItems: "center", gap: "10px",
        borderBottom: "1px solid #f1f5f9",
        background: selected ? "linear-gradient(135deg,#8B000008,#fff)" : "#fff",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: styleInfo.color + "15",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", color: styleInfo.color, fontWeight: 900,
        }}>
          {styleInfo.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
            Concept {concept.id}
          </div>
          <div style={{ fontSize: "11px", color: styleInfo.color, fontWeight: 600 }}>
            {styleInfo.label}
          </div>
        </div>
        <div style={{
          fontSize: "10px", color: "#94a3b8",
          background: "#f8fafc", padding: "3px 8px",
          borderRadius: "6px",
        }}>
          {styleInfo.desc}
        </div>
      </div>

      {/* Preview Image */}
      <div style={{
        position: "relative", background: "#0a0a14",
        minHeight: "200px", display: "flex",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {!imgError ? (
          <img
            src={normalizePreviewUrl(concept.previewUrl)}
            alt={`Concept ${concept.id}`}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        ) : (
          <div style={{
            textAlign: "center", padding: "32px 20px", color: "#64748b",
          }}>
            <Palette size={32} style={{ opacity: 0.3, marginBottom: "8px" }} />
            <p style={{ fontSize: "12px", margin: 0 }}>Preview loading...</p>
          </div>
        )}
        {/* Style overlay badge */}
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          background: styleInfo.color,
          color: "#fff", fontSize: "9px", fontWeight: 700,
          padding: "3px 8px", borderRadius: "4px",
          letterSpacing: "0.1em",
        }}>
          {concept.style.replace("_", " ").toUpperCase()}
        </div>
      </div>

      {/* Layout info */}
      <div style={{ padding: "12px 16px", background: "#f8fafc", fontSize: "11px", color: "#64748b" }}>
        <div style={{ marginBottom: "4px", fontWeight: 600, color: "#475569" }}>
          {concept.layout.headlineText}
        </div>
        <div style={{ opacity: 0.7 }}>
          {concept.layout.mood} · {concept.layout.compositionStyle?.replace("_", " ")}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={onSelect}
          style={{
            width: "100%", padding: "10px",
            borderRadius: "8px", border: "none",
            background: selected ? "#8B0000" : "#0f172a",
            color: "#fff", fontSize: "13px", fontWeight: 700,
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: "6px",
            transition: "all 0.15s",
          }}
        >
          {selected ? <><CheckCircle size={14} /> Selected</> : <><Eye size={14} /> Use This Concept</>}
        </button>
        {selected && (
          <button
            onClick={onPublish}
            disabled={publishing || isCarousel}
            style={{
              width: "100%", padding: "10px",
              borderRadius: "8px", border: "none",
              background: publishing || isCarousel ? "#94a3b8" : "#E60023",
              color: "#fff", fontSize: "13px", fontWeight: 700,
              cursor: publishing || isCarousel ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "6px",
            }}
            title={isCarousel ? "Carousel publishing coming soon" : ""}
          >
            {publishing
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Publishing...</>
              : <><Pin size={14} /> Publish to Pinterest</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════
export default function CreativeStudioPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [selected, setSelected] = useState<Idea | null>(null);
  const [tab, setTab] = useState<"approved" | "published">("approved");

  // Creative pipeline state
  const [phase, setPhase] = useState<Phase>("select");
  const [briefing, setBriefing] = useState(false);
  const [brief, setBrief] = useState<CreativeBrief | null>(null);
  const [dna, setDna] = useState<DesignDNA | null>(null);
  const [generating, setGenerating] = useState(false);
  const [concepts, setConcepts] = useState<ConceptSet | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<"A" | "B" | "C" | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState("");
  const [publishError, setPublishError] = useState("");
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");
  const [generatingSlides, setGeneratingSlides] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  // Fetch ideas
  const fetchIdeas = useCallback(async () => {
    setLoadingIdeas(true);
    try {
      const statuses = tab === "approved" ? ["approved", "scheduled"] : ["published"];
      const q = query(collection(db, "ideas"), where("status", "in", statuses));
      const snap = await getDocs(q);
      setIdeas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Idea)));
    } catch (e) { console.error(e); }
    setLoadingIdeas(false);
  }, [tab]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  // Live update for selected idea
  useEffect(() => {
    if (!selected) return;
    const unsub = onSnapshot(doc(db, "ideas", selected.id), (snap) => {
      if (snap.exists()) {
        const updated = { id: snap.id, ...snap.data() } as Idea;
        setSelected(updated);
        setIdeas((prev) => prev.map((i) => i.id === updated.id ? updated : i));
      }
    });
    return () => unsub();
  }, [selected?.id]);

  const selectIdea = (idea: Idea) => {
    setSelected(idea);
    setPhase("select");
    setBrief(null);
    setDna(null);
    setConcepts(null);
    setSelectedConcept(null);
    setError("");
    setPublishSuccess("");
    setPublishError("");
  };

  // ─── Phase 1: Brief My Creative Director ───
  const runCreativeDirector = async () => {
    if (!selected) return;
    setBriefing(true);
    setPhase("briefing");
    setError("");

    try {
      setLoadingStep("🧠 Reading brand identity...");
      await new Promise((r) => setTimeout(r, 400));

      setLoadingStep("🎬 AI Creative Director is thinking...");
      const briefRes = await fetch("/api/ai/creative-director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: selected.id, brandId: "softecai" }),
      });
      const briefData = await briefRes.json();
      if (!briefRes.ok) throw new Error(briefData.error || "Brief generation failed");

      setLoadingStep("🎨 Building design strategy & DNA...");
      const strategyRes = await fetch("/api/ai/design-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: briefData.brief,
          brandName: "Softecai",
          colors: ["#8B0000", "#ffffff", "#1a1a1a"],
          tone: "Professional",
          platform: selected.platform,
        }),
      });
      const strategyData = await strategyRes.json();
      if (!strategyRes.ok) throw new Error(strategyData.error || "Design strategy failed");

      setBrief(briefData.brief);
      setDna(strategyData.dna);
      setPhase("brief_ready");
    } catch (e: any) {
      setError(e.message);
      setPhase("select");
    }
    setBriefing(false);
    setLoadingStep("");
  };

  // ─── Phase 2: Generate 3 Creative Concepts ───
  const generateConcepts = async () => {
    if (!selected || !brief || !dna) return;
    setGenerating(true);
    setPhase("generating");
    setError("");

    try {
      setLoadingStep("⚡ Generating Concept A — Premium Minimal SaaS...");
      await new Promise((r) => setTimeout(r, 600));
      setLoadingStep("🔴 Generating Concept B — Bold Marketing...");
      await new Promise((r) => setTimeout(r, 400));
      setLoadingStep("✨ Generating Concept C — Editorial Premium...");

      const res = await fetch("/api/ai/generate-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          dna,
          brandName: "Softecai",
          colors: ["#8B0000", "#ffffff", "#1a1a1a"],
          tone: "Professional",
          platform: selected.platform,
          title: selected.title,
          referenceImageUrl: selected.referenceImageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Concept generation failed");

      setConcepts(data.concepts);
      setPhase("concepts_ready");
    } catch (e: any) {
      setError(e.message);
      setPhase("brief_ready");
    }
    setGenerating(false);
    setLoadingStep("");
  };

  // ─── Select Concept ───
  const handleSelectConcept = async (conceptId: "A" | "B" | "C") => {
    if (!selected || !concepts) return;
    setSelectedConcept(conceptId);
    const concept = concepts[conceptId];
    
    // Save selected concept's previewUrl as the idea's imageUrl
    await updateDoc(doc(db, "ideas", selected.id), {
      imageUrl: concept.previewUrl,
      selectedConceptId: conceptId,
      format: brief?.format,
      imageGeneratedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
  };

  // ─── Generate Carousel Slides ───
  const handleGenerateSlides = async () => {
    if (!selectedConcept || !concepts || !brief) return;
    setGeneratingSlides(true);
    setSlideProgress(1); // Starting with slide 1
    
    try {
      const totalSlides = 5;
      const concept = concepts[selectedConcept];
      const newSlides = [];
      
      for (let i = 1; i <= totalSlides; i++) {
        setSlideProgress(i);
        
        // Use previous slide's image as reference to maintain consistency
        const referenceImageUrl = i > 1 ? newSlides[i - 2].imageUrl : undefined;
        
        // Sequential fetch call per slide.
        const res = await fetch("/api/ai/generate-slide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            brief, 
            dna, 
            concept, 
            slideIndex: i, 
            totalSlides,
            platform: selected?.platform,
            referenceImageUrl
          }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Slide ${i} failed`);
        
        newSlides.push({
          order: i,
          imageUrl: data.slideUrl,
          caption: data.caption
        });
      }
      
      // Update local state
      const updatedConcept = { ...concept, slides: newSlides };
      setConcepts(prev => prev ? { ...prev, [selectedConcept]: updatedConcept } : prev);
      
      // Update firestore
      await updateDoc(doc(db, "ideas", selected!.id), {
        slides: newSlides,
        updatedAt: serverTimestamp(),
      });
      
    } catch (e: any) {
      setError(`Carousel generation failed: ${e.message}`);
    } finally {
      setGeneratingSlides(false);
    }
  };

  // ─── Publish ───
  const publishToPinterest = async () => {
    if (!selected) return;
    setPublishing(true);
    setPublishError("");
    setPublishSuccess("");
    try {
      const res = await fetch("/api/publish/pinterest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setPublishSuccess(`✅ Published! Pin ID: ${data.pinId}`);
      await fetchIdeas();
    } catch (e: any) {
      setPublishError(e.message);
    }
    setPublishing(false);
  };

  const platformColor = selected ? (PLATFORM_CONFIG[selected.platform]?.color || "#8B0000") : "#8B0000";

  // ═══════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════
  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>

      {/* ──── LEFT PANEL — Post List ──── */}
      <div style={{
        width: "300px", minWidth: "300px",
        background: "#fff", borderRight: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "18px 16px 0", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Palette size={18} color="#8B0000" />
            <h1 style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
              Creative Studio
            </h1>
          </div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>
            {(["approved", "published"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "7px", borderRadius: "8px", border: "none",
                background: tab === t ? "#8B0000" : "#f8fafc",
                color: tab === t ? "#fff" : "#64748b",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
              }}>
                {t === "approved" ? "🎨 Ready" : "✅ Published"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {loadingIdeas ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : ideas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "#94a3b8" }}>
              <ImageIcon size={36} style={{ opacity: 0.3, marginBottom: "10px" }} />
              <p style={{ fontSize: "13px", margin: 0 }}>No posts ready yet</p>
            </div>
          ) : ideas.map((idea) => {
            const cfg = PLATFORM_CONFIG[idea.platform] || { color: "#8B0000", label: idea.platform };
            const isActive = selected?.id === idea.id;
            return (
              <div
                key={idea.id}
                onClick={() => selectIdea(idea)}
                style={{
                  padding: "12px", borderRadius: "10px", cursor: "pointer",
                  marginBottom: "6px",
                  border: isActive ? `2px solid ${cfg.color}` : "1px solid #f1f5f9",
                  background: isActive ? cfg.color + "06" : "#fafafa",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{
                    fontSize: "9px", fontWeight: 700, color: cfg.color,
                    background: cfg.color + "15", padding: "2px 7px",
                    borderRadius: "20px", textTransform: "uppercase",
                  }}>{cfg.label}</span>
                  {idea.imageUrl && <Layers size={12} color={cfg.color} />}
                  {idea.status === "published" && <CheckCircle size={12} color="#16a34a" />}
                </div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", margin: "0 0 3px", lineHeight: 1.4 }}>
                  {idea.title}
                </p>
                <p style={{
                  fontSize: "11px", color: "#94a3b8", margin: 0, lineHeight: 1.4,
                  overflow: "hidden", textOverflow: "ellipsis",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                }}>
                  {idea.hook}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "10px", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={fetchIdeas} style={{
            width: "100%", padding: "8px", borderRadius: "8px",
            border: "1px solid #e2e8f0", background: "#fff",
            color: "#94a3b8", fontSize: "12px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* ──── RIGHT PANEL ──── */}
      {!selected ? (
        // Empty state
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          justifyContent: "center", flexDirection: "column",
          gap: "16px", background: "#f8fafc",
        }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "20px",
            background: "linear-gradient(135deg,#8B000015,#8B000005)",
            border: "1px solid #8B000022",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Brain size={36} color="#8B000066" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "#334155", margin: "0 0 6px" }}>
              AI Creative Director
            </p>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
              Select a post to start generating agency-quality creatives
            </p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>

          {/* Top bar */}
          <div style={{
            padding: "14px 24px", background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", gap: "16px",
          }}>
            <div style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: platformColor, flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>{selected.title}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                {PLATFORM_CONFIG[selected.platform]?.label} · {selected.status}
              </div>
            </div>

            {/* Progress steps */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <StepBadge step={1} label="Brief" active={phase === "select" || phase === "briefing"} done={["brief_ready","generating","concepts_ready"].includes(phase)} />
              <ChevronRight size={14} color="#cbd5e1" />
              <StepBadge step={2} label="Concepts" active={phase === "brief_ready" || phase === "generating"} done={phase === "concepts_ready"} />
              <ChevronRight size={14} color="#cbd5e1" />
              <StepBadge step={3} label="Publish" active={phase === "concepts_ready"} done={phase === "published"} />
            </div>
          </div>

          {/* Main scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

            {/* Error banner */}
            {error && (
              <div style={{
                marginBottom: "16px", padding: "12px 16px",
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "10px", fontSize: "13px", color: "#dc2626",
              }}>
                ❌ {error}
              </div>
            )}

            {/* ─── PHASE: Select — Brief CTA ─── */}
            {(phase === "select") && (
              <div style={{
                background: "#fff", borderRadius: "16px", padding: "32px",
                border: "1px solid #e2e8f0", textAlign: "center",
                boxShadow: "0 4px 16px #0000000a",
              }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "16px",
                  background: "linear-gradient(135deg,#8B000015,#8B000005)",
                  border: "1px solid #8B000022",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <Brain size={28} color="#8B0000" />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>
                  Brief My Creative Director
                </h2>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 }}>
                  The AI Creative Director will analyse your brand, understand the campaign objective,
                  and create a professional creative brief — before generating a single pixel.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "28px" }}>
                  {[
                    { icon: "🧠", label: "Reads brand identity" },
                    { icon: "🎯", label: "Defines visual strategy" },
                    { icon: "🎨", label: "Builds Design DNA" },
                  ].map((f) => (
                    <div key={f.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", marginBottom: "4px" }}>{f.icon}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{f.label}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={runCreativeDirector}
                  style={{
                    padding: "14px 36px", borderRadius: "12px", border: "none",
                    background: "linear-gradient(135deg,#8B0000,#c0392b)",
                    color: "#fff", fontSize: "15px", fontWeight: 700,
                    cursor: "pointer", display: "inline-flex",
                    alignItems: "center", gap: "8px",
                    boxShadow: "0 4px 20px #8B000033",
                  }}
                >
                  <Brain size={18} /> Brief My Creative Director
                </button>
              </div>
            )}

            {/* ─── PHASE: Briefing — Loading ─── */}
            {phase === "briefing" && (
              <div style={{
                background: "linear-gradient(135deg,#0f0f1a,#1a0a0a)",
                borderRadius: "16px", padding: "48px 32px",
                border: "1px solid #8B000033", textAlign: "center",
              }}>
                <Loader2 size={40} color="#8B0000" style={{ animation: "spin 1s linear infinite", marginBottom: "20px" }} />
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>
                  {loadingStep || "Thinking..."}
                </p>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  The AI Creative Director is crafting your brief
                </p>
              </div>
            )}

            {/* ─── PHASE: Brief Ready ─── */}
            {(phase === "brief_ready") && brief && (
              <>
                <BriefCard brief={brief} />
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <button
                    onClick={generateConcepts}
                    style={{
                      padding: "14px 40px", borderRadius: "12px", border: "none",
                      background: "linear-gradient(135deg,#1e293b,#334155)",
                      color: "#fff", fontSize: "15px", fontWeight: 700,
                      cursor: "pointer", display: "inline-flex",
                      alignItems: "center", gap: "8px",
                      boxShadow: "0 4px 20px #1e293b33",
                    }}
                  >
                    <Zap size={18} /> Generate 3 Creative Concepts
                  </button>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "10px" }}>
                    3 genuinely different creative directions will be generated
                  </p>
                </div>
              </>
            )}

            {/* ─── PHASE: Generating ─── */}
            {phase === "generating" && (
              <div style={{
                background: "linear-gradient(135deg,#0f0f1a,#0a0f1a)",
                borderRadius: "16px", padding: "48px 32px",
                border: "1px solid #1e293b", textAlign: "center",
              }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "24px" }}>
                  {["A", "B", "C"].map((c) => (
                    <div key={c} style={{
                      width: "48px", height: "48px", borderRadius: "12px",
                      background: "#ffffff08", border: "1px solid #ffffff11",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", fontWeight: 900, color: "#fff", opacity: 0.6,
                    }}>
                      {c}
                    </div>
                  ))}
                </div>
                <Loader2 size={32} color="#6366f1" style={{ animation: "spin 1s linear infinite", marginBottom: "16px" }} />
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>
                  {loadingStep || "Generating concepts..."}
                </p>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                  Crafting 3 distinct creative directions
                </p>
              </div>
            )}

            {/* ─── PHASE: Concepts Ready ─── */}
            {phase === "concepts_ready" && concepts && (
              <>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "20px",
                }}>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>
                      3 Creative Concepts
                    </h2>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      Each concept has a different strategy, layout, mood, and marketing psychology
                    </p>
                  </div>
                  <button
                    onClick={generateConcepts}
                    style={{
                      padding: "8px 16px", borderRadius: "8px",
                      border: "1px solid #e2e8f0", background: "#fff",
                      color: "#64748b", fontSize: "12px", fontWeight: 600,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                    }}
                  >
                    <RefreshCw size={12} /> Regenerate All
                  </button>
                </div>

                {/* 3 Concept Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  {(["A", "B", "C"] as const).map((id) => (
                    <ConceptCard
                      key={id}
                      concept={concepts[id]}
                      selected={selectedConcept === id}
                      onSelect={() => handleSelectConcept(id)}
                      onPublish={publishToPinterest}
                      publishing={publishing}
                    />
                  ))}
                </div>

                {/* Carousel Slides Generator */}
                {selectedConcept && brief?.format === 'carousel' && (
                  <div style={{
                    marginTop: "24px", padding: "20px",
                    background: "#fff", border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>Carousel Generation</h3>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                          Generate all slides sequentially for the selected concept.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateSlides}
                        disabled={generatingSlides}
                        style={{
                          padding: "10px 20px", borderRadius: "8px", border: "none",
                          background: generatingSlides ? "#e2e8f0" : "#16a34a",
                          color: generatingSlides ? "#94a3b8" : "#fff",
                          fontSize: "13px", fontWeight: 700,
                          cursor: generatingSlides ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", gap: "8px",
                        }}
                      >
                        {generatingSlides ? (
                          <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Generating Slide {slideProgress} of 5...</>
                        ) : (
                          <><Layers size={16} /> Generate 5 Slides</>
                        )}
                      </button>
                    </div>
                    
                    {/* Render Slides Preview */}
                    {concepts[selectedConcept].slides && concepts[selectedConcept].slides!.length > 0 && (
                      <div style={{
                        marginTop: "16px", display: "flex", gap: "12px",
                        overflowX: "auto", paddingBottom: "8px"
                      }}>
                        {concepts[selectedConcept].slides!.map((slide, i) => (
                          <div key={i} style={{
                            width: "120px", flexShrink: 0,
                            borderRadius: "8px", overflow: "hidden",
                            border: "1px solid #e2e8f0", background: "#f8fafc"
                          }}>
                            <img src={slide.imageUrl} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                            <div style={{ padding: "6px", fontSize: "10px", fontWeight: 600, textAlign: "center", color: "#64748b" }}>
                              Slide {slide.order}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Publish status */}
                {publishSuccess && (
                  <div style={{
                    marginTop: "16px", padding: "14px 18px",
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: "10px", fontSize: "13px", color: "#16a34a",
                    display: "flex", alignItems: "center", gap: "10px",
                  }}>
                    <CheckCircle size={16} />
                    {publishSuccess}
                    {selected.pinterestPinId && (
                      <a
                        href={`https://pinterest.com/pin/${selected.pinterestPinId}`}
                        target="_blank" rel="noreferrer"
                        style={{ marginLeft: "auto", color: "#E60023", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <ExternalLink size={13} /> View on Pinterest
                      </a>
                    )}
                  </div>
                )}
                {publishError && (
                  <div style={{
                    marginTop: "16px", padding: "14px 18px",
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: "10px", fontSize: "13px", color: "#dc2626",
                  }}>
                    ❌ {publishError}
                  </div>
                )}

                {/* Post Caption (below concepts) */}
                <div style={{
                  marginTop: "20px", background: "#fff",
                  borderRadius: "14px", padding: "20px",
                  border: "1px solid #e2e8f0",
                }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", margin: "0 0 14px" }}>
                    📝 Post Caption
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    {[
                      { label: "🎯 HOOK", value: selected.hook },
                      { label: "📝 BODY", value: selected.body },
                      { label: "📣 CTA",  value: selected.cta  },
                    ].map((f) => (
                      <div key={f.label} style={{
                        padding: "10px 12px", background: "#f8fafc",
                        borderRadius: "8px", border: "1px solid #f1f5f9",
                      }}>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: "5px" }}>
                          {f.label}
                        </div>
                        <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selected.hashtags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
                      {selected.hashtags.map((h) => (
                        <span key={h} style={{
                          fontSize: "11px", background: platformColor + "12",
                          color: platformColor, padding: "3px 8px",
                          borderRadius: "20px", fontWeight: 600,
                          border: `1px solid ${platformColor}25`,
                        }}>
                          #{h.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const text = `${selected.hook}\n\n${selected.body}\n\n${selected.cta}\n\n${(selected.hashtags || []).map((h) => `#${h.replace(/^#/, "")}`).join(" ")}`;
                      navigator.clipboard.writeText(text);
                    }}
                    style={{
                      padding: "9px 18px", borderRadius: "8px",
                      border: `1px solid ${platformColor}`,
                      background: platformColor + "08",
                      color: platformColor, fontSize: "12px",
                      fontWeight: 600, cursor: "pointer",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                    }}
                  >
                    <Send size={13} /> Copy Caption
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
