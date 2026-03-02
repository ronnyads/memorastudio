import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useOrder } from "@/hooks/useOrder";
import { productTypeLabels } from "@/lib/orderTypes";
import { Upload, Eye, Download, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const statusLabels: Record<string, string> = {
  created: "Criado",
  paid: "Pago",
  awaiting_upload: "Aguardando upload",
  processing: "Processando",
  ready: "Pronto",
  delivered: "Entregue",
  needs_revision: "Em revisao",
  cancelled: "Cancelado",
};

const OrderHub = () => {
  const { order, isLoading, error, isLegacyAccess } = useOrder();

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
        <section className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-lg text-center">
            <h1 className="font-display text-3xl font-bold mb-4">Pedido nao encontrado</h1>
            <p className="text-muted-foreground font-body">Verifique o link ou use a pagina de acompanhamento.</p>
            <Button variant="gold" className="mt-6" asChild>
              <Link to="/acompanhar">Acompanhar pedido</Link>
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-2">
                {order.order_number}
              </p>
              <h1 className="font-display text-3xl font-bold mb-2">Seu pedido</h1>
            </div>

            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 space-y-4 mb-8">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Servico</span>
                <span className="font-medium">{productTypeLabels[order.product_type]}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{statusLabels[order.status] || order.status}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display font-bold text-gradient-gold">R${Number(order.total).toFixed(0)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {isLegacyAccess && (
                <Button variant="secondary" size="lg" className="w-full" asChild>
                  <Link to={`/acesso-pedido?redirect=${encodeURIComponent(`/pedido/${order.id}`)}`}>
                    Fazer login para continuar com seguranca
                  </Link>
                </Button>
              )}

              {order.status === "awaiting_upload" && !isLegacyAccess && (
                <Button variant="gold" size="lg" className="w-full" asChild>
                  <Link to={`/pedido/${order.id}/enviar`}>
                    <Upload className="w-5 h-5 mr-2" /> Enviar foto
                  </Link>
                </Button>
              )}
              {order.status === "processing" && (
                <Button variant="gold" size="lg" className="w-full" asChild>
                  <Link to={`/pedido/${order.id}/status`}>
                    <Clock className="w-5 h-5 mr-2" /> Acompanhar status
                  </Link>
                </Button>
              )}
              {(order.status === "ready" || order.status === "delivered") && (
                <Button variant="gold" size="lg" className="w-full" asChild>
                  <Link to={`/pedido/${order.id}/resultado`}>
                    <Download className="w-5 h-5 mr-2" /> Ver resultado
                  </Link>
                </Button>
              )}
              {order.status === "needs_revision" && (
                <Button variant="gold-outline" size="lg" className="w-full" asChild>
                  <Link to={`/pedido/${order.id}/status`}>
                    <Eye className="w-5 h-5 mr-2" /> Acompanhar revisao
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default OrderHub;
