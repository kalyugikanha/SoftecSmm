"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  CheckSquare,
  Calendar,
  Send,
  Settings,
  LogOut,
  Bell,
  Rss,
} from "lucide-react";

const navItems = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/brand", icon: Rss, label: "Brand Identity" },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/dashboard/pillars", icon: Layers, label: "Content Pillars" },
      { href: "/dashboard/generate", icon: Sparkles, label: "AI Generator" },
      { href: "/dashboard/approvals", icon: CheckSquare, label: "Approval Queue", badge: true },
      { href: "/dashboard/studio", icon: LayoutDashboard, label: "Post Studio" },
    ],
  },
  {
    section: "Publishing",
    items: [
      { href: "/dashboard/calendar", icon: Calendar, label: "Content Calendar" },
      { href: "/dashboard/posts", icon: Send, label: "Post History" },
    ],
  },
  {
    section: "System",
    items: [
      { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src="/logo.png"
          alt="Softecai"
          style={{ width: 36, height: 36, objectFit: "contain" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Softecai</span>
          <span className="sidebar-logo-sub">SMEAI Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="nav-item-icon">
                    <item.icon size={16} />
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge" id="approval-count">0</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="nav-item btn-ghost"
          style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer" }}
          id="logout-btn"
        >
          <span className="nav-item-icon">
            <LogOut size={16} />
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
