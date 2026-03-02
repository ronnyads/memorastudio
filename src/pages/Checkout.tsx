import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ProductType } from "@/lib/orderTypes";

const productNameToType: Record<string, ProductType> = {
  "Restauração": "restore",
  "Restauração + HD/4K": "upscale",
  "Foto Temática": "theme",
  "Pacote 5 Fotos": "restore",
  "Pacote 10 Fotos": "restore",
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "Restauração";
  const price = searchParams.get("price") || "29";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorParam === "payment_failed") {
      toast.error("O pagamento não foi aprovado. Tente novamente.");
    }
  }, [errorParam]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setLoading(true);

    try {
      const productType = productNameToType[product] || "restore";

      const { data, error } = await supabase.functions.invoke("create-mp-preference", {
        body: {
          product,
          price,
          customer_email: email.trim().toLowerCase(),
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          product_type: productType,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (!data?.init_point) {
        throw new Error("URL de pagamento não recebida");
      }

      // Redirect to Mercado Pago checkout
      window.location.href = data.init_point;
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl font-bold mb-2">Finalizar Pedido</h1>
              <p className="text-muted-foreground font-body text-sm">
                Pagamento seguro via Mercado Pago
              </p>
            </div>

            {errorParam === "payment_failed" && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-center gap-3 text-sm font-body text-destructive">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                O pagamento não foi aprovado. Por favor, tente novamente.
              </div>
            )}

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
                <Label htmlFor="name" className="font-body text-sm">Nome completo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-secondary border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-sm">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-secondary border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-body text-sm">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3 text-sm font-body text-muted-foreground">
                <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                Você será redirecionado ao Mercado Pago para concluir o pagamento com segurança.
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full text-base py-6"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {loading ? "Redirecionando..." : `Pagar R$${price}`}
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
