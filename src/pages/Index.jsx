import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import StatsSection from "@/components/StatsSection";
import TeamSection from "@/components/TeamSection";
import JournalSection from "@/components/JournalSection";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const scrollToEl = () => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      const timer = setTimeout(scrollToEl, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Elursh | eCommerce Solutions – Build, Scale & Grow Your ecommerce Brand</title>
        <meta name="description" content="Elursh delivers eCommerce solutions that drive real results. From store audits and design to strategy and analytics – partner with us to build and scale your brand." />
        <link rel="canonical" href="https://elursh.com/" />
      </Helmet>
      <Header />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <JournalSection />
      <CaseStudiesSection />
      <StatsSection />
      <TeamSection />
      
      {/* Marquee Section */}
      <section className="w-full py-16 overflow-hidden border-t border-border">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-foreground">strategy.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-muted-foreground/30">business.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-foreground">marketing.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-muted-foreground/30">growth.</span>
          {/* Duplicate for seamless loop */}
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-foreground">strategy.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-muted-foreground/30">business.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-foreground">marketing.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-muted-foreground/30">growth.</span>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
