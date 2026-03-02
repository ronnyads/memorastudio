import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, CreditCard, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ProductType } from "@/lib/orderTypes";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;

if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
}

const productNameToType: Record<string, ProductType> = {
  "Restauração": "restore",
  "Restauração + HD/4K": "upscale",
  "Foto Temática": "theme",
  "Pacote 5 Fotos": "restore",
  "Pacote 10 Fotos": "restore",
};

type CardPaymentSubmitData = {
  token?: string;
  payment_method_id?: string;
  installments?: number;
  issuer_id?: string;
  payer?: {
    identification?: {
      type?: string;
      number?: string;
    };
  };
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
  const [showPayment, setShowPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam === "payment_failed") {
      toast.error("O pagamento não foi aprovado. Tente novamente.");
    }
  }, [errorParam]);

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (!MP_PUBLIC_KEY) {
      toast.error("Chave pública do Mercado Pago não configurada");
      return;
    }
    setPaymentError(null);
    setShowPayment(true);
  };

  const sendOtpAndRedirect = async (orderId: string, targetPath: string, orderNumber?: string | null) => {
    const normalizedEmail = email.trim().toLowerCase();
    const otpResponse = await supabase.functions.invoke("request-order-login", {
      body: {
        email: normalizedEmail,
        order_number: orderNumber || null,
        redirect_path: targetPath,
      },
    });

    if (otpResponse.error) {
      toast.warning("Pagamento confirmado, mas não foi possível enviar o acesso automático. Solicite o link na próxima tela.");
    } else {
      toast.success("Pagamento confirmado. Enviamos um link de acesso para seu e-mail.");
    }

    navigate(`/acesso-pedido?redirect=${encodeURIComponent(targetPath)}&email=${encodeURIComponent(normalizedEmail)}`);
  };

  const handlePaymentSubmit = async (formData: CardPaymentSubmitData) => {
    setLoading(true);
    setPaymentError(null);

    try {
      const productType = productNameToType[product] || "restore";

      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          token: formData.token,
          payment_method_id: formData.payment_method_id,
          installments: formData.installments,
          issuer_id: formData.issuer_id,
          payer_email: email.trim().toLowerCase(),
          product,
          price,
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          product_type: productType,
          identification_type: formData.payer?.identification?.type,
          identification_number: formData.payer?.identification?.number,
        },
      });

      if (error) throw error;
      if (data?.error) {
        setPaymentError(data.mp_detail || data.error);
        setLoading(false);
        return;
      }

      if (data?.status === "approved") {
        await sendOtpAndRedirect(
          data.order_id,
          `/pedido/${data.order_id}/enviar`,
          data.order_number ?? null,
        );
      } else if (data?.status === "rejected") {
        setPaymentError(
          getRejectMessage(data.status_detail) || "Pagamento recusado. Tente outro cartão.",
        );
        setLoading(false);
      } else {
        toast.info("Pagamento em processamento...");
        await sendOtpAndRedirect(
          data.order_id,
          `/pedido/${data.order_id}/status`,
          data.order_number ?? null,
        );
      }
    } catch (err) {
      console.error(err);
      setPaymentError("Erro ao processar pagamento. Tente novamente.");
      setLoading(false);
    }
  };

  const handlePaymentError = (error: unknown) => {
    console.error("CardPayment error:", error);
    setPaymentError("Erro no formulário de pagamento. Verifique os dados.");
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
                Pagamento seguro com cartão de crédito
              </p>
            </div>

            {(errorParam === "payment_failed" || paymentError) && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-center gap-3 text-sm font-body text-destructive">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {paymentError || "O pagamento não foi aprovado. Por favor, tente novamente."}
              </div>
            )}

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

            {!showPayment ? (
              <form onSubmit={handleContinueToPayment} className="space-y-6">
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
                  Seus dados de pagamento são processados com segurança pelo Mercado Pago.
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full text-base py-6"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Continuar para pagamento
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-body text-muted-foreground mb-4">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>{name} — {email}</span>
                  <button
                    onClick={() => { setShowPayment(false); setPaymentError(null); }}
                    className="ml-auto text-primary underline text-xs"
                  >
                    Alterar
                  </button>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-body text-sm">Processando pagamento...</span>
                  </div>
                )}

                <div className={loading ? "opacity-50 pointer-events-none" : ""}>
                  <CardPayment
                    initialization={{
                      amount: parseFloat(price),
                    }}
                    onSubmit={handlePaymentSubmit}
                    onError={handlePaymentError}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3 text-sm font-body text-muted-foreground">
                  <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                  Pagamento seguro. Os dados do cartão são criptografados pelo Mercado Pago.
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

function getRejectMessage(statusDetail: string): string | null {
  const messages: Record<string, string> = {
    cc_rejected_bad_filled_card_number: "Número do cartão incorreto.",
    cc_rejected_bad_filled_date: "Data de validade incorreta.",
    cc_rejected_bad_filled_other: "Dados do cartão incorretos.",
    cc_rejected_bad_filled_security_code: "Código de segurança incorreto.",
    cc_rejected_blacklist: "Cartão recusado. Use outro cartão.",
    cc_rejected_call_for_authorize: "Autorize o pagamento com o banco.",
    cc_rejected_card_disabled: "Cartão desabilitado. Contate o banco.",
    cc_rejected_duplicated_payment: "Pagamento duplicado. Já foi realizado.",
    cc_rejected_high_risk: "Pagamento recusado por segurança.",
    cc_rejected_insufficient_amount: "Saldo insuficiente.",
    cc_rejected_max_attempts: "Limite de tentativas. Use outro cartão.",
    cc_rejected_other_reason: "Cartão recusado. Use outro cartão.",
  };
  return messages[statusDetail] || null;
}

export default Checkout;
