import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, RefreshCw, Star, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useOrder } from "@/hooks/useOrder";
import { supabase } from "@/integrations/supabase/client";

const OrderResult = () => {
  const { order, assets, isLoading, error, token } = useOrder();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevision, setShowRevision] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!order || !assets[0]?.output_url) return;
    setDownloading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("download-file", {
        body: { order_id: order.id, token, file_path: assets[0].output_url },
      });
      if (fnError) throw fnError;

      window.open(data.signedUrl, "_blank");
      toast.success("Download iniciado!");
    } catch {
      toast.error("Erro ao gerar link de download.");
    } finally {
      setDownloading(false);
    }
  };

  const handleRevision = async () => {
    if (!order || !revisionNote.trim()) {
      toast.error("Descreva o que precisa ser ajustado.");
      return;
    }

    try {
      await supabase
        .from("orders")
        .update({ status: "needs_revision" })
        .eq("id", order.id);

      await supabase.from("jobs").insert({
        order_id: order.id,
        type: order.product_type,
        status: "needs_review",
        logs: [{ type: "revision_request", note: revisionNote, at: new Date().toISOString() }],
      });

      toast.success("Solicitação de ajuste enviada!");
      setShowRevision(false);
    } catch {
      toast.error("Erro ao solicitar ajuste.");
    }
  };

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

  const hasOutput = assets[0]?.output_url;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-2">
                {order.order_number}
              </p>
              <h1 className="font-display text-3xl font-bold mb-2">
                {hasOutput ? "Resultado Pronto! 🎉" : "Aguardando resultado..."}
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                Identidade preservada. Restauração natural.
              </p>
            </div>

            <div className="bg-gradient-card rounded-xl p-8 border border-border/50 mb-8">
              <div className="aspect-[4/3] rounded-lg bg-muted/30 flex items-center justify-center border border-border/30 mb-6">
                {hasOutput ? (
                  <p className="text-muted-foreground font-body text-sm">
                    Resultado disponível para download
                  </p>
                ) : (
                  <p className="text-muted-foreground font-body text-sm">
                    O resultado ainda está sendo processado
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="gold"
                  className="flex-1"
                  onClick={handleDownload}
                  disabled={!hasOutput || downloading}
                >
                  {downloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                  Download HD
                </Button>
                <Button
                  variant="gold-outline"
                  onClick={() => setShowRevision(!showRevision)}
                  disabled={order.status === "needs_revision"}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {order.status === "needs_revision" ? "Ajuste solicitado" : "Solicitar Ajuste"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-3 text-center">
                1 revisão gratuita incluída
              </p>
            </div>

            {showRevision && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gradient-card rounded-xl p-6 border border-border/50 space-y-4 mb-8"
              >
                <h3 className="font-display text-lg font-semibold">O que precisa ser ajustado?</h3>
                <Textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Descreva o que precisa mudar..."
                  className="bg-secondary border-border"
                />
                <Button variant="gold" className="w-full" onClick={handleRevision}>
                  Enviar Solicitação
                </Button>
              </motion.div>
            )}

            {/* Feedback */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 space-y-4">
              <h3 className="font-display text-lg font-semibold">Avalie o resultado</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star className={`w-6 h-6 transition-colors ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Conte o que achou do resultado..."
                className="bg-secondary border-border"
              />
              <Button variant="secondary" className="w-full" onClick={() => toast.success("Obrigado pelo feedback!")}>
                Enviar Feedback
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderResult;
