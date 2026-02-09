import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Linkedin, Instagram } from "react-feather";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t } = useTranslation();

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
  const footerLinks = {
    services: [
      { name: t("footer.storeAudit"), href: "/store-audit", isRoute: true },
      { name: t("footer.buyTheme"), href: "/theme", isRoute: true },
      { name: t("footer.improveStore"), href: "/improve-store", isRoute: true },
    ],
    company: [
      { name: t("footer.aboutUs"), href: "#about", isRoute: false },
      { name: t("footer.careers"), href: "#", isRoute: false },
      { name: t("footer.contact"), href: "/contact", isRoute: true },
    ],
  };

  const contact = {
    city: "Barcelona, Spain",
    address: ["C/ de Cristóbal de Moura,", "49, Sant Martí", "08019"],
    phone: "+13439462565",
  };

  return (
    <footer id="contact" className="bg-[#222222] text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-16">
          {/* Logo */}
          <div className="lg:col-span-1 h-[132px] w-[314px]">
            <Link to="/" className="inline-block">
              <img
                src={logo}
                alt="Elursh"
                className="w-[314px] h-auto max-w-[314px] max-h-[132px] brightness-0 invert object-contain object-left mt-0 lg:mt-[122px] mb-0"
                data-aos="zoom-in"
                data-aos-duration="1000"
                data-aos-easing="ease-out"
              />
            </Link>
          </div>

          {/* Spacer - pushes Services & Company right */}
          <div className="hidden lg:block lg:col-span-1" aria-hidden="true" />

          {/* Services */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-6 text-white font-sans">{t("footer.services")}</h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-6 text-white font-sans">{t("footer.company")}</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social icons only */}
          <div className="lg:col-span-2 flex flex-col items-start lg:items-end justify-center md:col-span-2">
            <div className="flex items-center gap-5">
              <a
                href="https://instagram.com/elurshteam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-10 h-10" strokeWidth={1.5} />
              </a>
              <a
                href={`https://wa.me/${contact.phone.replace(/\+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-10 h-10" />
              </a>
              <a
                href="https://www.behance.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Behance"
              >
                <BehanceIcon className="w-10 h-10" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-10 h-10" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright - bottom right */}
        <div className="mt-16 pt-8 border-t border-white/20 flex justify-end">
          <p className="text-sm text-white/80">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

function BehanceIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
    </svg>
  );
}

function WhatsAppIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default Footer;
