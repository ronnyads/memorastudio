

# Plano: Regenerar composites de restauracao com qualidade real

## Problema

As imagens composite atuais (geradas por AI) nao parecem restauracoes reais. As fotos dos dois lados sao diferentes (rostos, poses, cenarios distintos). O usuario mostrou 3 exemplos reais de como deve ser:

1. **Mesma foto, mesma pessoa, mesma pose** — lado esquerdo danificado (manchas, riscos, desbotado, P&B), lado direito restaurado (limpo, colorizado, nitido)
2. Transicao suave no meio — as duas metades se complementam perfeitamente
3. Tipos de restauracao vistos nos exemplos:
   - Foto com manchas/riscos/desbotada → limpa e restaurada (P&B)
   - Foto P&B antiga com danos → colorizada com cores naturais
   - Foto sepia/desbotada → colorizada vibrante

## Mudancas

### 1. Regenerar 6 composites de restauracao com prompts melhorados

Usar o gerador de imagens com prompts muito mais especificos, inspirados nos exemplos do usuario:

**restore_01_composite.jpg** — Casal anos 80, foto P&B com manchas e riscos no lado esquerdo, mesma foto restaurada limpa no lado direito. Mesma pessoa, mesma pose, split vertical.

**restore_02_composite.jpg** — Familia antiga (pais + 2 criancas), P&B desbotado com manchas amareladas no lado esquerdo, colorizado com cores naturais no lado direito. Mesma composicao.

**restore_03_composite.jpg** — Mae e filho, foto sepia desbotada no lado esquerdo, colorizada vibrante no lado direito. Mesma pose, mesmo enquadramento.

**restore_04_composite.jpg** — Retrato individual, foto rasgada/amassada com vincos no lado esquerdo, reconstruida limpa no lado direito.

**restore_05_composite.jpg** — Foto de grupo familiar, P&B granulado no esquerdo, colorizado detalhado no direito.

**restore_06_composite.jpg** — Foto pixelada/baixa resolucao no esquerdo, nitida HD no direito.

### 2. Regenerar 4 composites de temas

Manter os mesmos temas mas com prompts que garantam consistencia de identidade entre as duas metades.

### 3. Nenhuma mudanca de codigo

O componente `CompositeBeforeAfterSlider` e os dados em `landingExamples.ts` ja estao corretos. Apenas os arquivos JPG em `public/demo/composites/` precisam ser substituidos.

## Arquivos modificados (10 — apenas imagens)

- `public/demo/composites/restore_01_composite.jpg`
- `public/demo/composites/restore_02_composite.jpg`
- `public/demo/composites/restore_03_composite.jpg`
- `public/demo/composites/restore_04_composite.jpg`
- `public/demo/composites/restore_05_composite.jpg`
- `public/demo/composites/restore_06_composite.jpg`
- `public/demo/composites/theme_ice_princess.jpg`
- `public/demo/composites/theme_astronauta.jpg`
- `public/demo/composites/theme_safari.jpg`
- `public/demo/composites/theme_unicorn.jpg`

## Detalhe dos prompts

Cada prompt enfatizara:
- "identical person, identical pose, identical framing on both sides"
- "left side: damaged/old version — right side: restored version"
- "photorealistic, studio portrait style, split-screen composite"
- Inspirado nos exemplos reais do usuario (fotos de familia vintage)

