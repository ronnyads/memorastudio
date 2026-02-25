import { motion } from "framer-motion";
import { useState } from "react";
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
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

type OrderStatus = "paid" | "awaiting_upload" | "processing" | "review" | "done";

const statusLabels: Record<OrderStatus, string> = {
  paid: "Pago",
  awaiting_upload: "Aguardando Upload",
  processing: "Processando",
  review: "Revisão",
  done: "Concluído",
};

const statusColors: Record<OrderStatus, string> = {
  paid: "bg-blue-500/20 text-blue-400",
  awaiting_upload: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-primary/20 text-primary",
  review: "bg-purple-500/20 text-purple-400",
  done: "bg-green-500/20 text-green-400",
};

const mockOrders = [
  { id: "ORD-001", customer: "maria@email.com", product: "Restauração + HD/4K", status: "processing" as OrderStatus, date: "25/02/2026", price: "R$49" },
  { id: "ORD-002", customer: "pedro@email.com", product: "Restauração", status: "done" as OrderStatus, date: "24/02/2026", price: "R$29" },
  { id: "ORD-003", customer: "ana@email.com", product: "Foto Temática", status: "awaiting_upload" as OrderStatus, date: "25/02/2026", price: "R$39" },
  { id: "ORD-004", customer: "joao@email.com", product: "Pacote 5 Fotos", status: "paid" as OrderStatus, date: "25/02/2026", price: "R$123" },
  { id: "ORD-005", customer: "lucia@email.com", product: "Restauração", status: "review" as OrderStatus, date: "23/02/2026", price: "R$29" },
];

const Admin = () => {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = mockOrders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card p-6 hidden lg:flex flex-col">
        <Link to="/" className="font-display text-xl font-bold text-gradient-gold mb-10">
          Levres Studio
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

        <button className="flex items-center gap-3 px-3 py-2 text-muted-foreground text-sm font-body hover:text-destructive transition-colors">
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

            {/* Stats */}
            <div className="hidden md:flex gap-4">
              {[
                { label: "Total", value: "5" },
                { label: "Processando", value: "1" },
                { label: "Concluídos", value: "1" },
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
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pedido ou e-mail..."
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "paid", "awaiting_upload", "processing", "review", "done"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                    filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s === "all" ? "Todos" : statusLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-gradient-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium">Pedido</th>
                  <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium hidden md:table-cell">Cliente</th>
                  <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium">Produto</th>
                  <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-xs font-body text-muted-foreground font-medium hidden md:table-cell">Valor</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-sm font-body font-medium">{order.id}</td>
                    <td className="p-4 text-sm font-body text-muted-foreground hidden md:table-cell">{order.customer}</td>
                    <td className="p-4 text-sm font-body">{order.product}</td>
                    <td className="p-4">
                      <span className={`text-xs font-body px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-body font-medium hidden md:table-cell">{order.price}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Ver detalhes">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Reprocessar">
                          <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Entregar">
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground font-body text-sm">
                Nenhum pedido encontrado.
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
