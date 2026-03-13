import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ProblemSection = () => {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const problems = [
    "Poor branding that fails to build recognition",
    "Weak trust signals that make visitors hesitate",
    "Confusing navigation that frustrates shoppers",
    "No marketing system driving consistent traffic",
    "Lack of automation leaving revenue on the table",
  ];

  return (
    <section className="section-dark py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            The Hard Truth
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto text-dark-fg">
            Your Store Was Never Structured to Convert
          </h2>
          <p className="mt-6 text-center text-dark-fg/70 text-lg max-w-2xl mx-auto">
            Most ecommerce stores were built to look decent — not to convert visitors into paying customers. That's why you get traffic but not sales.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12 max-w-2xl mx-auto space-y-4">
            {problems.map((problem, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-dark-fg/5 border border-dark-fg/10">
                <span className="text-emerald font-display font-bold text-lg mt-0.5">0{i + 1}</span>
                <p className="text-dark-fg/80 font-body">{problem}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-12 text-center">
            <Button variant="cta" size="xl" onClick={scrollToForm}>
              Get Your Free Store Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default ProblemSection;
