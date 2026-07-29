"use client";
export default function PostsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Post History</h1>
        <p className="page-subtitle">Track all published and scheduled posts</p>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">📤</div>
        <p className="empty-state-title">No posts published yet</p>
        <p className="empty-state-desc">
          Once you approve ideas and connect your social platforms, published posts will appear here.
        </p>
        <a href="/dashboard/approvals" className="btn btn-primary">Go to Approvals</a>
      </div>
    </div>
  );
}
