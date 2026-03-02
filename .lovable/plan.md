

# Plano: Integrar Mercado Pago como Gateway de Pagamento

## Fluxo

```text
Cliente (Checkout) → Edge Function (create-preference) → API Mercado Pago → Redirect para MP
MP processa pagamento → Webhook (edge function) → Atualiza order no banco → Cliente redirecionado de volta
```

## O que precisa ser feito

### 1. Secret: Access Token do Mercado Pago
- Pedir ao usuario o **Access Token** do Mercado Pago (encontrado em https://www.mercadopago.com.br/developers/panel/app → Credenciais de producao ou teste)
- Armazenar como secret `MERCADO_PAGO_ACCESS_TOKEN` via Supabase secrets

### 2. Edge Function `create-mp-preference`
- Recebe: `order_id`, `product`, `price`, `customer_email`, `customer_name`
- Cria o pedido no banco (`orders` com `payment_status='pending'`)
- Chama a API do Mercado Pago `POST /checkout/preferences` para criar uma preference com:
  - `items[]` (nome, preco, quantidade)
  - `payer.email`
  - `back_urls` (success, failure, pending) apontando para `/pedido/:id/enviar?token=...`, `/checkout?error=true`, etc.
  - `external_reference` = `order.id`
  - `notification_url` apontando para a edge function de webhook
- Retorna a `init_point` (URL de checkout do MP) para o frontend redirecionar

### 3. Edge Function `mp-webhook`
- Recebe notificacoes IPN/webhook do Mercado Pago
- Quando `type=payment` e `action=payment.created` ou `payment.updated`:
  - Busca detalhes do pagamento via API MP (`GET /v1/payments/:id`)
  - Extrai `external_reference` (= order_id) e `status`
  - Atualiza `orders.payment_status` e `orders.status`:
    - `approved` → `payment_status='approved'`, `status='awaiting_upload'`
    - `rejected` → `payment_status='rejected'`
    - `pending`/`in_process` → `payment_status='pending'`
  - Insere registro em `payments` com gateway='mercadopago'
- Usa service role key para fazer updates no banco (bypass RLS)

### 4. Refatorar `Checkout.tsx`
- Ao submeter o formulario:
  - Chamar edge function `create-mp-preference` em vez de criar order direto
  - Receber a URL de checkout do MP (`init_point`)
  - `window.location.href = init_point` (redireciona para o Mercado Pago)
- Remover logica de pagamento simulado
- Adicionar tratamento para query param `?status=` quando o MP redireciona de volta

### 5. Pagina de retorno pos-pagamento
- Quando o MP redireciona de volta para `/pedido/:id/enviar?token=...`:
  - A pagina ja verifica `payment_status` — se o webhook ja processou, libera o upload
  - Se ainda `pending`, mostrar mensagem "Aguardando confirmacao do pagamento..." com polling

### 6. Config
- Adicionar `[functions.create-mp-preference]` e `[functions.mp-webhook]` no `config.toml` com `verify_jwt = false`

## Arquivos

**Novos (2):**
- `supabase/functions/create-mp-preference/index.ts`
- `supabase/functions/mp-webhook/index.ts`

**Modificados (2):**
- `src/pages/Checkout.tsx` — redirecionar para MP em vez de simular
- `supabase/config.toml` — registrar novas functions

## Prerequisito

Antes de implementar, preciso que voce adicione o **Access Token do Mercado Pago** como secret. Vou solicitar isso no primeiro passo da implementacao.

