

# Plano: Composite Before/After Slider

## Resumo

Substituir o sistema atual de duas imagens separadas por um sistema composite (imagem unica split 50/50). Criar novo componente `CompositeBeforeAfterSlider`, gerar 10 imagens composite via AI, e atualizar hero + galeria + temas.

## Mudancas

### 1. Gerar 10 imagens composite em `public/demo/composites/`

Usar o gerador de imagens (gemini-2.5-flash-image) com os prompts do usuario para criar:

**Restauracao (6):**
- `restore_01_composite.jpg` — riscos/manchas (split 50/50, mesma foto)
- `restore_02_composite.jpg` — foto escura vs corrigida
- `restore_03_composite.jpg` — desfocada vs nitida
- `restore_04_composite.jpg` — rasgada vs reconstruida
- `restore_05_composite.jpg` — P&B vs colorizada
- `restore_06_composite.jpg` — baixa res vs HD

**Temas (4):**
- `theme_ice_princess.jpg` — crianca normal vs princesa do gelo
- `theme_astronauta.jpg` — crianca vs astronauta
- `theme_safari.jpg` — crianca vs explorador safari
- `theme_unicorn.jpg` — crianca vs tema unicornio

Todas 1600x600, split vertical 50/50, mesma pessoa/pose/enquadramento.

### 2. Criar `src/components/landing/CompositeBeforeAfterSlider.tsx`

Componente que recebe `compositeSrc` (imagem unica). Duas camadas CSS com `background-size: 200% 100%`:
- Camada "antes": `background-position: left center`
- Camada "depois": `background-position: right center`
- Handle com pointer events (mouse + touch)
- `aspect-[8/3]` para proporcao consistente
- Input range oculto para acessibilidade
- Fallback elegante com CTA se `compositeSrc` vazio
- Labels "Antes"/"Depois" como badges

### 3. Atualizar `src/data/landingExamples.ts`

Adicionar novos exports mantendo os antigos para compatibilidade:

```typescript
export const heroComposites = [
  { id: "restore_01", title: "Riscos e manchas", compositeSrc: "/demo/composites/restore_01_composite.jpg" },
  { id: "restore_02", title: "Foto escura", compositeSrc: "/demo/composites/restore_02_composite.jpg" },
  { id: "restore_03", title: "Desfoque", compositeSrc: "/demo/composites/restore_03_composite.jpg" },
];

export const beforeAfterComposites = [ /* 6 items */ ];
export const themeComposites = [ /* 4 items */ ];
```

### 4. Atualizar `HeroSection.tsx`

- Importar `heroComposites` em vez de `heroRotationExamples`
- Usar `CompositeBeforeAfterSlider` em vez de `BeforeAfterSlider`
- Manter rotacao com useState + botao "Proximo exemplo"

### 5. Atualizar `BeforeAfterGallery.tsx`

- Importar `beforeAfterComposites`
- Usar `CompositeBeforeAfterSlider` para cada card
- Manter filtros por categoria (adaptar categorias aos novos IDs)

### 6. Atualizar `ThemesGallery.tsx`

- Importar `themeComposites`
- Para cada tema, renderizar `CompositeBeforeAfterSlider` mostrando original vs arte tematica
- Manter CTA "Quero esse tema"

## Arquivos

**Novos (11):**
- `public/demo/composites/restore_01_composite.jpg` a `restore_06_composite.jpg` (6)
- `public/demo/composites/theme_ice_princess.jpg`, `theme_astronauta.jpg`, `theme_safari.jpg`, `theme_unicorn.jpg` (4)
- `src/components/landing/CompositeBeforeAfterSlider.tsx`

**Modificados (4):**
- `src/data/landingExamples.ts`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/BeforeAfterGallery.tsx`
- `src/components/landing/ThemesGallery.tsx`

**Sem mudanca:**
- `BeforeAfterSlider.tsx` — mantido como legado

## Detalhe tecnico do slider

```text
Imagem composite (1600x600):
+------------------+------------------+
|                  |                  |
|   ANTES (left    |   DEPOIS (right  |
|   half of img)   |   half of img)   |
|                  |                  |
+------------------+------------------+

Camada CSS "antes":
  background-size: 200% 100%
  background-position: 0% 50%
  → mostra so a metade esquerda

Camada CSS "depois":
  background-size: 200% 100%
  background-position: 100% 50%
  clip-path: inset(0 0 0 {value}%)
  → mostra so a metade direita, cortada pelo slider
```

