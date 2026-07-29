/**
 * SoftecAI Creative Studio — Module 4+5: Design Strategy Engine + Design DNA Generator
 *
 * Takes: Creative Brief + Brand Data
 * Returns: Design Strategy Insights + Design DNA
 *
 * Gemini acts as a Design Knowledge Engine — uses its training knowledge
 * of modern design trends (SaaS, premium marketing, editorial).
 * NOT a live Pinterest scraper. V2 can add live sources without refactoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DesignStrategy, DesignDNA, CreativeBrief } from '@/lib/creative/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const DESIGN_STRATEGY_PROMPT = `
You are a Senior Design Strategist who has studied thousands of premium marketing creatives.
You have deep knowledge of modern SaaS design (Apple, Stripe, Linear, Vercel, Notion),
premium marketing patterns (Nike, Red Bull, Apple campaigns), and editorial design (Vogue, WSJ, Monocle).

Based on this Creative Brief and Brand, generate:
1. Design Strategy Insights — what design patterns will work best
2. Design DNA — the unified design specification for this creative

CREATIVE BRIEF:
{brief}

BRAND:
Name: {brandName}
Colors: {colors}
Tone: {tone}
Platform: {platform}

Generate EXACTLY this JSON structure:
{
  "strategy": {
    "modernTrends": ["trend1", "trend2", "trend3"],
    "layoutInsights": "What layout approach works best for this campaign and platform",
    "typographyPattern": "Specific typography approach (weights, sizes, hierarchy)",
    "colourBalance": "How to balance the colors (e.g. '80% dark, 15% brand accent, 5% white')",
    "heroPlacement": "Where and how to position the hero element",
    "spacingPrinciple": "How to use whitespace for this campaign",
    "ctaPattern": "Best CTA style for this platform and objective"
  },
  "dna": {
    "designLanguage": "Single design language label (e.g. 'Premium SaaS', 'Bold Performance', 'Luxury Editorial')",
    "visualStyle": "Visual style descriptor (e.g. 'Minimal Modern', 'High Impact', 'Sophisticated')",
    "heroPlacement": "Hero position (e.g. 'Center focal point', 'Left-offset with space', 'Full-bleed')",
    "typography": "Typography approach (e.g. 'Large bold display heading', 'Editorial serif', 'Oversized impact')",
    "colourUsage": "Color application (e.g. 'Deep dark + maroon accent', 'High contrast white + red', 'Muted luxury')",
    "spacing": "Spacing philosophy (e.g. 'Generous whitespace', 'Tight dynamic', 'Editorial breathing room')",
    "background": "Background style (e.g. 'Deep glassmorphic dark', 'Bold solid brand color', 'Textured editorial')",
    "ctaStyle": "CTA appearance (e.g. 'Minimal pill outline', 'Bold block button', 'Understated text link')"
  }
}

Rules:
- The DNA should feel like a genuine creative brief from a top agency
- Avoid generic answers like "use good typography"
- Be specific to the MOOD and PLATFORM of this campaign
- Return ONLY valid JSON. No explanation. No markdown fences.
`.trim();

export async function POST(req: NextRequest) {
  try {
    const { brief, brandName, colors, tone, platform }: {
      brief: CreativeBrief;
      brandName: string;
      colors: string[];
      tone: string;
      platform: string;
    } = await req.json();

    if (!brief || !platform) {
      return NextResponse.json({ error: 'brief and platform are required' }, { status: 400 });
    }

    const prompt = DESIGN_STRATEGY_PROMPT
      .replace('{brief}', JSON.stringify(brief, null, 2))
      .replace('{brandName}', brandName || 'Softecai')
      .replace('{colors}', (colors || []).join(', '))
      .replace('{tone}', tone || 'Professional')
      .replace('{platform}', platform);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleanJson = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const { strategy, dna }: { strategy: DesignStrategy; dna: DesignDNA } = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, strategy, dna });
  } catch (error: any) {
    console.error('[DesignStrategy Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate design strategy' },
      { status: 500 }
    );
  }
}
