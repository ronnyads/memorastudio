

# Correcao: Polling do Status nao atualiza a UI

## Problema

A pagina de status faz polling a cada 5s, mas o resultado da query de polling **nao atualiza os dados do order principal** renderizado na tela. A query de polling (`order-poll`) e separada da query principal (`order` do hook `useOrder`), entao mesmo que o admin mude o status no banco, a UI do cliente nunca reflete a mudanca.

## Solucao

No `OrderStatus.tsx`, usar `useQueryClient` para invalidar a query principal do order quando o polling detectar mudanca de status. Isso forca o `useOrder` a re-buscar os dados atualizados.

## Mudancas

**1 arquivo modificado: `src/pages/OrderStatus.tsx`**

- Importar `useQueryClient` do TanStack Query
- No callback do polling, comparar o status retornado com `order.status`
- Se diferente, chamar `queryClient.invalidateQueries({ queryKey: ["order", order.id] })` para forcar refresh do hook `useOrder`
- Isso faz a timeline atualizar automaticamente quando o admin muda o status para "ready"

