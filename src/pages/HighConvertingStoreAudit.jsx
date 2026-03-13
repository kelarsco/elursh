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
import { CheckCircle, ArrowUp, ArrowDown, XCircle, Star, User, Shield, Target, Home, TrendingUp, Layers, DollarSign, Store, UserCheck, Lock, AlertTriangle } from "lucide-react";

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
    console.log('Form submitted:', formData);
    alert('Thank you for your request! We will contact you within 24 hours to schedule your free store audit session.');
    setFormData({
      name: "",
      email: "",
      storeUrl: "",
      preferredDate: "",
      preferredTime: "",
      challenges: ""
    });
  };

  const scrollToForm = () => {
    document.getElementById('audit-form').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>7 Hidden Problems Killing Your Ecommerce Store Sales | Free Store Audit</title>
        <meta name="description" content="Discover the 7 hidden problems quietly killing your ecommerce store sales. Get a free store audit and transform your business into a profitable brand." />
        <link rel="canonical" href="https://elursh.com/high-converting-store-audit" />
      </Helmet>

      {/* Section 1: Curiosity Driven Headline */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-yellow-400 font-bold text-5xl md:text-7xl">7</span> Hidden Problems Quietly Killing Your Ecommerce Store Sales
            <br /><span className="text-yellow-400 text-2xl md:text-3xl">(#4 Is the One Most Store Owners Never Notice)</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Many ecommerce stores fail because of hidden issues in their structure, branding, and marketing systems. 
            These problems silently drain your revenue while you wonder why traffic doesn't convert.
          </p>
          <Button onClick={scrollToForm} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full">
            Request a Free Store Audit
          </Button>
        </div>
      </section>

      {/* Section 2: Visual Explanation */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">There's a System Behind Successful Stores</h2>
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
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <Target className="text-blue-600 mb-4 mx-auto" size={80} />
              <h3 className="text-2xl font-semibold mb-2">Store Structure Blueprint</h3>
              <p className="text-gray-600">Professional audit reveals the exact framework your store needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: This Is For You */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">This Is For You If...</h2>
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
          <Button onClick={scrollToForm} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full mt-8">
            Start Your Store Audit
          </Button>
        </div>
      </section>

      {/* Section 4: With vs Without System */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The Difference Is Clear</h2>
            <p className="text-xl text-gray-600">See how a professional store audit transforms your business</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
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
          </div>
        </div>
      </section>

      {/* Section 5: What You Get */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What You Get From Your Free Store Audit</h2>
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
        </div>
      </section>

      {/* Section 6: Before/After Slider */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See The Transformation</h2>
            <p className="text-xl text-gray-600">Real results from stores that implemented our audit recommendations</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white text-center shadow-2xl">
            <div className="h-64 flex items-center justify-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">{slides[currentSlide].title}</h3>
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
          </div>
        </div>
      </section>

      {/* Section 7: The Real Problem */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">The Real Problem Most Store Owners Face</h2>
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
          <Button onClick={scrollToForm} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full mt-8">
            Fix These Problems Now
          </Button>
        </div>
      </section>

      {/* Section 8: Expert Introduction */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full p-8 inline-block mb-4">
                <UserCheck size={80} />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6">Meet Your Store Audit Expert</h2>
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
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Testimonials */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Success Stories From Store Owners Like You</h2>
            <p className="text-xl text-gray-300">Real results from real businesses</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white text-gray-900">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="mb-4">
                  "The audit revealed exactly why our store wasn't converting. After implementing the changes, our sales increased by 180% in just 45 days!"
                </p>
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full p-2 mr-3">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-gray-600">Fashion Boutique Owner</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white text-gray-900">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="mb-4">
                  "I was spending $2,000/month on ads with barely any sales. The audit showed me exactly what to fix. Now my ads are profitable!"
                </p>
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full p-2 mr-3">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-semibold">Mike Chen</div>
                    <div className="text-sm text-gray-600">Electronics Store</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white text-gray-900">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="mb-4">
                  "Finally someone who understands! The audit was thorough and the results speak for themselves. 300% revenue growth in 3 months."
                </p>
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full p-2 mr-3">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-semibold">Emily Rodriguez</div>
                    <div className="text-sm text-gray-600">Beauty Brand Founder</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 10: Audit Process */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How Your Free Store Audit Works</h2>
            <p className="text-xl text-gray-600">Simple, transparent process with clear deliverables</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Store Analysis</h4>
              <p className="text-gray-600">We analyze your store structure, design, and conversion elements</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">Issue Identification</h4>
              <p className="text-gray-600">We identify specific conversion problems and revenue blockers</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Audit Report</h4>
              <p className="text-gray-600">You receive a detailed report with actionable recommendations</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h4 className="text-xl font-semibold mb-2">Implementation Plan</h4>
              <p className="text-gray-600">We provide a clear roadmap to transform your store</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11: Final Conversion */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Your Store Is Just a Few Adjustments Away</h2>
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
              <div className="text-4xl font-bold text-yellow-400 mb-2">2.5x</div>
              <p className="text-gray-300">Average conversion increase</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">100%</div>
              <p className="text-gray-300">Free audit, no obligation</p>
            </div>
          </div>
          <Button onClick={scrollToForm} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full">
            Request Your Free Store Audit
          </Button>
        </div>
      </section>

      {/* Section 12: Contact Form */}
      <section id="audit-form" className="bg-gray-50 py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Request Your Free Store Audit</CardTitle>
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
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="storeUrl">Store URL *</Label>
                  <Input
                    id="storeUrl"
                    type="url"
                    placeholder="https://yourstore.com"
                    value={formData.storeUrl}
                    onChange={(e) => handleInputChange('storeUrl', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredTime">Preferred Time (US Timezone)</Label>
                    <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9am-11am">9:00 AM - 11:00 AM EST</SelectItem>
                        <SelectItem value="11am-1pm">11:00 AM - 1:00 PM EST</SelectItem>
                        <SelectItem value="1pm-3pm">1:00 PM - 3:00 PM EST</SelectItem>
                        <SelectItem value="3pm-5pm">3:00 PM - 5:00 PM EST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="challenges">What are your biggest challenges? (Optional)</Label>
                  <Textarea
                    id="challenges"
                    placeholder="Tell us about your current situation..."
                    value={formData.challenges}
                    onChange={(e) => handleInputChange('challenges', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="text-center">
                  <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full">
                    Request Free Audit Session
                  </Button>
                  <p className="text-gray-500 mt-3 text-sm">
                    <Lock className="inline mr-1" size={12} />
                    Your information is secure. No spam, ever.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HighConvertingStoreAudit;
