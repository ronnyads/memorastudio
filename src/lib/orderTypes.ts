export type OrderStatus = 'created' | 'paid' | 'awaiting_upload' | 'processing' | 'ready' | 'delivered' | 'needs_revision' | 'cancelled';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
export type ProductType = 'restore' | 'upscale' | 'theme';
export type JobStatus = 'queued' | 'processing' | 'done' | 'failed' | 'needs_review';

export interface Order {
  id: string;
  order_number: string;
  public_access_token?: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  product_type: ProductType;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderAsset {
  id: string;
  order_id: string;
  input_url: string | null;
  output_url: string | null;
  preview_url: string | null;
  created_at: string;
}

export interface OrderBrief {
  id: string;
  order_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  order_id: string;
  type: ProductType;
  status: JobStatus;
  attempts: number;
  logs: unknown[];
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  last_error?: string | null;
  locked_by?: string | null;
  next_retry_at?: string | null;
}

export interface Payment {
  id: string;
  order_id: string;
  gateway: string;
  payment_id: string | null;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  created: 'Criado',
  paid: 'Pago',
  awaiting_upload: 'Aguardando Upload',
  processing: 'Processando',
  ready: 'Pronto',
  delivered: 'Entregue',
  needs_revision: 'Em Revisão',
  cancelled: 'Cancelado',
};

export const productTypeLabels: Record<ProductType, string> = {
  restore: 'Restauração',
  upscale: 'Restauração + HD/4K',
  theme: 'Foto Temática',
};
