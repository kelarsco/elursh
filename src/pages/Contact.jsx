import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Instagram, Linkedin, Share2 } from "lucide-react";
import hero1Bg from "@/assets/hero2.png";

const PRIMARY_GOALS = [
  { value: "improve_store", label: "Improve store" },
  { value: "increase_sales", label: "Increase sales" },
  { value: "store_audit", label: "Store audit" },
  { value: "theme_purchase", label: "Theme purchase" },
  { value: "other", label: "Other" },
];

const BUDGET_OPTIONS = [
  { value: "200-500", label: "$200 – $500" },
  { value: "500-1000", label: "$500 – $1,000" },
  { value: "1000-2500", label: "$1,000 – $2,500" },
  { value: "2500+", label: "$2,500+" },
  { value: "skip", label: "Prefer not to say" },
];

const STEP_LABELS = ["Name & Email", "Store & Goal", "Budget", "Message"];
const MIN_BUDGET = 200;

export default function Contact() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    store_link: "",
    primary_goal: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-out", once: false, offset: 150, mirror: true });
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    setErrors({});
    return true;
  };

  const handleContinue = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 4) setStep((s) => s + 1);
  };

  const handleSkipBudget = () => {
    updateForm("budget", "skip");
    setStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    try {
      const res = await fetch(`${apiBase}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          store_link: form.store_link.trim() || undefined,
          primary_goal: form.primary_goal || undefined,
          budget: form.budget && form.budget !== "skip" ? form.budget : undefined,
          message: form.message.trim() || undefined,
          source: "contact_page",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_button]:font-sans">
      <Helmet>
        <title>Contact Us | Partner with Elursh | Elursh</title>
        <meta name="description" content="Every client matters to us. Get in touch with Elursh to discuss your eCommerce goals and partner with us for real results." />
        <link rel="canonical" href="https://elursh.com/contact" />
        <meta property="og:url" content="https://elursh.com/contact" />
        <meta property="og:title" content="Contact Us | Elursh" />
        <meta property="og:description" content="Get in touch with Elursh for eCommerce solutions." />
      </Helmet>
      <Header />

      {/* Hero header - matches About us style */}
      <section
        className="relative pt-32 pb-20 md:pb-28 overflow-hidden"
        style={{ backgroundColor: "#FAE6E1" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${hero1Bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-16">
            <div className="relative">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-sans font-semibold text-[#2A2A2A] relative inline-block"
                style={{ fontFamily: "Space Grotesk", fontWeight: 600 }}
              >
                Contact
                <span
                  className="absolute bottom-1 left-0 h-4 bg-yellow-300 -z-10"
                  style={{
                    width: "calc(100% + 8px)",
                    clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)",
                    transform: "rotate(-0.5deg)",
                    left: "-4px",
                  }}
                />
              </h1>
            </div>
            <div className="max-w-md">
              <p className="text-lg text-[#2A2A2A]/80 leading-relaxed">
                Every client matters to us, and that includes you. Partner with Elursh to achieve real eCommerce results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact info blocks + form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-12">
            We're here to help you and answer any questions you might have.
          </h2>

          {/* Contact info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: MessageCircle,
                title: "Send a message",
                detail: "team@elursh.com",
              },
              {
                icon: Share2,
                title: "Connect with us",
                socials: [
                  { name: "Instagram", href: "https://instagram.com/elursh", icon: Instagram, stroke: true },
                  { name: "LinkedIn", href: "https://linkedin.com/company/elursh", icon: Linkedin, stroke: true },
                  { name: "Behance", href: "https://behance.net/elursh", icon: BehanceIcon },
                  { name: "WhatsApp", href: "https://wa.me/23439462565", icon: WhatsAppIcon },
                ],
              },
            ].map(({ icon: Icon, title, detail, socials }, idx) => (
              <div
                key={title}
                className="group relative p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-200 transition-all duration-300"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-easing="ease-out"
                data-aos-delay={idx * 100}
              >
                <div className="relative inline-flex mb-4">
                  {Icon && (
                    <>
                      <Icon className="w-10 h-10 text-neutral-800" strokeWidth={1.5} />
                      <span
                        className="absolute -inset-2 rounded-full border-2 border-dashed border-rose-300 opacity-0 group-hover:opacity-60 transition-opacity"
                        style={{ animation: "pulse 2s infinite" }}
                      />
                    </>
                  )}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
                {detail && <p className="text-sm text-neutral-600">{detail}</p>}
                {socials && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    {socials.map(({ name, href, icon: SocialIcon, stroke }) => (
                      <a
                        key={name}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        aria-label={name}
                      >
                        <SocialIcon className="w-5 h-5" {...(stroke && { strokeWidth: 1.5 })} />
                        {name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Multi-step form */}
          <div className="max-w-2xl">
            {submitted ? (
              <div className="p-8 rounded-2xl border-2 border-secondary/20 bg-secondary/5 text-center">
                <p className="text-xl font-semibold text-secondary">Thank you!</p>
                <p className="mt-2 text-neutral-600">We've received your message and will get back to you soon.</p>
                <Link to="/" className="inline-block mt-6">
                  <Button variant="outline" className="rounded-full focus-visible:ring-0 focus-visible:ring-offset-0">Back to Home</Button>
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 shadow-sm space-y-8 [&_input]:focus-visible:ring-0 [&_input]:focus-visible:ring-offset-0 [&_input]:focus-visible:border-neutral-300 [&_textarea]:focus-visible:ring-0 [&_textarea]:focus-visible:ring-offset-0 [&_textarea]:focus-visible:border-neutral-300 [&_button]:focus-visible:ring-0 [&_button]:focus-visible:ring-offset-0"
              >
                <div className="flex gap-2">
                  {STEP_LABELS.map((label, i) => (
                    <div
                      key={label}
                      className={`h-px flex-1 rounded-full transition-colors ${
                        i + 1 <= step ? "bg-secondary" : "bg-neutral-200"
                      }`}
                    />
                  ))}
                </div>

                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-base font-medium">Your name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        placeholder="John Doe"
                        className="mt-2 h-12 rounded-xl border-2 border-neutral-200"
                        autoFocus
                      />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-base font-medium">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        placeholder="you@example.com"
                        className="mt-2 h-12 rounded-xl border-2 border-neutral-200"
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <Button
                      type="button"
                      onClick={handleContinue}
                      className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-base"
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="store_link" className="text-base font-medium">Store link (optional)</Label>
                      <Input
                        id="store_link"
                        value={form.store_link}
                        onChange={(e) => updateForm("store_link", e.target.value)}
                        placeholder="https://yourstore.myshopify.com"
                        className="mt-2 h-12 rounded-xl border-2 border-neutral-200"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Primary goal</Label>
                      <Select value={form.primary_goal} onValueChange={(v) => updateForm("primary_goal", v)}>
                        <SelectTrigger className="mt-2 h-12 rounded-xl border-2 border-neutral-200 focus:ring-0 focus:ring-offset-0 data-[state=open]:border-neutral-300">
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIMARY_GOALS.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
                        Back
                      </Button>
                      <Button type="button" onClick={handleContinue} className="flex-1 h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
                        Minimum budget: <strong>${MIN_BUDGET}</strong>
                      </p>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Budget range (optional)</Label>
                      <Select value={form.budget} onValueChange={(v) => updateForm("budget", v)}>
                        <SelectTrigger className="mt-2 h-12 rounded-xl border-2 border-neutral-200 focus:ring-0 focus:ring-offset-0 data-[state=open]:border-neutral-300">
                          <SelectValue placeholder="Select budget or skip" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGET_OPTIONS.map((b) => (
                            <SelectItem key={b.value} value={b.value}>
                              {b.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl">
                        Back
                      </Button>
                      <Button type="button" variant="ghost" onClick={handleSkipBudget} className="flex-1 h-12 rounded-xl text-neutral-600">
                        Skip this step
                      </Button>
                      <Button type="button" onClick={handleContinue} className="flex-1 h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="message" className="text-base font-medium">Your message (optional)</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => updateForm("message", e.target.value)}
                        placeholder="Tell us more about your project..."
                        rows={5}
                        className="mt-2 rounded-xl border-2 border-neutral-200 resize-none"
                      />
                    </div>
                    {errors.submit && (
                      <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{errors.submit}</p>
                    )}
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl">
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold"
                      >
                        {submitting ? "Sending…" : "Contact Us"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function BehanceIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
    </svg>
  );
}

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
