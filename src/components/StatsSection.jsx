import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "./SplitText";

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const target = Number(value);
    if (!containerRef.current || Number.isNaN(target)) return;

    const node = containerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;

          const duration = 1500;
          const startTime = performance.now();

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(target * eased));

            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          };

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={containerRef}>
      {displayValue.toLocaleString()}
    </span>
  );
};

const StatsSection = () => {
  const [isHighlightVisible, setIsHighlightVisible] = useState(false);

  const stats = [
    { number: "1200", suffix: "+", label: "Satisfied eCommerce clients worldwide" },
    { number: "10", suffix: "M+", label: "Revenue generated for brands" },
    { number: "480", suffix: "+", label: "eCommerce brands scaled" },
    { number: "2.5", suffix: "M+", label: "Ad spend managed across platforms" }
  ];

  const handleAnimationComplete = () => {
    setIsHighlightVisible(true);
  };

  return (
    <section className="stats-section section-padding bg-background border-t border-border">
      <div className="container-custom">
        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] gap-12 lg:gap-20 items-stretch">
          {/* Left Content */}
          <div className="flex flex-col justify-between max-w-xl">
            <div>
              <SplitText
                tag="h2"
                className="text-[30px] md:text-[3rem] lg:text-[3.25rem] leading-tight font-sans font-semibold tracking-[-1.6px] text-[#222222]"
                style={{ fontFamily: "Space Grotesk", fontWeight: 600 }}
                textAlign="left"
                splitType="chars"
                delay={20}
                duration={0.6}
                ease="power3.out"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                onLetterAnimationComplete={handleAnimationComplete}
              >
               Research-led strategy built to scale {" "}
                <span className="relative inline-block">
                  <span className="relative z-10">online stores.</span>
                  <span
                    className={`absolute bottom-1 left-0 h-3 bg-yellow-300 -z-10 ${isHighlightVisible ? "animate-yellow-highlight" : "yellow-highlight-hidden"}`}
                    style={{
                      width: "calc(100% + 8px)",
                      left: "-4px",
                      transformOrigin: "left",
                    }}
                  ></span>
                </span>{" "}
                media.
              </SplitText>

              <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-md">
                We combine human empathy and intelligent data to provide the highest level of satisfaction.
              </p>
            </div>

            <div className="mt-10">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold bg-[#222222] text-white tracking-[0.04em] uppercase shadow-sm hover:bg-black transition-colors"
              >
                LET&apos;S TALK NOW
              </Link>
            </div>
          </div>

          {/* Right Content - Stats Grid */}
          <div className="border border-border grid grid-cols-2">
            {stats.map((stat, index) => {
              const isTopRow = index < 2;
              const isLeftCol = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`flex flex-col justify-between px-8 py-10 bg-background animate-slide-up ${
                    isTopRow ? "border-b border-border" : ""
                  } ${isLeftCol ? "border-r border-border" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-[14px] md:text-[14px] text-muted-foreground max-w-[13rem]">
                    {stat.label}
                  </p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-[30px] md:text-[30px] tracking-[-1.6px] font-semibold text-[#222222]">
                      <span className="relative -top-[7px] mr-[2px] text-[26px] leading-none">
                        ↑
                      </span>
                      <AnimatedNumber value={stat.number} />
                      {stat.suffix}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
