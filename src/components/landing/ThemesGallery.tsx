import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { themes, themeExamples } from "@/data/landingExamples";
import BeforeAfterSlider from "./BeforeAfterSlider";

const ThemesGallery = () => {
  return (
    <section id="temas" className="py-24 bg-gradient-card">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            Fotos Temáticas
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Temas de <span className="text-gradient-gold">Aniversário</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Transforme fotos em arte personalizada para festas e datas especiais.
          </p>
        </motion.div>

        {/* Theme sliders */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {themeExamples.map((theme, i) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-secondary/30 rounded-xl p-4 border border-border/50"
            >
              <BeforeAfterSlider
                afterSrc={theme.afterSrc}
                beforeSrc={theme.beforeSrc}
                beforeLabel="Original"
                afterLabel="Arte"
                degradeType="bw"
              />
              <div className="flex items-center justify-between mt-3">
                <h3 className="font-display text-base font-semibold">{theme.title}</h3>
                <Button variant="gold-outline" size="sm" className="text-xs" asChild>
                  <Link to={`/pricing?theme=${theme.id}`}>Quero esse tema</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Remaining themes as emoji cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {themes.map((theme, i) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-secondary/50 rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all hover:shadow-gold text-center"
            >
              <span className="text-4xl mb-3 block">{theme.emoji}</span>
              <h3 className="font-display text-lg font-semibold mb-1">{theme.name}</h3>
              <p className="text-xs font-body text-muted-foreground mb-4 leading-relaxed">
                {theme.description}
              </p>
              <Button variant="gold-outline" size="sm" className="w-full text-xs" asChild>
                <Link to={`/pricing?theme=${theme.id}`}>Quero esse tema</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThemesGallery;
