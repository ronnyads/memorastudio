

# Plano: Imagens Demo + Fallback + Rotacao no Hero

## Problema
Todos os sliders usam `/placeholder.svg` (quadrado cinza generico). O `BeforeAfterSlider` tem `bg-gradient-to-br` nos wrappers que cobrem as imagens.

## Mudancas

### 1. Criar 6 SVGs demo em `public/demo/`

Cada SVG 800x600 com filtros SVG para simular fotos reais:

- `before_01.svg`: Tons sepia, riscos (linhas diagonais semi-transparentes), grain via `feTurbulence`, vinheta escura
- `after_01.svg`: Cores naturais, sem riscos, grain sutil, sem vinheta
- `before_02.svg`: Muito escuro, baixo contraste, vinheta pesada
- `after_02.svg`: Exposicao correta, contraste bom, limpo
- `before_03.svg`: Blur gaussiano forte, baixo contraste
- `after_03.svg`: Nitido, contraste adequado

Cada SVG usa `<filter>` com `feTurbulence` (grain), `feGaussianBlur` (desfoque), `feColorMatrix` (sepia/escuro), e overlays de `<rect>`/`<line>` semi-transparentes para danos. Sem texto "Antes/Depois" dentro do SVG. Watermark "DEMO" pequeno no canto inferior direito.

### 2. Atualizar `src/data/landingExamples.ts`

Adicionar exports:

```
export const heroRotationExamples = [
  { id: '01', title: 'Riscos e manchas', category: 'riscos', before: '/demo/before_01.svg', after: '/demo/after_01.svg' },
  { id: '02', title: 'Foto escura', category: 'escura', before: '/demo/before_02.svg', after: '/demo/after_02.svg' },
  { id: '03', title: 'Desfoque', category: 'desfoque', before: '/demo/before_03.svg', after: '/demo/after_03.svg' },
];

export const heroBeforeAfter = heroRotationExamples[0];
```

Atualizar `landingExamples` para usar os paths `/demo/before_XX.svg` e `/demo/after_XX.svg` (6 itens, repetindo os 3 pares).

### 3. Atualizar `BeforeAfterSlider.tsx`

- **Remover** `bg-gradient-to-br from-primary/30 to-primary/10` e `bg-gradient-to-br from-muted to-muted/70` dos wrappers das imagens — esses gradientes cobrem as imagens
- **Fallback elegante**: Se `beforeSrc` ou `afterSrc` estiver vazio/nulo, renderizar um card com gradiente gold sutil, texto "Veja o resultado em segundos" e botao CTA "Comecar agora" linkando para `/pricing`
- Manter labels "Antes"/"Depois" como badges no componente

### 4. Atualizar `HeroSection.tsx`

- Importar `heroRotationExamples` de `landingExamples`
- Adicionar `useState` para index do exemplo atual (0, 1, 2)
- Passar `heroRotationExamples[index].before` e `.after` ao slider
- Adicionar botao "Proximo exemplo" abaixo do slider com icone de seta, que incrementa o index (com wrap)
- Mostrar titulo do exemplo atual abaixo do slider

### 5. Atualizar `BeforeAfterGallery.tsx`

Ja usa `landingExamples` — so precisa que os paths sejam atualizados no passo 2 para funcionar automaticamente.

## Arquivos

**Novos (6):**
- `public/demo/before_01.svg`
- `public/demo/after_01.svg`
- `public/demo/before_02.svg`
- `public/demo/after_02.svg`
- `public/demo/before_03.svg`
- `public/demo/after_03.svg`

**Modificados (3):**
- `src/data/landingExamples.ts`
- `src/components/landing/BeforeAfterSlider.tsx`
- `src/components/landing/HeroSection.tsx`

