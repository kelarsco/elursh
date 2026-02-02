import SplitText from "./SplitText";
import teambg from "@/assets/teambg.jpg";

const TeamSection = () => {
  const partners = [
    "Shopify Partners",
    "Klaviyo Elite",
  ];

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-start w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={teambg}
          alt="Team working"
          className="w-full h-full object-cover"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute inset-0 bg-primary/85"></div>
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 py-20 w-full flex flex-col items-start">
        <div className="max-w-3xl w-full text-left">
          <SplitText
            tag="h2"
            className="text-[30px] md:text-5xl lg:text-6xl font-sans font-semibold leading-[1.2] tracking-[-1.6px] mb-8 text-primary-foreground"
            style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}
            textAlign="left"
            splitType="chars"
            delay={20}
            duration={0.6}
            ease="power3.out"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
          >
            Forward thinking team of designers, developers and{" "}
            <span className="italic">strategic marketers.</span>
          </SplitText>
          
          {/* Partner Logos */}
          <div className="flex flex-wrap items-center gap-12 mt-16">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-primary-foreground/60 font-semibold text-lg">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
