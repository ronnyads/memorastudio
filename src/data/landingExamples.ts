import type { DegradeType } from "@/components/landing/BeforeAfterSlider";

// ── Before/After model (dual-image with CSS fallback) ──────

export interface BeforeAfterExample {
  id: string;
  title: string;
  afterSrc: string;
  beforeSrc?: string;
  degradeType?: DegradeType;
  composite?: boolean;
  category?: string;
}

export const beforeAfterExamples: BeforeAfterExample[] = [
  { id: "01", title: "P&B → Colorizada", afterSrc: "/demo/before-after/real_01.png", composite: true, category: "colorizacao" },
  { id: "02", title: "Foto rasgada → Restaurada", afterSrc: "/demo/before-after/real_02.png", composite: true, category: "riscos" },
  { id: "03", title: "Foto danificada → Restaurada", afterSrc: "/demo/before-after/real_03.png", composite: true, category: "riscos" },
  { id: "04", title: "Família P&B → Colorizada", afterSrc: "/demo/before-after/real_04.png", composite: true, category: "colorizacao" },
  { id: "05", title: "P&B → Colorizada", afterSrc: "/demo/before-after/05_after.jpg", degradeType: "bw", category: "colorizacao" },
  { id: "06", title: "Baixa resolução → HD", afterSrc: "/demo/before-after/06_after.jpg", degradeType: "lowres", category: "hd4k" },
];

export const heroExamples = beforeAfterExamples.slice(0, 3);

// ── Theme examples ─────────────────────────────────────────

export interface ThemeExample {
  id: string;
  title: string;
  afterSrc: string;
  beforeSrc?: string;
}

export const themeExamples: ThemeExample[] = [
  { id: "ice_princess", title: "Princesa do Gelo", afterSrc: "/demo/before-after/theme_ice_princess_after.jpg" },
  { id: "astronauta", title: "Astronauta", afterSrc: "/demo/before-after/theme_astronauta_after.jpg" },
  { id: "safari", title: "Safari", afterSrc: "/demo/before-after/theme_safari_after.jpg" },
  { id: "unicorn", title: "Unicórnio", afterSrc: "/demo/before-after/theme_unicorn_after.jpg" },
];

// ── Categories ─────────────────────────────────────────────

export const exampleCategories = [
  { id: "todos", label: "Todos" },
  { id: "riscos", label: "Riscos" },
  { id: "escura", label: "Foto escura" },
  { id: "desfoque", label: "Desfoque" },
  { id: "colorizacao", label: "Colorização" },
  { id: "hd4k", label: "HD/4K" },
];

// ── Themes (emoji cards) ───────────────────────────────────

export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const themes: Theme[] = [
  { id: "stitch", name: "Stitch", description: "Inspirado no universo tropical e divertido", emoji: "🧵" },
  { id: "frozen", name: "Frozen", description: "Inspirado no reino do gelo e magia", emoji: "❄️" },
  { id: "princesa", name: "Princesa", description: "Inspirado em contos de fadas encantados", emoji: "👑" },
  { id: "safari", name: "Safari", description: "Inspirado na aventura e natureza selvagem", emoji: "🦁" },
  { id: "astronauta", name: "Astronauta", description: "Inspirado na exploração espacial", emoji: "🚀" },
  { id: "futebol", name: "Futebol", description: "Inspirado no universo esportivo", emoji: "⚽" },
  { id: "unicornio", name: "Unicórnio", description: "Inspirado em fantasia e cores mágicas", emoji: "🦄" },
  { id: "carros", name: "Carros", description: "Inspirado no mundo das corridas e velocidade", emoji: "🏎️" },
];
