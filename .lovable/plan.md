

## Plano: Checkout com pagamento dentro do site (Mercado Pago Checkout Bricks)

### Resumo

Trocar o fluxo atual (redireciona para o site do Mercado Pago) por um formulário de pagamento embutido usando o **SDK React do Mercado Pago** (`@mercadopago/sdk-react`). O cliente preenche o cartão diretamente no seu site.

### Arquitetura

```text
Cliente preenche dados pessoais + cartão (CardPayment Brick)
    ↓
SDK gera um token seguro do cartão (frontend)
    ↓
Frontend envia token + dados → Edge Function "process-payment"
    ↓
Edge Function chama POST /v1/payments no Mercado Pago
    ↓
Retorna status do pagamento → Frontend redireciona conforme resultado
```

### Mudanças

**1. Instalar dependência**
- `@mercadopago/sdk-react` — SDK oficial do Mercado Pago para React

**2. Refatorar `src/pages/Checkout.tsx`**
- Inicializar o SDK com `initMercadoPago(PUBLIC_KEY)` usando a `MERCADO_PAGO_PUBLIC_KEY` já salva como secret (expor via `VITE_MERCADO_PAGO_PUBLIC_KEY` ou usar diretamente)
- Após o cliente preencher nome/email/telefone, mostrar o componente `<CardPayment>` do SDK que renderiza o formulário de cartão seguro
- No callback `onSubmit`, enviar o token gerado + dados do pedido para a nova edge function `process-payment`
- Tratar resposta: aprovado → redirecionar para upload; rejeitado → mostrar erro inline

**3. Nova Edge Function `supabase/functions/process-payment/index.ts`**
- Recebe: `token`, `payment_method_id`, `installments`, `issuer_id`, `payer` (email), `product`, `price`, `customer_name`, `customer_phone`, `product_type`
- Cria o pedido na tabela `orders` (como faz hoje o `create-mp-preference`)
- Chama `POST https://api.mercadopago.com/v1/payments` com o `ACCESS_TOKEN`, enviando o token do cartão e dados do pagamento
- Retorna o status do pagamento e o `order_id` para o frontend
- Se aprovado, atualiza `payment_status = 'approved'` e `status = 'awaiting_upload'`

**4. Atualizar `supabase/config.toml`**
- Adicionar `[functions.process-payment]` com `verify_jwt = false`

**5. Expor a Public Key para o frontend**
- A `MERCADO_PAGO_PUBLIC_KEY` precisa estar acessível no frontend. Adicionar como variável `VITE_MERCADO_PAGO_PUBLIC_KEY` no `.env`

### Detalhes técnicos

- O componente `<CardPayment>` do SDK é PCI-compliant — os dados do cartão nunca passam pelo seu servidor, apenas o token
- O webhook `mp-webhook` continua funcionando como fallback para atualizações de status
- A edge function `create-mp-preference` pode ser mantida ou removida (não será mais usada)
- A aplicação no painel do Mercado Pago precisa estar configurada como **"Checkout Transparente"** ou **"Checkout API"** (a que você já tem)

### Prerequisito

Precisarei da **Public Key** do Mercado Pago adicionada como variável de ambiente `VITE_MERCADO_PAGO_PUBLIC_KEY` no `.env` para o SDK funcionar no frontend.

