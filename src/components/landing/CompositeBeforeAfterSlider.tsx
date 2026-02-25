import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CompositeBeforeAfterSliderProps {
  compositeSrc?: string;
  title?: string;
  className?: string;
  leftLabel?: string;
  rightLabel?: string;
}

const CompositeBeforeAfterSlider = ({
  compositeSrc,
  title,
  className,
  leftLabel = "Antes",
  rightLabel = "Depois",
}: CompositeBeforeAfterSliderProps) => {
  const [value, setValue] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setValue(Math.round((x / rect.width) * 100));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setValue(50);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fallback: no image
  if (!compositeSrc) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl", className)}>
        <div className="w-full aspect-[8/3] bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-lg font-display font-semibold text-foreground text-center">
            Veja o resultado em segundos
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Começar agora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {title && (
        <p className="text-sm font-body text-muted-foreground text-center">{title}</p>
      )}

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl select-none cursor-col-resize aspect-[8/3]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* LAYER: BEFORE (left half of composite) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${compositeSrc})`,
            backgroundSize: "200% 100%",
            backgroundPosition: "0% 50%",
          }}
        />

        {/* LAYER: AFTER (right half of composite), clipped */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${compositeSrc})`,
            backgroundSize: "200% 100%",
            backgroundPosition: "100% 50%",
            clipPath: `inset(0 0 0 ${value}%)`,
          }}
        />

        {/* Labels */}
        <span className="absolute top-3 left-3 text-xs font-body font-semibold bg-background/80 text-foreground px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
          {leftLabel}
        </span>
        <span className="absolute top-3 right-3 text-xs font-body font-semibold bg-primary/90 text-primary-foreground px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
          {rightLabel}
        </span>

        {/* Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary/80 z-10 pointer-events-none"
          style={{ left: `${value}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary border-2 border-primary-foreground shadow-elevated flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
              <path d="M4 8H12M4 8L6 6M4 8L6 10M12 8L10 6M12 8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Hidden range for accessibility */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20"
          aria-label="Slider antes e depois"
        />
      </div>
    </div>
  );
};

export default CompositeBeforeAfterSlider;
