import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowUp, ArrowDown, XCircle, Star, User, Shield, Target, Home, TrendingUp, Layers, DollarSign, Store, UserCheck, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import expertProfile from "@/assets/about_me.png";
import heroDiagram from "@/assets/hero-diagram.jpg";
import beforeStore from "@/assets/before-store.jpg";
import afterStore from "@/assets/after-store.jpg";
import expertPhoto from "@/assets/expert-photo.jpg";

const HighConvertingStoreAudit = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    storeUrl: "",
    preferredDate: "",
    preferredTime: "",
    challenges: ""
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Before: 0.8% Conversion Rate",
      description: "Poor design, no trust signals, confusing navigation"
    },
    {
      title: "After: 3.2% Conversion Rate", 
      description: "Professional design, strong trust signals, clear user flow"
    },
    {
      title: "Result: 300% Revenue Increase",
      description: "Same traffic, 4x more sales within 60 days"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${formData.name}! We'll contact you within 24 hours to schedule your free store audit.`);
    setFormData({
      name: "",
      email: "",
      storeUrl: "",
      preferredDate: "",
      preferredTime: "",
      challenges: ""
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="overflow-hidden">
      <Helmet>
        <title>7 Hidden Problems Killing Your Ecommerce Store Sales | Free Store Audit</title>
        <meta name="description" content="Discover the 7 hidden problems quietly killing your ecommerce store sales. Get a free store audit and transform your business into a profitable brand." />
        <link rel="canonical" href="https://elursh.com/high-converting-store-audit" />
      </Helmet>

      {/* Hero Section */}
      <section className="section-dark py-24 sm:py-32 lg:py-40 relative overflow-hidden">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(hsl(var(--dark-fg)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--dark-fg)) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        
        <div className="container-section relative z-10">
          <FadeIn>
            <div className="flex items-center gap-2 justify-center mb-8">
              <AlertTriangle className="h-5 w-5 text-emerald" />
              <span className="text-emerald font-display font-semibold text-sm uppercase tracking-widest">
                Free Store Audit
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-center leading-tight max-w-5xl mx-auto text-dark-fg">
              7 Hidden Problems Quietly Killing Your Ecommerce Store Sales
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-4 text-center font-display font-medium text-emerald text-lg sm:text-xl">
              (#4 Is the One Most Store Owners Never Notice)
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-8 text-center text-dark-fg/70 font-body text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Most ecommerce stores don't fail because of a bad product. They fail because of hidden issues in their structure, branding, and marketing systems that silently drain revenue every single day.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="cta" size="xl" onClick={scrollToForm}>
                Request a Free Store Audit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-dark-fg/50 text-sm font-body">
                No commitment required. 100% free.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-light py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-4xl font-bold mb-6 font-heading">There's a System Behind Successful Stores</h2>
                <p className="text-xl mb-6 text-gray-600">
                  High-converting ecommerce stores don't happen by accident. They follow a proven structure that builds trust, 
                  guides visitors to purchase, and maximizes every marketing dollar.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-lg">
                    <CheckCircle className="text-green-500 mr-3" size={24} />
                    Strategic store architecture
                  </div>
                  <div className="flex items-center text-lg">
                    <CheckCircle className="text-green-500 mr-3" size={24} />
                    Conversion-focused design
                  </div>
                  <div className="flex items-center text-lg">
                    <CheckCircle className="text-green-500 mr-3" size={24} />
                    Trust-building elements
                  </div>
                  <div className="flex items-center text-lg">
                    <CheckCircle className="text-green-500 mr-3" size={24} />
                    Automated marketing systems
                  </div>
                </div>
                <Button onClick={scrollToForm} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  Get Your Store Analyzed
                </Button>
              </FadeIn>
            </div>
            <div className="text-center">
              <img 
                src={heroDiagram} 
                alt="Store Structure Blueprint" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section className="section-dark py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold mb-8 font-heading">This Is For You If...</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left space-y-4">
                <div className="flex items-center text-lg">
                  <CheckCircle className="text-yellow-400 mr-3" size={24} />
                  You get traffic but barely any sales
                </div>
                <div className="flex items-center text-lg">
                  <CheckCircle className="text-yellow-400 mr-3" size={24} />
                  Your ads bring visitors but not buyers
                </div>
                <div className="flex items-center text-lg">
                  <CheckCircle className="text-yellow-400 mr-3" size={24} />
                  Your store looks okay but doesn't convert
                </div>
              </div>
              <div className="text-left space-y-4">
                <div className="flex items-center text-lg">
                  <CheckCircle className="text-yellow-400 mr-3" size={24} />
                  You don't know what to fix first
                </div>
                <div className="flex items-center text-lg">
                  <CheckCircle className="text-yellow-400 mr-3" size={24} />
                  You want to turn your store into a real brand
                </div>
                <div className="flex items-center text-lg">
                  <CheckCircle className="text-yellow-400 mr-3" size={24} />
                  You're tired of inconsistent revenue
                </div>
              </div>
            </div>
            <Button onClick={scrollToForm} size="lg" className="bg-emerald hover:bg-emerald/90 text-white px-8 py-4 text-lg font-semibold rounded-full mt-8">
              Start Your Store Audit
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="section-light py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-4xl font-bold mb-4 font-heading">The Difference Is Clear</h2>
              <p className="text-xl text-gray-600">See how a professional store audit transforms your business</p>
            </FadeIn>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={0.1}>
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <XCircle className="mr-2" size={24} />
                    Without Store Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="mr-2" size={20} />
                    Random changes without strategy
                  </div>
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="mr-2" size={20} />
                    Confusing store structure
                  </div>
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="mr-2" size={20} />
                    Visitors leave without buying
                  </div>
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="mr-2" size={20} />
                    Ads waste money
                  </div>
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="mr-2" size={20} />
                    No predictable revenue
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center">
                    <CheckCircle className="mr-2" size={24} />
                    With Store Audit & Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="mr-2" size={20} />
                    Clear brand positioning
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="mr-2" size={20} />
                    Conversion-focused design
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="mr-2" size={20} />
                    Strong trust signals
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="mr-2" size={20} />
                    Marketing system that works
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="mr-2" size={20} />
                    Predictable revenue growth
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Audit Accordion */}
      <section className="section-dark py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl font-bold text-center mb-12 font-heading">What You Get From Your Free Store Audit</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="structure" className="border-gray-700">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <Layers className="mr-3" size={20} />
                    Store Structure Analysis
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Complete evaluation of your store's architecture, navigation flow, and user experience patterns. 
                  We identify structural barriers that prevent visitors from becoming customers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="conversion" className="border-gray-700">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <TrendingUp className="mr-3" size={20} />
                    Conversion Rate Optimization Review
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Deep dive into your conversion metrics, checkout process, and purchase funnel. 
                  We reveal exactly where you're losing sales and how to fix it.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="pages" className="border-gray-700">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <Home className="mr-3" size={20} />
                    Homepage & Product Page Evaluation
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Detailed analysis of your most important pages. We evaluate design, copy, trust signals, 
                  and conversion elements that turn browsers into buyers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="branding" className="border-gray-700">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <Target className="mr-3" size={20} />
                    Brand Positioning Analysis
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Assessment of your brand identity, messaging consistency, and market positioning. 
                  We help you stand out and build customer loyalty.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="trust" className="border-gray-700">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <Shield className="mr-3" size={20} />
                    Trust & Credibility Signals Review
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Complete audit of your trust signals, social proof, security features, and credibility elements. 
                  We identify gaps that make visitors hesitate to purchase.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="marketing" className="border-gray-700">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <DollarSign className="mr-3" size={20} />
                    Marketing Funnel Evaluation
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Analysis of your entire marketing funnel from awareness to conversion. 
                  We optimize every touchpoint for maximum revenue.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </FadeIn>
        </div>
      </section>

      {/* Before/After Slider */}
      <section className="section-light py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-4xl font-bold mb-4 font-heading">See The Transformation</h2>
              <p className="text-xl text-gray-600">Real results from stores that implemented our audit recommendations</p>
            </FadeIn>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white text-center shadow-2xl">
            <FadeIn delay={0.3}>
              <div className="h-64 flex items-center justify-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4 font-heading">{slides[currentSlide].title}</h3>
                  <p className="text-xl">{slides[currentSlide].description}</p>
                </div>
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section-dark py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold mb-6 font-heading">The Real Problem Most Store Owners Face</h2>
            <p className="text-xl mb-12 text-gray-300">
              Most ecommerce stores fail not because of bad products, but because they were never structured to convert.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-6">
                <div>
                  <h4 className="text-yellow-400 flex items-center mb-2">
                    <AlertTriangle className="mr-2" size={20} />
                    Poor Branding
                  </h4>
                  <p className="text-gray-300">Your store looks amateur and visitors don't trust buying from you.</p>
                </div>
                <div>
                  <h4 className="text-yellow-400 flex items-center mb-2">
                    <AlertTriangle className="mr-2" size={20} />
                    Weak Trust Signals
                  </h4>
                  <p className="text-gray-300">No social proof, reviews, or security features to build confidence.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-yellow-400 flex items-center mb-2">
                    <AlertTriangle className="mr-2" size={20} />
                    Confusing Navigation
                  </h4>
                  <p className="text-gray-300">Visitors can't find what they need and leave frustrated.</p>
                </div>
                <div>
                  <h4 className="text-yellow-400 flex items-center mb-2">
                    <AlertTriangle className="mr-2" size={20} />
                    No Marketing System
                  </h4>
                  <p className="text-gray-300">You're spending money on ads without a strategy to convert traffic.</p>
                </div>
              </div>
            </div>
            <Button onClick={scrollToForm} size="lg" className="bg-emerald hover:bg-emerald/90 text-white px-8 py-4 text-lg font-semibold rounded-full mt-8">
              Fix These Problems Now
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Expert Section */}
      <section className="section-light py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center">
              <FadeIn>
                <div className="rounded-full overflow-hidden inline-block mb-4 shadow-lg">
                  <img 
                    src={expertPhoto} 
                    alt="Store Audit Expert" 
                    className="w-48 h-48 object-cover"
                  />
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <h2 className="text-4xl font-bold mb-6 font-heading">Meet Your Store Audit Expert</h2>
                <p className="text-xl mb-6 text-gray-600">
                  With over 8 years of experience optimizing ecommerce stores, I've helped hundreds of store owners 
                  transform their struggling businesses into profitable brands.
                </p>
                <p className="text-lg mb-6 text-gray-600">
                  I understand the frustration of investing time and money into your store only to see inconsistent results. 
                  My systematic approach to store audits identifies the exact issues holding you back and provides a clear roadmap 
                  to predictable revenue growth.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2" size={20} />
                    500+ stores audited
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2" size={20} />
                    Average 2.5x conversion increase
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2" size={20} />
                    Ecommerce optimization certified
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-dark py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-4xl font-bold mb-4 font-heading">Success Stories From Store Owners Like You</h2>
              <p className="text-xl text-gray-300">Real results from real businesses</p>
            </FadeIn>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.1}>
              <Card className="bg-white text-gray-900">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="mb-4">"The audit revealed exactly what was wrong with our store. After implementing the recommendations, our conversion rate tripled in just 6 weeks!"</p>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-gray-600">Fashion Boutique Owner</div>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Card className="bg-white text-gray-900">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="mb-4">"I was wasting so much money on ads with no sales. The free audit showed me exactly why and how to fix it. Best decision ever!"</p>
                  <div className="font-semibold">Mike Rodriguez</div>
                  <div className="text-sm text-gray-600">Electronics Store</div>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.3}>
              <Card className="bg-white text-gray-900">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="mb-4">"The step-by-step roadmap was exactly what I needed. Finally getting consistent sales and growing my business with confidence."</p>
                  <div className="font-semibold">Emma Thompson</div>
                  <div className="text-sm text-gray-600">Home Decor Shop</div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-light py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-4xl font-bold mb-4 font-heading">How Your Free Store Audit Works</h2>
              <p className="text-xl text-gray-600">Simple, transparent process with clear deliverables</p>
            </FadeIn>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <FadeIn delay={0.1}>
              <div className="text-center">
                <div className="bg-emerald text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h4 className="text-xl font-semibold mb-2 font-heading">Store Analysis</h4>
                <p className="text-gray-600">We analyze your store structure, design, and conversion elements</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="text-center">
                <div className="bg-emerald text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h4 className="text-xl font-semibold mb-2 font-heading">Issue Identification</h4>
                <p className="text-gray-600">We identify specific conversion problems and revenue blockers</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="text-center">
                <div className="bg-emerald text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h4 className="text-xl font-semibold mb-2 font-heading">Audit Report</h4>
                <p className="text-gray-600">You receive a detailed report with actionable recommendations</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="text-center">
                <div className="bg-emerald text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h4 className="text-xl font-semibold mb-2 font-heading">Implementation Plan</h4>
                <p className="text-gray-600">We provide a clear roadmap to transform your store</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-dark py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold mb-6 font-heading">Your Store Is Just a Few Adjustments Away</h2>
            <p className="text-xl mb-12 text-gray-300">
              Many stores are just a few structural improvements away from becoming trustworthy brands. 
              With the right adjustments, you can achieve consistent revenue within 3 to 6 months.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">3-6</div>
                <p className="text-gray-300">Months to consistent revenue</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">300%</div>
                <p className="text-gray-300">Average revenue increase</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">0$</div>
                <p className="text-gray-300">Cost for the initial audit</p>
              </div>
            </div>
            <Button onClick={scrollToForm} size="lg" className="bg-emerald hover:bg-emerald/90 text-white px-8 py-4 text-lg font-semibold rounded-full">
              Request Your Free Store Audit
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking-form" className="section-light py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold font-heading">Request Your Free Store Audit</CardTitle>
                <p className="text-gray-600 mt-2">
                  Fill out the form below and we'll contact you within 24 hours to schedule your free audit session.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="storeUrl">Store URL *</Label>
                    <Input
                      id="storeUrl"
                      name="storeUrl"
                      value={formData.storeUrl}
                      onChange={handleChange}
                      placeholder="https://yourstore.com"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredDate">Preferred Date</Label>
                      <Select value={formData.preferredDate} onValueChange={(value) => handleInputChange('preferredDate', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="next-week">Next Week</SelectItem>
                          <SelectItem value="this-week">This Week</SelectItem>
                          <SelectItem value="asap">As Soon As Possible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preferredTime">Preferred Time</Label>
                      <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                          <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="challenges">What are your biggest challenges? (Optional)</Label>
                    <Textarea
                      id="challenges"
                      name="challenges"
                      value={formData.challenges}
                      onChange={handleChange}
                      placeholder="Tell us about your current challenges and goals..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald hover:bg-emerald/90 text-white py-3 text-lg font-semibold">
                    Request Free Store Audit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>
    </main>
  );
};

export default HighConvertingStoreAudit;
