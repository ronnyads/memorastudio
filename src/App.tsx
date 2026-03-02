import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useSearchParams } from "react-router-dom";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import OrderUpload from "./pages/OrderUpload";
import OrderStatus from "./pages/OrderStatus";
import OrderResult from "./pages/OrderResult";
import OrderHub from "./pages/OrderHub";
import TrackOrder from "./pages/TrackOrder";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import OrderAccess from "./pages/OrderAccess";
import OrderPortalGuard from "./components/OrderPortalGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const LegacyOrderRedirect = ({ to }: { to: "enviar" | "status" | "resultado" }) => {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const token = search.get("token");
  const suffix = token ? `?token=${encodeURIComponent(token)}` : "";
  return <Navigate to={`/pedido/${id}/${to}${suffix}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/precos" element={<Pricing />} />
          <Route path="/pricing" element={<Navigate to="/precos" replace />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/acesso-pedido" element={<OrderAccess />} />

          {/* New Portuguese routes */}
          <Route element={<OrderPortalGuard />}>
            <Route path="/pedido/:id" element={<OrderHub />} />
            <Route path="/pedido/:id/enviar" element={<OrderUpload />} />
            <Route path="/pedido/:id/status" element={<OrderStatus />} />
            <Route path="/pedido/:id/resultado" element={<OrderResult />} />
          </Route>
          <Route path="/acompanhar" element={<TrackOrder />} />

          {/* Legacy redirects */}
          <Route path="/order/:id/upload" element={<LegacyOrderRedirect to="enviar" />} />
          <Route path="/order/:id/status" element={<LegacyOrderRedirect to="status" />} />
          <Route path="/order/:id/result" element={<LegacyOrderRedirect to="resultado" />} />

          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
