import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Clara S.",
    text: "Incrível! A foto do meu avô ficou perfeita, como se tivesse sido tirada ontem. Chorei de emoção.",
    rating: 5,
  },
  {
    name: "Pedro Henrique L.",
    text: "Mandei uma foto toda desbotada dos anos 60. Voltou nítida, com cores naturais. Super recomendo!",
    rating: 5,
  },
  {
    name: "Ana Beatriz R.",
    text: "Fiz o tema de aniversário da minha filha. Ficou lindo, profissional demais. Todos amaram!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            Depoimentos
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            O que nossos clientes{" "}
            <span className="text-gradient-gold">dizem</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-gradient-card rounded-xl p-8 border border-border/50"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground/80 font-body text-sm leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <p className="text-sm font-body font-semibold text-foreground">
                {t.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
