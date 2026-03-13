import { FadeIn } from "@/components/FadeIn";
import { Search, FileText, Lightbulb, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Store Analysis",
    description: "We analyze your store's structure, design, and user experience from a buyer's perspective.",
  },
  {
    icon: FileText,
    title: "Issue Identification",
    description: "We identify every conversion blocker — from trust signals to checkout friction.",
  },
  {
    icon: Lightbulb,
    title: "Detailed Audit Report",
    description: "You receive a comprehensive report with prioritized, actionable recommendations.",
  },
  {
    icon: Rocket,
    title: "Actionable Roadmap",
    description: "We provide clear next steps so you know exactly what to improve and in what order.",
  },
];

const ProcessSection = () => {
  return (
    <section className="section-light py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            How It Works
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto">
            Your Audit in 4 Simple Steps
          </h2>
        </FadeIn>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="h-7 w-7 text-emerald" />
                </div>
                <div className="text-emerald font-display font-bold text-sm mb-2">
                  Step {i + 1}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
