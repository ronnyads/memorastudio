import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Clock, Image, Cpu, Download, Loader2, Eye } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";
import { orderStatusLabels } from "@/lib/orderTypes";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const OrderStatus = () => {
  const { order, isLoading, error, token } = useOrder();

  // Polling every 5s
  useQuery({
    queryKey: ["order-poll", order?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("id", order!.id)
        .single();
      return data;
    },
    enabled: !!order && !["ready", "delivered", "cancelled"].includes(order.status),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 text-center">
          <h1 className="font-display text-3xl font-bold">Pedido não encontrado</h1>
        </section>
        <Footer />
      </div>
    );
  }

  const statusOrder = ["paid", "awaiting_upload", "processing", "ready"] as const;
  const currentIdx = (() => {
    if (order.status === "delivered" || order.status === "ready") return 3;
    if (order.status === "processing") return 2;
    if (order.status === "awaiting_upload") return 1;
    return 0;
  })();

  const steps = [
    { icon: Check, label: "Pago" },
    { icon: Image, label: "Foto recebida" },
    { icon: Cpu, label: "Processando" },
    { icon: Download, label: "Pronto para download" },
  ];

  const tokenParam = token ? `?token=${token}` : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-2">
                {order.order_number}
              </p>
              <h1 className="font-display text-3xl font-bold mb-2">Status do Pedido</h1>
              <p className="text-muted-foreground font-body text-sm flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                {order.status === "ready" || order.status === "delivered"
                  ? "Resultado pronto!"
                  : "Tempo estimado: 15-30 minutos"}
              </p>
            </div>

            <div className="bg-gradient-card rounded-xl p-8 border border-border/50 mb-8">
              <div className="space-y-0">
                {steps.map((step, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx && order.status !== "ready" && order.status !== "delivered";
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            done && !active
                              ? "bg-gradient-gold shadow-gold"
                              : active
                              ? "border-2 border-primary bg-primary/10 animate-pulse"
                              : "border border-border bg-muted"
                          }`}
                        >
                          <step.icon
                            className={`w-5 h-5 ${
                              done && !active
                                ? "text-primary-foreground"
                                : active
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-0.5 h-12 ${done ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pt-2">
                        <p className={`font-body font-medium text-sm ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {active && (
                          <p className="text-xs text-primary font-body mt-1">Em andamento...</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {(order.status === "ready" || order.status === "delivered") && (
              <Button variant="gold" size="lg" className="w-full" asChild>
                <Link to={`/pedido/${order.id}/resultado${tokenParam}`}>
                  <Eye className="w-5 h-5 mr-2" /> Ver Resultado
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderStatus;
