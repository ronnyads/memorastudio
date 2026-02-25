import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Download, RefreshCw, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const OrderResult = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-2">
                Pedido #{id}
              </p>
              <h1 className="font-display text-3xl font-bold mb-2">Resultado Pronto! 🎉</h1>
              <p className="text-muted-foreground font-body text-sm">
                Sua foto foi restaurada com sucesso
              </p>
            </div>

            {/* Result Preview */}
            <div className="bg-gradient-card rounded-xl p-8 border border-border/50 mb-8">
              <div className="aspect-[4/3] rounded-lg bg-muted/30 flex items-center justify-center border border-border/30 mb-6">
                <p className="text-muted-foreground font-body text-sm">
                  Preview do resultado aparecerá aqui
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="gold" className="flex-1" onClick={() => toast.success("Download iniciado!")}>
                  <Download className="w-5 h-5 mr-2" />
                  Download HD
                </Button>
                <Button variant="gold-outline" onClick={() => toast.info("Solicitação de ajuste enviada!")}>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Solicitar Ajuste
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-3 text-center">
                1 revisão gratuita incluída
              </p>
            </div>

            {/* Feedback */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 space-y-4">
              <h3 className="font-display text-lg font-semibold">Avalie o resultado</h3>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        s <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
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
