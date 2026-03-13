import { FadeIn } from "@/components/FadeIn";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    business: "Fashion & Accessories Store",
    quote: "I was getting 500+ visitors a day and maybe 1-2 sales. After implementing the audit recommendations, my conversion rate tripled in just 6 weeks.",
  },
  {
    name: "James R.",
    business: "Home & Living Brand",
    quote: "The audit revealed issues I never would have found on my own. My store finally looks and feels like a legitimate brand. Revenue is up 180%.",
  },
  {
    name: "Maria L.",
    business: "Beauty & Skincare Store",
    quote: "I was ready to give up on ecommerce entirely. The audit gave me a clear plan. Three months later, I'm getting consistent daily sales for the first time.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-soft py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Real Results
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto">
            Store Owners Who Took Action
          </h2>
        </FadeIn>

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-background rounded-xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:border-emerald/20 hover:-translate-y-1 h-full flex flex-col group">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                  ))}
                </div>
                <p className="text-foreground font-body leading-relaxed flex-1 text-lg group-hover:text-emerald/90 transition-colors">
                  "{t.quote}"
                </p>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="font-display font-bold text-foreground text-lg">{t.name}</p>
                  <p className="text-muted-foreground text-sm font-body">{t.business}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
