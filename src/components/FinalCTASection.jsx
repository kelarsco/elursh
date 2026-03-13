import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection = () => {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="section-dark py-20 sm:py-28">
      <div className="container-section text-center">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4">
            Take The First Step
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl max-w-4xl mx-auto text-dark-fg leading-tight">
            Your Store Is Just a Few Strategic Improvements Away From Consistent Revenue
          </h2>
          <p className="mt-6 text-dark-fg/70 text-lg max-w-2xl mx-auto font-body">
            Most stores that implement audit recommendations see measurable improvements within 3 to 6 months. The question isn't whether your store can improve — it's how quickly you want it to happen.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10">
            <Button variant="cta" size="xl" onClick={scrollToForm}>
              Request Your Free Store Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-dark-fg/50 text-sm font-body">
              Limited spots available each month. No obligation.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default FinalCTASection;
