# DESIGN.md — johndegraft.app

Brand anchor for all pages. Author and commit before touching any component.

---

## 1. Identity

**Site:** johndegraft.app  
**Owner:** John de Graft-Johnson  
**Domain:** Production AI systems — healthcare, government, enterprise  
**Voice:** Expert, precise, direct. No hype. No jargon without explanation. Speaks to technical peers and informed decision-makers.

---

## 2. Color Tokens

```css
/* Backgrounds */
--color-bg:           #05050f;          /* page background */
--color-surface:      rgba(255,255,255,0.06);  /* card fill */
--color-surface-mid:  rgba(255,255,255,0.10);  /* elevated card / hover */

/* Borders */
--color-border:       rgba(255,255,255,0.10);
--color-border-focus: rgba(255,255,255,0.25);

/* Text */
--color-text:         #f1f5f9;
--color-muted:        rgba(255,255,255,0.50);
--color-subtle:       rgba(255,255,255,0.30);

/* Accent — Blue (primary across site, CTAs, links) */
--color-accent:       #60a5fa;          /* blue-400 */

/* Accent — Teal (clinical pages: RAG, audit) */
--color-clinical:     #14b8a6;          /* teal-500 — NHS/clinical read */

/* Signal colors */
--color-review:       #f59e0b;          /* amber — mandatory human-review flag */
--color-safe:         #22c55e;          /* green — verified / low risk */
--color-warn:         #f59e0b;          /* amber — caution */
--color-danger:       #ef4444;          /* red — high risk */

/* Project domain accents (portfolio page) */
--color-healthcare:   #60a5fa;          /* blue */
--color-govai:        #a78bfa;          /* violet */
--color-responsible:  #14b8a6;          /* teal */
--color-agentic:      #f59e0b;          /* amber */
```

---

## 3. Typography

```css
/* Display — DM Serif Display for clinical/institutional pages (RAG, audit) */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');

/* Body — system-ui everywhere (no FOUT, fast) */
--font-display: 'DM Serif Display', Georgia, serif;
--font-body:    system-ui, -apple-system, sans-serif;

/* Type scale */
--text-xs:   0.75rem;     /* 12px — labels, badges */
--text-sm:   0.875rem;    /* 14px — captions, stack tags */
--text-base: 1rem;        /* 16px — body */
--text-lg:   1.125rem;    /* 18px — lead paragraph */
--text-xl:   1.25rem;     /* 20px — card headings */
--text-2xl:  1.5rem;      /* 24px — section headings */
--text-hero: clamp(2rem, 5vw, 3.25rem); /* hero H1 */

/* Weight conventions */
/* Display headings: 400 (DM Serif is expressive at normal weight) */
/* UI headings, labels: 600 semibold */
/* Body: 400 */
/* Badges, tags: 500-600 */

/* Letter spacing */
/* Labels/eyebrows: 0.10–0.12em uppercase */
/* Hero H1: -0.01em */
/* Body: 0 */
```

---

## 4. Spacing & Layout

```
Base unit: 4px (Tailwind default)
Container max: 900px for reading content, 1100px for data-heavy pages
Section padding: 80px desktop, 48px mobile
Card padding: 28px standard, 20px compact

Gutters: 24px (gap-6)
Grid: 12-column implied; most pages use 2-col or 3-col card grids
```

---

## 5. Border Radius & Elevation

```css
--radius-sm:   6px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-xl:   24px;   /* hero card, large surfaces */

/* Glass card shadow — enhanced with inner highlight */
--shadow-glass: 0 1px 0 0 rgba(255,255,255,0.10) inset,
                0 8px 40px rgba(0,0,0,0.60);

/* Gradient border trick — wrap card in a ::before pseudo or use outline div */
/* border: 1px solid transparent + background-clip: padding-box */
/* then overlay: background: linear-gradient(135deg, rgba(20,184,166,0.4), rgba(255,255,255,0.06)) border-box */

/* Review flag glow */
--shadow-review: 0 0 20px rgba(245,158,11,0.25);

/* Clinical accent glow (hero, CTA) */
--shadow-clinical: 0 0 40px rgba(20,184,166,0.20);

/* Ambient background glow orbs (clinical pages) */
/* Teal orb: radial-gradient(ellipse 600px 400px at 20% 30%, rgba(20,184,166,0.12) 0%, transparent 70%) */
/* Blue orb: radial-gradient(ellipse 400px 300px at 80% 70%, rgba(96,165,250,0.08) 0%, transparent 70%) */
```

---

## 6. Components

**LiquidGlassCard** — `backdrop-filter: blur(20px)`, `--color-surface` fill, `--color-border` border. Used for: hero content, project cards, feature highlights. NOT for light backgrounds.

**Badge pill** — `text-xs font-semibold tracking-wider uppercase px-2 py-1 rounded-full`. Background: `${color}18`, border: `${color}30`.

**Human-review flag** — amber `--color-review` background tint, amber border, amber text. Must include a shield or warning icon. Never use green for unreviewed content.

**Citation card** — compact `--color-surface` card with a left accent border in `--color-clinical`. Contains: NICE guideline reference, excerpt, SNOMED CT code if applicable.

**Status pill** — `Live / Pilot / In Development / Open Source` — same pattern as portfolio cards.

---

## 7. Motion

```css
/* Easing */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* snappy settle */
--ease-linear: linear;

/* Durations */
--duration-fast:   150ms;
--duration-base:   300ms;
--duration-slow:   500ms;

/* On-brand: fade-and-rise (translateY 12px → 0, opacity 0 → 1) */
/* Off-brand: bouncy springs, rotation, letter-by-letter reveals */
/* Clinical pages: prefer no motion or single fade-in — prefers-reduced-motion must be respected */
```

---

## 8. Voice & Content

- Sentence case everywhere (not Title Case for headings)
- Numbers: spell out under ten, numeral above
- Avoid: "cutting-edge", "state-of-the-art", "powerful", "seamlessly", "leverage" (verb)
- Preferred: "built on", "trained on", "answers", "surfaces", "flags", "generates"
- Technical terms should be defined inline or on first use
- Every claim about the RAG system must be qualified: cite the standard, name the framework

---

## 9. Rationale & Anti-Patterns

**Why teal for clinical pages:** NHS digital brand leans teal/blue-green. `#14b8a6` is close enough to feel institutional without copying NHS identity directly. Blue (`#60a5fa`) reads as "tech startup" — fine for CTAs but not as the dominant clinical accent.

**Why DM Serif Display on H1:** Serif conveys authority and permanence — qualities a clinical decision support tool must project. System-ui headings read as developer tool. One display-weight serif heading is enough; body stays in system-ui.

**Why amber for the review flag:** Safety-critical UIs use amber/yellow for "requires human attention" — it's a universal signal that pre-dates software. Green on a partially-validated response would be dangerous UX.

**Do NOT:**
- Use purple/violet as the primary clinical accent (reads as consumer/entertainment)
- Animate the human-review flag (motion on a safety warning is distracting)
- Put the review flag in green at any stage
- Use the 3D particle network on clinical pages (too playful for the audience)
- Stack more than two LiquidGlassCard levels (blur-on-blur breaks the effect)
- Write long body paragraphs without a subheading every 3–4 lines on clinical content
