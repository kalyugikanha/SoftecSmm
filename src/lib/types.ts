// ===== BRAND =====
import { PostFormat, Slide } from "./creative/types";

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  targetAudience: string;
  tone: string; // e.g. "professional", "casual", "inspirational"
  colors: string[];
  platforms: Platform[];
  logoUrl?: string;
  websiteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== CONTENT PILLAR =====
export interface ContentPillar {
  id: string;
  brandId: string;
  name: string;
  description: string;
  emoji: string;
  percentage: number; // % of content for this pillar
  examples: string[];
  createdAt: Date;
}

// ===== POST IDEA =====
export interface PostIdea {
  id: string;
  brandId: string;
  pillarId: string;
  platform: Platform;
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  suggestedImagePrompt?: string;
  status: IdeaStatus;
  format?: PostFormat;
  slides?: Slide[];
  referenceImageUrl?: string;
  scheduledDate?: Date;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== APPROVED POST =====
export interface ApprovedPost {
  id: string;
  ideaId: string;
  brandId: string;
  platform: Platform;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  imagePrompt?: string;
  format?: PostFormat;
  slides?: Slide[];
  scheduledAt: Date;
  publishedAt?: Date;
  status: PostStatus;
  platformPostId?: string; // ID from Meta/Pinterest etc after publishing
  createdAt: Date;
}

// ===== CALENDAR EVENT =====
export interface CalendarEvent {
  id: string;
  postId: string;
  brandId: string;
  platform: Platform;
  title: string;
  scheduledAt: Date;
  status: PostStatus;
  color: string;
}

// ===== ENUMS =====
export type Platform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "pinterest"
  | "youtube"
  | "whatsapp";

export type IdeaStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "published";

export type PostStatus =
  | "pending"
  | "approved"
  | "scheduled"
  | "published"
  | "failed";

// ===== NOTIFICATION =====
export interface Notification {
  id: string;
  type: "idea_ready" | "post_published" | "approval_needed" | "error";
  title: string;
  message: string;
  channel: "telegram" | "whatsapp" | "in_app";
  read: boolean;
  createdAt: Date;
}
