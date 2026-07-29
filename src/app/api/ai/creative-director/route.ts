/**
 * SoftecAI Creative Studio — Module 3: AI Creative Director
 *
 * Accepts brand data + post caption → Returns a professional Creative Brief.
 * Does NOT generate images. Does NOT generate concepts.
 * Thinks like a creative agency Creative Director.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase/admin';
import { CreativeBrief, PLATFORM_FORMATS } from '@/lib/creative/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CREATIVE_DIRECTOR_PROMPT = `
You are the Creative Director at a world-class marketing agency (think Wieden+Kennedy, R/GA, Huge).

You have been briefed on a social media post. Your job is to create a professional Creative Brief — 
NOT to generate an image prompt. NOT to describe what the post looks like.

Your brief tells the design team:
- What story to tell
- What SPECIFIC visual type to use (choose from the taxonomy below)
- What hero object to feature
- What mood and atmosphere to create
- What design style to follow

BRAND CONTEXT:
Brand Name: {brandName}
Industry: {industry}
Tone of Voice: {tone}
Target Audience: {targetAudience}
Brand Colors: {colors}
Brand Personality: {personality}

POST CONTEXT:
Platform: {platform}
Valid Platform Specs: {platformSpecs}
Post Title: {title}
Caption Hook: {hook}
Caption Body: {body}
CTA: {cta}

VISUAL TYPE TAXONOMY — Choose EXACTLY ONE based on the idea's content:

1. "character_mascot" — Use when: the post is about a human experience, transformation, before/after, emotional story, or brand personality. Example: "stressed entrepreneur discovers AI efficiency" → mascot or character showing the journey.

2. "device_mockup" — Use when: the post demonstrates a product, feature, software, dashboard, or app. Example: "introducing our AI analytics dashboard" → screen mockup showing the interface in a premium setting.

3. "abstract_hero" — Use when: the concept is about a big idea, metaphor, technology, growth, or anything that needs a visual symbol rather than a literal representation. Example: "AI-powered business transformation" → glowing neural network sphere or data constellation. This was the style used yesterday.

4. "icon_infographic" — Use when: the post is a list, steps, comparison, stats, or process. Example: "5 ways AI saves you time" → clean icon-based layout with numbered steps. Good for LinkedIn educational content.

5. "typographic" — Use when: the post is a powerful quote, a single key stat, a bold statement, or when text IS the visual impact. Example: "Your competitors are already using AI." → Large type, minimal design, text carries the weight. This format does NOT generate an AI image — it uses premium typography only.

REASONING RULES:
- "abstract_hero" is the right default for B2B technology concepts, AI capabilities, growth metrics, and transformation stories.
- "character_mascot" requires a clear human narrative or emotional journey.
- "device_mockup" only makes sense if we actually have a product/UI/Dashboard to show.
- "icon_infographic" only works if there are genuinely 3-6 distinct steps, pillars, or items to visualize.
- "typographic" is a deliberate choice for high-impact text — not a fallback. Reserve it for ideas where the copy itself is the strongest asset.
- DO NOT default to the same format every time. Read the idea and reason explicitly about which type fits THIS specific content.

Create a Creative Brief as a JSON object with EXACTLY these fields:
{
  "format": "One of: character_mascot | device_mockup | abstract_hero | icon_infographic | typographic",
  "formatReason": "1-2 sentences explaining WHY this visual type fits this specific idea",
  "aspectRatio": "Choose EXACTLY ONE from the Valid Platform Specs above (e.g., '1:1', '9:16', '4:5', '2:3')",
  "campaignObjective": "Single clear marketing objective for this creative",
  "visualStory": "The story this creative tells visually (2-3 sentences)",
  "visualConcept": "A highly descriptive, realistic, and premium visual concept (e.g., 'A modern executive reviewing real-time data on a holographic glass display in a dimly lit boardroom'). Focus on human elements, premium environments, and relevant business context.",
  "antiCliche": "What to avoid to keep it premium (e.g., 'Avoid glowing blue brains, cheesy 3D gears, or generic tech nodes')",
  "mood": "2-3 mood words (e.g. 'Premium, Confident, Realistic')",
  "composition": "How elements are arranged (e.g. 'Hero center, text left-aligned')",
  "colourPsychology": "Why these colors work for this campaign",
  "backgroundStyle": "Background description (e.g. 'Deep dark navy gradient with subtle glassmorphic overlay')",
  "designStyle": "Design language (e.g. 'Apple minimalism + Stripe gradients + Linear precision')",
  "negativePrompt": "What to AVOID in this creative"
}

Rules:
- Be SPECIFIC and realistic. Think agency-level photography or premium illustration.
- Think about what will STOP THE SCROLL on {platform}
- Choose an aspect ratio that is STRICTLY in the 'Valid Platform Specs' list.
- DO NOT use cheap sci-fi metaphors (like 3D glowing spheres or node networks). Anchor the concept in reality or premium branding.
- Return ONLY valid JSON. No explanation. No markdown code fences.
`.trim();


export async function POST(req: NextRequest) {
  try {
    const { ideaId, brandId } = await req.json();

    if (!ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 });
    }

    // Fetch the post idea
    const ideaDoc = await adminDb.collection('ideas').doc(ideaId).get();
    if (!ideaDoc.exists) {
      return NextResponse.json({ error: 'Post idea not found' }, { status: 404 });
    }
    const idea = ideaDoc.data()!;

    // Fetch brand data
    const brandQuery = await adminDb.collection('brands')
      .where('brandKey', '==', 'softecai')
      .limit(1)
      .get();
    
    const brand = brandQuery.empty ? null : brandQuery.docs[0].data();

    // Build platform specs string
    const platName = idea.platform || 'instagram';
    const spec = PLATFORM_FORMATS[platName] || PLATFORM_FORMATS['instagram'];
    const specStr = `Supported aspect ratios: ${spec.aspectRatios.join(', ')}. Supports carousels: ${spec.supportsCarousel ? 'Yes' : 'No'}.`;

    // Build the prompt
    const prompt = CREATIVE_DIRECTOR_PROMPT
      .replace('{brandName}', brand?.name || 'Softecai')
      .replace('{industry}', brand?.industry || 'Technology / AI')
      .replace('{tone}', brand?.tone || 'Professional')
      .replace('{targetAudience}', brand?.targetAudience || 'SMEs and enterprises')
      .replace('{colors}', (brand?.colors || ['#8B0000', '#ffffff']).join(', '))
      .replace('{personality}', brand?.personality || 'Premium, Innovative, Trustworthy')
      .replace('{platform}', platName)
      .replace('{platformSpecs}', specStr)
      .replace('{title}', idea.title || '')
      .replace('{hook}', idea.hook || '')
      .replace('{body}', idea.body || '')
      .replace('{cta}', idea.cta || '');

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON — strip any accidental markdown fences
    const cleanJson = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const brief: CreativeBrief = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, brief });
  } catch (error: any) {
    console.error('[CreativeDirector Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate creative brief' },
      { status: 500 }
    );
  }
}
