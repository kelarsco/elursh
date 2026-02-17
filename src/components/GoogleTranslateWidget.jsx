import { useEffect, useRef, useState } from "react";

const TRANSLATE_BANNER_KEY = "elursh_translate_banner_dismissed";

export function GoogleTranslateWidget() {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (containerRef.current && !window.google?.translate) {
      window.googleTranslateElementInit = () => {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "es,fr,de,pt,it,zh-CN,ja,ar,ru,hi,ko,pl,nl",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            "google_translate_element"
          );
          setLoaded(true);
        } catch (e) {
          console.warn("Google Translate init error:", e);
        }
      };
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div ref={containerRef} className="google-translate-widget">
      <div id="google_translate_element" />
    </div>
  );
}

const BROWSER_LANG_TO_LABEL = {
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
  ru: "Русский",
  hi: "हिन्दी",
  ko: "한국어",
  pl: "Polski",
  nl: "Nederlands",
};

export function LanguageDetectionBanner() {
  const [show, setShow] = useState(false);
  const [browserLang, setBrowserLang] = useState(null);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(TRANSLATE_BANNER_KEY);
    if (dismissed) return;

    const navLang = navigator.language || navigator.userLanguage || "";
    const primary = navLang.split("-")[0].toLowerCase();
    // Show banner when browser prefers non-English
    if (primary && primary !== "en") {
      setBrowserLang(primary);
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(TRANSLATE_BANNER_KEY, "1");
    setShow(false);
  };

  const scrollToTranslate = () => {
    const el = document.querySelector("#google_translate_element");
    if (el) {
      el.closest(".google-translate-widget")?.scrollIntoView({ behavior: "smooth" });
      // Try to focus/trigger the widget dropdown
      const select = el.querySelector?.(".goog-te-combo");
      if (select) select.click?.();
    }
    handleDismiss();
  };

  if (!show || !browserLang) return null;

  const langLabel = BROWSER_LANG_TO_LABEL[browserLang] || browserLang;

  return (
    <div
      role="banner"
      className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-2 px-4 text-center text-sm shadow-md"
    >
      <span>
        Translate this page to {langLabel}?
      </span>
      <button
        type="button"
        onClick={scrollToTranslate}
        className="ml-3 font-semibold underline hover:no-underline"
      >
        Use Google Translate
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="ml-4 opacity-80 hover:opacity-100"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}
