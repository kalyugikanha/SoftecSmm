"use client";
export default function NotificationsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Approval alerts from Telegram & WhatsApp</p>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">🔔</div>
        <p className="empty-state-title">No notifications yet</p>
        <p className="empty-state-desc">
          Connect your Telegram bot and WhatsApp to receive approval requests and alerts here.
        </p>
        <a href="/dashboard/settings" className="btn btn-primary">Setup Integrations</a>
      </div>
    </div>
  );
}
