"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "@/lib/auth";

const PLATFORMS = [
  { name: "Instagram", color: "#E1306C", icon: "📸" },
  { name: "Facebook", color: "#1877F2", icon: "👍" },
  { name: "LinkedIn", color: "#0A66C2", icon: "💼" },
  { name: "Pinterest", color: "#E60023", icon: "📌" },
  { name: "YouTube", color: "#FF0000", icon: "▶️" },
  { name: "WhatsApp", color: "#25D366", icon: "💬" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginWithEmail(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait before trying again.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#ffffff",
    }}>

      {/* ===== LEFT PANEL — Dark Branding ===== */}
      <div style={{
        width: "50%",
        background: "linear-gradient(145deg, #0a0a0a 0%, #1a0505 50%, #0d0808 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,0,0,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "-5%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,0,0,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "55%", left: "40%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,30,30,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Top: Logo */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44,
              background: "linear-gradient(135deg, #8B0000, #C41E1E)",
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.3rem", fontWeight: 900, color: "white",
              boxShadow: "0 0 20px rgba(139,0,0,0.5)",
            }}>
              S
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
                softecai
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                SMEAI Platform
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Hero Text */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(139,0,0,0.2)",
            border: "1px solid rgba(196,30,30,0.4)",
            borderRadius: 100,
            padding: "5px 14px",
            marginBottom: 24,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#C41E1E",
              boxShadow: "0 0 8px #C41E1E",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ color: "#E53333", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              AI-Powered Automation
            </span>
          </div>

          <h1 style={{
            color: "white",
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}>
            Automate Your<br />
            <span style={{
              background: "linear-gradient(90deg, #C41E1E, #E53333, #FF6B6B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Social Media
            </span>
            <br />with Gemini AI
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.95rem",
            lineHeight: 1.7,
            maxWidth: 360,
            marginBottom: 36,
          }}>
            From brand vision to published posts — SMEAI handles your entire content workflow across every platform.
          </p>

          {/* Platform Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {PLATFORMS.map((p) => (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 100,
                padding: "5px 12px",
                transition: "all 0.2s",
              }}>
                <span style={{ fontSize: "0.8rem" }}>{p.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", fontWeight: 600 }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Stats */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", gap: 32,
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          {[
            { value: "6+", label: "Platforms" },
            { value: "AI", label: "Gemini Powered" },
            { value: "∞", label: "Content Ideas" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ color: "#C41E1E", fontSize: "1.4rem", fontWeight: 900, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT PANEL — White Login Form ===== */}
      <div style={{
        width: "50%",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 64px",
        position: "relative",
      }}>
        {/* Top right corner label */}
        <div style={{
          position: "absolute", top: 32, right: 40,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ color: "#888", fontSize: "0.82rem" }}>Need help?</span>
          <span style={{
            background: "#f5f5f5", border: "1px solid #e8e8e8",
            borderRadius: 100, padding: "4px 14px",
            color: "#333", fontSize: "0.78rem", fontWeight: 600,
            cursor: "pointer",
          }}>
            Contact Us
          </span>
        </div>

        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Greeting */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              color: "#111",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 10,
            }}>
              Welcome back,<br />
              <span style={{ color: "#8B0000" }}>Admin</span> 👋
            </h2>
            <p style={{ color: "#888", fontSize: "0.92rem", lineHeight: 1.6 }}>
              Sign in to manage Softecai's social media AI platform.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@softecai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  background: "#f8f8f8",
                  border: "1.5px solid #eee",
                  borderRadius: 10,
                  padding: "13px 16px",
                  fontSize: "0.92rem",
                  color: "#111",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8B0000";
                  e.target.style.background = "#fff";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,0,0,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#eee";
                  e.target.style.background = "#f8f8f8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Password
                </label>
                <span style={{ fontSize: "0.78rem", color: "#8B0000", cursor: "pointer", fontWeight: 500 }}>
                  Forgot password?
                </span>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  background: "#f8f8f8",
                  border: "1.5px solid #eee",
                  borderRadius: 10,
                  padding: "13px 16px",
                  fontSize: "0.92rem",
                  color: "#111",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8B0000";
                  e.target.style.background = "#fff";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,0,0,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#eee";
                  e.target.style.background = "#f8f8f8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#fff5f5",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "11px 16px",
                color: "#dc2626",
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#eee" }} />
              <span style={{ color: "#bbb", fontSize: "0.78rem" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#eee" }} />
            </div>

            {/* Submit Button */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#999" : "linear-gradient(135deg, #8B0000, #C41E1E)",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "14px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: loading ? "none" : "0 4px 20px rgba(139,0,0,0.35)",
                transition: "all 0.2s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(139,0,0,0.45)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(139,0,0,0.35)";
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Signing in...
                </>
              ) : (
                "Sign In to Dashboard →"
              )}
            </button>
          </form>

          {/* Footer note */}
          <p style={{
            textAlign: "center",
            marginTop: 32,
            fontSize: "0.78rem",
            color: "#bbb",
            lineHeight: 1.6,
          }}>
            Softecai SMEAI — Internal Platform v1.0
            <br />
            <span style={{ color: "#8B0000" }}>Authorized Personnel Only</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #C41E1E; }
          50% { opacity: 0.6; box-shadow: 0 0 16px #C41E1E; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          div[style*="width: 50%"]:first-child { display: none !important; }
          div[style*="width: 50%"]:last-child { width: 100% !important; padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}
