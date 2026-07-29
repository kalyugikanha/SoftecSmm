/**
 * SoftecAI Creative Studio — Abstract Hero Asset Provider Interface
 *
 * Architecture Rule: V1 uses CSS gradients & SVG. Future versions plug in
 * Gemini Image, DALL-E 3, Flux, Ideogram — without changing any other module.
 */

import type { HeroAsset } from './types';

// ═══════════════════════════════════════════════════
// Hero Asset Request — Provider-Agnostic
// ═══════════════════════════════════════════════════

export interface HeroAssetRequest {
  /** High-level description of the scene, e.g. "A modern executive looking at holographic real-time data in a sleek glass office" */
  visualConcept: string;
  /** What to avoid, e.g. "Avoid glowing blue brains, 3D gears, or generic tech nodes" */
  antiCliche: string;
  /** e.g. "Premium, Confident, Futuristic" */
  mood: string;
  /** e.g. "minimal_saas", "bold_marketing", "editorial" */
  style: string;
  /** Brand colors to incorporate */
  colors: string[];
  /** Target width in pixels */
  width: number;
  /** Target height in pixels */
  height: number;
  /** Optional reference image URL (e.g. character to maintain) */
  referenceImageUrl?: string;
  /** Copy fields for native AI image generation */
  headline?: string;
  subhead?: string;
  cta?: string;
  brandName?: string;
}

// ═══════════════════════════════════════════════════
// Abstract Hero Asset Provider Interface
// ═══════════════════════════════════════════════════

export interface IHeroAssetProvider {
  /** Unique identifier, e.g. "css_v1", "openai_dalle", "flux" */
  readonly name: string;
  /** Provide a hero asset for the given request */
  provide(request: HeroAssetRequest): Promise<HeroAsset>;
}

// ═══════════════════════════════════════════════════
// Provider Registry
// ═══════════════════════════════════════════════════

const providerRegistry = new Map<string, IHeroAssetProvider>();

export function registerHeroAssetProvider(provider: IHeroAssetProvider): void {
  providerRegistry.set(provider.name, provider);
}

export function getHeroAssetProvider(name: string): IHeroAssetProvider {
  const provider = providerRegistry.get(name);
  if (!provider) {
    throw new Error(
      `Hero Asset Provider "${name}" not found. Available: ${Array.from(providerRegistry.keys()).join(', ')}`
    );
  }
  return provider;
}

export function getDefaultHeroAssetProvider(): IHeroAssetProvider {
  // V1 default is css_v1
  return getHeroAssetProvider('css_v1');
}

// ═══════════════════════════════════════════════════
// Lazy Provider Registration
// ═══════════════════════════════════════════════════
import { GeminiImageProvider } from "./heroAssets/geminiImageProvider";
registerHeroAssetProvider(new GeminiImageProvider());
