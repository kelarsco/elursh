import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Layout, Volume2, BarChart2, Layers, MessageCircle, X, Instagram } from "react-feather";
import SplitText from "./SplitText";

const ServicesSection = () => {
  const { t } = useTranslation();
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [isWhatsAppDismissed, setIsWhatsAppDismissed] = useState(false);

  const services = [
    {
      number: "01",
      icon: Search,
      titleKey: "services.auditTitle",
      badgeKey: null,
      descKey: "services.auditDesc",
    },
    {
      number: "02",
      icon: Layout,
      titleKey: "services.designTitle",
      badgeKey: "services.popular",
      descKey: "services.designDesc",
    },
    {
      number: "03",
      icon: Volume2,
      titleKey: "services.marketingTitle",
      badgeKey: null,
      descKey: "services.marketingDesc",
    },
    {
      number: "04",
      icon: BarChart2,
      titleKey: "services.analyticsTitle",
      badgeKey: null,
      descKey: "services.analyticsDesc",
    },
    {
      number: "05",
      icon: Layers,
      titleKey: "services.brandingTitle",
      badgeKey: null,
      descKey: "services.brandingDesc",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined" || typeof document === "undefined") return;

      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight || 0;
      const doc = document.documentElement;
      const totalHeight = doc.scrollHeight || document.body.scrollHeight;

      const maxScrollable = Math.max(totalHeight - viewportHeight, 1);
      const scrolledRatio = scrollY / maxScrollable;

      // Show when user has scrolled at least 20% of the page
      setShowWhatsAppPrompt(scrolledRatio >= 0.2);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section id="services" className="section-padding" style={{ backgroundColor: '#1f1e1e', overflow: 'hidden' }}>
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mb-12 md:mb-20">
          <SplitText
            tag="h2"
            className="text-4xl md:text-5xl lg:text-6xl font-sans font-semibold leading-[1.2] mb-8 text-white text-left"
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
            {t("services.ctaTitle")}{" "}
            <span className="italic">{t("services.ctaTitleItalic")}</span>
          </SplitText>
        </div>

        {/* Services List */}
        <div className="space-y-0 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          {services.map((service, index) => (
            <div
              key={service.number}
              className="group py-6 md:py-10 border-b transition-colors cursor-pointer"
              style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              data-aos="fade-up"
              data-aos-duration="900"
              data-aos-easing="ease-out-cubic"
              data-aos-delay={150 + index * 120}
              data-aos-once="false"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                {/* Number */}
                <span className="text-sm font-medium w-12 flex-shrink-0 md:pl-[21px] md:ml-[28px]" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {service.number}
                </span>
                
                {/* Icon and Title Section */}
                <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 md:min-w-[450px] md:ml-[101px] md:-mr-[87px]">
                  <service.icon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 flex-shrink-0" style={{ color: 'rgba(255, 255, 255, 1)', ...(service.icon === Layout ? { width: '33px', height: '33px' } : { width: '28px', height: '28px' }) }} />
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-medium flex items-center gap-2 md:gap-3 flex-wrap" style={{ color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                    {t(service.titleKey)}
                    {service.badgeKey && (
                      <span className="bg-yellow-300 text-[#222222] text-xs px-2 md:px-3 py-1 font-sans font-medium rounded-[50px]">
                        {t(service.badgeKey)}
                      </span>
                    )}
                  </h3>
                </div>
                
                {/* Description */}
                <p className="text-sm flex-1 md:ml-[132px] md:mr-5 leading-[25px]" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {t(service.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {t("services.ctaReady")}{" "}
            <Link to="/contact" className="underline transition-colors" style={{ color: '#ffffff' }}>
              {t("services.contactUs")}
            </Link>
          </p>
        </div>
      </div>

      {!isWhatsAppDismissed && showWhatsAppPrompt && (
        <div className="fixed bottom-[20%] right-4 md:right-6 z-40 w-[64px] h-[64px] group">
          <div className="relative bg-[#111111] text-white rounded-full shadow-lg flex items-center justify-center my-[84px] mx-0 overflow-visible w-[64px] h-[64px]">
            <button
              type="button"
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white transition-opacity duration-200 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWhatsAppDismissed(true);
              }}
            >
              <X className="w-3 h-3" />
            </button>
            <span className="flex items-center justify-center w-[64px] h-[64px]">
              <MessageCircle className="w-7 h-7" />
            </span>
            {/* WhatsApp Icon - appears on hover */}
            <a
              href="https://wa.me/13439462565"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full -mr-2 w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg hover:scale-110"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
            {/* Instagram Icon - appears on hover */}
            <a
              href="https://instagram.com/elurshteam"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full -ml-12 w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 delay-75 shadow-lg hover:scale-110"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;
