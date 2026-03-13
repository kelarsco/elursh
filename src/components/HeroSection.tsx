import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import { ArrowRight, AlertTriangle } from "lucide-react";

const HeroSection = () => {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="section-dark py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(hsl(var(--dark-fg)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--dark-fg)) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />
      
      <div className="container-section relative z-10">
        <FadeIn>
          <div className="flex items-center gap-2 justify-center mb-8">
            <AlertTriangle className="h-5 w-5 text-emerald" />
            <span className="text-emerald font-display font-semibold text-sm uppercase tracking-widest">
              Free Store Audit
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-center leading-tight max-w-5xl mx-auto text-dark-fg">
            7 Hidden Problems Quietly Killing Your Ecommerce Store Sales
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-4 text-center font-display font-medium text-emerald text-lg sm:text-xl">
            (#4 Is the One Most Store Owners Never Notice)
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mt-8 text-center text-dark-fg/70 font-body text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Most ecommerce stores don't fail because of a bad product. They fail because of hidden issues in their structure, branding, and marketing systems that silently drain revenue every single day.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="cta" size="xl" onClick={scrollToForm}>
              Request a Free Store Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-dark-fg/50 text-sm font-body">
              No commitment required. 100% free.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HeroSection;
