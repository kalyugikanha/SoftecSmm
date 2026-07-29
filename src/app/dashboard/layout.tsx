"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { Bell, Search } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setUserEmail(user.email || "Admin");
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-base)",
        }}
      >
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <p className="topbar-greeting">
              {greeting}, <span>{userEmail.split("@")[0]}</span> 👋
            </p>
          </div>
          <div className="topbar-right">
            {/* Search */}
            <div className="search-bar" style={{ width: 240 }}>
              <Search size={14} color="var(--text-muted)" />
              <input placeholder="Search posts, pillars..." id="global-search" />
            </div>

            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button
                className="btn btn-ghost btn-icon"
                id="notification-bell"
                aria-label="Notifications"
              >
                <Bell size={16} />
              </button>
              <div className="notif-dot" />
            </div>

            {/* Avatar */}
            <div className="avatar" id="user-avatar" title={userEmail}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}
