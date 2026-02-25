import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload as UploadIcon, Image, Send } from "lucide-react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const OrderUpload = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "Restauração";

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [briefing, setBriefing] = useState("");

  const isTheme = product.toLowerCase().includes("temática") || product.toLowerCase().includes("tema");

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Envie apenas imagens");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = () => {
    if (!file) {
      toast.error("Envie uma foto primeiro");
      return;
    }
    toast.success("Foto enviada para processamento!");
    navigate(`/order/${id}/status`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-2">
                Pedido #{id}
              </p>
              <h1 className="font-display text-3xl font-bold mb-2">Envie sua Foto</h1>
              <p className="text-muted-foreground font-body text-sm">
                {product} — pagamento confirmado ✓
              </p>
            </div>

            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-8 ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-card" />
                  <p className="text-sm font-body text-muted-foreground">{file?.name}</p>
                  <p className="text-xs font-body text-primary cursor-pointer">Clique para trocar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-body font-medium">Arraste sua foto aqui</p>
                    <p className="text-sm text-muted-foreground font-body">ou clique para selecionar</p>
                  </div>
                </div>
              )}
            </div>

            {/* Briefing Form */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 space-y-6 mb-8">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Briefing do Pedido
              </h3>

              {isTheme ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Nome</Label>
                    <Input placeholder="Nome da pessoa" className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Idade</Label>
                    <Input placeholder="Ex: 5 anos" className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Tema</Label>
                    <Input placeholder="Ex: Princesas, Super-heróis" className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Cores</Label>
                    <Input placeholder="Ex: Rosa e dourado" className="bg-secondary border-border" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="font-body text-sm">Frase / Texto</Label>
                    <Input placeholder="Ex: Feliz Aniversário!" className="bg-secondary border-border" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Instruções adicionais</Label>
                    <Textarea
                      value={briefing}
                      onChange={(e) => setBriefing(e.target.value)}
                      placeholder="Descreva o que deseja: intensidade da restauração, remoção de manchas específicas, colorização..."
                      className="bg-secondary border-border min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button variant="gold" size="lg" className="w-full text-base py-6" onClick={handleSubmit}>
              <Send className="w-5 h-5 mr-2" />
              Enviar para Processamento
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderUpload;
