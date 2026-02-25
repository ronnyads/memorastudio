import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, CreditCard } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "Restauração";
  const price = searchParams.get("price") || "29";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);

    // Simulating payment — real integration with Stripe/MercadoPago needed
    setTimeout(() => {
      setLoading(false);
      toast.success("Pagamento confirmado!");
      navigate(`/order/demo-123/upload?product=${encodeURIComponent(product)}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl font-bold mb-2">Finalizar Pedido</h1>
              <p className="text-muted-foreground font-body text-sm">
                Pagamento seguro e rápido
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-body text-sm text-muted-foreground">Serviço</span>
                <span className="font-body text-sm font-medium">{product}</span>
              </div>
              <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                <span className="font-display text-lg font-semibold">Total</span>
                <span className="font-display text-2xl font-bold text-gradient-gold">
                  R${price}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-body text-sm">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-sm">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3 text-sm font-body text-muted-foreground">
                <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                Pagamento processado com segurança. Seus dados estão protegidos.
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full text-base py-6"
                disabled={loading}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {loading ? "Processando..." : `Pagar R$${price}`}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
