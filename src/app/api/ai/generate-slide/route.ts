import { NextRequest, NextResponse } from 'next/server';
import { GeminiImageProvider } from '@/lib/creative/heroAssets/geminiImageProvider';
import { cssHeroAssetProvider } from '@/lib/creative/heroAssets/cssProvider';

const geminiImageProvider = new GeminiImageProvider();

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
    const { brief, dna, concept, slideIndex, totalSlides, platform, referenceImageUrl } = await req.json();

    if (!brief || !concept || !slideIndex) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const baseUrl = 'http://localhost:3000';
    const dims = getDimensions(brief.aspectRatio, platform);

    // Modify the hero object based on slide index for variation
    const slideObject = `${brief.heroObject}, slide ${slideIndex} of ${totalSlides} in a sequence showing progress or variations`;

    const heroAssetReq = {
      heroObject: slideObject,
      mood: brief.mood,
      style: concept.style,
      colors: brief.colors || ['#8B0000', '#ffffff'],
      width: dims.width,
      height: dims.height,
      referenceImageUrl
    };

    let heroAsset;
    try {
      heroAsset = await geminiImageProvider.provide(heroAssetReq);
    } catch (error) {
      console.error(`Gemini Image Provider failed for slide ${slideIndex}, falling back to typographic (CSS)`, error);
      heroAsset = await cssHeroAssetProvider.provide(heroAssetReq);
    }

    // Determine slide-specific text
    const isFirst = slideIndex === 1;
    const isLast = slideIndex === totalSlides;
    let headlineText = concept.layout.headlineText;
    let subheadText = concept.layout.subheadText;
    
    if (isFirst) {
      // First slide uses the main concept headline
    } else if (isLast) {
      headlineText = concept.layout.ctaText;
      subheadText = "Link in bio to learn more.";
    } else {
      headlineText = `Key insight ${slideIndex - 1}`;
      subheadText = "Swiping through to discover more details and strategies.";
    }

    // Build the preview URL
    const previewUrl = new URL(`${baseUrl}/api/og`);
    previewUrl.searchParams.set('concept', concept.id);
    previewUrl.searchParams.set('style', concept.style);
    previewUrl.searchParams.set('platform', platform || 'instagram');
    previewUrl.searchParams.set('headline', headlineText);
    previewUrl.searchParams.set('subhead', subheadText);
    previewUrl.searchParams.set('cta', isLast ? 'Click Link' : 'Swipe');
    previewUrl.searchParams.set('brand', concept.layout.brandName || 'SOFTECAI');
    previewUrl.searchParams.set('primaryColor', concept.layout.primaryColor);
    previewUrl.searchParams.set('secondaryColor', concept.layout.secondaryColor);
    previewUrl.searchParams.set('accentColor', concept.layout.accentColor);
    previewUrl.searchParams.set('bgColor', concept.layout.backgroundColor);
    previewUrl.searchParams.set('textPrimary', concept.layout.textPrimaryColor);
    previewUrl.searchParams.set('mood', concept.layout.mood);
    if (heroAsset.type === 'ai_image') {
      previewUrl.searchParams.set('bgImageUrl', heroAsset.data);
    }
    previewUrl.searchParams.set('t', Date.now().toString());

    return NextResponse.json({
      success: true,
      slideUrl: previewUrl.toString(),
      caption: headlineText,
    });
  } catch (error: any) {
    console.error('[GenerateSlide Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate slide' },
      { status: 500 }
    );
  }
}
