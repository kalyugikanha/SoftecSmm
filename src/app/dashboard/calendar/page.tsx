"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ChevronLeft,
  ChevronRight,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  X,
} from "lucide-react";

const PLATFORM_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  instagram: { color: "#E1306C", icon: Instagram, label: "Instagram" },
  facebook: { color: "#1877F2", icon: Facebook, label: "Facebook" },
  linkedin: { color: "#0A66C2", icon: Linkedin, label: "LinkedIn" },
  youtube: { color: "#FF0000", icon: Youtube, label: "YouTube" },
  pinterest: { color: "#E60023", icon: Circle, label: "Pinterest" },
  whatsapp: { color: "#25D366", icon: Circle, label: "WhatsApp" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface PostIdea {
  id: string;
  title: string;
  platform: string;
  status: string;
  scheduledDate?: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  brandId: string;
}

export default function CalendarPage() {
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date());
  const [ideas, setIdeas] = useState<PostIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PostIdea | null>(null);
  const [scheduling, setScheduling] = useState<PostIdea | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "ideas"),
        where("status", "in", ["approved", "scheduled", "published"])
      );
      const snap = await getDocs(q);
      setIdeas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostIdea)));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  // Calendar grid
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const getIdeasForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return ideas.filter((idea) => idea.scheduledDate?.startsWith(dateStr));
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const handleScheduleSave = async () => {
    if (!scheduling || !scheduleDate) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "ideas", scheduling.id), {
        scheduledDate: new Date(scheduleDate).toISOString(),
        status: "scheduled",
        updatedAt: new Date().toISOString(),
      });
      await fetchIdeas();
      setScheduling(null);
      setScheduleDate("");
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  // Stats
  const approvedCount = ideas.filter((i) => i.status === "approved").length;
  const scheduledCount = ideas.filter((i) => i.status === "scheduled").length;
  const publishedCount = ideas.filter((i) => i.status === "published").length;

  return (
    <div className="animate-fade-in" style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Content Calendar
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "6px" }}>
          Schedule and track your approved posts across all platforms
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Approved (Unscheduled)", value: approvedCount, color: "#f59e0b", icon: "✅" },
          { label: "Scheduled", value: scheduledCount, color: "#8B0000", icon: "📅" },
          { label: "Published", value: publishedCount, color: "#16a34a", icon: "🚀" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: "12px", padding: "20px",
            border: "1px solid var(--bg-border)", boxShadow: "var(--shadow-sm)",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <span style={{ fontSize: "28px" }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Card */}
      <div style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid var(--bg-border)", boxShadow: "var(--shadow-md)", overflow: "hidden",
      }}>
        {/* Month Nav */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--bg-border)",
          background: "linear-gradient(135deg,#8B0000 0%,#b91c1c 100%)",
        }}>
          <button
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px",
              color: "#fff", width: "36px", height: "36px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
              {MONTHS[month]} {year}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              {ideas.length} posts this period
            </div>
          </div>
          <button
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px",
              color: "#fff", width: "36px", height: "36px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: "#f8fafc" }}>
          {DAYS.map((d) => (
            <div key={d} style={{
              padding: "10px 0", textAlign: "center", fontSize: "12px",
              fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase",
              letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)",
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {Array.from({ length: totalCells }).map((_, i) => {
            const day = i - firstDay + 1;
            const valid = day >= 1 && day <= daysInMonth;
            const dayIdeas = valid ? getIdeasForDay(day) : [];
            const todayCell = valid && isToday(day);

            return (
              <div key={i} style={{
                minHeight: "100px", padding: "8px",
                borderRight: (i + 1) % 7 === 0 ? "none" : "1px solid var(--bg-border)",
                borderBottom: "1px solid var(--bg-border)",
                background: todayCell ? "rgba(139,0,0,0.04)" : valid ? "#fff" : "#f9fafb",
                transition: "background 0.15s",
              }}>
                {valid && (
                  <>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: todayCell ? "#8B0000" : "transparent",
                      color: todayCell ? "#fff" : "var(--text-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: todayCell ? 700 : 400,
                      marginBottom: "6px",
                    }}>{day}</div>

                    {/* Post chips */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {dayIdeas.slice(0, 3).map((idea) => {
                        const cfg = PLATFORM_CONFIG[idea.platform] || { color: "#64748b", label: idea.platform };
                        return (
                          <button key={idea.id} onClick={() => setSelected(idea)} style={{
                            background: cfg.color + "18", border: `1px solid ${cfg.color}40`,
                            borderLeft: `3px solid ${cfg.color}`, borderRadius: "4px",
                            padding: "3px 6px", cursor: "pointer", textAlign: "left",
                            fontSize: "10px", color: cfg.color, fontWeight: 600,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            width: "100%",
                          }}>
                            {cfg.label}: {idea.title}
                          </button>
                        );
                      })}
                      {dayIdeas.length > 3 && (
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", paddingLeft: "4px" }}>
                          +{dayIdeas.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled Posts */}
      {ideas.filter((i) => i.status === "approved" && !i.scheduledDate).length > 0 && (
        <div style={{ marginTop: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
            📋 Approved — Not Yet Scheduled
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "14px" }}>
            {ideas.filter((i) => i.status === "approved" && !i.scheduledDate).map((idea) => {
              const cfg = PLATFORM_CONFIG[idea.platform] || { color: "#64748b", label: idea.platform };
              return (
                <div key={idea.id} style={{
                  background: "#fff", borderRadius: "12px", padding: "16px",
                  border: "1px solid var(--bg-border)", boxShadow: "var(--shadow-sm)",
                  borderTop: `3px solid ${cfg.color}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, color: cfg.color,
                      background: cfg.color + "15", padding: "3px 8px", borderRadius: "20px",
                    }}>{cfg.label}</span>
                    <CheckCircle size={16} color="#16a34a" />
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.4 }}>
                    {idea.title}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
                    {idea.hook}
                  </p>
                  <button onClick={() => { setScheduling(idea); setScheduleDate(""); }} style={{
                    width: "100%", background: "#8B0000", color: "#fff", border: "none",
                    borderRadius: "8px", padding: "9px", fontSize: "13px", fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  }}>
                    <Calendar size={14} /> Schedule Post
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px", padding: "28px",
            maxWidth: "520px", width: "100%", maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{
                background: (PLATFORM_CONFIG[selected.platform]?.color || "#64748b") + "15",
                color: PLATFORM_CONFIG[selected.platform]?.color || "#64748b",
                fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px",
              }}>{PLATFORM_CONFIG[selected.platform]?.label || selected.platform}</span>
              <button onClick={() => setSelected(null)} style={{
                background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
              }}><X size={20} /></button>
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
              {selected.title}
            </h2>
            {[
              { label: "Hook", value: selected.hook },
              { label: "Caption", value: selected.body },
              { label: "CTA", value: selected.cta },
            ].map((f) => f.value && (
              <div key={f.label} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                  {f.label}
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {f.value}
                </p>
              </div>
            ))}
            {selected.hashtags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px" }}>
                {selected.hashtags.map((h) => (
                  <span key={h} style={{
                    fontSize: "12px", background: "#f1f5f9",
                    color: "#475569", padding: "3px 8px", borderRadius: "20px",
                  }}>#{h.replace(/^#/, "")}</span>
                ))}
              </div>
            )}
            {selected.status !== "scheduled" && (
              <button onClick={() => { setSelected(null); setScheduling(selected); }} style={{
                width: "100%", marginTop: "20px", background: "#8B0000", color: "#fff",
                border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px",
                fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px",
              }}>
                <Calendar size={16} /> Schedule This Post
              </button>
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduling && (
        <div onClick={() => setScheduling(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px", padding: "28px",
            maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              📅 Schedule Post
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
              {scheduling.title}
            </p>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                <Clock size={14} style={{ display: "inline", marginRight: "6px" }} />
                Choose Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "8px",
                  border: "1px solid var(--bg-border)", fontSize: "14px",
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setScheduling(null)} style={{
                flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid var(--bg-border)",
                background: "#fff", color: "var(--text-secondary)", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={handleScheduleSave} disabled={!scheduleDate || saving} style={{
                flex: 2, padding: "11px", borderRadius: "8px", border: "none",
                background: scheduleDate ? "#8B0000" : "#ccc",
                color: "#fff", fontSize: "14px", fontWeight: 600,
                cursor: scheduleDate ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                {saving ? "Saving..." : <><CheckCircle size={16} /> Confirm Schedule</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
