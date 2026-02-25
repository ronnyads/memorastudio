import { motion } from "framer-motion";
import { Sparkles, Maximize, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Sparkles,
    title: "Restauração Profissional",
    description: "Remove ruído, corrige cores, melhora nitidez e elimina manchas — tudo com naturalidade.",
    features: ["Remoção de ruído", "Correção de cor", "Nitidez natural", "Remoção de manchas"],
    tag: "Mais Popular",
  },
  {
    icon: Maximize,
    title: "Restauração + HD/4K",
    description: "Tudo da restauração profissional + upscale para alta resolução. Perfeito para impressão.",
    features: ["Tudo da Restauração", "Upscale HD/4K", "Textura preservada", "Pronto p/ impressão"],
    tag: "Premium",
  },
  {
    icon: Palette,
    title: "Foto Temática",
    description: "Transforme fotos em arte temática para aniversários e datas especiais. Layouts prontos e elegantes.",
    features: ["Temas personalizados", "Nome, idade, data", "Story & A4", "Tipografia elegante"],
    tag: "Criativo",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            Nossos Serviços
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Escolha o ideal para{" "}
            <span className="text-gradient-gold">suas memórias</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative bg-gradient-card rounded-xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 group flex flex-col"
            >
              <span className="absolute top-4 right-4 text-xs font-body font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {service.tag}
              </span>

              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:shadow-gold transition-all duration-500">
                <service.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="font-display text-2xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed mb-6">
                {service.description}
              </p>

              <ul className="space-y-2 mb-8 flex-1">
                {service.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm font-body text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button variant="gold-outline" className="w-full" asChild>
                <Link to="/pricing">Ver Preços</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
