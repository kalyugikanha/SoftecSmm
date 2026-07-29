"use client";
export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage API integrations, platforms, and preferences</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {[
          { title: "🤖 Telegram Bot", desc: "Connect Telegram for approval notifications", status: "Not configured" },
          { title: "💬 WhatsApp Business", desc: "Connect WhatsApp for approval alerts", status: "Not configured" },
          { title: "📘 Meta (Facebook + Instagram)", desc: "Connect Facebook & Instagram for auto-publishing", status: "Not configured" },
          { title: "📌 Pinterest", desc: "Connect Pinterest for pin scheduling", status: "Not configured" },
          { title: "🤖 Gemini AI", desc: "Google Gemini for content generation", status: "Configured via .env" },
          { title: "🔥 Firebase", desc: "Database and authentication", status: "Connected" },
        ].map((item) => (
          <div key={item.title} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h4>{item.title}</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>{item.desc}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{
                fontSize: "0.78rem",
                color: item.status.includes("Connected") || item.status.includes("Configured")
                  ? "var(--status-success)"
                  : "var(--text-muted)"
              }}>
                {item.status}
              </span>
              <button className="btn btn-secondary btn-sm">Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
