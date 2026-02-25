// ── Composite model (new) ──────────────────────────────────

export interface CompositeExample {
  id: string;
  title: string;
  compositeSrc: string;
  category?: string;
}

export const heroComposites: CompositeExample[] = [
  { id: "restore_01", title: "Riscos e manchas", compositeSrc: "/demo/composites/restore_01_composite.jpg" },
  { id: "restore_02", title: "Foto escura", compositeSrc: "/demo/composites/restore_02_composite.jpg" },
  { id: "restore_03", title: "Desfoque", compositeSrc: "/demo/composites/restore_03_composite.jpg" },
];

export const beforeAfterComposites: CompositeExample[] = [
  { id: "restore_01", title: "Riscos e manchas", compositeSrc: "/demo/composites/restore_01_composite.jpg", category: "riscos" },
  { id: "restore_02", title: "Foto escura", compositeSrc: "/demo/composites/restore_02_composite.jpg", category: "escura" },
  { id: "restore_03", title: "Desfoque", compositeSrc: "/demo/composites/restore_03_composite.jpg", category: "desfoque" },
  { id: "restore_04", title: "Foto rasgada", compositeSrc: "/demo/composites/restore_04_composite.jpg", category: "riscos" },
  { id: "restore_05", title: "P&B → Colorizada", compositeSrc: "/demo/composites/restore_05_composite.jpg", category: "colorizacao" },
  { id: "restore_06", title: "Baixa resolução → HD", compositeSrc: "/demo/composites/restore_06_composite.jpg", category: "hd4k" },
];

export const themeComposites: CompositeExample[] = [
  { id: "ice_princess", title: "Princesa do Gelo", compositeSrc: "/demo/composites/theme_ice_princess.jpg" },
  { id: "astronauta", title: "Astronauta", compositeSrc: "/demo/composites/theme_astronauta.jpg" },
  { id: "safari", title: "Safari", compositeSrc: "/demo/composites/theme_safari.jpg" },
  { id: "unicorn", title: "Unicórnio", compositeSrc: "/demo/composites/theme_unicorn.jpg" },
];

// ── Legacy exports (kept for compat) ───────────────────────

export const exampleCategories = [
  { id: "todos", label: "Todos" },
  { id: "riscos", label: "Riscos" },
  { id: "escura", label: "Foto escura" },
  { id: "desfoque", label: "Desfoque" },
  { id: "colorizacao", label: "Colorização" },
  { id: "hd4k", label: "HD/4K" },
];

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
