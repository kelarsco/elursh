import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, ChevronDown, Mail, FileText, ShoppingBag, Zap, Globe } from "react-feather";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "العربية" },
];

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [hasBackground, setHasBackground] = useState(false);
  const [menuItemsVisible, setMenuItemsVisible] = useState(false);
  const lastScrollY = useRef(0);

  const menuItems = [
    { name: t("header.home"), href: "/", isRoute: true },
    { name: t("header.agency"), href: "/we-are", isRoute: true },
    { name: t("header.expertise"), href: "#services", isRoute: true, isHash: true },
    {
      name: t("header.products"),
      href: "#products",
      isRoute: false,
      dropdown: [
        { name: t("header.storeAudit"), href: "/store-audit", icon: FileText },
        { name: t("header.purchaseTheme"), href: "/theme", icon: ShoppingBag },
        { name: t("header.improveStore"), href: "/improve-store", icon: Zap },
      ],
    },
    { name: t("header.contact"), href: "/contact", isRoute: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If at the top, remove background
      if (currentScrollY <= 0) {
        setHasBackground(false);
      } 
      // If scrolled past the top (either up or down), add background
      else {
        setHasBackground(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle menu open/close animations
  useEffect(() => {
    if (isMenuOpen && !isMenuClosing) {
      // Reset visibility state - container opens first
      setMenuItemsVisible(false);
      setIsMenuClosing(false);
      // Wait for container to fully open (0.5s) before showing nav links
      const timer = setTimeout(() => {
        setMenuItemsVisible(true);
      }, 500); // Wait for container animation to complete
      return () => clearTimeout(timer);
    } else if (isMenuClosing) {
      // Fade out menu items first (quick fade - 0.3s)
      setMenuItemsVisible(false);
      // Then close container after items fade out (wait 0.3s for fade, then start container close)
      const timer = setTimeout(() => {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
      }, 300); // Wait for nav items to fade out before closing container
      return () => clearTimeout(timer);
    } else {
      setMenuItemsVisible(false);
    }
  }, [isMenuOpen, isMenuClosing]);

  const handleCloseMenu = () => {
    setIsMenuClosing(true);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        hasBackground 
          ? 'bg-background/95 backdrop-blur-sm border-b border-border' 
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between h-20 w-full header-container px-[10px] lg:px-[38px]">
          {/* Logo - use <a> for full page reload to home */}
          <a href="/" className="flex items-center" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
            <img src={logo} alt="Elursh" className="h-[20.8px] md:h-[30.6px]" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10" style={{ paddingLeft: '0px', paddingRight: '0px', paddingTop: '0px', paddingBottom: '0px', marginLeft: '0px', marginRight: '252px', justifyContent: 'center' }}>
            {menuItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.dropdown ? (
                  <button 
                    className="flex items-center gap-1 text-[19px] font-semibold text-foreground hover:text-foreground/70 transition-colors hover-underline"
                    onMouseEnter={() => setIsProductsOpen(true)}
                    onMouseLeave={() => setIsProductsOpen(false)}
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : item.isRoute ? (
                  item.isHash ? (
                    isHome ? (
                      <a
                        href={item.href}
                        className="text-[19px] font-semibold text-foreground hover:text-foreground/70 transition-colors hover-underline"
                        onClick={(e) => {
                          e.preventDefault();
                          document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        to={`/${item.href}`}
                        className="text-[19px] font-semibold text-foreground hover:text-foreground/70 transition-colors hover-underline"
                      >
                        {item.name}
                      </Link>
                    )
                  ) : item.href === "/" ? (
                    <a
                      href="/"
                      className="text-[19px] font-semibold text-foreground hover:text-foreground/70 transition-colors hover-underline"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-[19px] font-semibold text-foreground hover:text-foreground/70 transition-colors hover-underline"
                    >
                      {item.name}
                    </Link>
                  )
                ) : (
                  <a
                    href={item.href}
                    className="text-[19px] font-semibold text-foreground hover:text-foreground/70 transition-colors hover-underline"
                  >
                    {item.name}
                  </a>
                )}
                
                {item.dropdown && (
                  <div 
                    className={`absolute top-full left-0 pt-4 ${isProductsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300`}
                    onMouseEnter={() => setIsProductsOpen(true)}
                    onMouseLeave={() => setIsProductsOpen(false)}
                  >
                    <div className="bg-background border border-border shadow-xl min-w-[200px]">
                      {item.dropdown.map((subItem) => {
                        const IconComponent = subItem.icon;
                        return (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            {IconComponent && <IconComponent className="w-4 h-4" strokeWidth={1.5} />}
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button + Language switcher */}
          <div className="hidden lg:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t("common.language")}>
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code).then(() => window.location.reload())}
                    className={i18n.language === lang.code ? "bg-muted" : ""}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to="/contact"
              className="cta-button relative overflow-hidden bg-transparent px-6 py-3 text-sm font-semibold flex items-center gap-2 group transition-colors border border-foreground text-foreground hover:bg-foreground hover:text-background"
            >
              <span className="cta-button-text relative z-10 flex items-center gap-2">
                <Mail className="w-4 h-4 transition-colors group-hover:text-background" />
                {t("header.sendMessage")}
              </span>
            </Link>
          </div>

          {/* Mobile: Language switcher + Menu Button */}
          <div className="lg:hidden flex items-center" style={{ gap: '5px' }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t("common.language")}>
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code).then(() => window.location.reload())}
                    className={i18n.language === lang.code ? "bg-muted" : ""}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="p-2"
              onClick={() => {
                if (isMenuOpen) {
                  handleCloseMenu();
                } else {
                  setIsMenuOpen(true);
                }
              }}
            style={{ background: 'none', paddingLeft: '18px', paddingRight: '18px' }}
          >
            {!isMenuOpen && !isMenuClosing && (
              <svg 
                className="w-6 h-6" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ background: 'none' }}
              >
                <line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            )}
            </button>
          </div>
      </div>

      {/* Mobile Menu Close Button - Overlay */}
      {(isMenuOpen || isMenuClosing) && (
        <button
          className="lg:hidden fixed top-4 right-4 z-[60] p-2"
          onClick={handleCloseMenu}
          style={{ background: 'none', paddingLeft: '18px', paddingRight: '18px' }}
        >
          <X className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Mobile Menu */}
      {(isMenuOpen || isMenuClosing) && (
        <div 
          className="lg:hidden fixed top-0 left-0 right-0 w-full mobile-menu-container z-[55]"
          style={{ 
            paddingLeft: '40px', 
            paddingRight: '40px',
            paddingTop: '80px',
            paddingBottom: '1.5rem',
            backgroundColor: '#2a2a2a',
            minHeight: '100vh',
            animation: isMenuClosing 
              ? 'slideUp 0.5s ease-out 0.3s forwards' // Start container close after nav items fade (0.3s delay)
              : 'slideDown 0.5s ease-out forwards', // Container opens immediately
            transformOrigin: 'top',
            overflow: 'hidden'
          }}
        >
            <nav className="flex flex-col gap-4 items-center justify-center" style={{ height: '100%', minHeight: 'calc(100vh - 80px)' }}>
              {menuItems.map((item, index) => (
                <div 
                  key={item.name}
                  className="mobile-menu-item"
                  style={{
                    opacity: menuItemsVisible ? 1 : 0,
                    transform: menuItemsVisible ? 'translateY(0)' : 'translateY(-10px)',
                    transition: isMenuClosing 
                      ? 'opacity 0.3s ease-out 0s, transform 0.3s ease-out 0s' // Fade out immediately on close
                      : `opacity 0.3s ease-out ${0.5 + index * 0.08}s, transform 0.3s ease-out ${0.5 + index * 0.08}s` // Start after container opens
                  }}
                >
                  {item.dropdown ? (
                    <div>
                      <button 
                        className="flex items-center gap-1 font-medium text-white w-full"
                        style={{ fontSize: '34px' }}
                        onClick={() => setIsProductsOpen(!isProductsOpen)}
                      >
                        {item.name}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isProductsOpen && (
                        <div className="mt-2 ml-4 flex flex-col gap-2">
                          {item.dropdown.map((subItem) => {
                            const IconComponent = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                                style={{ fontSize: '28px' }}
                                onClick={handleCloseMenu}
                              >
                                {IconComponent && <IconComponent className="w-5 h-5" strokeWidth={1.5} />}
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : item.isRoute ? (
                    item.isHash ? (
                      isHome ? (
                        <a
                          href={item.href}
                          className="font-medium text-white"
                          style={{ fontSize: '34px' }}
                          onClick={(e) => {
                            e.preventDefault();
                            document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                            handleCloseMenu();
                          }}
                        >
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          to={`/${item.href}`}
                          className="font-medium text-white"
                          style={{ fontSize: '34px' }}
                          onClick={handleCloseMenu}
                        >
                          {item.name}
                        </Link>
                      )
                    ) : item.href === "/" ? (
                      <a
                        href="/"
                        className="font-medium text-white"
                        style={{ fontSize: '34px' }}
                        onClick={handleCloseMenu}
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        className="font-medium text-white"
                        style={{ fontSize: '34px' }}
                        onClick={handleCloseMenu}
                      >
                        {item.name}
                      </Link>
                    )
                  ) : (
                    <a
                      href={item.href}
                      className="font-medium text-white"
                      style={{ fontSize: '34px' }}
                      onClick={handleCloseMenu}
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
