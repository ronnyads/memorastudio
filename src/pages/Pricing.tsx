import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Sparkles, Maximize, Palette } from "lucide-react";
import { Link } from "react-router-dom";

const products = [
  {
    icon: Sparkles,
    name: "Restauração",
    price: "29",
    description: "Restauração profissional com naturalidade",
    features: [
      "Remoção de ruído",
      "Correção de cor",
      "Melhora de nitidez",
      "Remoção de manchas/riscos",
      "1 revisão gratuita",
    ],
    popular: false,
  },
  {
    icon: Maximize,
    name: "Restauração + HD/4K",
    price: "49",
    description: "Restauração completa + upscale para impressão",
    features: [
      "Tudo da Restauração",
      "Upscale HD/4K",
      "Preserva textura natural",
      "Pronto para impressão/quadro",
      "1 revisão gratuita",
    ],
    popular: true,
  },
  {
    icon: Palette,
    name: "Foto Temática",
    price: "39",
    description: "Transforme em arte para aniversários e datas",
    features: [
      "Tema personalizável",
      "Nome, idade, data, cores",
      "Formato Story (1080x1920)",
      "Formato A4 (opcional)",
      "Tipografia elegante",
      "1 revisão gratuita",
    ],
    popular: false,
  },
];

const packages = [
  {
    name: "Pacote 5 Fotos",
    discount: "15%",
    description: "Escolha qualquer combinação de serviços",
    originalPrice: "145",
    price: "123",
  },
  {
    name: "Pacote 10 Fotos",
    discount: "25%",
    description: "Máxima economia para projetos grandes",
    originalPrice: "290",
    price: "217",
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
              Preços Transparentes
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              Invista nas suas{" "}
              <span className="text-gradient-gold">memórias</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
              Preço justo, resultado profissional. Pagamento seguro, sem surpresas.
            </p>
          </motion.div>

          {/* Individual Products */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {products.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`relative bg-gradient-card rounded-xl p-8 border flex flex-col ${
                  product.popular
                    ? "border-primary/50 shadow-gold"
                    : "border-border/50"
                }`}
              >
                {product.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-body font-semibold bg-gradient-gold text-primary-foreground px-4 py-1 rounded-full">
                    Mais Popular
                  </span>
                )}

                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <product.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="font-display text-2xl font-semibold mb-2">{product.name}</h3>
                <p className="text-muted-foreground font-body text-sm mb-6">{product.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-display font-bold text-gradient-gold">
                    R${product.price}
                  </span>
                  <span className="text-muted-foreground font-body text-sm ml-1">/foto</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {product.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-body text-foreground/80">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={product.popular ? "gold" : "gold-outline"}
                  className="w-full"
                  asChild
                >
                  <Link to={`/checkout?product=${encodeURIComponent(product.name)}&price=${product.price}`}>
                    Escolher
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Packages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold">
              Pacotes com <span className="text-gradient-gold">desconto</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-gradient-card rounded-xl p-8 border border-border/50 flex flex-col items-center text-center"
              >
                <span className="text-xs font-body font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                  {pkg.discount} OFF
                </span>
                <h3 className="font-display text-2xl font-semibold mb-2">{pkg.name}</h3>
                <p className="text-muted-foreground font-body text-sm mb-6">{pkg.description}</p>
                <div className="mb-6">
                  <span className="text-muted-foreground line-through text-sm mr-2">R${pkg.originalPrice}</span>
                  <span className="text-3xl font-display font-bold text-gradient-gold">
                    R${pkg.price}
                  </span>
                </div>
                <Button variant="gold-outline" className="w-full" asChild>
                  <Link to={`/checkout?product=${encodeURIComponent(pkg.name)}&price=${pkg.price}`}>
                    Escolher Pacote
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
