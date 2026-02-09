import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play, ArrowRight, ArrowUpRight } from "react-feather";
import heroPortrait from "@/assets/hero-portrait.jpg";
import hero1Bg from "@/assets/hero2.png";
import BlurText from "./BlurText";
import { useEffect, useRef, useState } from "react";

const HeroSection = () => {
  const { t } = useTranslation();
  const highlightRef = useRef(null);
  const commerceHighlightRef = useRef(null);
  const buttonRef = useRef(null);
  const [isHighlightVisible, setIsHighlightVisible] = useState(false);
  const [isCommerceHighlightVisible, setIsCommerceHighlightVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const originalPositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  
  const clientLogos = [
    "Shopify",
    "Amazon",
    "eBay",
    "Etsy",
    "WooCommerce",
  ];

  useEffect(() => {
    if (!highlightRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHighlightVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    observer.observe(highlightRef.current);
    return () => observer.disconnect();
  }, []);

  // Commerce highlight animation
  useEffect(() => {
    if (!commerceHighlightRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCommerceHighlightVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    observer.observe(commerceHighlightRef.current);
    return () => observer.disconnect();
  }, []);

  // Cursor follow effect for button
  useEffect(() => {
    if (!buttonRef.current) return;

    let currentPosition = { x: 0, y: 0 };
    let isInRange = false;

    // Store original position
    const updateOriginalPosition = () => {
      if (buttonRef.current) {
        // Temporarily reset transform to get accurate position
        const tempTransform = buttonRef.current.style.transform;
        buttonRef.current.style.transform = 'translate(0, 0)';
        requestAnimationFrame(() => {
          if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            originalPositionRef.current = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
            buttonRef.current.style.transform = tempTransform;
          }
        });
      }
    };

    // Initial position update
    setTimeout(updateOriginalPosition, 100);
    window.addEventListener('resize', updateOriginalPosition);

    const handleMouseMove = (e) => {
      if (!buttonRef.current) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Use stored original position or calculate from current
      let buttonCenterX = originalPositionRef.current.x;
      let buttonCenterY = originalPositionRef.current.y;

      if (!buttonCenterX || !buttonCenterY) {
        const rect = buttonRef.current.getBoundingClientRect();
        buttonCenterX = rect.left + rect.width / 2 - currentPosition.x;
        buttonCenterY = rect.top + rect.height / 2 - currentPosition.y;
        originalPositionRef.current = { x: buttonCenterX, y: buttonCenterY };
      }

      // Calculate distance between cursor and button center
      const distance = Math.sqrt(
        Math.pow(mouseX - buttonCenterX, 2) + Math.pow(mouseY - buttonCenterY, 2)
      );

      const followRange = 200; // 200px range

      if (distance < followRange) {
        if (!isInRange) {
          isInRange = true;
        }
        
        // Calculate how much to move (stronger effect closer to cursor)
        const strength = (followRange - distance) / followRange;
        const maxMove = 15; // Maximum pixels to move
        const moveX = (mouseX - buttonCenterX) * strength * (maxMove / followRange);
        const moveY = (mouseY - buttonCenterY) * strength * (maxMove / followRange);

        currentPosition = { x: moveX, y: moveY };

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          setButtonPosition(currentPosition);
        });
      } else {
        if (isInRange) {
          isInRange = false;
        }
        
        // Return to original position smoothly
        currentPosition = { x: 0, y: 0 };

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          setButtonPosition({ x: 0, y: 0 });
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateOriginalPosition);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="flex flex-col lg:flex-row">
        {/* Left Content */}
        <div 
          className="py-16 lg:py-24 px-8 lg:px-16 animate-slide-in-left relative flex flex-col justify-center h-[50vh] lg:h-screen w-full lg:w-[50vw] order-2 lg:order-none"
          style={{
            backgroundImage: `url(${hero1Bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#fce7f3'
          }}
        >
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-sans font-bold leading-[55px] mb-8 hero-title-large"
            style={{ paddingLeft: '0px', paddingRight: '0px', fontWeight: 700 }}
          >
            
            <span 
              className="font-bold relative inline-block text-[46px] md:text-[90px]" 
              ref={commerceHighlightRef}
              style={{
                fontWeight: 900,
                lineHeight: '42px'
              }}
            >
              {t("hero.ecommerce")}
              <span 
                className={`absolute bottom-1 left-0 h-3 bg-yellow-300 -z-10 ${isCommerceHighlightVisible ? 'animate-yellow-highlight' : 'yellow-highlight-hidden'}`} 
                style={{ 
                  width: 'calc(100% + 8px)', 
                  left: '-4px',
                  transformOrigin: 'left'
                }}
              ></span>
            </span>
            <br />
            <span
              className="text-[46px] md:text-[90px]"
              style={{
                fontWeight: 900,
                lineHeight: '25px'
              }}
            >
              {t("hero.backbone")}
            </span>
          </h1>
          <p 
            className="text-lg text-muted-foreground max-w-md mb-10"
            style={{ color: 'rgba(12, 9, 9, 1)', paddingLeft: '5px', paddingRight: '5px' }}
          >

{t("hero.tagline")}
          </p>
          <div className="flex items-center gap-6">
            <Link 
              ref={buttonRef}
              to="/store-audit" 
              className="cta-discover-button inline-flex items-center gap-6 group"
              aria-label="Free store audit"
              style={{
                transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
                transition: buttonPosition.x === 0 && buttonPosition.y === 0 ? 'transform 0.3s ease-out' : 'none'
              }}
            >
              <span className="cta-icon-circle w-14 h-14 rounded-full bg-[#2A2A2A] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1a1a1a]">
                <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="cta-text text-lg font-medium text-[rgba(36,30,30,1)] transition-all duration-300 group-hover:translate-x-1">
                {t("hero.freeStoreAudit")}
              </span>
            </Link>
          </div>

          {/* Award Winning Agency Badge */}
          <div className="absolute bottom-8 right-8 flex flex-col items-center" style={{ 
            background: 'transparent',
            boxSizing: 'content-box',
            marginTop: '-33px',
            marginBottom: '-33px',
            marginLeft: '-17px',
            marginRight: '-17px',
            fontSize: '42px'
          }}>
            <div 
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                letterSpacing: '0.05em',
                lineHeight: '1.2'
              }}
            >
              <BlurText
                text={t("hero.awardWinning")}
                delay={150}
                animateBy="words"
                direction="top"
                reverse={false}
                className="text-[#222222] font-bold uppercase tracking-tight text-[14px] lg:text-[19px]"
              />
            </div>
            <div 
              className="bg-[#222222]"
              style={{
                width: '1px',
                height: '30px',
                marginTop: '8px'
              }}
            />
          </div>
        </div>

        {/* Right Content - Image */}
        <div className="relative animate-slide-in-right h-[60vh] lg:h-screen w-full lg:w-[50vw] order-1 lg:order-none">
          <div className="relative w-full h-full">
            <img
              src={heroPortrait}
              alt="Ecommerce Expert"
              className="w-full h-full object-cover object-top animate-blur-fade-scale"
            />
            
            {/* Video Play Card */}
            <div 
              className="hidden lg:block absolute bottom-8 left-8 bg-white p-6 max-w-[280px] relative"
              style={{
                paddingTop: '77px',
                paddingBottom: '77px',
                paddingLeft: '122px',
                paddingRight: '122px',
                marginTop: '-423px',
                marginBottom: '-423px',
                marginLeft: '-31px',
                marginRight: '-31px',
                width: '444px',
                boxSizing: 'content-box',
                height: '301px'
              }}
            >
              {/* Expand Icon - Top Right */}
              <div className="absolute top-6 right-6">
                <ArrowUpRight className="w-6 h-6 text-[#222222]" strokeWidth={2} />
              </div>
              
              {/* hey! Text with Yellow Highlight */}
              <div className="mb-6" ref={highlightRef}>
                <span className="text-2xl font-serif italic text-[#222222] relative inline-block" style={{ fontSize: '50px' }}>
                  we<span className="relative inline-block px-1">
                    <span 
                      className={`absolute inset-0 bg-yellow-300 ${isHighlightVisible ? 'animate-yellow-highlight' : 'yellow-highlight-hidden'}`}
                      style={{ 
                        transformOrigin: 'left',
                        zIndex: 0
                      }}
                    ></span>
                    <span className="relative z-10">'re</span>
                  </span>
                </span>
              </div>
              
              {/* Main Content Text */}
              <div className="text-[#222222] font-bold text-lg leading-tight">
                <div style={{ fontSize: '37px' }}>World-cl<span className="text-[#222222]/40">a</span>ss</div>
                <div className="text-[#222222]/40" style={{ fontSize: '37px', fontWeight: 700, width: '352px' }}>Ecommerce Growth</div>
                <div className="text-[#222222]/40" style={{ fontSize: '37px' }}>Team.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Logos */}
      <div className="container-custom">
        <div className="py-12 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
            {clientLogos.map((logo) => (
              <span 
                key={logo} 
                className="text-xl md:text-2xl font-semibold text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
