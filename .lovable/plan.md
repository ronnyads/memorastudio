

# Plano: Fluxo Completo do Cliente — Pagamento → Upload → Entrega

## Escopo

Implementar o fluxo SaaS completo do Memora Studio com a regra "pagamento antes de tudo". Atualmente tudo e mock/estatico. Precisamos: banco de dados real, storage, rotas corretas, bloqueios de seguranca, polling de status, e painel admin funcional.

## Fases de Implementacao

Este e um projeto grande. Vou dividir em **3 fases** para manter cada entrega testavel.

---

### FASE 1 — Banco de Dados + Storage + Rotas

**1.1 Migracao SQL — criar tabelas**

```sql
-- Enums
CREATE TYPE order_status AS ENUM ('created','paid','awaiting_upload','processing','ready','delivered','needs_revision','cancelled');
CREATE TYPE payment_status AS ENUM ('pending','approved','rejected','cancelled','refunded');
CREATE TYPE product_type AS ENUM ('restore','upscale','theme');
CREATE TYPE job_status AS ENUM ('queued','processing','done','failed','needs_review');

-- orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT 'MEM-' || substr(gen_random_uuid()::text, 1, 8),
  public_access_token UUID DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  product_type product_type NOT NULL,
  status order_status NOT NULL DEFAULT 'created',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- order_assets
CREATE TABLE order_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  input_url TEXT,
  output_url TEXT,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- order_brief
CREATE TABLE order_brief (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  type product_type NOT NULL,
  status job_status NOT NULL DEFAULT 'queued',
  attempts INT DEFAULT 0,
  logs JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  gateway TEXT NOT NULL DEFAULT 'manual',
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**1.2 RLS Policies**

- `orders`: SELECT publico via `public_access_token` (para clientes sem login acessarem seu pedido via token no URL). Admin full access via `has_role()`.
- `order_assets`, `order_brief`, `jobs`, `payments`: mesma logica — acesso via token do order + admin full.
- INSERT em orders: permitir para `anon` (checkout cria pedido sem login).
- Storage bucket `order-files`: privado, upload via signed URL gerada por edge function.

**1.3 Storage**

- Criar bucket `order-files` (privado)
- RLS: admin pode tudo, clientes fazem upload/download via signed URLs

**1.4 Rotas**

Atualizar `App.tsx`:
```
/pedido/:id            → OrderHub (novo)
/pedido/:id/enviar     → OrderUpload (existente, refatorado)
/pedido/:id/status     → OrderStatus (existente, refatorado)
/pedido/:id/resultado  → OrderResult (existente, refatorado)
/acompanhar            → TrackOrder (novo)
```
Manter rotas antigas `/order/...` como redirect para `/pedido/...`.

---

### FASE 2 — Checkout Real + Upload + Briefing

**2.1 Checkout (`/checkout`)**

Refatorar `Checkout.tsx`:
- Formulario: email, nome, telefone (opcional), produto, preco
- Ao "pagar" (simulado por agora — integracao Stripe depois):
  - INSERT em `orders` com `payment_status='approved'`, `status='awaiting_upload'`
  - INSERT em `payments`
  - Redirecionar para `/pedido/:id/enviar?token=...`

**2.2 Upload + Briefing (`/pedido/:id/enviar`)**

Refatorar `OrderUpload.tsx`:
- Buscar order do banco via `id` + `token` (query param)
- Se `payment_status != approved`: mostrar tela bloqueada "Pagamento pendente"
- Upload: drag&drop, preview, validacao (jpg/png, max 15MB, alerta se < 800px)
- Upload para Storage via edge function que gera signed URL
- Briefing dinamico por `product_type` (ja existe a UI, conectar ao banco)
- Ao enviar:
  - Salvar `order_assets.input_url`
  - Salvar `order_brief.data`
  - Criar `job` com status `queued`
  - Atualizar `orders.status = 'processing'`
  - Redirecionar para `/pedido/:id/status?token=...`

**2.3 Edge Function `upload-file`**

- Recebe order_id + token
- Valida token
- Gera signed upload URL para o bucket
- Retorna URL

---

### FASE 3 — Status + Resultado + Admin

**3.1 Order Hub (`/pedido/:id`)**

Nova pagina simples:
- Buscar order via token
- Mostrar resumo + status atual
- Botoes dinamicos conforme estado

**3.2 Status (`/pedido/:id/status`)**

Refatorar `OrderStatus.tsx`:
- Buscar order + job do banco
- Timeline dinamica baseada em `orders.status`
- Polling a cada 5s via `useQuery` com `refetchInterval`
- Quando `status = ready`: CTA "Ver resultado"

**3.3 Resultado (`/pedido/:id/resultado`)**

Refatorar `OrderResult.tsx`:
- Buscar order + assets do banco
- Before/After slider usando `input_url` e `output_url`
- Download via signed URL (edge function)
- Botao "Solicitar Ajuste": atualiza `orders.status = 'needs_revision'`

**3.4 Edge Function `download-file`**

- Recebe order_id + token
- Valida token + status
- Gera signed download URL
- Retorna URL

**3.5 Admin (`/admin`)**

Refatorar `Admin.tsx`:
- Proteger com auth check (`has_role(uid, 'admin')`)
- Listar orders reais do banco
- Ver detalhes: input, briefing, status
- Acoes: atualizar status, subir output manualmente, reprocessar
- Upload de output: admin sobe o resultado final para o bucket

**3.6 Track Order (`/acompanhar`)**

Pagina simples:
- Campo email + order_number
- Busca o pedido e redireciona para `/pedido/:id?token=...`

---

## Arquivos

**Novos (~8):**
- `supabase/migrations/XXXX_create_order_tables.sql`
- `supabase/functions/upload-file/index.ts`
- `supabase/functions/download-file/index.ts`
- `src/pages/OrderHub.tsx`
- `src/pages/TrackOrder.tsx`
- `src/hooks/useOrder.ts` (hook para buscar order via token)
- `src/lib/orderTypes.ts` (tipos TypeScript para orders)

**Modificados (~6):**
- `src/App.tsx` — novas rotas
- `src/pages/Checkout.tsx` — criar order no banco
- `src/pages/OrderUpload.tsx` — conectar ao banco + storage
- `src/pages/OrderStatus.tsx` — polling real
- `src/pages/OrderResult.tsx` — download real + revisao
- `src/pages/Admin.tsx` — dados reais + acoes
- `supabase/config.toml` — configurar edge functions

## Ordem de Implementacao

Comecarei pela **Fase 1** (banco + storage + rotas), depois **Fase 2** (checkout + upload), depois **Fase 3** (status + resultado + admin). Cada fase sera testavel independentemente.

## Nota sobre Pagamentos

O checkout sera implementado com simulacao (pagamento aprovado imediatamente). A integracao real com Stripe/MercadoPago pode ser feita depois habilitando o conector Stripe — a estrutura do banco ja suporta isso com a tabela `payments`.

