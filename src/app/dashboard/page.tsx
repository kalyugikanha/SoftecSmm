"use client";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  CheckSquare,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Send,
  Instagram,
  ArrowRight,
  Zap,
  Globe,
  MessageSquare,
} from "lucide-react";

const stats = [
  {
    id: "stat-total-ideas",
    icon: Sparkles,
    label: "Total Ideas",
    value: "0",
    change: "Start generating",
    up: true,
  },
  {
    id: "stat-pending-approval",
    icon: Clock,
    label: "Pending Approval",
    value: "0",
    change: "Nothing pending",
    up: true,
  },
  {
    id: "stat-approved-posts",
    icon: CheckCircle,
    label: "Approved Posts",
    value: "0",
    change: "Ready to publish",
    up: true,
  },
  {
    id: "stat-published",
    icon: Send,
    label: "Published",
    value: "0",
    change: "This month",
    up: true,
  },
];

const platforms = [
  { name: "Instagram", color: "var(--platform-instagram)", icon: "📸", connected: false },
  { name: "Facebook", color: "var(--platform-facebook)", icon: "👍", connected: false },
  { name: "LinkedIn", color: "var(--platform-linkedin)", icon: "💼", connected: false },
  { name: "Pinterest", color: "var(--platform-pinterest)", icon: "📌", connected: false },
  { name: "YouTube", color: "var(--platform-youtube)", icon: "▶️", connected: false },
  { name: "WhatsApp", color: "var(--platform-whatsapp)", icon: "💬", connected: false },
];

const quickActions = [
  {
    id: "quick-brand",
    href: "/dashboard/brand",
    icon: Globe,
    title: "Setup Brand",
    desc: "Define your brand identity, tone & audience",
    step: 1,
  },
  {
    id: "quick-pillars",
    href: "/dashboard/pillars",
    icon: Layers,
    title: "Content Pillars",
    desc: "AI-generate content pillars for your brand",
    step: 2,
  },
  {
    id: "quick-generate",
    href: "/dashboard/generate",
    icon: Sparkles,
    title: "Generate Ideas",
    desc: "Let Gemini AI create post ideas per platform",
    step: 3,
  },
  {
    id: "quick-approvals",
    href: "/dashboard/approvals",
    icon: CheckSquare,
    title: "Approve & Post",
    desc: "Review, edit, and approve post ideas",
    step: 4,
  },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">
              Your AI-powered social media command center
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Link href="/dashboard/generate" className="btn btn-primary" id="quick-generate-btn">
              <Sparkles size={16} />
              Generate Content
            </Link>
          </div>
        </div>
      </div>

      {/* AI Status Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(139,0,0,0.15), rgba(139,0,0,0.05))",
          border: "1px solid var(--brand-crimson)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4) var(--space-6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
        id="ai-status-banner"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "var(--status-success)",
              boxShadow: "0 0 8px var(--status-success)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            Gemini AI Engine Online
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Ready to generate content for Softecai
          </span>
        </div>
        <span className="ai-badge">
          <Zap size={10} />
          Active
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: "var(--space-8)" }}>
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card" id={stat.id}>
            <div className="stat-icon">
              <stat.icon size={20} />
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
            <div className={`stat-change ${stat.up ? "up" : "down"}`}>
              <TrendingUp size={12} />
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        {/* Quick Start Guide */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Zap size={16} color="var(--brand-crimson-bright)" />
                Quick Start Workflow
              </h3>
              <p className="card-subtitle">Follow these steps to get started</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                id={action.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  padding: "var(--space-4)",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--bg-border)",
                  textDecoration: "none",
                  transition: "all var(--transition-fast)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-crimson)";
                  (e.currentTarget as HTMLElement).style.background = "var(--brand-crimson-subtle)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: "var(--radius-full)",
                    background: "var(--brand-crimson-subtle)",
                    border: "1px solid var(--brand-crimson)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--brand-crimson-bright)",
                    fontWeight: 800, fontSize: "0.75rem",
                    flexShrink: 0,
                  }}
                >
                  {action.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{action.desc}</div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        </div>

        {/* Platform Connections */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Instagram size={16} color="var(--platform-instagram)" />
                Platform Connections
              </h3>
              <p className="card-subtitle">Connect your social accounts</p>
            </div>
            <Link href="/dashboard/settings" className="btn btn-secondary btn-sm" id="manage-platforms-btn">
              Manage
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {platforms.map((p) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--bg-border)",
                }}
                id={`platform-${p.name.toLowerCase()}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span style={{ fontSize: "1.1rem" }}>{p.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    {p.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: p.connected ? "var(--status-success)" : "var(--text-muted)",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: p.connected ? "var(--status-success)" : "var(--text-muted)" }}>
                    {p.connected ? "Connected" : "Not connected"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <MessageSquare size={16} color="var(--brand-crimson-bright)" />
            Recent Activity
          </h3>
          <Link href="/dashboard/posts" className="btn btn-ghost btn-sm">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="empty-state" style={{ padding: "var(--space-10)" }}>
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-title">No activity yet</p>
          <p className="empty-state-desc">
            Start by setting up your brand identity, then generate your first batch of AI-powered content ideas.
          </p>
          <Link href="/dashboard/brand" className="btn btn-primary" id="setup-brand-cta">
            <Globe size={16} />
            Setup Brand Now
          </Link>
        </div>
      </div>
    </div>
  );
}
