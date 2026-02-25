export interface LandingExample {
  id: number;
  category: string;
  beforeSrc: string;
  afterSrc: string;
  label: string;
}

export const landingExamples: LandingExample[] = [
  { id: 1, category: "riscos", beforeSrc: "/placeholder.svg", afterSrc: "/placeholder.svg", label: "Foto com riscos profundos" },
  { id: 2, category: "escura", beforeSrc: "/placeholder.svg", afterSrc: "/placeholder.svg", label: "Foto escurecida pelo tempo" },
  { id: 3, category: "desfoque", beforeSrc: "/placeholder.svg", afterSrc: "/placeholder.svg", label: "Foto desfocada restaurada" },
  { id: 4, category: "colorizacao", beforeSrc: "/placeholder.svg", afterSrc: "/placeholder.svg", label: "Colorização de foto P&B" },
  { id: 5, category: "hd4k", beforeSrc: "/placeholder.svg", afterSrc: "/placeholder.svg", label: "Upscale HD para impressão" },
  { id: 6, category: "riscos", beforeSrc: "/placeholder.svg", afterSrc: "/placeholder.svg", label: "Restauração de foto rasgada" },
];

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
