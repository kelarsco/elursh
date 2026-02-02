import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Play, Linkedin } from "react-feather";
import { useEffect } from "react";
import SplitText from "@/components/SplitText";
import AOS from "aos";
import "aos/dist/aos.css";
import aboutHero from "@/assets/about-hero.jpg";
import aboutVideoCover from "@/assets/about-video-cover.jpg";
import hero1Bg from "@/assets/hero2.png";

const WeAre = () => {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out",
      once: false,
      offset: 150,
      mirror: true,
    });
  }, []);

  const clients = ["Shopify", "BigCommerce", "WooCommerce", "Magento", "Klaviyo"];

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
                About us
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
                A specialized eCommerce agency helping brands build, optimize, and scale their online stores with cutting-edge design and proven growth strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Agency Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image with Badge */}
            <div className="relative animate-slide-in-left">
              <img 
                src={aboutHero} 
                alt="Our team" 
                className="w-full max-w-md mx-auto lg:mx-0"
              />
              {/* Experience Badge */}
              <div className="absolute bottom-0 left-0 bg-background p-6 shadow-xl">
                <span className="text-5xl font-serif font-bold">20+</span>
                <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                  Years eCommerce<br />Experience
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="animate-slide-in-right">
              <SplitText
                tag="h2"
                className="text-[30px] md:text-5xl lg:text-6xl font-sans font-semibold leading-[1.2] tracking-[-1.6px] mb-8 text-[#222222]"
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
                We're a creative<br />
                eCommerce agency.
              </SplitText>
              <p className="text-muted-foreground mb-4">
                We specialize in transforming online stores into high-converting, revenue-generating machines. With over 20 years of experience, we've helped hundreds of eCommerce brands increase sales, improve user experience, and scale their businesses.
              </p>
              <p className="text-muted-foreground mb-8">
                From custom Shopify themes and store redesigns to conversion rate optimization and marketing automation, we provide end-to-end eCommerce solutions that drive measurable results for fashion brands, jewelry stores, fitness retailers, and more.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  to="/contact" 
                  className="bg-secondary text-secondary-foreground px-8 py-4 font-semibold hover:bg-secondary/90 transition-colors"
                >
                  Let's Talk Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="py-12 border-y border-border">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {clients.map((client) => (
              <span key={client} className="text-xl md:text-2xl font-bold text-muted-foreground/50 hover:text-foreground transition-colors">
                {client}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative">
        <div className="group relative h-[60vh] md:h-[80vh]">
          <img 
            src={aboutVideoCover} 
            alt="Our office" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/20" />
          
          {/* Play Button - visible on hover only */}
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-300 shadow-2xl">
            <Play className="w-8 h-8 text-foreground ml-1" fill="currentColor" />
          </button>
        </div>
      </section>

      {/* Combined Services & Team Section */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          {/* Top Section - Services Content */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
            {/* Left Section - Heading with Dot */}
            <div className="relative">
              {/* Dark circular dot */}
              <div className="w-2 h-2 bg-[#222222] rounded-full mb-6"></div>
              <SplitText
                tag="h2"
                className="text-[30px] md:text-5xl lg:text-6xl font-sans font-semibold leading-[1.2] tracking-[-1.6px] text-[#222222]"
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
                We want to bring and business the{" "}
                <span className="relative inline-block">
                  digital
                  <span className="absolute bottom-1 left-0 h-3 bg-yellow-300 -z-10" style={{ width: 'calc(100% + 4px)', left: '-2px' }}></span>
                </span>{" "}
                world.
              </SplitText>
            </div>
            
            {/* Right Section - Content Blocks with Dividers */}
            <div className="space-y-0">
              {/* Block 1 */}
              <div 
                className="pb-8 border-b border-border"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-easing="ease-out"
                data-aos-delay="100"
              >
                <h3 className="font-semibold text-lg mb-2 text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                  Creative Excellence, Proven Results
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                  We deliver eCommerce projects with creativity and precision, focusing on solutions that drive real business growth.
                </p>
              </div>
              
              {/* Block 2 */}
              <div 
                className="py-8 border-b border-border"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-easing="ease-out"
                data-aos-delay="200"
              >
                <h3 className="font-semibold text-lg mb-2 text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                  People First, Always
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                  Every brand we work with matters. We value our clients, their customers, and the trust placed in us—working consistently to exceed expectations.
                </p>
              </div>
              
              {/* Block 3 */}
              <div 
                className="py-8 border-b border-border"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-easing="ease-out"
                data-aos-delay="300"
              >
                <h3 className="font-semibold text-lg mb-2 text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                  Collaboration for Stronger Brands
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                  Great eCommerce brands are built together. We partner closely with our clients to create impactful, scalable branding and store experiences.
                </p>
              </div>
              
              {/* Block 4 */}
              <div 
                className="pt-8"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-easing="ease-out"
                data-aos-delay="400"
              >
                <h3 className="font-semibold text-lg mb-2 text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                  Commitment to Digital Innovation
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                  We are committed to delivering unique, high-performing digital solutions that keep eCommerce brands competitive and future-ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="w-full py-16 overflow-hidden border-t border-border">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-foreground">strategy.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-muted-foreground/30">business.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-foreground">marketing.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-muted-foreground/30">growth.</span>
          {/* Duplicate for seamless loop */}
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-foreground">strategy.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-muted-foreground/30">business.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-foreground">marketing.</span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-serif mx-8 text-muted-foreground/30">growth.</span>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WeAre;

