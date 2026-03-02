import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

const OrderAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user, isLoading: authLoading } = useAuthSession();

  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const redirectPath = useMemo(() => searchParams.get("redirect") || "/acompanhar", [searchParams]);

  useEffect(() => {
    if (!authLoading && session) {
      navigate(redirectPath, { replace: true });
    }
  }, [authLoading, session, redirectPath, navigate]);

  useEffect(() => {
    const prefillEmail = searchParams.get("email");
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [searchParams]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Informe seu e-mail");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("request-order-login", {
      body: {
        email: normalizedEmail,
        order_number: orderNumber.trim().toUpperCase() || null,
        redirect_path: redirectPath,
      },
    });
    setLoading(false);

    if (error) {
      toast.error("Não foi possível enviar o acesso por e-mail.");
      return;
    }

    setSent(true);
    toast.success(data?.message || "Se existir pedido para este e-mail, você receberá o link de acesso.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl font-bold mb-2">Acesso ao Pedido</h1>
              <p className="text-muted-foreground font-body text-sm">
                Entre com seu e-mail para acessar com segurança
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-sm">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-secondary border-border"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="font-body text-sm">Número do pedido (opcional)</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="MEM-XXXXXXXX"
                  className="bg-secondary border-border"
                />
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <MailCheck className="w-5 h-5 mr-2" />}
                {loading ? "Enviando..." : "Enviar link de acesso"}
              </Button>
            </form>

            {sent && (
              <div className="mt-6 bg-muted/40 border border-border rounded-lg p-4">
                <p className="text-sm font-body text-muted-foreground">
                  Verifique seu e-mail e clique no link recebido. Depois você será redirecionado para continuar.
                </p>
              </div>
            )}

            {!authLoading && user?.email && (
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground font-body mb-2">
                  Sessão ativa: {user.email}
                </p>
                <Button variant="secondary" onClick={() => navigate("/acompanhar")}>
                  Ir para acompanhamento
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderAccess;
