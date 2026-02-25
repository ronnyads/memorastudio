import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Check, Clock, Image, Cpu, Eye, Download } from "lucide-react";

const statusSteps = [
  { icon: Check, label: "Pago", done: true },
  { icon: Image, label: "Foto recebida", done: true },
  { icon: Cpu, label: "Processando", done: false, active: true },
  { icon: Eye, label: "Revisão", done: false },
  { icon: Download, label: "Pronto para download", done: false },
];

const OrderStatus = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-2">
                Pedido #{id}
              </p>
              <h1 className="font-display text-3xl font-bold mb-2">Status do Pedido</h1>
              <p className="text-muted-foreground font-body text-sm flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Tempo estimado: 15-30 minutos
              </p>
            </div>

            {/* Status Steps */}
            <div className="bg-gradient-card rounded-xl p-8 border border-border/50">
              <div className="space-y-0">
                {statusSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          step.done
                            ? "bg-gradient-gold shadow-gold"
                            : step.active
                            ? "border-2 border-primary bg-primary/10 animate-pulse"
                            : "border border-border bg-muted"
                        }`}
                      >
                        <step.icon
                          className={`w-5 h-5 ${
                            step.done
                              ? "text-primary-foreground"
                              : step.active
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-12 ${
                            step.done ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-2">
                      <p
                        className={`font-body font-medium text-sm ${
                          step.done || step.active ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.active && (
                        <p className="text-xs text-primary font-body mt-1">Em andamento...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderStatus;
