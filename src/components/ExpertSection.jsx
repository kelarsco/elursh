import { FadeIn } from "@/components/FadeIn";
import expertPhoto from "@/assets/about_me.png";

const ExpertSection = () => {
  return (
    <section className="section-light py-20 sm:py-28">
      <div className="container-section">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <FadeIn>
            <div className="relative">
              <img
                src={expertPhoto}
                alt="Ecommerce optimization expert"
                className="rounded-2xl shadow-xl w-full max-w-sm mx-auto"
                loading="lazy"
              />
              <div className="absolute -top-4 -right-4 bg-emerald text-primary-foreground px-5 py-3 rounded-xl font-display font-bold shadow-lg">
                200+ Stores Audited
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div>
              <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4">
                Your Audit Expert
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl">
                I've Been Where You Are
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground font-body leading-relaxed">
                <p>
                  After years of working with ecommerce stores of all sizes, I've seen the same patterns over and over. Talented store owners with great products — struggling because their store wasn't built to convert.
                </p>
                <p>
                  I developed a systematic approach to auditing and optimizing stores that focuses on the fundamentals: structure, trust, and conversion design.
                </p>
                <p>
                  Every audit I conduct is personalized. I don't use templates. I analyze your specific store, your specific audience, and provide a clear roadmap tailored to your situation.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default ExpertSection;
