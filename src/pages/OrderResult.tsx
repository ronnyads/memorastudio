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
  const { order, assets, isLoading, error } = useOrder();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevision, setShowRevision] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [requestingRevision, setRequestingRevision] = useState(false);

  const hasOutput = assets[0]?.output_url;

  const handleDownload = async () => {
    if (!order || !hasOutput) return;
    setDownloading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("request-order-download-url", {
        body: { order_id: order.id },
      });
      if (fnError || !data?.signedUrl) throw fnError || new Error("No signed URL");

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
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

    setRequestingRevision(true);
    const { error: fnError } = await supabase.functions.invoke("request-order-revision", {
      body: {
        order_id: order.id,
        note: revisionNote.trim(),
      },
    });
    setRequestingRevision(false);

    if (fnError) {
      toast.error("Erro ao solicitar ajuste.");
      return;
    }

    toast.success("Solicitacao de ajuste enviada!");
    setShowRevision(false);
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
          <h1 className="font-display text-3xl font-bold">Pedido nao encontrado</h1>
        </section>
        <Footer />
      </div>
    );
  }

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
                {hasOutput ? "Resultado pronto!" : "Aguardando resultado..."}
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                Identidade preservada com acabamento natural.
              </p>
            </div>

            <div className="bg-gradient-card rounded-xl p-8 border border-border/50 mb-8">
              <div className="aspect-[4/3] rounded-lg bg-muted/30 flex items-center justify-center border border-border/30 mb-6">
                <p className="text-muted-foreground font-body text-sm">
                  {hasOutput ? "Resultado disponivel para download" : "O resultado ainda esta sendo processado"}
                </p>
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
                  disabled={requestingRevision || order.status === "needs_revision"}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {order.status === "needs_revision" ? "Ajuste solicitado" : "Solicitar ajuste"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-3 text-center">
                1 revisao gratuita incluida
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
                  placeholder="Descreva o ajuste desejado..."
                  className="bg-secondary border-border"
                />
                <Button variant="gold" className="w-full" onClick={handleRevision} disabled={requestingRevision}>
                  {requestingRevision ? "Enviando..." : "Enviar solicitacao"}
                </Button>
              </motion.div>
            )}

            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 space-y-4">
              <h3 className="font-display text-lg font-semibold">Avalie o resultado</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}>
                    <Star className={`w-6 h-6 transition-colors ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Conte o que achou do resultado..."
                className="bg-secondary border-border"
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => toast.success("Obrigado pelo feedback!")}
              >
                Enviar feedback
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
