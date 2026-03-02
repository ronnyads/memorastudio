import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, user, isLoading } = useAuthSession();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate(`/acesso-pedido?redirect=${encodeURIComponent("/acompanhar")}`, { replace: true });
    }
  }, [isLoading, session, navigate]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Preencha o numero do pedido.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("customer_email", (user?.email || "").toLowerCase())
      .eq("order_number", orderNumber.trim().toUpperCase())
      .maybeSingle();
    setLoading(false);

    if (error || !data?.id) {
      toast.error("Pedido nao encontrado para esta conta.");
      return;
    }

    navigate(`/pedido/${data.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl font-bold mb-2">Acompanhar Pedido</h1>
              <p className="text-muted-foreground font-body text-sm">
                Conta autenticada: {user?.email}
              </p>
            </div>

            <form onSubmit={handleTrack} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="order" className="font-body text-sm">Numero do pedido</Label>
                <Input
                  id="order"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="MEM-XXXXXXXX"
                  className="bg-secondary border-border"
                />
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                Buscar pedido
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/acesso-pedido", { replace: true });
                }}
              >
                Trocar conta
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TrackOrder;
