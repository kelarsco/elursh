import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

// Auto-discover before/after images from /src/assets
// This avoids hard-coding filenames so Vite won't fail if you rename them.
const imageModules = import.meta.glob("/src/assets/*.{png,jpg,jpeg,webp}", {
  eager: true,
  as: "url",
});

const IMAGES = Object.entries(imageModules)
  .map(([path, src]) => {
    const lower = path.toLowerCase();
    const isAfter = lower.includes("after");
    const isBefore = lower.includes("before");
    if (!isAfter && !isBefore) return null;

    // Extract numeric index from filename, e.g. before3-..., after2.png
    const match = lower.match(/(?:before|after)\s*([0-9]+)/);
    const index = match ? Number(match[1]) : 0;
    const label = isAfter ? "After" : "Before";

    return { src, label, index };
  })
  .filter(Boolean)
  // Sort by pair index, then Before before After
  .sort((a, b) => {
    if (a.index !== b.index) return a.index - b.index;
    if (a.label === b.label) return 0;
    return a.label === "Before" ? -1 : 1;
  });

const BeforeAfterCarousel = () => {
  // If no matching images found, render nothing so the page doesn't error.
  if (!IMAGES.length) {
    return null;
  }

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
   const [activeIndex, setActiveIndex] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isHovered]);

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  };

  const goNext = () => {
    setIndex((prev) => (prev + 1) % IMAGES.length);
  };

  return (
    <section
      className="section-soft bg-slate-950/95 text-slate-50 min-h-screen flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full max-w-none px-4 sm:px-8 lg:px-12 mx-auto">
        <FadeIn>
          <p className="text-emerald-400 font-display font-semibold text-xs sm:text-sm uppercase tracking-[0.35em] mb-3 text-center">
            Before &amp; After
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-center max-w-3xl mx-auto">
            Real Store Makeovers Our Audits Help Create
          </h2>
          <p className="mt-4 text-center text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Swipe through multiple before-and-after transformations. You&apos;ll see how structure,
            branding, and UX changes combine to unlock higher conversion rates.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-10 relative w-full">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous stores"
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-900/80 border border-slate-700 p-2 text-slate-200 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next stores"
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-900/80 border border-slate-700 p-2 text-slate-200 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="overflow-hidden w-full">
              <div
                ref={trackRef}
                className="flex gap-0 transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${(index * 100) / 5}%)`,
                  width: `${(IMAGES.length * 100) / 5}%`,
                }}
              >
                {IMAGES.map((img, i) => (
                  <figure
                    key={i}
                    className="relative shrink-0 w-[15%] md:w-[16%] lg:w-[18%] overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer"
                    onClick={() => setActiveIndex(i)}
                  >
                    <img
                      src={img.src}
                      alt={`${img.label} ecommerce store layout`}
                      className="h-full w-full object-contain"
                    />
                    <figcaption className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
                      {img.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] sm:text-xs text-slate-500">
              Carousel auto-plays on loop. Hover to pause, or use the arrows to move manually.
            </p>
          </div>
        </FadeIn>
        {activeIndex !== null && IMAGES[activeIndex] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            onClick={() => setActiveIndex(null)}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-slate-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-slate-100 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                onClick={() => setActiveIndex(null)}
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={IMAGES[activeIndex].src}
                alt={`${IMAGES[activeIndex].label} ecommerce store layout enlarged`}
                className="h-full w-full object-contain bg-slate-900"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BeforeAfterCarousel;

