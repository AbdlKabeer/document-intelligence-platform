"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Zap, Users, Brain, Lock, BarChart3, FileText, Workflow, Building2, Globe2, Clock, Check, ChevronRight, AlertCircle, MessageSquare, Upload, ArrowUpRight } from 'lucide-react';

// Enhanced MetricCard with better animation and design
const MetricCard = ({ value, label, icon: Icon }: { value: string; label: string; icon: any }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`bg-white/90 backdrop-blur-sm p-8 rounded-2xl text-center transform transition-all duration-700 hover:scale-105 border border-green-100 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <div className="relative">
        <div className="absolute -inset-4 bg-green-100 rounded-full opacity-20" />
        <Icon className="h-10 w-10 text-green-600 mx-auto mb-4 relative" />
      </div>
      <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
};

// Enhanced FeatureCard with better hover effects
const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="group p-8 bg-white/95 backdrop-blur-sm rounded-2xl hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-8 w-8 text-green-700" />
      </div>
      <h3 className="text-xl font-semibold text-green-700 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
      <div className="mt-6 flex items-center text-green-700 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <span className="text-sm font-medium">Learn more</span>
        <ArrowUpRight className="h-4 w-4 ml-1" />
      </div>
    </div>
  </div>
);

// Enhanced HeroStats with better design
const HeroStats = () => (
  <div className="absolute -bottom-12 -right-12 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-green-100 transform hover:scale-105 transition-all duration-300">
    <div className="grid grid-cols-2 gap-8">
      <div className="text-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">99.9%</div>
        <div className="text-sm text-gray-600 font-medium mt-1">Uptime</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">2.5x</div>
        <div className="text-sm text-gray-600 font-medium mt-1">ROI</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">10k+</div>
        <div className="text-sm text-gray-600 font-medium mt-1">Users</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">95%</div>
        <div className="text-sm text-gray-600 font-medium mt-1">Satisfaction</div>
      </div>
    </div>
  </div>
);

// Enhanced TestimonialCard with better visuals
const TestimonialCard = ({ name, role, company, quote, rating = 5 }: { name: string; role: string; company: string; quote: string; rating?: number }) => (
  <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group">
    <div className="absolute inset-x-0 -top-px h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="flex items-center justify-between mb-6">
      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
        <Building2 className="h-6 w-6 text-green-700" />
      </div>
      <div className="flex">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
    <p className="text-gray-600 italic mb-6 leading-relaxed flex-grow">&quot;{quote}&quot;</p>
    <div className="border-t pt-6 mt-auto">
      <h4 className="font-semibold text-green-700">{name}</h4>
      <p className="text-gray-500 text-sm">{role}</p>
      <p className="text-gray-400 text-sm">{company}</p>
    </div>
  </div>
);

// Enhanced Hero Section with 3D-like elements
const HeroSection = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-amber-100/50 opacity-50" />
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(104,211,145,0.15)_0%,rgba(255,255,255,0)_100%)]" />
    </div>
    <div className="relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium">
            <Zap className="h-4 w-4 mr-2" />
            Trusted by 500+ enterprises
          </div>
          <h1 className="text-6xl font-bold text-green-800 leading-tight">
            Empower Your Workforce with{' '}
            <span className="relative inline-block">
              Custom AI
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-amber-200/50 -rotate-2 transform" />
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Transform your enterprise with AI assistants tailored to each role. Boost productivity, streamline workflows, and unlock your team's full potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-green-700 text-white rounded-xl hover:bg-green-600 transition-all duration-300 flex items-center justify-center group shadow-lg shadow-green-700/20">
              Schedule Demo
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-green-700 rounded-xl hover:bg-green-50 transition-all duration-300 flex items-center justify-center border border-green-200">
              Watch Video
            </button>
          </div>
        </div>
        <div className="relative">
          <HeroIllustration />
          <HeroStats />
        </div>
      </div>
    </div>
  </div>
);

// Hero Section SVG
const HeroIllustration = () => (
  <svg viewBox="0 0 600 400" className="w-full h-full rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#34D399', stopOpacity: 0.2 }} />
        <stop offset="100%" style={{ stopColor: '#FCD34D', stopOpacity: 0.2 }} />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="600" height="400" fill="url(#grad1)" rx="20" />
    <circle cx="300" cy="200" r="80" fill="#34D399" fillOpacity="0.3" />
    <path d="M250 180 Q300 120 350 180 T450 180" stroke="#059669" strokeWidth="4" fill="none" />
    <rect x="150" y="250" width="300" height="40" fill="#059669" fillOpacity="0.1" rx="8" />
    <rect x="150" y="300" width="200" height="40" fill="#059669" fillOpacity="0.1" rx="8" />
  </svg>
);

const UseCaseCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="p-8 bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
      <Icon className="h-6 w-6 text-green-700" />
    </div>
    <h3 className="text-xl font-semibold text-green-700 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Rest of the component remains similar, just updating the main return statement
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 font-sans">

      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="h-8 w-8 text-green-700" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">LiveQ</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-700 transition-colors duration-300">Features</a>
              <a href="#solutions" className="text-gray-600 hover:text-green-700 transition-colors duration-300">Solutions</a>
              <a href="#testimonials" className="text-gray-600 hover:text-green-700 transition-colors duration-300">Testimonials</a>
              <button className="px-6 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-600 transition-all duration-300 flex items-center shadow-lg shadow-green-700/20">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <HeroSection />
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-green-100 to-amber-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard value="95%" label="User Satisfaction" icon={Users} />
            <MetricCard value="30%" label="Efficiency Increase" icon={Zap} />
            <MetricCard value="500+" label="Enterprise Clients" icon={Building2} />
            <MetricCard value="24/7" label="AI Support" icon={Clock} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-700 mb-4">
              Enterprise-Grade AI Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Customize and deploy AI assistants that understand your industry, company processes, and security requirements.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="Role-Specific AI Assistants"
              description="Create custom AI assistants tailored to different roles and departments within your organization."
            />
            <FeatureCard
              icon={Lock}
              title="Enterprise Security"
              description="Bank-grade encryption and compliance with SOC 2, HIPAA, and other industry standards."
            />
            <FeatureCard
              icon={Workflow}
              title="Workflow Automation"
              description="Streamline complex processes with intelligent automation and custom workflows."
            />
            <FeatureCard
              icon={FileText}
              title="Document Intelligence"
              description="Process and analyze documents with advanced AI capabilities and natural language understanding."
            />
            <FeatureCard
              icon={Globe2}
              title="Multilingual Document Hub"
              description="Upload and manage official documents in 95+ languages. AI assistants automatically understand and respond to client queries based on your documentation."
            />
            <FeatureCard
              icon={Upload}
              title="Document-Aware AI Service"
              description="Upload company documents and let AI assistants handle customer inquiries using your official documentation through our robust API integration."
            />
            <FeatureCard
              icon={BarChart3}
              title="Advanced Analytics"
              description="Perform technical calculations and generate precise visualizations of data in real-time."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Contextual Responses"
              description="AI assistants provide accurate responses based on your uploaded documentation, maintaining consistency across all customer interactions."
            />
            <FeatureCard
              icon={Shield}
              title="Data Privacy Controls"
              description="Granular control over document access and usage, ensuring sensitive information remains secure."
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section - From old version with enhanced UI */}
      <section id="use-cases" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-700 mb-4">
              How Companies Use LiveQ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how leading organizations leverage LiveQ to transform their operations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <UseCaseCard
              icon={FileText}
              title="Research Teams"
              description="Equip researchers with tools for analyzing and deriving insights from large sets of technical documents."
            />
            <UseCaseCard
              icon={BarChart3}
              title="Finance Professionals"
              description="Provide finance teams with workflows that automate and streamline reporting and data analysis."
            />
            <UseCaseCard
              icon={AlertCircle}
              title="Legal Departments"
              description="Enable legal teams to analyze documents securely and efficiently, enhancing compliance and due diligence."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-gradient-to-b from-green-100 to-amber-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-700 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how enterprises are transforming their operations with LiveQ's AI assistants.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Chen"
              role="Chief Technology Officer"
              company="Global Financial Services"
              quote="LiveQ's AI assistants have revolutionized how our teams handle complex financial analysis and reporting. The customization capabilities are exceptional."
            />
            <TestimonialCard
              name="Michael Roberts"
              role="Head of Operations"
              company="Healthcare Solutions Inc"
              quote="The ability to create role-specific AI assistants has transformed our workflow efficiency. Our teams are more productive than ever."
            />
            <TestimonialCard
              name="Elena Rodriguez"
              role="Director of Innovation"
              company="Tech Innovations Corp"
              quote="LiveQ's enterprise-grade security and customization features made it the clear choice for our AI transformation journey."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-green-700 mb-6">
            Ready to Transform Your Enterprise?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join leading companies in empowering your workforce with custom AI assistants. Schedule a demo to see LiveQ in action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 transition-all duration-300 flex items-center justify-center">
              Schedule Enterprise Demo <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="px-8 py-4 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold">LiveQ</span>
            </div>
            <p className="text-gray-400">
              Empowering enterprises with custom AI solutions.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Features</li>
              <li>Solutions</li>
              <li>Security</li>
              <li>Pricing</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Documentation</li>
              <li>Case Studies</li>
              <li>Support</li>
              <li>API</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 LiveQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}