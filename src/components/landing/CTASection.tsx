import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Pronto para restaurar{" "}
            <span className="text-gradient-gold">suas memórias?</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg mb-4 leading-relaxed">
            Comece agora e veja a magia acontecer. Pagamento seguro, resultado profissional.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary font-body mb-10">
            <Shield className="w-4 h-4" />
            <span>Garantia: se não gostar, ajustamos 1 vez sem custo</span>
          </div>
          <Button variant="gold" size="lg" className="text-base px-12 py-6" asChild>
            <Link to="/pricing">Começar Agora</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
