import { FadeIn } from "@/components/FadeIn";
import { CheckCircle } from "lucide-react";

const items = [
  "You get traffic but barely any sales",
  "Your ads bring visitors but not buyers",
  "Your store looks okay but doesn't convert",
  "You don't know what to fix first",
  "You want to turn your store into a real brand",
  "You've invested time and money but feel stuck",
];

const ChecklistSection = () => {
  return (
    <section className="section-soft py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Is This You?
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto">
            This Store Audit Is For You If...
          </h2>
        </FadeIn>

        <div className="mt-12 grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="flex items-start gap-4 p-5 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle className="h-6 w-6 text-emerald shrink-0 mt-0.5" />
                <p className="font-body text-foreground font-medium">{item}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChecklistSection;
