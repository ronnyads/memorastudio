import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { to: "/", label: "Início", isRoute: true },
  { to: "/pricing", label: "Preços", isRoute: true },
  { to: "#como-funciona", label: "Como Funciona", isRoute: false },
  { to: "#servicos", label: "Serviços", isRoute: false },
];

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
            Memora Studio
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link key={link.to} to={link.to} className="text-sm font-body text-foreground/70 hover:text-primary transition-colors">
                {link.label}
              </Link>
            ) : (
              <a key={link.to} href={link.to} className="text-sm font-body text-foreground/70 hover:text-primary transition-colors">
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="gold" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/pricing">Começar Agora</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-border w-72">
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/" className="font-display text-xl font-bold text-gradient-gold">
                  Memora Studio
                </Link>
                {navLinks.map((link) =>
                  link.isRoute ? (
                    <Link key={link.to} to={link.to} className="text-sm font-body text-foreground/70 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.to} href={link.to} className="text-sm font-body text-foreground/70 hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  )
                )}
                <Button variant="gold" size="sm" asChild className="mt-4">
                  <Link to="/pricing">Começar Agora</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
