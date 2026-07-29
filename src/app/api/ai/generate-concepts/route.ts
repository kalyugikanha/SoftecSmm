/**
 * SoftecAI Creative Studio — Module 6: Generate 3 Creative Concepts
 *
 * Takes: Creative Brief + Design DNA + Brand Data
 * Returns: 3 CreativeConcepts with different strategies, layouts, moods
 *
 * Each concept has a DIFFERENT:
 * - Creative strategy
 * - Layout and composition
 * - Typography approach
 * - Mood and feel
 * - Marketing psychology
 * - Hero object style
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  CreativeBrief,
  DesignDNA,
  CreativeConcept,
  ConceptLayout,
  GeminiConceptsResponse,
} from '@/lib/creative/types';
import { cssHeroAssetProvider } from '@/lib/creative/heroAssets/cssProvider';
import { GeminiImageProvider } from '@/lib/creative/heroAssets/geminiImageProvider';

const geminiImageProvider = new GeminiImageProvider();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CONCEPTS_PROMPT = `
You are an AI Creative Director generating THREE completely different creative directions for a social media post.

These must NOT be three colour variations. Each concept must have a genuinely different:
- Creative strategy and marketing psychology
- Layout structure and composition
- Typography approach
- Hero object / visual metaphor
- Mood and atmosphere
- How the brand message is communicated visually

CREATIVE BRIEF:
{brief}

DESIGN DNA:
{dna}

BRAND:
Name: {brandName}
Colors: {colors}
Tone: {tone}
Platform: {platform}

POST:
Title: {title}

Generate EXACTLY this JSON structure:
{
  "conceptA": {
    "name": "Premium Minimal SaaS",
    "style": "minimal_saas",
    "layout": {
      "primaryColor": "#hexcolor",
      "secondaryColor": "#hexcolor",
      "accentColor": "#hexcolor",
      "backgroundColor": "#0a0a0f or similar very dark",
      "textPrimaryColor": "#ffffff",
      "textSecondaryColor": "#a0aec0 or similar",
      "headlineText": "Short punchy 4-6 word headline (NOT the post title)",
      "subheadText": "One compelling supporting line",
      "ctaText": "2-3 word action",
      "brandName": "{brandName}",
      "heroStyle": "glass_geometric",
      "typographyStyle": "clean_minimal",
      "compositionStyle": "centered_hero",
      "mood": "Premium, Calm, Confident",
      "marketingStrategy": "Build trust through premium aesthetic. Let the quality of design signal the quality of the product.",
      "designRationale": "Apple-style minimal design with single focal point. High whitespace creates premium feel. Glass morphic element adds modern tech feel without complexity."
    }
  },
  "conceptB": {
    "name": "Bold Marketing",
    "style": "bold_marketing",
    "layout": {
      "primaryColor": "#hexcolor (use brand primary, high contrast)",
      "secondaryColor": "#hexcolor",
      "accentColor": "#ffffff or vivid",
      "backgroundColor": "#brand primary or high contrast dark",
      "textPrimaryColor": "#ffffff",
      "textSecondaryColor": "#hexcolor",
      "headlineText": "BOLD IMPACTFUL ALL-CAPS HEADLINE",
      "subheadText": "Sharp punchy supporting statement",
      "ctaText": "STRONG ACTION",
      "brandName": "{brandName}",
      "heroStyle": "bold_diagonal",
      "typographyStyle": "heavy_display",
      "compositionStyle": "asymmetric_bold",
      "mood": "Energetic, Urgent, Bold",
      "marketingStrategy": "Stop the scroll through visual contrast and bold typography. Create urgency. Make the brand colour the hero.",
      "designRationale": "Nike/Red Bull inspired high-contrast layout. Diagonal composition creates motion and energy. Oversized typography is the design element."
    }
  },
  "conceptC": {
    "name": "Editorial Premium",
    "style": "editorial",
    "layout": {
      "primaryColor": "#hexcolor (sophisticated, brand-aligned)",
      "secondaryColor": "#hexcolor (muted luxury)",
      "accentColor": "#hexcolor (brand accent, used sparingly)",
      "backgroundColor": "#1a1a1a or deep neutral",
      "textPrimaryColor": "#f5f5f5",
      "textSecondaryColor": "#888888",
      "headlineText": "Large Editorial Headline That Tells A Story",
      "subheadText": "A more measured, thoughtful supporting line",
      "ctaText": "Discover More",
      "brandName": "{brandName}",
      "heroStyle": "editorial_split",
      "typographyStyle": "editorial_serif",
      "compositionStyle": "magazine_split",
      "mood": "Sophisticated, Storytelling, Luxury",
      "marketingStrategy": "Create aspiration through editorial quality. Position the brand as thought leader. Luxury brands use this to build desire, not just awareness.",
      "designRationale": "WSJ/Vogue-inspired editorial layout. Split composition guides the eye. Large typography as art. Premium brands convert better through aspiration than urgency."
    }
  }
}

Critical Rules:
- All three concepts must look COMPLETELY DIFFERENT from each other
- headlineText should NOT be the post title — it should be a short, punchy, creative headline
- Colors should use brand colors intelligently — not randomly
- Each concept must reflect a genuinely different marketing philosophy
- Return ONLY valid JSON. No explanation. No markdown fences.
`.trim();

const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  instagram: { width: 1080, height: 1080 },
  facebook:  { width: 1200, height: 630  },
  linkedin:  { width: 1200, height: 627  },
  pinterest: { width: 1000, height: 1500 },
  youtube:   { width: 1280, height: 720  },
  whatsapp:  { width: 1080, height: 1080 },
};

function getDimensions(aspectRatio?: string, platform?: string) {
  if (aspectRatio) {
    if (aspectRatio === "1:1") return { width: 1080, height: 1080 };
    if (aspectRatio === "4:5") return { width: 1080, height: 1350 };
    if (aspectRatio === "9:16") return { width: 1080, height: 1920 };
    if (aspectRatio === "16:9") return { width: 1920, height: 1080 };
    if (aspectRatio === "2:3") return { width: 1000, height: 1500 };
    if (aspectRatio === "1.91:1") return { width: 1200, height: 628 };
  }
  return PLATFORM_DIMENSIONS[platform || "instagram"] || PLATFORM_DIMENSIONS.instagram;
}

export async function POST(req: NextRequest) {
  try {
    const { brief, dna, brandName, colors, tone, platform, title, referenceImageUrl }: {
      brief: CreativeBrief;
      dna: DesignDNA;
      brandName: string;
      colors: string[];
      tone: string;
      platform: string;
      title: string;
      referenceImageUrl?: string;
    } = await req.json();

    if (!brief || !dna || !platform) {
      return NextResponse.json({ error: 'brief, dna, and platform are required' }, { status: 400 });
    }

    // Always use localhost for preview URLs — the OG renderer is a local API route.
    // Using NEXT_PUBLIC_APP_URL (localtunnel) breaks image loading in the browser.
    const baseUrl = 'http://localhost:3000';
    const dims = getDimensions(brief.aspectRatio, platform);

    // Step 1: Generate 3 concept layouts via Gemini
    const prompt = CONCEPTS_PROMPT
      .replace(/{brief}/g, JSON.stringify(brief, null, 2))
      .replace(/{dna}/g, JSON.stringify(dna, null, 2))
      .replace(/{brandName}/g, brandName || 'Softecai')
      .replace(/{colors}/g, (colors || []).join(', '))
      .replace(/{tone}/g, tone || 'Professional')
      .replace(/{platform}/g, platform)
      .replace(/{title}/g, title || '');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const geminiResponse: GeminiConceptsResponse = JSON.parse(cleanJson);

    // Step 2: Generate hero assets + build preview URLs for each concept
    const conceptEntries = [
      { key: 'A' as const, data: geminiResponse.conceptA },
      { key: 'B' as const, data: geminiResponse.conceptB },
      { key: 'C' as const, data: geminiResponse.conceptC },
    ];

    const concepts: Record<string, CreativeConcept> = {};
    const debugLog: Record<string, any>[] = [];

    for (const { key, data } of conceptEntries) {
      let heroAsset;
      let actualFormat = brief.format || 'abstract_hero';
      let conceptDebug: Record<string, any> = {
        concept: key,
        format: actualFormat,
        geminiCalled: false,
        geminiSuccess: false,
        geminiError: null,
        finalProvider: null,
      };

      const heroAssetReq = {
        visualConcept: (brief as any).visualConcept || '',
        antiCliche: (brief as any).antiCliche || '',
        mood: brief.mood,
        style: data.style,
        colors: colors || ['#8B0000', '#ffffff'],
        width: dims.width,
        height: dims.height,
        referenceImageUrl: referenceImageUrl,
        headline: data.layout.headlineText,
        subhead: data.layout.subheadText,
        cta: data.layout.ctaText,
        brandName: data.layout.brandName || brandName,
      };

      // Visual types that require a real Gemini-generated image
      const needsRealImage = [
        'character_mascot',
        'device_mockup',
        'abstract_hero',
        'icon_infographic',
        // Legacy format names (in case old ideas still use them)
        'character',
        'infographic',
      ];

      if (needsRealImage.includes(actualFormat)) {
        conceptDebug.geminiCalled = true;
        try {
          heroAsset = await geminiImageProvider.provide(heroAssetReq);
          conceptDebug.geminiSuccess = true;
          conceptDebug.finalProvider = 'gemini_image';
          conceptDebug.imageUrl = heroAsset.data;
        } catch (error: any) {
          conceptDebug.geminiError = error?.message || String(error);
          conceptDebug.finalProvider = 'css_fallback';
          console.error(`[GenerateConcepts] Gemini Image Provider failed for concept ${key}, falling back to typographic (CSS)`, error);
          heroAsset = await cssHeroAssetProvider.provide(heroAssetReq);
          actualFormat = 'typographic'; // downgrade format on failure
        }
      } else {
        // typographic — CSS/Satori only, text IS the visual
        conceptDebug.finalProvider = 'css_typographic';
        heroAsset = await cssHeroAssetProvider.provide(heroAssetReq);
      }

      console.log(`[GenerateConcepts DEBUG] Concept ${key}:`, JSON.stringify(conceptDebug, null, 2));
      debugLog.push(conceptDebug);


      // Build the preview URL
      let previewUrlString = "";
      let rendererType = "satori_v1";

      if (needsRealImage.includes(actualFormat) && heroAsset.type === 'ai_image') {
        // Native Gemini image (fully baked with text)
        previewUrlString = heroAsset.data;
        rendererType = "gemini_native";
      } else {
        // Satori fallback (HTML/CSS)
        const previewUrl = new URL(`${baseUrl}/api/og`);
        previewUrl.searchParams.set('concept', key);
        previewUrl.searchParams.set('style', data.style);
        previewUrl.searchParams.set('platform', platform);
        previewUrl.searchParams.set('headline', data.layout.headlineText);
        previewUrl.searchParams.set('subhead', data.layout.subheadText);
        previewUrl.searchParams.set('cta', data.layout.ctaText);
        previewUrl.searchParams.set('brand', data.layout.brandName || brandName);
        previewUrl.searchParams.set('primaryColor', data.layout.primaryColor);
        previewUrl.searchParams.set('secondaryColor', data.layout.secondaryColor);
        previewUrl.searchParams.set('accentColor', data.layout.accentColor);
        previewUrl.searchParams.set('bgColor', data.layout.backgroundColor);
        previewUrl.searchParams.set('textPrimary', data.layout.textPrimaryColor);
        previewUrl.searchParams.set('mood', data.layout.mood);
        if (heroAsset.type === 'ai_image') {
          previewUrl.searchParams.set('bgImageUrl', heroAsset.data);
        }
        previewUrl.searchParams.set('t', Date.now().toString());
        previewUrlString = previewUrl.toString();
      }

      concepts[key] = {
        id: key,
        name: data.name,
        style: data.style,
        designDNA: dna,
        heroAsset,
        layout: data.layout,
        renderer: rendererType,
        previewUrl: previewUrlString,
        version: 1,
        createdAt: new Date().toISOString(),
      };
      
    }

    return NextResponse.json({
      success: true,
      concepts: {
        A: concepts['A'],
        B: concepts['B'],
        C: concepts['C'],
      },
      debug: debugLog,
    });
  } catch (error: any) {
    console.error('[GenerateConcepts Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate concepts' },
      { status: 500 }
    );
  }
}
