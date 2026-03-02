import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload as UploadIcon, Image, Send, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { themes } from "@/data/landingExamples";
import { useOrder } from "@/hooks/useOrder";
import { supabase } from "@/integrations/supabase/client";
import { productTypeLabels } from "@/lib/orderTypes";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const OrderUpload = () => {
  const navigate = useNavigate();
  const { order, isLoading, error, token } = useOrder();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Restoration briefing
  const [fidelity, setFidelity] = useState("maxima");
  const [removeSpots, setRemoveSpots] = useState(true);
  const [reduceNoise, setReduceNoise] = useState(true);
  const [recoverColors, setRecoverColors] = useState(false);
  const [improveSharpness, setImproveSharpness] = useState(true);
  const [upscaleHD, setUpscaleHD] = useState(false);
  const [briefing, setBriefing] = useState("");

  // HD/4K briefing
  const [usage, setUsage] = useState("");

  // Theme briefing
  const [themeName, setThemeName] = useState("");
  const [personName, setPersonName] = useState("");
  const [age, setAge] = useState("");
  const [date, setDate] = useState("");
  const [colors, setColors] = useState("");
  const [phrase, setPhrase] = useState("");
  const [format, setFormat] = useState("story");

  const handleFile = useCallback((f: File) => {
    if (!f.type.match(/^image\/(jpeg|png|heic|heif)$/i) && !f.type.startsWith("image/")) {
      toast.error("Envie apenas imagens (JPG, PNG)");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Máximo 15MB.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      // Check resolution
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 800 && img.height < 800) {
          toast.warning("Imagem com resolução baixa. O resultado pode ser limitado.");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const buildBriefData = () => {
    if (!order) return {};
    if (order.product_type === "theme") {
      return { themeName, personName, age, date, colors, phrase, format };
    }
    if (order.product_type === "upscale") {
      return { usage, notes: briefing };
    }
    return {
      fidelity,
      removeSpots,
      reduceNoise,
      recoverColors,
      improveSharpness,
      upscaleHD,
      notes: briefing,
    };
  };

  const handleSubmit = async () => {
    if (!file || !order) {
      toast.error("Envie uma foto primeiro");
      return;
    }
    setSubmitting(true);

    try {
      // Upload file to storage via edge function
      const fileExt = file.name.split(".").pop();
      const filePath = `${order.id}/input.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.functions.invoke("upload-file", {
        body: { order_id: order.id, token: token, file_path: filePath },
      });

      if (uploadError) throw uploadError;

      // Upload the actual file using the signed URL
      const { signedUrl } = uploadData;
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // Get public URL for reference
      const inputUrl = `order-files/${filePath}`;

      // Save asset
      await supabase.from("order_assets").insert({
        order_id: order.id,
        input_url: inputUrl,
      });

      // Save brief
      await supabase.from("order_brief").insert({
        order_id: order.id,
        data: buildBriefData(),
      });

      // Create job
      await supabase.from("jobs").insert({
        order_id: order.id,
        type: order.product_type,
        status: "queued",
      });

      // Update order status
      await supabase
        .from("orders")
        .update({ status: "processing" })
        .eq("id", order.id);

      toast.success("Foto enviada para processamento!");
      navigate(`/pedido/${order.id}/status?token=${token}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 text-center">
          <h1 className="font-display text-3xl font-bold">Pedido não encontrado</h1>
        </section>
        <Footer />
      </div>
    );
  }

  // Payment gate
  if (order.payment_status !== "approved") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-lg text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">Pagamento Pendente</h1>
              <p className="text-muted-foreground font-body mb-8">
                O upload só é liberado após a confirmação do pagamento.
              </p>
              <Button variant="gold" asChild>
                <a href={`/checkout?product=${encodeURIComponent(productTypeLabels[order.product_type])}&price=${order.total}`}>
                  Voltar ao Pagamento
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const isTheme = order.product_type === "theme";
  const isHD = order.product_type === "upscale";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-2">
                {order.order_number}
              </p>
              <h1 className="font-display text-3xl font-bold mb-2">Envie sua Foto</h1>
              <p className="text-muted-foreground font-body text-sm">
                {productTypeLabels[order.product_type]} — pagamento confirmado ✓
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
                accept="image/jpeg,image/png,image/heic,image/heif"
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
                    <p className="text-sm text-muted-foreground font-body">JPG, PNG ou HEIC — máx 15MB</p>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Tema</Label>
                      <Select value={themeName} onValueChange={setThemeName}>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.emoji} {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Formato</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="story">Story (1080x1920)</SelectItem>
                          <SelectItem value="a4">A4 (impressão)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Nome</Label>
                      <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Nome da pessoa" className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Idade</Label>
                      <Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex: 5 anos" className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Data</Label>
                      <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Ex: 15/03/2026" className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Cores</Label>
                      <Input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Ex: Rosa e dourado" className="bg-secondary border-border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Frase / Texto</Label>
                    <Input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="Ex: Feliz Aniversário!" className="bg-secondary border-border" />
                  </div>
                </div>
              ) : isHD ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Para qual uso?</Label>
                    <Select value={usage} onValueChange={setUsage}>
                      <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione o uso" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quadro">Quadro / Moldura</SelectItem>
                        <SelectItem value="album">Álbum de fotos</SelectItem>
                        <SelectItem value="impressao">Impressão geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Instruções adicionais</Label>
                    <Textarea value={briefing} onChange={(e) => setBriefing(e.target.value)} placeholder="Algo mais que devemos saber?" className="bg-secondary border-border min-h-[80px]" />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="font-body text-sm font-semibold">Nível de fidelidade</Label>
                    <RadioGroup value={fidelity} onValueChange={setFidelity} className="flex flex-col gap-3">
                      <div className="flex items-start space-x-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                        <RadioGroupItem value="maxima" id="maxima" className="mt-0.5" />
                        <div>
                          <Label htmlFor="maxima" className="font-body text-sm font-medium cursor-pointer">
                            🔒 Fidelidade Máxima <span className="text-xs text-primary ml-1">(recomendado)</span>
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">Preserva fielmente rosto, traços e identidade.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                        <RadioGroupItem value="aprimorar" id="aprimorar" className="mt-0.5" />
                        <div>
                          <Label htmlFor="aprimorar" className="font-body text-sm font-medium cursor-pointer">✨ Aprimorar leve</Label>
                          <p className="text-xs text-muted-foreground mt-1">Permite melhorias sutis além da restauração.</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-body text-sm font-semibold">O que restaurar</Label>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="spots" checked={removeSpots} onCheckedChange={(v) => setRemoveSpots(!!v)} />
                        <Label htmlFor="spots" className="font-body text-sm cursor-pointer">Remover riscos, manchas e rasgos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="noise" checked={reduceNoise} onCheckedChange={(v) => setReduceNoise(!!v)} />
                        <Label htmlFor="noise" className="font-body text-sm cursor-pointer">Reduzir ruído/granulação</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="colors" checked={recoverColors} onCheckedChange={(v) => setRecoverColors(!!v)} />
                        <Label htmlFor="colors" className="font-body text-sm cursor-pointer">Recuperar cores</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sharpness" checked={improveSharpness} onCheckedChange={(v) => setImproveSharpness(!!v)} />
                        <Label htmlFor="sharpness" className="font-body text-sm cursor-pointer">Melhorar nitidez (leve)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="upscale" checked={upscaleHD} onCheckedChange={(v) => setUpscaleHD(!!v)} />
                        <Label htmlFor="upscale" className="font-body text-sm cursor-pointer">Upscale HD/4K</Label>
                      </div>
                    </div>
                  </div>

                  {fidelity === "maxima" && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">
                        <span className="font-semibold text-foreground">🔒 Modo Fidelidade Máxima:</span>{" "}
                        Traços faciais serão preservados exatamente. Apenas restauração e correção.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="font-body text-sm">Instruções adicionais</Label>
                    <Textarea value={briefing} onChange={(e) => setBriefing(e.target.value)} placeholder="Descreva detalhes específicos..." className="bg-secondary border-border min-h-[80px]" />
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full text-base py-6"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
              {submitting ? "Enviando..." : "Enviar para Processamento"}
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderUpload;
