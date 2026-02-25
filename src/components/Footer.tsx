import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="font-display text-xl font-bold text-gradient-gold">
            Memora Studio
          </Link>
          <div className="flex gap-6 text-sm font-body text-muted-foreground">
            <Link to="/pricing" className="hover:text-primary transition-colors">Preços</Link>
            <a href="#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a>
            <a href="#servicos" className="hover:text-primary transition-colors">Serviços</a>
          </div>
          <p className="text-xs font-body text-muted-foreground">
            © 2026 Memora Studio. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
