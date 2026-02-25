import { useState, useRef, useCallback, useMemo } from "react";

export type DegradeType = "scratches" | "dark" | "blur" | "torn" | "bw" | "lowres";

interface BeforeAfterSliderProps {
  afterSrc: string;
  beforeSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
  degradeType?: DegradeType;
  composite?: boolean;
  className?: string;
}

const DEGRADE_FILTERS: Record<DegradeType, string> = {
  scratches: "grayscale(0.3) sepia(0.4) contrast(0.8) brightness(0.85)",
  dark: "brightness(0.3) contrast(1.3) sepia(0.15)",
  blur: "blur(2px) grayscale(0.2) brightness(0.9)",
  torn: "grayscale(0.5) sepia(0.3) contrast(0.85)",
  bw: "grayscale(1) contrast(0.9) sepia(0.15)",
  lowres: "blur(3px) brightness(0.95)",
};

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`;

const BeforeAfterSlider = ({
  afterSrc,
  beforeSrc,
  beforeLabel = "Antes",
  afterLabel = "Depois",
  degradeType = "scratches",
  composite = false,
  className = "",
}: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const useFallback = !composite && !beforeSrc;
  const beforeImage = beforeSrc || afterSrc;

  const beforeStyle = useMemo(() => {
    if (!useFallback) return {};
    return { filter: DEGRADE_FILTERS[degradeType] };
  }, [useFallback, degradeType]);

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
        {composite ? (
          <>
            {/* Composite mode: single image, show right half as "after" */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={afterSrc}
                alt={afterLabel}
                className="h-full object-cover"
                style={{ width: "200%", objectPosition: "100% center" }}
                loading="lazy"
              />
            </div>

            {/* Composite mode: show left half as "before", clipped */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <img
                src={afterSrc}
                alt={beforeLabel}
                className="h-full object-cover"
                style={{ width: "200%", objectPosition: "0% center" }}
                loading="lazy"
              />
            </div>
          </>
        ) : (
          <>
            {/* After image (full width, background) */}
            <div className="absolute inset-0">
              <img src={afterSrc} alt={afterLabel} className="w-full h-full object-cover" loading="lazy" />
            </div>

            {/* Before image (clipped) */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="w-full h-full object-cover"
                style={beforeStyle}
                loading="lazy"
              />
              {useFallback && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-60"
                  style={{ backgroundImage: NOISE_SVG }}
                />
              )}
              {useFallback && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
                  }}
                />
              )}
            </div>
          </>
        )}

        {/* Labels */}
        <span className="absolute top-3 left-3 text-xs font-body font-semibold bg-background/80 text-foreground px-2 py-1 rounded-md backdrop-blur-sm z-20">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 text-xs font-body font-semibold bg-primary/90 text-primary-foreground px-2 py-1 rounded-md backdrop-blur-sm z-20">
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
