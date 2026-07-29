/**
 * SoftecAI Creative Studio — Abstract Renderer Interface
 *
 * Architecture Rule: Satori is NOT the architecture. Satori is the V1 renderer.
 * All future renderers (FabricJS, Canvas, Konva, SVG, Canva, Figma) must implement
 * this interface and can be swapped without changing any other module.
 */

import type { CreativeConcept, CreativeBrief } from './types';

// ═══════════════════════════════════════════════════
// Renderer Input / Output — Renderer-Agnostic
// ═══════════════════════════════════════════════════

export interface RenderInput {
  concept: CreativeConcept;
  brief: CreativeBrief;
  platform: string;
  width: number;
  height: number;
}

export interface RenderOutput {
  /** Public URL of the rendered image/file */
  url: string;
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  width: number;
  height: number;
  /** Which renderer produced this */
  renderedBy: string;
}

// ═══════════════════════════════════════════════════
// Abstract Renderer Interface
// ═══════════════════════════════════════════════════

export interface ICreativeRenderer {
  /** Unique identifier for this renderer, e.g. "satori_v1" */
  readonly name: string;
  readonly version: string;
  /** Render a concept and return a URL */
  render(input: RenderInput): Promise<RenderOutput>;
}

// ═══════════════════════════════════════════════════
// Platform Dimensions — Used by all renderers
// ═══════════════════════════════════════════════════

export const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  instagram: { width: 1080, height: 1080 },
  facebook:  { width: 1200, height: 630  },
  linkedin:  { width: 1200, height: 627  },
  pinterest: { width: 1000, height: 1500 },
  youtube:   { width: 1280, height: 720  },
  whatsapp:  { width: 1080, height: 1080 },
};

// ═══════════════════════════════════════════════════
// Renderer Registry — Register and get renderers by name
// Allows plugging in new renderers without changing calling code
// ═══════════════════════════════════════════════════

const rendererRegistry = new Map<string, ICreativeRenderer>();

export function registerRenderer(renderer: ICreativeRenderer): void {
  rendererRegistry.set(renderer.name, renderer);
}

export function getRenderer(name: string): ICreativeRenderer {
  const renderer = rendererRegistry.get(name);
  if (!renderer) {
    throw new Error(
      `Renderer "${name}" not found. Available renderers: ${Array.from(rendererRegistry.keys()).join(', ')}`
    );
  }
  return renderer;
}

export function getDefaultRenderer(): ICreativeRenderer {
  // V1 default is satori_v1
  return getRenderer('satori_v1');
}
