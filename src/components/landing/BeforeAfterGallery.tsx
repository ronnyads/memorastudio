import { useState } from "react";
import { motion } from "framer-motion";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { beforeAfterExamples, exampleCategories } from "@/data/landingExamples";

const BeforeAfterGallery = () => {
  const [activeFilter, setActiveFilter] = useState("todos");

  const filtered = activeFilter === "todos"
    ? beforeAfterExamples
    : beforeAfterExamples.filter((e) => e.category === activeFilter);

  return (
    <section id="antes-depois" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            Resultados Reais
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Antes & <span className="text-gradient-gold">Depois</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Veja a transformação com seus próprios olhos. Arraste o slider para comparar.
          </p>
        </motion.div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {exampleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                activeFilter === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filtered.map((example, i) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <BeforeAfterSlider
                afterSrc={example.afterSrc}
                beforeSrc={example.beforeSrc}
                degradeType={example.degradeType}
              />
              <p className="text-sm font-body text-muted-foreground mt-2 text-center">
                {example.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterGallery;
