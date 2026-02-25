import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Maximize, Palette } from "lucide-react";
import { Link } from "react-router-dom";

const products = [
  {
    icon: Sparkles,
    name: "Restauração",
    price: "29",
    features: ["Remoção de ruído", "Correção de cor", "1 revisão grátis"],
  },
  {
    icon: Maximize,
    name: "HD/4K",
    price: "49",
    popular: true,
    features: ["Tudo da Restauração", "Upscale HD/4K", "Pronto p/ impressão"],
  },
  {
    icon: Palette,
    name: "Tema",
    price: "39",
    features: ["Layout personalizado", "Nome, idade, cores", "Formato Story"],
  },
];

const PricingPreview = () => {
  return (
    <section id="precos" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            Preços Transparentes
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Invista nas suas <span className="text-gradient-gold">memórias</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          {products.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-card rounded-xl p-6 border text-center ${
                p.popular ? "border-primary/50 shadow-gold" : "border-border/50"
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{p.name}</h3>
              <p className="text-3xl font-display font-bold text-gradient-gold mb-4">
                R${p.price}<span className="text-sm text-muted-foreground font-body">/foto</span>
              </p>
              <ul className="space-y-2 mb-6 text-left">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs font-body text-foreground/80">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="gold" size="lg" className="px-10 py-6 text-base" asChild>
            <Link to="/pricing">Ver todos os preços e pacotes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;
