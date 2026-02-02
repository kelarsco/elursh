import { ArrowRight } from "react-feather";
import SplitText from "./SplitText";
import { portfolios } from "@/data/portfolios";

const CaseStudiesSection = () => {
  const caseStudies = portfolios.slice(0, 6);

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <SplitText
            tag="h2"
            className="text-4xl md:text-5xl lg:text-6xl font-sans font-semibold leading-[1.2] mb-8 text-[#222222]"
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
            Trusted by<br />Growing <em>Brands</em>
          </SplitText>
          
          {/* View All Projects Button */}
          <a 
            href="/all-projects" 
            className="inline-flex items-center gap-4 md:gap-6 group relative"
          >
            <span className="cta-icon-circle w-14 h-14 rounded-full bg-[#2A2A2A] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1a1a1a]">
              <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="flex items-center">
              <span className="cta-text text-lg font-medium text-[rgba(36,30,30,1)] transition-all duration-300 group-hover:translate-x-1">
                view all projects
              </span>
              {/* Portfolio Count Badge */}
              <span className="ml-2 inline-flex md:hidden bg-secondary text-secondary-foreground text-xs font-semibold rounded-full w-6 h-6 items-center justify-center">
                {portfolios.length}
              </span>
            </span>
            {/* Desktop badge in corner */}
            <span className="hidden md:flex absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full w-6 h-6 items-center justify-center">
              {portfolios.length}
            </span>
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((study, index) => (
            <a
              key={index}
              href={study.link || "#"}
              target={study.link ? "_blank" : undefined}
              rel={study.link ? "noopener noreferrer" : undefined}
              className="group relative overflow-hidden cursor-pointer animate-scale-in block"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={study.image}
                  alt={study.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-[15px]"
                />
              </div>
              <div
                className="absolute inset-0 bg-primary/0 group-hover:bg-primary/80 transition-all duration-300 flex items-end p-6"
                style={{ borderRadius: "15px" }}
              >
                <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-xs text-secondary font-medium uppercase tracking-wider" style={{ color: 'rgba(245, 245, 245, 1)' }}>
                    {study.category}
                  </span>
                  <h3 className="text-xl text-primary-foreground mt-2" style={{ fontFamily: 'Space Grotesk' }}>
                    {study.title}
                  </h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
