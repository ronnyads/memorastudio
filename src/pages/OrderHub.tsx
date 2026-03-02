import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useOrder } from "@/hooks/useOrder";
import { orderStatusLabels, productTypeLabels } from "@/lib/orderTypes";
import { Upload, Eye, Download, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const OrderHub = () => {
  const { order, isLoading, error, token } = useOrder();

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
            <h1 className="font-display text-3xl font-bold mb-4">Pedido não encontrado</h1>
            <p className="text-muted-foreground font-body">Verifique o link ou use a página de acompanhamento.</p>
            <Button variant="gold" className="mt-6" asChild>
              <Link to="/acompanhar">Acompanhar Pedido</Link>
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const tokenParam = token ? `?token=${token}` : "";

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
              <h1 className="font-display text-3xl font-bold mb-2">Seu Pedido</h1>
            </div>

            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 space-y-4 mb-8">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Serviço</span>
                <span className="font-medium">{productTypeLabels[order.product_type]}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{orderStatusLabels[order.status]}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display font-bold text-gradient-gold">R${Number(order.total).toFixed(0)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {order.status === "awaiting_upload" && (
                <Button variant="gold" size="lg" className="w-full" asChild>
                  <Link to={`/pedido/${order.id}/enviar${tokenParam}`}>
                    <Upload className="w-5 h-5 mr-2" /> Enviar Foto
                  </Link>
                </Button>
              )}
              {order.status === "processing" && (
                <Button variant="gold" size="lg" className="w-full" asChild>
                  <Link to={`/pedido/${order.id}/status${tokenParam}`}>
                    <Clock className="w-5 h-5 mr-2" /> Acompanhar Status
                  </Link>
                </Button>
              )}
              {(order.status === "ready" || order.status === "delivered") && (
                <Button variant="gold" size="lg" className="w-full" asChild>
                  <Link to={`/pedido/${order.id}/resultado${tokenParam}`}>
                    <Download className="w-5 h-5 mr-2" /> Ver Resultado
                  </Link>
                </Button>
              )}
              {order.status === "needs_revision" && (
                <Button variant="gold-outline" size="lg" className="w-full" asChild>
                  <Link to={`/pedido/${order.id}/status${tokenParam}`}>
                    <Eye className="w-5 h-5 mr-2" /> Acompanhar Revisão
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
