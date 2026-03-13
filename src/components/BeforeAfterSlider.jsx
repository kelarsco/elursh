import { useState, useRef, useCallback } from "react";
import { FadeIn } from "@/components/FadeIn";
import beforeImg from "@/assets/before-store.jpg";
import afterImg from "@/assets/after-store.jpg";

const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e) => {
    if (isDragging.current) updatePosition(e.clientX);
  };
  const handleTouchMove = (e) => {
    updatePosition(e.touches[0].clientX);
  };

  return (
    <section className="section-soft py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Visual Proof
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto">
            See the Transformation
          </h2>
          <p className="mt-6 text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Drag the slider to see how a structured audit transforms an ecommerce store.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div
            ref={containerRef}
            className="mt-12 relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl cursor-col-resize select-none aspect-[3/2]"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            {/* After image (full) */}
            <img src={afterImg} alt="Store after optimization" className="absolute inset-0 w-full h-full object-cover" />
            
            {/* Before image (clipped) */}
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
              <img src={beforeImg} alt="Store before optimization" className="w-full h-full object-cover" />
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald cursor-col-resize z-10"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-emerald shadow-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary-foreground">
                  <path d="M7 4L3 10L7 16M13 4L17 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-dark/80 text-dark-fg px-3 py-1.5 rounded-md text-sm font-display font-semibold z-20">
              Before
            </div>
            <div className="absolute top-4 right-4 bg-emerald/90 text-primary-foreground px-3 py-1.5 rounded-md text-sm font-display font-semibold z-20">
              After
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
