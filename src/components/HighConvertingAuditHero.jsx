import { ArrowRight } from "lucide-react";

const HighConvertingAuditHero = () => {
  return (
    <section className="relative overflow-hidden bg-[#020617] text-white">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(30,64,175,0.5) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center sm:py-24 md:py-28">
        <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
          Free Store Audit
        </p>

        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
          <span>7 Hidden Problems Quietly</span>
          <br />
          <span>Killing Your Ecommerce</span>
          <br />
          <span>Store Sales</span>
        </h1>

        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-emerald-300 md:text-sm">
          (#4 Is the One Most Store Owners Never Notice)
        </p>

        <p className="mt-6 max-w-2xl text-sm text-slate-300 md:text-base">
          Most ecommerce stores don&apos;t fail because of a bad product. They fail
          because of hidden issues in their structure, branding, and marketing
          systems that silently drain revenue every single day.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#booking-form"
            className="inline-flex items-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            Request a Free Store Audit
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <p className="text-xs text-slate-400">
            No commitment required. 100% free.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HighConvertingAuditHero;

