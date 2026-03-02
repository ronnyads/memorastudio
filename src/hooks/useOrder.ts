import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useSearchParams } from "react-router-dom";
import type { Order, OrderAsset, OrderBrief, Job } from "@/lib/orderTypes";

export function useOrder() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const orderQuery = useQuery({
    queryKey: ["order", id, token],
    queryFn: async () => {
      if (!id) throw new Error("Order ID missing");

      let query = supabase
        .from("orders")
        .select("*")
        .eq("id", id);

      if (token) {
        query = query.eq("public_access_token", token);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data as unknown as Order;
    },
    enabled: !!id,
  });

  const assetsQuery = useQuery({
    queryKey: ["order-assets", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_assets")
        .select("*")
        .eq("order_id", id!);
      if (error) throw error;
      return data as unknown as OrderAsset[];
    },
    enabled: !!id && !!orderQuery.data,
  });

  const briefQuery = useQuery({
    queryKey: ["order-brief", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_brief")
        .select("*")
        .eq("order_id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as OrderBrief | null;
    },
    enabled: !!id && !!orderQuery.data,
  });

  const jobsQuery = useQuery({
    queryKey: ["order-jobs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("order_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Job[];
    },
    enabled: !!id && !!orderQuery.data,
  });

  return {
    order: orderQuery.data,
    assets: assetsQuery.data ?? [],
    brief: briefQuery.data,
    jobs: jobsQuery.data ?? [],
    isLoading: orderQuery.isLoading,
    error: orderQuery.error,
    token,
    orderId: id,
    refetchOrder: orderQuery.refetch,
    refetchAll: () => {
      orderQuery.refetch();
      assetsQuery.refetch();
      briefQuery.refetch();
      jobsQuery.refetch();
    },
  };
}
