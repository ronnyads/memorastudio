import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

const BeforeAfterSlider = ({
  beforeSrc,
  afterSrc,
  beforeLabel = "Antes",
  afterLabel = "Depois",
  className = "",
}: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  // Fallback: if no images, show elegant CTA card
  if (!beforeSrc || !afterSrc) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex flex-col items-center justify-center gap-4 p-6">
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
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl select-none cursor-col-resize ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      <div className="relative w-full aspect-[4/3]">
        {/* After image (full width, background) */}
        <div className="absolute inset-0">
          <img src={afterSrc} alt={afterLabel} className="w-full h-full object-cover" />
        </div>

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img src={beforeSrc} alt={beforeLabel} className="w-full h-full object-cover" />
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 text-xs font-body font-semibold bg-background/80 text-foreground px-2 py-1 rounded-md backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 text-xs font-body font-semibold bg-primary/90 text-primary-foreground px-2 py-1 rounded-md backdrop-blur-sm">
          {afterLabel}
        </span>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary shadow-gold cursor-col-resize z-10"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary border-2 border-primary-foreground shadow-elevated flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
              <path d="M4 8H12M4 8L6 6M4 8L6 10M12 8L10 6M12 8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
