import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quanto tempo demora a restauração?",
    answer: "A maioria dos pedidos é entregue em até 24 horas. Pedidos com prioridade são processados em até 6 horas.",
  },
  {
    question: "E se eu não gostar do resultado?",
    answer: "Todos os pedidos incluem 1 revisão gratuita. Basta solicitar os ajustes desejados e nós refazemos sem custo adicional.",
  },
  {
    question: "Quais formatos de imagem são aceitos?",
    answer: "Aceitamos JPG, PNG, TIFF e WebP. Recomendamos enviar na maior resolução disponível para melhores resultados.",
  },
  {
    question: "A restauração altera a identidade da pessoa?",
    answer: "Jamais. Nossa IA é configurada para preservar a identidade natural. Nada de 'efeito plástico' ou alterações faciais.",
  },
  {
    question: "Como funciona o pagamento?",
    answer: "O pagamento é feito antes do envio da foto, via cartão de crédito ou Pix. Após a confirmação, você faz o upload e envia o briefing.",
  },
  {
    question: "Posso pedir restauração + tema ao mesmo tempo?",
    answer: "Sim! Nossos pacotes de 5 e 10 fotos permitem combinar qualquer mix de serviços com desconto.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            Dúvidas Frequentes
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Perguntas <span className="text-gradient-gold">Frequentes</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-gradient-card rounded-xl border border-border/50 px-6"
              >
                <AccordionTrigger className="font-body text-sm font-medium hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
