import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TrackOrder = () => {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !orderNumber) {
      toast.error("Preencha e-mail e número do pedido");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("id, public_access_token")
      .eq("customer_email", email.trim().toLowerCase())
      .eq("order_number", orderNumber.trim().toUpperCase())
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      toast.error("Pedido não encontrado. Verifique os dados.");
      return;
    }

    navigate(`/pedido/${data.id}?token=${data.public_access_token}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl font-bold mb-2">Acompanhar Pedido</h1>
              <p className="text-muted-foreground font-body text-sm">
                Insira seu e-mail e código do pedido
              </p>
            </div>

            <form onSubmit={handleTrack} className="space-y-6">
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
              <div className="space-y-2">
                <Label htmlFor="order" className="font-body text-sm">Número do Pedido</Label>
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
                Buscar Pedido
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
