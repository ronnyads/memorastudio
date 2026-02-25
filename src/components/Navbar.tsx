import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-gradient-gold">
            Levres Studio
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-body text-foreground/70 hover:text-primary transition-colors">
            Início
          </Link>
          <Link to="/pricing" className="text-sm font-body text-foreground/70 hover:text-primary transition-colors">
            Preços
          </Link>
          <a href="#como-funciona" className="text-sm font-body text-foreground/70 hover:text-primary transition-colors">
            Como Funciona
          </a>
          <a href="#servicos" className="text-sm font-body text-foreground/70 hover:text-primary transition-colors">
            Serviços
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="gold" size="sm" asChild>
            <Link to="/pricing">Começar Agora</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
