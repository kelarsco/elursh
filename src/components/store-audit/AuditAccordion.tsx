import { FadeIn } from "@/components/FadeIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const auditItems = [
  {
    title: "Store Structure Analysis",
    description: "We evaluate your store's navigation, page hierarchy, and overall user flow to ensure visitors can find what they need and move toward checkout effortlessly.",
  },
  {
    title: "Conversion Rate Optimization Review",
    description: "We analyze every step of your sales funnel — from landing page to checkout — identifying friction points that cause visitors to abandon their purchase.",
  },
  {
    title: "Homepage & Product Page Evaluation",
    description: "Your homepage and product pages are your most important assets. We review layout, copy, imagery, and CTA placement to maximize their conversion potential.",
  },
  {
    title: "Brand Positioning Analysis",
    description: "We assess how your brand is perceived — your value proposition, messaging consistency, and visual identity — to ensure you stand out from competitors.",
  },
  {
    title: "Trust & Credibility Signals Review",
    description: "Reviews, guarantees, security badges, social proof — we check every trust signal to make sure visitors feel confident buying from your store.",
  },
  {
    title: "Marketing Funnel Evaluation",
    description: "We map your entire marketing funnel from ad click to repeat purchase, identifying gaps where potential customers are slipping through the cracks.",
  },
  {
    title: "Email Marketing Automation Opportunities",
    description: "Abandoned carts, welcome sequences, post-purchase flows — we identify automation opportunities that can recover lost revenue on autopilot.",
  },
  {
    title: "Traffic Conversion Strategy",
    description: "We analyze your traffic sources and landing page alignment to ensure you're attracting the right visitors and converting them effectively.",
  },
];

const AuditAccordion = () => {
  return (
    <section className="section-light py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            What's Included
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto">
            What You Get From the Store Audit
          </h2>
          <p className="mt-6 text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive, actionable audit covering every critical area of your ecommerce store.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12 max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {auditItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow bg-background"
                >
                  <AccordionTrigger className="font-display font-semibold text-left hover:no-underline py-5">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-body leading-relaxed pb-5">
                    {item.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default AuditAccordion;
