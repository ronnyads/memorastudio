

# Plano de Upgrade: Levres Studio → Memora Studio

## Resumo

O projeto atual tem uma base sólida (landing, pricing, checkout mock, upload, status, result, admin) mas precisa de upgrades significativos na landing page (antes/depois slider, galeria de temas) e renomeação para "Memora Studio". O backend (Supabase, Stripe) será tratado em etapas futuras.

## O que já existe
- Landing com hero, how it works, services, testimonials, CTA
- Pricing com 3 produtos + 2 pacotes
- Checkout (mock), Upload, Status tracker, Result page
- Admin backoffice com tabela de pedidos mock
- Design system charcoal/gold com Playfair Display + Inter

## O que muda neste upgrade

### 1. Renomear para "Memora Studio"
- Atualizar Navbar, Footer, Admin sidebar, index.html (title, meta tags)
- Todas as referências "Levres Studio" → "Memora Studio"

### 2. Hero Section — Antes/Depois Slider
- Redesenhar o hero: headline à esquerda, componente **BeforeAfterSlider** grande à direita
- Criar `src/components/landing/BeforeAfterSlider.tsx` — slider interativo (drag handle) que revela antes/depois
- Usar imagens placeholder (gradientes ou placeholder.svg) com texto "Antes"/"Depois"
- Adicionar CTA "Ver exemplos" que scrolla para a seção de antes/depois

### 3. Nova Seção: Galeria "Antes & Depois"
- Criar `src/components/landing/BeforeAfterGallery.tsx`
- Grid com 6 exemplos, cada um usando o componente BeforeAfterSlider em tamanho menor
- Chips de filtro: Riscos, Foto escura, Desfoque, Colorização, HD/4K
- Dados em `src/data/landingExamples.ts` para fácil troca de imagens

### 4. Nova Seção: Galeria de Temas de Aniversário
- Criar `src/components/landing/ThemesGallery.tsx`
- Grid de cards com os 8 temas: Stitch, Frozen, Princesa, Safari, Astronauta, Futebol, Unicórnio, Carros
- Cada card com ícone/emoji, nome, descrição "inspirado em"
- CTA "Quero esse tema" → redireciona para `/pricing?theme=nome`

### 5. Atualizar estrutura da Landing Page
Nova ordem das seções:
1. Hero (com BeforeAfterSlider)
2. Galeria Antes & Depois
3. Temas de Aniversário
4. Como Funciona (3 passos)
5. Serviços (cards existentes)
6. Seção de Preços resumida (cards inline)
7. Testimonials
8. FAQ (nova)
9. CTA
10. Footer

### 6. Nova Seção: FAQ
- Criar `src/components/landing/FAQSection.tsx`
- Usar Accordion do shadcn/ui
- 5-6 perguntas comuns (garantia, prazo, formatos, pagamento, etc.)

### 7. Add-ons na página de Pricing
- Adicionar seção de add-ons: versão A4, 3 variações de tema, prioridade de fila
- Atualizar a página `/pricing` para aceitar query param `?theme=` e pré-selecionar produto temático

### 8. Melhorias no Upload (briefing dinâmico)
- Restauração: radio Natural/Forte, checkbox remover manchas, checkbox colorizar
- HD/4K: select uso (quadro, álbum, impressão)
- Tema: select de tema (lista dos 8), campos nome/idade/data/cores/frase, select formato (Story/A4)

### 9. Navbar responsiva
- Adicionar menu hamburger mobile com Sheet do shadcn

---

## Detalhes Técnicos

### Componente BeforeAfterSlider
- Usa dois `<div>` sobrepostos com `clip-path` ou `overflow: hidden` + largura dinâmica
- Handle arrastável via `onMouseMove`/`onTouchMove`
- Props: `beforeSrc`, `afterSrc`, `beforeLabel`, `afterLabel`

### Dados dos exemplos (`src/data/landingExamples.ts`)
```typescript
export const landingExamples = [
  { id: 1, category: "riscos", beforeSrc: "/placeholder.svg", afterSrc: "/placeholder.svg", label: "Foto com riscos" },
  // ... 5 more
];

export const themes = [
  { id: "stitch", name: "Stitch", description: "Inspirado no universo tropical e divertido", emoji: "🧵" },
  { id: "frozen", name: "Frozen", description: "Inspirado no reino do gelo", emoji: "❄️" },
  // ... 6 more
];
```

### Arquivos criados/modificados
**Novos:**
- `src/components/landing/BeforeAfterSlider.tsx`
- `src/components/landing/BeforeAfterGallery.tsx`
- `src/components/landing/ThemesGallery.tsx`
- `src/components/landing/FAQSection.tsx`
- `src/components/landing/PricingPreview.tsx`
- `src/data/landingExamples.ts`

**Modificados:**
- `src/components/Navbar.tsx` — renomear + mobile menu
- `src/components/Footer.tsx` — renomear
- `src/components/landing/HeroSection.tsx` — redesenhar com slider
- `src/pages/Index.tsx` — nova ordem de seções
- `src/pages/Pricing.tsx` — add-ons + theme query param
- `src/pages/OrderUpload.tsx` — briefing dinâmico melhorado
- `src/pages/Admin.tsx` — renomear
- `index.html` — meta tags atualizadas

