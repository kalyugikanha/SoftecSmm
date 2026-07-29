/**
 * SoftecAI Creative Studio — V1 CSS Hero Asset Provider
 *
 * Provides hero assets using CSS gradients, SVG shapes, and visual metaphors.
 * No external API needed. Swappable with DALL-E / Flux in future without
 * changing any other module — just register a new provider.
 */

import type { IHeroAssetProvider, HeroAssetRequest } from '../heroAssetProvider';
import type { HeroAsset } from '../types';

// ═══════════════════════════════════════════════════
// Hero Style → CSS/SVG Mapping
// Each style generates a visually distinct hero composition
// ═══════════════════════════════════════════════════

function generateHeroCSS(style: string, colors: string[], mood: string): string {
  const primary = colors[0] || '#8B0000';
  const secondary = colors[1] || '#ffffff';

  const heroMap: Record<string, string> = {
    // Minimal SaaS style: Glassmorphic orb with glow
    glass_geometric: `
      linear-gradient(135deg, ${primary}33 0%, transparent 60%),
      linear-gradient(225deg, #0ea5e933 0%, transparent 60%)
    `.trim(),

    // Bold Marketing: High contrast diagonal band
    bold_diagonal: `
      linear-gradient(135deg, ${primary} 0%, ${primary}cc 40%, #000 100%)
    `.trim(),

    // Editorial: Subtle refined gradient
    editorial_split: `
      linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, ${primary}22 100%)
    `.trim(),

    // Fallback
    default: `linear-gradient(135deg, ${primary}44 0%, #00000088 100%)`,
  };

  return heroMap[style] || heroMap.default;
}

function generateHeroSVG(style: string, colors: string[], mood: string): string {
  const primary = colors[0] || '#8B0000';

  if (style === 'glass_geometric') {
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${primary};stop-opacity:0.6"/>
            <stop offset="100%" style="stop-color:${primary};stop-opacity:0"/>
          </radialGradient>
          <radialGradient id="orb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.15"/>
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0"/>
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="280" fill="url(#glow)" opacity="0.6"/>
        <circle cx="300" cy="300" r="180" fill="url(#orb)"/>
        <circle cx="300" cy="300" r="120" fill="none" stroke="${primary}" stroke-width="1" stroke-opacity="0.4"/>
        <circle cx="300" cy="300" r="80" fill="none" stroke="${primary}" stroke-width="1.5" stroke-opacity="0.6"/>
        <circle cx="300" cy="300" r="40" fill="${primary}" opacity="0.8"/>
        <circle cx="300" cy="300" r="20" fill="#ffffff" opacity="0.9"/>
      </svg>
    `).toString('base64')}`;
  }

  if (style === 'bold_diagonal') {
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <polygon points="0,0 600,0 600,400 200,600 0,600" fill="${primary}" opacity="0.95"/>
        <polygon points="600,400 600,600 300,600" fill="${primary}" opacity="0.4"/>
        <line x1="0" y1="200" x2="600" y2="200" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.2"/>
        <line x1="0" y1="400" x2="600" y2="400" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.2"/>
        <circle cx="480" cy="120" r="60" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.3"/>
        <circle cx="480" cy="120" r="30" fill="#ffffff" opacity="0.15"/>
      </svg>
    `).toString('base64')}`;
  }

  // Editorial: Clean minimal lines
  return `data:image/svg+xml;base64,${Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#0f0f0f"/>
      <rect x="40" y="40" width="520" height="1" fill="${primary}" opacity="0.6"/>
      <rect x="40" y="559" width="520" height="1" fill="${primary}" opacity="0.6"/>
      <rect x="300" y="80" width="260" height="440" fill="${primary}" opacity="0.08" rx="4"/>
      <circle cx="120" cy="300" r="80" fill="none" stroke="${primary}" stroke-width="1" stroke-opacity="0.5"/>
    </svg>
  `).toString('base64')}`;
}

// ═══════════════════════════════════════════════════
// V1 CSS Hero Asset Provider Implementation
// ═══════════════════════════════════════════════════

export const cssHeroAssetProvider: IHeroAssetProvider = {
  name: 'css_v1',

  async provide(request: HeroAssetRequest): Promise<HeroAsset> {
    const { style, colors, mood } = request;

    // Map concept style to hero style key
    const heroStyleMap: Record<string, string> = {
      minimal_saas:    'glass_geometric',
      bold_marketing:  'bold_diagonal',
      editorial:       'editorial_split',
    };
    const heroStyle = heroStyleMap[style] || 'glass_geometric';

    return {
      type: 'svg_illustration',
      provider: 'css_v1',
      data: generateHeroSVG(heroStyle, colors, mood),
    };
  },
};
