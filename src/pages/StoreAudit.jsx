import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BarChart2, TrendingUp, AlertCircle, CheckCircle, ArrowRight } from "react-feather";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const StoreAudit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");

  const handleAnalyze = () => {
    // Handle the analyze action here
    console.log("Analyzing store:", storeUrl);
    // You can navigate to analyze-store page or perform analysis here
    window.location.href = `/analyze-store?url=${encodeURIComponent(storeUrl)}`;
  };
  const auditFeatures = [
    {
      icon: BarChart2,
      title: "Comprehensive Analysis",
      description: "Deep dive into your store's performance, UX, and conversion funnels.",
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Identify untapped revenue potential and optimization strategies.",
    },
    {
      icon: AlertCircle,
      title: "Issue Detection",
      description: "Find technical issues, broken links, and performance bottlenecks.",
    },
    {
      icon: CheckCircle,
      title: "Action Plan",
      description: "Get a prioritized roadmap with specific implementation steps.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="pt-32 pb-20 bg-background">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-semibold mb-6" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              Unlock your store's full{" "}
              <span className="italic">potential</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Get a comprehensive analysis of your ecommerce store with actionable insights to boost conversions and revenue.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-semibold hover:bg-primary/90 transition-colors mt-8"
            >
              audit my store
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {auditFeatures.map((feature, index) => (
              <div key={index} className="p-8 border border-border hover:border-secondary transition-colors">
                <feature.icon className="w-10 h-10 text-secondary mb-6" />
                <h3 className="text-xl font-sans mb-3" style={{ fontFamily: 'Space Grotesk' }}>{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Store Analysis Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[500px] bg-background border-border rounded-lg p-8">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl md:text-3xl font-semibold text-[#222222] mb-2" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                  Analyze Your Store
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground" style={{ fontFamily: 'Space Grotesk' }}>
                  Enter your store URL below to get started with a comprehensive analysis.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label htmlFor="store-url" className="text-sm font-medium text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                    Store URL
                  </label>
                  <Input
                    id="store-url"
                    type="url"
                    placeholder="https://yourstore.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && storeUrl.trim()) {
                        handleAnalyze();
                      }
                    }}
                    className="w-full h-12 text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    style={{ fontFamily: 'Space Grotesk' }}
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!storeUrl.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  Start Analyzing
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StoreAudit;
