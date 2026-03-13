import { FadeIn } from "@/components/FadeIn";
import { XCircle, CheckCircle } from "lucide-react";

const withoutItems = [
  "Random changes with no strategy",
  "Confusing store structure",
  "Visitors leave without buying",
  "Ads waste money on non-buyers",
  "No predictable revenue",
];

const withItems = [
  "Clear brand positioning",
  "Conversion-focused design",
  "Strong trust signals throughout",
  "Marketing system that works",
  "Predictable, growing revenue",
];

const ComparisonSection = () => {
  return (
    <section className="section-dark py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            The Difference Is Clear
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto text-dark-fg">
            With a System vs. Without a System
          </h2>
        </FadeIn>

        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <FadeIn delay={0.1}>
            <div className="rounded-xl p-8 bg-danger-soft/10 border border-danger-soft/20 h-full">
              <h3 className="font-display font-bold text-xl text-danger-soft mb-6">
                Without Store Optimization
              </h3>
              <ul className="space-y-4">
                {withoutItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-danger-soft shrink-0 mt-0.5" />
                    <span className="text-dark-fg/80 font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="rounded-xl p-8 bg-emerald/10 border border-emerald/20 h-full">
              <h3 className="font-display font-bold text-xl text-emerald mb-6">
                With Store Audit & Optimization
              </h3>
              <ul className="space-y-4">
                {withItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald shrink-0 mt-0.5" />
                    <span className="text-dark-fg/80 font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
