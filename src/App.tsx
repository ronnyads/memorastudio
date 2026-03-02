import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

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

          {/* New Portuguese routes */}
          <Route path="/pedido/:id" element={<OrderHub />} />
          <Route path="/pedido/:id/enviar" element={<OrderUpload />} />
          <Route path="/pedido/:id/status" element={<OrderStatus />} />
          <Route path="/pedido/:id/resultado" element={<OrderResult />} />
          <Route path="/acompanhar" element={<TrackOrder />} />

          {/* Legacy redirects */}
          <Route path="/order/:id/upload" element={<Navigate to="../pedido/:id/enviar" replace />} />
          <Route path="/order/:id/status" element={<Navigate to="../pedido/:id/status" replace />} />
          <Route path="/order/:id/result" element={<Navigate to="../pedido/:id/resultado" replace />} />

          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
