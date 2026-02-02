import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SplitText from "@/components/SplitText";
import hero1Bg from "@/assets/hero2.png";
import { portfolios } from "@/data/portfolios";

const AllProjects = () => {
  const [activeNiche, setActiveNiche] = useState("All");

  const niches = ["All", "Sport & Fitness", "Fashion", "Jewelry", "Supplements", "Electronics", "Beauty & Cosmetics"];

  const filteredPortfolios = activeNiche === "All" 
    ? portfolios 
    : portfolios.filter(portfolio => portfolio.niche === activeNiche);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 md:pb-28 overflow-hidden"
        style={{
          backgroundColor: '#FAE6E1',
        }}
      >
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${hero1Bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-16">
            {/* Left - Heading */}
            <div className="relative">
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-sans font-semibold text-[#2A2A2A] relative inline-block"
                style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}
              >
                Portfolio
                {/* Yellow Underline - Brush Stroke Style */}
                <span 
                  className="absolute bottom-1 left-0 h-4 bg-yellow-300 -z-10"
                  style={{
                    width: 'calc(100% + 8px)',
                    clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)',
                    transform: 'rotate(-0.5deg)',
                    left: '-4px',
                  }}
                />
              </h1>
            </div>
            
            {/* Right - Description */}
            <div className="max-w-md">
              <p className="text-lg text-[#2A2A2A]/80 leading-relaxed">
                We pride ourselves by providing top-notch digital media services. Our life is totally depend on client success and satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-border bg-background sticky top-0 z-20">
        <div className="container-custom">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {niches.map((niche) => (
              <button
                key={niche}
                onClick={() => setActiveNiche(niche)}
                className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
                  activeNiche === niche
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Projects Counter */}
          <div className="mb-8">
            <p className="text-muted-foreground text-sm">
              Showing {filteredPortfolios.length} of {portfolios.length} projects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map((portfolio, index) => (
              <a
                key={index}
                href={portfolio.link || "#"}
                target={portfolio.link ? "_blank" : undefined}
                rel={portfolio.link ? "noopener noreferrer" : undefined}
                className="group relative overflow-hidden cursor-pointer animate-scale-in block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={portfolio.image}
                    alt={portfolio.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/80 transition-all duration-300 flex items-end p-6">
                  <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(245, 245, 245, 1)' }}>
                      {portfolio.category}
                    </span>
                    <h3 className="text-xl text-primary-foreground mt-2" style={{ fontFamily: 'Space Grotesk' }}>
                      {portfolio.title}
                    </h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          {filteredPortfolios.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AllProjects;
