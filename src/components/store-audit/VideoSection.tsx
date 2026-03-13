import { FadeIn } from "@/components/FadeIn";
import heroDiagram from "@/assets/hero-diagram.jpg";

const VideoSection = () => {
  return (
    <section className="section-light py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-center text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4">
            The System Behind Successful Stores
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto">
            There's a Proven Structure Behind Every High-Converting Store
          </h2>
          <p className="mt-6 text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Successful ecommerce brands don't happen by accident. They follow a strategic system that optimizes every touchpoint from first click to checkout.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12 rounded-xl overflow-hidden shadow-2xl border border-border">
            <img
              src={heroDiagram}
              alt="Ecommerce store optimization strategy diagram showing conversion funnel, trust signals, brand positioning, and marketing systems"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default VideoSection;
