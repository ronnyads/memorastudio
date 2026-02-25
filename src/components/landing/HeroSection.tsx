import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BeforeAfterSlider from "./BeforeAfterSlider";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-dark">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

      <div className="container relative z-10 mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-6"
            >
              Restauração Profissional de Fotos
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="font-display text-5xl md:text-7xl font-bold leading-[1.1] mb-6"
            >
              Suas memórias merecem{" "}
              <span className="text-gradient-gold">vida nova</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 font-body leading-relaxed"
            >
              Restauração com IA profissional que preserva a essência natural das suas fotos.
              Sem efeito plástico. Sem perder identidade.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button variant="gold" size="lg" className="text-base px-10 py-6" asChild>
                <Link to="/pricing">Começar Agora</Link>
              </Button>
              <Button variant="gold-outline" size="lg" className="text-base px-10 py-6" asChild>
                <a href="#antes-depois">Ver Exemplos</a>
              </Button>
            </motion.div>
          </div>

          {/* Right — Before/After Slider */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <BeforeAfterSlider
              beforeSrc="/placeholder.svg"
              afterSrc="/placeholder.svg"
              className="shadow-elevated"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
