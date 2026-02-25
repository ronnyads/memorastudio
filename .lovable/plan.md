

# Plano: Usar as 4 fotos reais de restauracao como exemplos na LP

## Problema

Os exemplos de restauracao na LP usam imagens AI-generated que parecem artificiais. O usuario enviou 4 fotos reais de restauracoes profissionais (composites side-by-side) que mostram o padrao de qualidade desejado.

## Abordagem

Copiar as 4 imagens reais do usuario para `public/demo/before-after/` e usa-las diretamente nos exemplos de restauracao. Como sao composites (before|after lado a lado em 1 imagem), precisamos de um modo "composite" no `BeforeAfterSlider`: a imagem e carregada uma vez, o lado esquerdo (0-50%) mostra o "antes" e o lado direito (50-100%) mostra o "depois", usando `object-position` e `object-fit` para recortar cada metade.

## Mudancas

### 1. Copiar as 4 imagens reais para o projeto

- `user-uploads://image-4.png` → `public/demo/before-after/real_01.png` (mae e filho, P&B → colorizado)
- `user-uploads://image-5.png` → `public/demo/before-after/real_02.png` (marinheiro, foto rasgada → restaurada)
- `user-uploads://image-6.png` → `public/demo/before-after/real_03.png` (soldado, foto danificada → restaurada)
- `user-uploads://image-7.png` → `public/demo/before-after/real_04.png` (familia asiatica, P&B → colorizada)

### 2. Atualizar `BeforeAfterSlider.tsx` — adicionar modo composite

Adicionar prop `composite?: boolean`. Quando `composite=true`:
- Uma unica imagem e carregada (`afterSrc`)
- Lado "Antes": `<img>` com `object-fit: cover; object-position: left;` mostrando a metade esquerda
- Lado "Depois": `<img>` com `object-fit: cover; object-position: right;` mostrando a metade direita
- O clip-path do slider controla a divisao visivel

Detalhes tecnicos do modo composite:
```text
Imagem original: [BEFORE | AFTER] (side-by-side)

Container aspect-ratio: 4/3 (retrato)

Lado ANTES:
  <img src={compositeSrc}
    style="width: 200%; object-fit: cover; object-position: 0% center;"
  />

Lado DEPOIS:
  <img src={compositeSrc}
    style="width: 200%; object-fit: cover; object-position: 100% center;"
  />

clip-path no "antes": inset(0 {100-position}% 0 0)
```

### 3. Atualizar `landingExamples.ts`

Substituir os 4 primeiros exemplos de restauracao pelas imagens reais, usando o modo composite:

```typescript
{ id: "01", title: "P&B → Colorizada", afterSrc: "/demo/before-after/real_01.png", composite: true, category: "colorizacao" },
{ id: "02", title: "Foto rasgada → Restaurada", afterSrc: "/demo/before-after/real_02.png", composite: true, category: "riscos" },
{ id: "03", title: "Foto danificada → Restaurada", afterSrc: "/demo/before-after/real_03.png", composite: true, category: "riscos" },
{ id: "04", title: "Família P&B → Colorizada", afterSrc: "/demo/before-after/real_04.png", composite: true, category: "colorizacao" },
```

Manter exemplos 05 e 06 com fallback CSS (degradeType) como demos adicionais.

Atualizar `heroExamples` para usar os 3 primeiros exemplos reais.

### 4. Atualizar interface `BeforeAfterExample`

Adicionar campo `composite?: boolean` na interface.

## Arquivos

**Novos (4 — copias de imagens):**
- `public/demo/before-after/real_01.png`
- `public/demo/before-after/real_02.png`
- `public/demo/before-after/real_03.png`
- `public/demo/before-after/real_04.png`

**Modificados (2):**
- `src/components/landing/BeforeAfterSlider.tsx` — adicionar modo composite
- `src/data/landingExamples.ts` — usar imagens reais nos primeiros 4 exemplos

