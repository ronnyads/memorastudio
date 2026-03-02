import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function OrderPortalGuard() {
  const { session, isLoading } = useAuthSession();
  const location = useLocation();
  const hasLegacyToken = new URLSearchParams(location.search).has("token");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session && !hasLegacyToken) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/acesso-pedido?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <Outlet />;
}
