import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "react-feather";
import SplitText from "./SplitText";
import AOS from "aos";
import "aos/dist/aos.css";
import hero1Bg from "@/assets/hero2.png";

const JournalSection = () => {
  const highlightRef = useRef(null);
  const [isHighlightVisible, setIsHighlightVisible] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out",
      once: false,
      offset: 150,
      mirror: true,
    });
  }, []);

  const handleAnimationComplete = () => {
    setIsHighlightVisible(true);
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* Left Side - Content */}
          <div>
            <SplitText
              tag="h2"
              className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.2] tracking-[-1.6px] mb-6 text-[#222222]"
              style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}
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
              Let's build and scale your ecommerce store to{" "}
              <span className="relative inline-block" ref={highlightRef}>
                7figures a month
                <span 
                  className={`absolute bottom-1 left-0 h-3 bg-yellow-300 -z-10 ${isHighlightVisible ? 'animate-yellow-highlight' : 'yellow-highlight-hidden'}`} 
                  style={{ 
                    width: 'calc(100% + 8px)', 
                    left: '-4px',
                    transformOrigin: 'left'
                  }}
                ></span>
              </span>
            </SplitText>
            <p 
              className="text-lg md:text-xl text-[#222222] mb-8" 
              style={{ fontFamily: 'Space Grotesk', fontWeight: 400 }}
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-easing="ease-out"
              data-aos-delay="200"
            >
              Your success is our priority
            </p>
            
            {/* CTA Button */}
            <div
              className="flex flex-wrap gap-4"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-easing="ease-out"
              data-aos-delay="300"
            >
              <Link
                to="/improve-store"
                className="cta-discover-button inline-flex items-center gap-6 group"
                aria-label="Boost sales"
              >
                <span className="cta-icon-circle w-14 h-14 rounded-full bg-[#2A2A2A] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1a1a1a]">
                  <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                </span>
                <span className="cta-text text-lg font-medium text-[rgba(36,30,30,1)] transition-all duration-300 group-hover:translate-x-1">
                  Boost sales
                </span>
              </Link>
            </div>
          </div>

          {/* Right Side - Stats */}
          <div
            className="border border-border grid grid-cols-2 h-full min-h-0"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-easing="ease-out"
            data-aos-delay="200"
          >
            <Link
              to="/store-audit"
              className="group relative flex flex-col justify-between px-8 py-10 border-r border-border hover:bg-muted/30 transition-colors overflow-hidden"
              style={{
                backgroundImage: `url(${hero1Bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "#fce7f3",
              }}
            >
              <div className="absolute top-6 right-6 text-[#222222] group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="text-[30px] tracking-[-1.6px] font-semibold text-[#222222] pt-1 pr-12">
                free
              </div>
              <p className="text-[14px] lg:text-[19px] text-muted-foreground max-w-[13rem] mt-6">
                Audit your store to detect issues and uncover growth opportunities.
              </p>
            </Link>
            <Link
              to="/improve-store"
              className="group relative flex flex-col justify-between px-8 py-10 bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="absolute top-6 right-6 text-[#222222] group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="text-[30px] tracking-[-1.6px] font-semibold text-[#222222] pt-1 pr-12">
                100+
              </div>
              <p className="text-[14px] lg:text-[19px] text-muted-foreground max-w-[13rem] mt-6">
                Services to help you improve and scale your store.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JournalSection;
