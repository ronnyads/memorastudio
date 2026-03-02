import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Search,
  Eye,
  Download,
  RefreshCw,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderAsset, OrderBrief, Job, OrderStatus } from "@/lib/orderTypes";
import { orderStatusLabels } from "@/lib/orderTypes";

const statusColors: Record<string, string> = {
  created: "bg-muted text-muted-foreground",
  paid: "bg-blue-500/20 text-blue-400",
  awaiting_upload: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-primary/20 text-primary",
  ready: "bg-green-500/20 text-green-400",
  delivered: "bg-green-500/20 text-green-400",
  needs_revision: "bg-purple-500/20 text-purple-400",
  cancelled: "bg-destructive/20 text-destructive",
};

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Auth check
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!data) {
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
    enabled: isAdmin === true,
  });

  const { data: orderDetails } = useQuery({
    queryKey: ["admin-order-details", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return null;
      const [assets, brief, jobs] = await Promise.all([
        supabase.from("order_assets").select("*").eq("order_id", selectedOrder.id),
        supabase.from("order_brief").select("*").eq("order_id", selectedOrder.id).maybeSingle(),
        supabase.from("jobs").select("*").eq("order_id", selectedOrder.id).order("created_at", { ascending: false }),
      ]);
      return {
        assets: (assets.data ?? []) as unknown as OrderAsset[],
        brief: brief.data as unknown as OrderBrief | null,
        jobs: (jobs.data ?? []) as unknown as Job[],
      };
    },
    enabled: !!selectedOrder,
  });

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }
    toast.success(`Status atualizado para: ${orderStatusLabels[newStatus]}`);
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleUploadOutput = async (orderId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${orderId}/output.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("order-files")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("Erro ao fazer upload");
        return;
      }

      // Update or create order_assets
      const { data: existing } = await supabase
        .from("order_assets")
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("order_assets")
          .update({ output_url: `order-files/${filePath}` })
          .eq("id", existing.id);
      } else {
        await supabase.from("order_assets").insert({
          order_id: orderId,
          output_url: `order-files/${filePath}`,
        });
      }

      await updateOrderStatus(orderId, "ready");
      toast.success("Output enviado e pedido marcado como pronto!");
      queryClient.invalidateQueries({ queryKey: ["admin-order-details"] });
    };
    input.click();
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.customer_email.toLowerCase().includes(search.toLowerCase()) && !o.order_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    done: orders.filter((o) => o.status === "ready" || o.status === "delivered").length,
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card p-6 hidden lg:flex flex-col">
        <Link to="/" className="font-display text-xl font-bold text-gradient-gold mb-10">
          Memora Studio
        </Link>
        <nav className="space-y-2 flex-1">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-body">
            <LayoutDashboard className="w-4 h-4" /> Pedidos
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted text-sm font-body transition-colors">
            <Package className="w-4 h-4" /> Produtos
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted text-sm font-body transition-colors">
            <Settings className="w-4 h-4" /> Configurações
          </button>
        </nav>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
          className="flex items-center gap-3 px-3 py-2 text-muted-foreground text-sm font-body hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Painel Admin</h1>
              <p className="text-muted-foreground font-body text-sm">Gerencie todos os pedidos</p>
            </div>
            <div className="hidden md:flex gap-4">
              {[
                { label: "Total", value: stats.total.toString() },
                { label: "Processando", value: stats.processing.toString() },
                { label: "Concluídos", value: stats.done.toString() },
              ].map((s, i) => (
                <div key={i} className="bg-gradient-card rounded-lg p-4 border border-border/50 min-w-[100px] text-center">
                  <p className="text-2xl font-display font-bold text-gradient-gold">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-body">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar pedido ou e-mail..." className="pl-10 bg-secondary border-border" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "awaiting_upload", "processing", "ready", "needs_revision", "delivered"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                    filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s === "all" ? "Todos" : orderStatusLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-gradient-card rounded-xl border border-border/50 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium">Pedido</th>
                    <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium hidden md:table-cell">Cliente</th>
                    <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium">Tipo</th>
                    <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium hidden md:table-cell">Valor</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-sm font-body font-medium">{order.order_number}</td>
                      <td className="p-4 text-sm font-body text-muted-foreground hidden md:table-cell">{order.customer_email}</td>
                      <td className="p-4 text-sm font-body">{order.product_type}</td>
                      <td className="p-4">
                        <span className={`text-xs font-body px-2 py-1 rounded-full ${statusColors[order.status] || ""}`}>
                          {orderStatusLabels[order.status]}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-body font-medium hidden md:table-cell">R${Number(order.total).toFixed(0)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Ver detalhes" onClick={() => setSelectedOrder(order)}>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Upload resultado" onClick={() => handleUploadOutput(order.id)}>
                            <Upload className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground font-body text-sm">
                Nenhum pedido encontrado.
              </div>
            )}
          </div>
        </motion.div>

        {/* Detail Panel */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border/50 p-6 overflow-y-auto z-50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">{selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="space-y-4 text-sm font-body">
              <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span>{selectedOrder.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedOrder.customer_email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{selectedOrder.product_type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>R${Number(selectedOrder.total).toFixed(0)}</span></div>

              <div className="space-y-2">
                <span className="text-muted-foreground">Atualizar Status</span>
                <Select value={selectedOrder.status} onValueChange={(v) => updateOrderStatus(selectedOrder.id, v as OrderStatus)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(orderStatusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {orderDetails?.brief && (
                <div className="space-y-2">
                  <span className="text-muted-foreground font-semibold">Briefing</span>
                  <pre className="bg-muted/30 rounded-lg p-3 text-xs overflow-auto max-h-48">
                    {JSON.stringify(orderDetails.brief.data, null, 2)}
                  </pre>
                </div>
              )}

              {orderDetails?.jobs && orderDetails.jobs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-muted-foreground font-semibold">Jobs</span>
                  {orderDetails.jobs.map((job) => (
                    <div key={job.id} className="bg-muted/30 rounded-lg p-3 text-xs">
                      <p>Status: {job.status} | Tentativas: {job.attempts}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button variant="gold" className="w-full" onClick={() => handleUploadOutput(selectedOrder.id)}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Resultado
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Admin;
