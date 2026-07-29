/**
 * SoftecAI Creative Studio — Core Types
 * 
 * Design principle: Every type is future-proof and renderer-agnostic.
 * No type should depend on a specific renderer (Satori, Canvas, etc.)
 * or a specific hero asset provider (CSS, DALL-E, Flux, etc.)
 */

// ═══════════════════════════════════════════════════
// NEW — Platform Format Specs
// ═══════════════════════════════════════════════════
/**
 * Visual Taxonomy — 5 specific types the Creative Director chooses from.
 * Types that produce real Gemini images: character_mascot | device_mockup | abstract_hero | icon_infographic
 * Typographic stays as the CSS/Satori fallback (text-first, no AI image needed).
 */
export type PostFormat =
  | 'character_mascot'   // relatable brand personality / mascot
  | 'device_mockup'      // product/feature demo on screen or device
  | 'abstract_hero'      // concept/metaphor visual (sphere, network, object)
  | 'icon_infographic'   // steps/process/comparison with icons
  | 'typographic';       // quote/stat impact, text IS the visual

export interface PlatformFormatSpec {
  aspectRatios: string[];
  supportsCarousel: boolean;
}

export const PLATFORM_FORMATS: Record<string, PlatformFormatSpec> = {
  instagram: { aspectRatios: ["1:1", "4:5", "9:16"], supportsCarousel: true },
  pinterest: { aspectRatios: ["2:3", "1:1", "9:16"], supportsCarousel: true },
  linkedin: { aspectRatios: ["1:1", "1.91:1"], supportsCarousel: true },
  facebook: { aspectRatios: ["1:1", "1.91:1", "4:5"], supportsCarousel: true },
  youtube: { aspectRatios: ["16:9"], supportsCarousel: false },
  whatsapp: { aspectRatios: ["1:1", "9:16"], supportsCarousel: false }
};

// ═══════════════════════════════════════════════════
// MODULE 3 — Creative Brief
// Output of the AI Creative Director
// ═══════════════════════════════════════════════════
export interface CreativeBrief {
  format: PostFormat;
  formatReason?: string;    // AI's explanation of why this visual type was chosen
  aspectRatio: string;
  campaignObjective: string;
  visualStory: string;
  visualConcept: string;    // e.g. "A modern executive looking at holographic real-time data in a sleek glass office"
  antiCliche: string;       // e.g. "Avoid glowing blue brains, 3D gears, or generic tech nodes"
  mood: string;             // e.g. "Premium, Confident, Futuristic"
  composition: string;      // e.g. "Hero center, text left-aligned"
  colourPsychology: string; // e.g. "Dark = trust, Maroon = premium power"
  backgroundStyle: string;  // e.g. "Deep dark gradient with glass overlay"
  designStyle: string;      // e.g. "Apple + Stripe + Linear"
  negativePrompt: string;   // e.g. "No text, no watermarks, no clutter"
}

// ═══════════════════════════════════════════════════
// MODULE 4 — Design Strategy
// Output of the Design Strategy Engine (Gemini design knowledge)
// ═══════════════════════════════════════════════════
export interface DesignStrategy {
  modernTrends: string[];
  layoutInsights: string;
  typographyPattern: string;
  colourBalance: string;
  heroPlacement: string;
  spacingPrinciple: string;
  ctaPattern: string;
}

// ═══════════════════════════════════════════════════
// MODULE 5 — Design DNA
// The unified design specification generated from Brand + Brief + Strategy
// Every concept is generated FROM this DNA — never directly from caption
// ═══════════════════════════════════════════════════
export interface DesignDNA {
  designLanguage: string;  // e.g. "Premium SaaS"
  visualStyle: string;     // e.g. "Minimal Modern"
  heroPlacement: string;   // e.g. "Center"
  typography: string;      // e.g. "Large Bold Display"
  colourUsage: string;     // e.g. "Dark + Maroon Accent"
  spacing: string;         // e.g. "High Whitespace"
  background: string;      // e.g. "Glass Gradient Dark"
  ctaStyle: string;        // e.g. "Rounded Pill Button"
}

// ═══════════════════════════════════════════════════
// MODULE 7 — Hero Asset
// Renderer-agnostic. Provider-agnostic.
// V1: CSS/SVG gradients. Future: DALL-E, Flux, Gemini Image
// ═══════════════════════════════════════════════════
export type HeroAssetType = 'css_gradient' | 'svg_illustration' | 'ai_image';
export type HeroAssetProvider = 'css_v1' | 'gemini_image' | 'openai_dalle' | 'flux' | 'ideogram';

export interface HeroAsset {
  type: HeroAssetType;
  provider: HeroAssetProvider;
  /** For css_gradient: CSS gradient string. For svg: SVG markup. For ai_image: URL */
  data: string;
  /** Optional: width/height hints */
  width?: number;
  height?: number;
}

// ═══════════════════════════════════════════════════
// MODULE 6 — Concept Layout Parameters
// Renderer-agnostic layout spec. The renderer reads this and composes the creative.
// ═══════════════════════════════════════════════════
export type ConceptStyle = 'minimal_saas' | 'bold_marketing' | 'editorial';

export interface ConceptLayout {
  // Colours
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  // Text content
  headlineText: string;
  subheadText: string;
  ctaText: string;
  brandName: string;
  tagline?: string;
  // Layout & composition
  heroStyle: string;           // e.g. "glass_geometric", "bold_diagonal", "editorial_split"
  typographyStyle: string;     // e.g. "clean_minimal", "heavy_display", "editorial_serif"
  compositionStyle: string;    // e.g. "centered_hero", "asymmetric_bold", "magazine_split"
  // Creative direction
  mood: string;
  marketingStrategy: string;
  designRationale: string;
}

// ═══════════════════════════════════════════════════
// MODULE 9 — Design Critic Score (Phase 2 ready)
// Weighted scoring system. Never random AI scores.
// ═══════════════════════════════════════════════════
export interface ScoreBreakdown {
  brandConsistency: number;  // weight: 20%
  typography: number;        // weight: 15%
  contrast: number;          // weight: 15%
  visualHierarchy: number;   // weight: 15%
  whitespace: number;        // weight: 10%
  marketingAppeal: number;   // weight: 10%
  readability: number;       // weight: 10%
  visualBalance: number;     // weight: 5%
  accessibility: number;     // weight: 5%
  overall: number;           // weighted average
}

// ═══════════════════════════════════════════════════
// MODULE 13 — Design Rationale (Phase 2 ready)
// "Why this design?" — builds agency-level confidence
// ═══════════════════════════════════════════════════
export interface ConceptRationale {
  whyThisLayout: string;
  whyThisHero: string;
  whyTheseColors: string;
  whyThisComposition: string;
  performancePrediction: string;
  marketingPsychology: string;
}

// ═══════════════════════════════════════════════════
// CORE — Creative Concept
// Future-proof data model. Supports all future rendering engines.
// ═══════════════════════════════════════════════════
export interface Slide {
  order: number;
  imageUrl: string;
  caption?: string;
}

export interface CreativeConcept {
  id: 'A' | 'B' | 'C';
  name: string;
  style: ConceptStyle;

  // Design specification
  designDNA: DesignDNA;
  heroAsset: HeroAsset;
  layout: ConceptLayout;

  // Rendering
  renderer: string;        // e.g. "satori_v1" — extensible for future renderers
  previewUrl: string;      // The generated image URL for this concept (or first slide)
  slides?: Slide[];        // Used for carousel formats


  // Versioning (supports Creative Project History in Phase 3)
  version: number;
  createdAt: string;

  // Phase 2 additions (placeholders — undefined until Phase 2)
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
  rationale?: ConceptRationale;
}

// ═══════════════════════════════════════════════════
// CORE — Creative Session
// Groups Brief + DNA + 3 Concepts for a single post
// ═══════════════════════════════════════════════════
export interface CreativeSession {
  id: string;
  ideaId: string;
  brandId: string;
  platform: string;
  brief: CreativeBrief;
  strategy: DesignStrategy;
  dna: DesignDNA;
  concepts: {
    A: CreativeConcept;
    B: CreativeConcept;
    C: CreativeConcept;
  };
  selectedConceptId?: 'A' | 'B' | 'C';
  finalImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════
// Gemini API Response Types (internal)
// ═══════════════════════════════════════════════════
export interface GeminiConceptsResponse {
  conceptA: {
    name: string;
    style: ConceptStyle;
    layout: ConceptLayout;
  };
  conceptB: {
    name: string;
    style: ConceptStyle;
    layout: ConceptLayout;
  };
  conceptC: {
    name: string;
    style: ConceptStyle;
    layout: ConceptLayout;
  };
}
