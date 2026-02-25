

# Plano: LP com Antes/Depois Real (mesma foto) + Fallback CSS

## Problema

As imagens composite geradas por IA continuam mostrando pessoas/poses diferentes nos dois lados. Isso quebra a credibilidade da LP. A solucao correta e abandonar o modelo composite e usar um sistema dual-image com fallback CSS: quando nao houver "before" real, o componente degrada o "after" com filtros CSS para simular foto antiga.

## Abordagem

Trocar de composite (1 imagem split) para dual-image (before + after separados). O slider volta a usar duas `<img>` sobrepostas. Se `beforeSrc` estiver vazio, o slider renderiza o `afterSrc` duas vezes — no lado "Antes" aplica filtros CSS (grayscale, sepia, contrast baixo, blur leve, noise overlay via pseudo-elemento) para simular degradacao. Isso GARANTE que e sempre a mesma foto.

## Mudancas

### 1. Gerar 6 imagens "after" de alta qualidade

Gerar via AI apenas o "depois" (foto restaurada bonita) em `public/demo/before-after/`. Sem tentar gerar splits. Cada imagem e um retrato limpo, nitido, colorido.

- `01_after.jpg` — Retrato de casal, limpo e nitido
- `02_after.jpg` — Familia (pais + criancas), cores naturais
- `03_after.jpg` — Mae e filho, colorizado vibrante
- `04_after.jpg` — Retrato individual, limpo
- `05_after.jpg` — Grupo familiar, detalhado
- `06_after.jpg` — Retrato HD nitido

Sem gerar "before" — o CSS faz isso automaticamente.

### 2. Gerar 4 imagens "after" para temas

- `theme_ice_princess_after.jpg` — Crianca como princesa do gelo
- `theme_astronauta_after.jpg` — Crianca como astronauta
- `theme_safari_after.jpg` — Crianca como explorador safari
- `theme_unicorn_after.jpg` — Crianca tema unicornio

O "before" (original) sera a mesma imagem sem os efeitos tematicos — tambem gerada via AI, ou usada com fallback CSS (versao "normal" da crianca).

### 3. Reescrever `BeforeAfterSlider.tsx` com fallback CSS

Novo componente unificado que aceita:

```typescript
interface Props {
  afterSrc: string;
  beforeSrc?: string; // opcional — se vazio, degrada o after
  beforeLabel?: string;
  afterLabel?: string;
  degradeType?: "scratches" | "dark" | "blur" | "torn" | "bw" | "lowres";
  className?: string;
}
```

Quando `beforeSrc` esta vazio, renderiza `afterSrc` no lado "Antes" com filtros CSS:

```text
Filtros por tipo:
- scratches: grayscale(30%) sepia(40%) contrast(0.8) + noise overlay SVG
- dark: brightness(0.3) contrast(1.3)
- blur: blur(2px) grayscale(20%)
- torn: grayscale(50%) sepia(30%) + crack overlay
- bw: grayscale(100%) contrast(0.9) sepia(15%)
- lowres: blur(3px) + pixelate via image-rendering
```

Noise overlay: pseudo-elemento `::after` com `background-image: url(noise SVG inline)` + `mix-blend-mode: multiply`.

### 4. Atualizar `landingExamples.ts`

```typescript
export interface BeforeAfterExample {
  id: string;
  title: string;
  afterSrc: string;
  beforeSrc?: string; // opcional
  degradeType: "scratches" | "dark" | "blur" | "torn" | "bw" | "lowres";
  category?: string;
}

export const beforeAfterExamples: BeforeAfterExample[] = [
  { id: "01", title: "Riscos e manchas", afterSrc: "/demo/before-after/01_after.jpg", degradeType: "scratches", category: "riscos" },
  { id: "02", title: "Foto escura", afterSrc: "/demo/before-after/02_after.jpg", degradeType: "dark", category: "escura" },
  { id: "03", title: "Desfoque", afterSrc: "/demo/before-after/03_after.jpg", degradeType: "blur", category: "desfoque" },
  { id: "04", title: "Foto rasgada", afterSrc: "/demo/before-after/04_after.jpg", degradeType: "torn", category: "riscos" },
  { id: "05", title: "P&B → Colorizada", afterSrc: "/demo/before-after/05_after.jpg", degradeType: "bw", category: "colorizacao" },
  { id: "06", title: "Baixa resolução → HD", afterSrc: "/demo/before-after/06_after.jpg", degradeType: "lowres", category: "hd4k" },
];

export const heroExamples = beforeAfterExamples.slice(0, 3);
```

### 5. Atualizar `HeroSection.tsx`

- Importar `heroExamples` e o novo `BeforeAfterSlider`
- Passar `afterSrc` + `degradeType` para cada exemplo
- Manter botao "Proximo exemplo"

### 6. Atualizar `BeforeAfterGallery.tsx`

- Importar `beforeAfterExamples`
- Usar novo `BeforeAfterSlider` com `afterSrc` + `degradeType`
- Manter filtros por categoria

### 7. Atualizar `ThemesGallery.tsx`

- Para temas, usar o slider com `beforeSrc` (foto original da crianca) e `afterSrc` (versao tematica)
- Ambas geradas via AI mas como imagens separadas

### 8. Remover `CompositeBeforeAfterSlider.tsx`

Nao sera mais usado. Substituido pelo novo `BeforeAfterSlider`.

## Detalhe tecnico do fallback CSS

```text
┌─────────────────────────────────────────┐
│  afterSrc (imagem unica)                │
│                                         │
│  Lado ANTES:              Lado DEPOIS:  │
│  <img src={afterSrc}      <img src={afterSrc}
│   style={degradeFilters}   (sem filtros)
│   + noise overlay />       />           │
│                                         │
│  clip-path: left portion  clip-path: right
└─────────────────────────────────────────┘

Resultado: SEMPRE a mesma foto nos dois lados.
O "antes" parece danificado via CSS puro.
```

## Arquivos

**Novos (7):**
- `public/demo/before-after/01_after.jpg` a `06_after.jpg` (6 imagens)
- Noise SVG inline (dentro do componente, sem arquivo extra)

**Modificados (5):**
- `src/components/landing/BeforeAfterSlider.tsx` — reescrito com fallback CSS
- `src/data/landingExamples.ts` — novo modelo dual-image
- `src/components/landing/HeroSection.tsx` — usar novo slider
- `src/components/landing/BeforeAfterGallery.tsx` — usar novo slider
- `src/components/landing/ThemesGallery.tsx` — usar novo slider com pares separados

**Removidos (1):**
- `src/components/landing/CompositeBeforeAfterSlider.tsx`

**Imagens composite antigas** em `public/demo/composites/` podem ser removidas depois.

