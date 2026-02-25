import { motion } from "framer-motion";
import { CreditCard, Upload, Download } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    title: "1. Escolha e Pague",
    description: "Selecione o serviço ideal e faça o pagamento seguro. Rápido e sem burocracia.",
  },
  {
    icon: Upload,
    title: "2. Envie sua Foto",
    description: "Faça upload da sua foto e preencha o briefing. Nós cuidamos do resto.",
  },
  {
    icon: Download,
    title: "3. Receba o Resultado",
    description: "Acompanhe o status em tempo real e baixe sua foto restaurada em alta qualidade.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            Simples e Rápido
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Como <span className="text-gradient-gold">funciona</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative bg-gradient-card rounded-xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 group"
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:shadow-gold transition-all duration-500">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
