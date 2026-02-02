import { Smile, Volume2, Briefcase } from "react-feather";
import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SplitText from "./SplitText";

const AboutSection = () => {
  const highlightRef = useRef(null);
  const [isHighlightVisible, setIsHighlightVisible] = useState(false);
  const stats = [
    { icon: Smile, text: "350+ global eCommerce brands served" },
    { icon: Volume2, text: "Award-winning digital eCommerce agency" },
    { icon: Briefcase, text: "750+ high-impact projects completed in the past year" },
  ];

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

  useEffect(() => {
    if (!highlightRef.current) return;
    
    // Trigger highlight after a delay to match SplitText animation
    const timer = setTimeout(() => {
      setIsHighlightVisible(true);
    }, 800); // Delay to allow text animation to complete
    
    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    setIsHighlightVisible(true);
  };

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container-custom">
        {/* Top Section */}
        <div className="block lg:grid lg:grid-cols-2 gap-16 items-start mb-16 text-center lg:text-left">
          {/* Left Content - Main Text */}
          <div>
            <SplitText
              tag="h2"
              className="text-4xl md:text-5xl lg:text-[52px] font-sans font-semibold leading-[1.2] mb-8 text-[#222222] lg:tracking-[-1.6px]"
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
              We are a bold{" "}
              <span className="font-bold">eCommerce</span>{" "}
              team built to{" "}
              <span className="font-bold relative inline-block italic" ref={highlightRef}>
                scale all brands.
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
          </div>

          {/* Right Content - 20+ Years Section */}
          <div 
            className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-center lg:justify-start" 
            data-aos="fade-up" 
            data-aos-duration="1000"
            data-aos-easing="ease-out"
            data-aos-delay="200"
          >
            {/* Large Circle */}
            <div className="w-48 h-48 md:w-52 md:h-52 lg:w-48 lg:h-48 rounded-full bg-[#222222] flex items-center justify-center flex-shrink-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)'
            }}>
              <span className="text-6xl md:text-7xl lg:text-6xl font-bold text-white">20+</span>
            </div>
            
            {/* Text Block */}
            <div className="flex flex-col pt-2 text-center lg:text-left">
              <h3 className="text-lg md:text-xl lg:text-lg font-bold uppercase text-[#222222] mb-3 tracking-tight" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                20+ YEARS OF EXPERIENCE
              </h3>
              <p className="text-base md:text-lg lg:text-base text-[#222222] leading-relaxed max-w-md mx-auto lg:mx-0" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '32px' }}>
              We provide eCommerce design and digital services focused on usability, performance, and sales growth.    </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Statistics */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => {
            const parts = stat.text.split(' ');
            const number = parts[0];
            const rest = parts.slice(1).join(' ');
            return (
              <div 
                key={index} 
                className="flex items-start justify-between gap-4" 
                style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '1rem' }}
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-easing="ease-out"
                data-aos-delay={300 + (index * 150)}
              >
                <p className="text-base md:text-lg text-[#222222] leading-relaxed flex-1">
                  <span className="font-bold">{number}</span> {rest}
                </p>
                <stat.icon className="w-6 h-6 text-[#222222] flex-shrink-0" strokeWidth={1.5} style={{ overflow: stat.icon === Smile ? 'visible' : 'hidden' }} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
