import {
  CtaSection,
  FeatureShowcase,
  Hero,
  InteractiveWidget,
  Metrics,
  Navbar,
  WhyChooseUs,
} from "./components/landing-page";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative max-w-full overflow-x-hidden">
      {/* Background Glows (dùng max-w-full để không đâm thủng màn hình mobile) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-62.5 bg-blue-600/10 blur-[100px] pointer-events-none z-0" />

      <Navbar />

      <main className="relative z-10 space-y-16 sm:space-y-24 pb-16">
        {/* pt-24 sm:pt-32 giúp Hero không bị đè bởi Navbar fixed */}
        <section id="hero" className="scroll-mt-20 pt-24 sm:pt-32 px-4 sm:px-6">
          <Hero />
        </section>

        <section id="widget" className="scroll-mt-20 px-4 sm:px-6">
          <InteractiveWidget />
        </section>

        <section id="why-us" className="scroll-mt-20 px-4 sm:px-6">
          <WhyChooseUs />
        </section>

        <section id="metrics" className="scroll-mt-20 px-4 sm:px-6">
          <Metrics />
        </section>

        <section id="features" className="scroll-mt-20 px-4 sm:px-6">
          <FeatureShowcase />
        </section>

        <section id="cta" className="scroll-mt-20 px-4 sm:px-6">
          <CtaSection />
        </section>
      </main>
    </div>
  );
}
