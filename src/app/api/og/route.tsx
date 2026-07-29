/**
 * SoftecAI Creative Studio — Satori V1 Renderer
 *
 * Architecture Rule: This is the V1 renderer. It implements the abstract renderer interface.
 * Future renderers (FabricJS, Canvas, Figma) replace this without changing other modules.
 *
 * 3 Distinct Templates:
 * - minimal_saas:   Apple/Stripe dark glassmorphism, centered hero, clean minimal
 * - bold_marketing: High contrast, oversized bold typography, diagonal energy
 * - editorial:      Magazine split layout, large editorial type, luxury feel
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const W = { instagram: 1080, facebook: 1200, linkedin: 1200, pinterest: 1000, youtube: 1280, whatsapp: 1080 };
const H = { instagram: 1080, facebook: 630,  linkedin: 627,  pinterest: 1500, youtube: 720,  whatsapp: 1080 };

function getSize(platform: string) {
  return {
    w: W[platform as keyof typeof W] || 1080,
    h: H[platform as keyof typeof H] || 1080,
  };
}

// ═══════════════════════════════════
// Template A — Premium Minimal SaaS
// Apple / Stripe / Linear inspired
// ═══════════════════════════════════
function renderMinimalSaaS(params: Record<string, string>, w: number, h: number) {
  const bg = params.bgColor || '#050914';
  const primary = params.primaryColor || '#8B0000';
  const accent = params.accentColor || '#c0392b';
  const textPrimary = params.textPrimary || '#ffffff';
  const headline = params.headline || 'AI That Drives Revenue';
  const subhead = params.subhead || 'Automate. Scale. Dominate.';
  const cta = params.cta || 'Get Started';
  const brand = params.brand || 'SOFTECAI';
  const bgImageUrl = params.bgImageUrl;

  return (
    <div
      style={{
        width: w, height: h,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: bg,
        position: 'relative',
        fontFamily: 'sans-serif',
      }}
    >
      {/* AI Generated Background Image */}
      {bgImageUrl && (
        <img
          src={bgImageUrl}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          alt="bg"
        />
      )}

      {/* Background gradient orbs (hide if image exists) */}
      {!bgImageUrl && (
        <>
          <div style={{
            position: 'absolute', top: '-15%', left: '50%',
            width: Math.floor(w * 0.7) + 'px', height: Math.floor(w * 0.7) + 'px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${primary}44 0%, transparent 70%)`,
            display: 'flex',
            transform: 'translateX(-50%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', right: '-10%',
            width: Math.floor(w * 0.5) + 'px', height: Math.floor(w * 0.5) + 'px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, #0ea5e922 0%, transparent 70%)`,
            display: 'flex',
          }} />
        </>
      )}

      {/* Brand badge — top center */}
      <div style={{
        position: 'absolute', top: Math.floor(h * 0.06) + 'px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: primary, display: 'flex',
        }} />
        <div style={{
          fontSize: Math.floor(w * 0.022) + 'px', fontWeight: 700,
          color: textPrimary, letterSpacing: '0.2em',
          opacity: 0.7, display: 'flex',
        }}>
          {brand.toUpperCase()}
        </div>
      </div>

      {/* Hero geometric ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: Math.floor(w * 0.55) + 'px', height: Math.floor(w * 0.55) + 'px',
        borderRadius: '50%',
        border: `1px solid ${primary}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: 'translate(-50%, -50%)',
      }}>
        <div style={{
          width: Math.floor(w * 0.35) + 'px', height: Math.floor(w * 0.35) + 'px',
          borderRadius: '50%',
          border: `1px solid ${primary}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: Math.floor(w * 0.18) + 'px', height: Math.floor(w * 0.18) + 'px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${primary} 0%, ${primary}88 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 ${Math.floor(w * 0.04)}px ${primary}66`,
          }}>
            <div style={{
              width: Math.floor(w * 0.08) + 'px', height: Math.floor(w * 0.08) + 'px',
              borderRadius: '50%', backgroundColor: '#ffffff',
              opacity: 0.9, display: 'flex',
            }} />
          </div>
        </div>
      </div>

      {/* Main text block — bottom half */}
      <div style={{
        position: 'absolute',
        bottom: Math.floor(h * 0.12) + 'px',
        width: Math.floor(w * 0.82) + 'px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: Math.floor(h * 0.025) + 'px',
      }}>
        <div style={{
          fontSize: Math.floor(w * 0.072) + 'px', fontWeight: 900,
          color: textPrimary, textAlign: 'center',
          lineHeight: 1.1, letterSpacing: '-0.03em',
          display: 'flex',
        }}>
          {headline}
        </div>
        <div style={{
          fontSize: Math.floor(w * 0.028) + 'px', fontWeight: 400,
          color: textPrimary, opacity: 0.55,
          textAlign: 'center', display: 'flex',
        }}>
          {subhead}
        </div>
        {/* CTA */}
        <div style={{
          marginTop: Math.floor(h * 0.02) + 'px',
          padding: `${Math.floor(h * 0.018)}px ${Math.floor(w * 0.06)}px`,
          backgroundColor: primary,
          borderRadius: '100px',
          fontSize: Math.floor(w * 0.022) + 'px', fontWeight: 700,
          color: '#ffffff', letterSpacing: '0.05em',
          display: 'flex',
        }}>
          {cta} →
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// Template B — Bold Marketing
// Nike / Red Bull inspired
// ═══════════════════════════════════
function renderBoldMarketing(params: Record<string, string>, w: number, h: number) {
  const primary = params.primaryColor || '#8B0000';
  const bg = params.bgColor || '#0a0a0a';
  const textPrimary = params.textPrimary || '#ffffff';
  const headline = params.headline || 'DOMINATE YOUR MARKET';
  const subhead = params.subhead || 'AI-powered growth. Zero excuses.';
  const cta = params.cta || 'START NOW';
  const brand = params.brand || 'SOFTECAI';
  const bgImageUrl = params.bgImageUrl;

  return (
    <div style={{
      width: w, height: h,
      display: 'flex', flexDirection: 'column',
      backgroundColor: bg,
      position: 'relative',
      fontFamily: 'sans-serif',
      overflow: 'hidden',
    }}>
      {/* AI Generated Background Image */}
      {bgImageUrl && (
        <img
          src={bgImageUrl}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
          alt="bg"
        />
      )}

      {/* Bold diagonal brand color block */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: Math.floor(h * 0.52) + 'px',
        backgroundColor: primary,
        display: 'flex',
        clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 100%)',
      }} />

      {/* Brand — top left */}
      <div style={{
        position: 'absolute', top: Math.floor(h * 0.06) + 'px', left: Math.floor(w * 0.07) + 'px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          fontSize: Math.floor(w * 0.024) + 'px', fontWeight: 900,
          color: '#ffffff', letterSpacing: '0.25em',
          display: 'flex',
        }}>
          {brand.toUpperCase()}
        </div>
      </div>

      {/* Decorative large number / graphic */}
      <div style={{
        position: 'absolute',
        top: Math.floor(h * 0.04) + 'px', right: Math.floor(w * 0.06) + 'px',
        fontSize: Math.floor(w * 0.28) + 'px', fontWeight: 900,
        color: '#ffffff', opacity: 0.08,
        lineHeight: 1,
        display: 'flex',
      }}>
        AI
      </div>

      {/* Main headline — large, bold, uppercase */}
      <div style={{
        position: 'absolute',
        bottom: Math.floor(h * 0.28) + 'px',
        left: Math.floor(w * 0.07) + 'px',
        width: Math.floor(w * 0.86) + 'px',
        display: 'flex', flexDirection: 'column',
        gap: Math.floor(h * 0.015) + 'px',
      }}>
        <div style={{
          fontSize: Math.floor(w * 0.085) + 'px', fontWeight: 900,
          color: textPrimary, lineHeight: 1.0,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          display: 'flex', flexWrap: 'wrap',
        }}>
          {headline}
        </div>
        <div style={{
          fontSize: Math.floor(w * 0.03) + 'px', fontWeight: 400,
          color: textPrimary, opacity: 0.7,
          display: 'flex',
        }}>
          {subhead}
        </div>
      </div>

      {/* Bold CTA bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '100%', height: Math.floor(h * 0.15) + 'px',
        backgroundColor: primary,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${Math.floor(w * 0.07)}px`,
      }}>
        <div style={{
          fontSize: Math.floor(w * 0.03) + 'px', fontWeight: 900,
          color: '#ffffff', letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: 'flex',
        }}>
          {cta}
        </div>
        <div style={{
          fontSize: Math.floor(w * 0.06) + 'px', color: '#ffffff',
          display: 'flex',
        }}>→</div>
      </div>

      {/* Divider line */}
      <div style={{
        position: 'absolute',
        bottom: Math.floor(h * 0.15) + 'px', left: 0,
        width: '100%', height: '1px',
        backgroundColor: primary, opacity: 0.5,
        display: 'flex',
      }} />
    </div>
  );
}

// ═══════════════════════════════════
// Template C — Editorial Premium
// WSJ / Vogue / Monocle inspired
// ═══════════════════════════════════
function renderEditorial(params: Record<string, string>, w: number, h: number) {
  const primary = params.primaryColor || '#8B0000';
  const bg = params.bgColor || '#111111';
  const textPrimary = params.textPrimary || '#f0ebe3';
  const headline = params.headline || 'The Future of Business Is Already Here';
  const subhead = params.subhead || 'How AI is quietly reshaping revenue for forward-thinking companies';
  const cta = params.cta || 'Read More';
  const brand = params.brand || 'Softecai';
  const bgImageUrl = params.bgImageUrl;

  const isPinterest = h > w;

  return (
    <div style={{
      width: w, height: h,
      display: 'flex', flexDirection: 'column',
      backgroundColor: bg,
      position: 'relative',
      fontFamily: 'Georgia, serif',
    }}>
      {/* AI Generated Background Image */}
      {bgImageUrl && (
        <img
          src={bgImageUrl}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          alt="bg"
        />
      )}

      {/* Top editorial rule line */}
      <div style={{
        position: 'absolute', top: Math.floor(h * 0.06) + 'px', left: Math.floor(w * 0.07) + 'px',
        width: Math.floor(w * 0.86) + 'px', height: '2px',
        backgroundColor: primary,
        display: 'flex',
      }} />
      <div style={{
        position: 'absolute', top: Math.floor(h * 0.06) + 8 + 'px', left: Math.floor(w * 0.07) + 'px',
        width: Math.floor(w * 0.86) + 'px', height: '1px',
        backgroundColor: primary, opacity: 0.3,
        display: 'flex',
      }} />

      {/* Brand — editorial masthead style */}
      <div style={{
        position: 'absolute',
        top: Math.floor(h * 0.09) + 'px', left: Math.floor(w * 0.07) + 'px',
        display: 'flex', alignItems: 'baseline', gap: '12px',
      }}>
        <div style={{
          fontSize: Math.floor(w * 0.028) + 'px', fontWeight: 700,
          color: primary, letterSpacing: '0.15em',
          fontFamily: 'sans-serif', textTransform: 'uppercase',
          display: 'flex',
        }}>
          {brand}
        </div>
        <div style={{
          fontSize: Math.floor(w * 0.016) + 'px',
          color: textPrimary, opacity: 0.4,
          fontFamily: 'sans-serif',
          display: 'flex',
        }}>
          INSIGHTS
        </div>
      </div>

      {/* Large editorial number / decorative */}
      <div style={{
        position: 'absolute',
        right: Math.floor(w * 0.07) + 'px',
        top: Math.floor(h * 0.08) + 'px',
        fontSize: Math.floor(w * 0.016) + 'px',
        color: textPrimary, opacity: 0.3,
        fontFamily: 'sans-serif',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: '4px',
      }}>
        <div style={{ display: 'flex' }}>Vol. 01</div>
        <div style={{ display: 'flex' }}>2025</div>
      </div>

      {/* Visual accent block — right side panel */}
      {!isPinterest && (
        <div style={{
          position: 'absolute',
          right: 0, top: Math.floor(h * 0.2) + 'px',
          width: Math.floor(w * 0.3) + 'px',
          height: Math.floor(h * 0.65) + 'px',
          background: `linear-gradient(180deg, ${primary}22 0%, ${primary}44 50%, ${primary}11 100%)`,
          borderLeft: `1px solid ${primary}33`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '20px',
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            border: `1px solid ${primary}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              backgroundColor: primary, display: 'flex',
            }} />
          </div>
          <div style={{
            width: Math.floor(w * 0.18) + 'px', height: '1px',
            backgroundColor: textPrimary, opacity: 0.2, display: 'flex',
          }} />
          <div style={{
            fontSize: Math.floor(w * 0.018) + 'px',
            color: textPrimary, opacity: 0.4,
            fontFamily: 'sans-serif',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px',
          }}>
            <div style={{ display: 'flex' }}>AI</div>
            <div style={{ display: 'flex' }}>DRIVEN</div>
          </div>
        </div>
      )}

      {/* Main headline — editorial large */}
      <div style={{
        position: 'absolute',
        top: isPinterest ? Math.floor(h * 0.22) + 'px' : Math.floor(h * 0.2) + 'px',
        left: Math.floor(w * 0.07) + 'px',
        width: isPinterest ? Math.floor(w * 0.86) + 'px' : Math.floor(w * 0.56) + 'px',
        display: 'flex', flexDirection: 'column',
        gap: Math.floor(h * 0.03) + 'px',
      }}>
        {/* Category label */}
        <div style={{
          fontSize: Math.floor(w * 0.016) + 'px', fontWeight: 700,
          color: primary, letterSpacing: '0.2em',
          fontFamily: 'sans-serif', textTransform: 'uppercase',
          display: 'flex',
        }}>
          AI Strategy
        </div>

        {/* Main headline */}
        <div style={{
          fontSize: isPinterest ? Math.floor(w * 0.072) + 'px' : Math.floor(w * 0.065) + 'px',
          fontWeight: 700, color: textPrimary,
          lineHeight: 1.15, letterSpacing: '-0.01em',
          display: 'flex', flexWrap: 'wrap',
        }}>
          {headline}
        </div>

        {/* Thin rule */}
        <div style={{
          width: '60px', height: '2px',
          backgroundColor: primary, display: 'flex',
        }} />

        {/* Subhead */}
        <div style={{
          fontSize: Math.floor(w * 0.026) + 'px', fontWeight: 400,
          color: textPrimary, opacity: 0.55,
          lineHeight: 1.6, display: 'flex', flexWrap: 'wrap',
        }}>
          {subhead}
        </div>
      </div>

      {/* Bottom CTA — editorial style */}
      <div style={{
        position: 'absolute',
        bottom: Math.floor(h * 0.07) + 'px',
        left: Math.floor(w * 0.07) + 'px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          fontSize: Math.floor(w * 0.02) + 'px', fontWeight: 700,
          color: primary, letterSpacing: '0.12em',
          fontFamily: 'sans-serif', textTransform: 'uppercase',
          display: 'flex',
        }}>
          {cta}
        </div>
        <div style={{
          width: '40px', height: '1px',
          backgroundColor: primary, display: 'flex',
        }} />
      </div>

      {/* Bottom rule */}
      <div style={{
        position: 'absolute',
        bottom: Math.floor(h * 0.055) + 'px', left: Math.floor(w * 0.07) + 'px',
        width: Math.floor(w * 0.86) + 'px', height: '1px',
        backgroundColor: textPrimary, opacity: 0.1,
        display: 'flex',
      }} />
    </div>
  );
}

// ═══════════════════════════════════
// Route Handler
// ═══════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const style = searchParams.get('style') || 'minimal_saas';
    const platform = searchParams.get('platform') || 'instagram';
    const { w, h } = (() => {
      const s = getSize(platform);
      return { w: s.w, h: s.h };
    })();

    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => { params[key] = value; });

    let template: React.ReactElement;

    if (style === 'bold_marketing') {
      template = renderBoldMarketing(params, w, h);
    } else if (style === 'editorial') {
      template = renderEditorial(params, w, h);
    } else {
      template = renderMinimalSaaS(params, w, h);
    }

    return new ImageResponse(template, { width: w, height: h });
  } catch (e: any) {
    console.error('[OG Route Error]', e);
    return new Response(`Failed to render: ${e.message}`, { status: 500 });
  }
}
