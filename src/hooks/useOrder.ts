import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { Order, OrderAsset, OrderBrief, Job } from "@/lib/orderTypes";

type OrderPortalResponse = {
  order: Order;
  assets: OrderAsset[];
  brief: OrderBrief | null;
  jobs: Job[];
  legacy?: boolean;
};

export function useOrder() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { session } = useAuthSession();

  const orderQuery = useQuery({
    queryKey: ["order-portal-data", id, token, session?.user?.email ?? null],
    queryFn: async () => {
      if (!id) throw new Error("Order ID missing");

      if (session) {
        const { data, error } = await supabase.functions.invoke("get-order-portal-data", {
          body: { order_id: id },
        });
        if (error) throw error;
        return {
          order: data.order as Order,
          assets: (data.assets ?? []) as OrderAsset[],
          brief: (data.brief ?? null) as OrderBrief | null,
          jobs: (data.jobs ?? []) as Job[],
          legacy: false,
        } as OrderPortalResponse;
      }

      if (token) {
        const { data, error } = await supabase.functions.invoke("legacy-order-access", {
          body: { order_id: id, token },
        });
        if (error) throw error;
        return {
          order: data.order as Order,
          assets: (data.assets ?? []) as OrderAsset[],
          brief: (data.brief ?? null) as OrderBrief | null,
          jobs: (data.jobs ?? []) as Job[],
          legacy: true,
        } as OrderPortalResponse;
      }

      throw new Error("Authentication required");
    },
    enabled: !!id && (Boolean(session) || Boolean(token)),
  });

  const portalData = orderQuery.data;

  return {
    order: portalData?.order,
    assets: portalData?.assets ?? [],
    brief: portalData?.brief ?? null,
    jobs: portalData?.jobs ?? [],
    isLegacyAccess: portalData?.legacy ?? false,
    isLoading: orderQuery.isLoading,
    error: orderQuery.error,
    token,
    orderId: id,
    refetchOrder: orderQuery.refetch,
    refetchAll: orderQuery.refetch,
  };
}
