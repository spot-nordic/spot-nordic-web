'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ShoppingBag, Palette, Target, Zap, Globe, ArrowUpRight, Award, Briefcase, MapPin, Plane, ShieldCheck } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </div>
);

export default function AboutPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background -z-10"></div>
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-foreground text-sm font-semibold mb-8 shadow-sm">
            <Target size={16} className="text-primary" />
            Defining the Nordic Standard Since 2015
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground">
            Crafting Premium Experiences Through <span className="text-primary">Nordic Precision</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Spot-Nordic, a trademark of I&I Heildsala, was founded in Iceland to bring absolute reliability, flawless functionality, and a timeless aesthetic to printing companies, designers, and advertising agencies worldwide.
          </p>
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Heritage & Expertise</h2>
              <div className="prose prose-lg dark:prose-invert text-muted-foreground">
                <p>
                  Led by Owner and CEO Mr. Ingi Karlsson, our roots run deep in the graphic arts industry. With nearly three decades of experience spanning offset printing, prepress, design, and color management systems, we understand the critical demands of modern production.
                </p>
                <p>
                  In 2007, Mr. Karlsson became the first person globally to earn the prestigious <strong>Ugra Certified Expert</strong> diploma (Certificate #1). This unwavering commitment to international standards drives our advisory services, helping global agencies and printers maximize quality and profitability.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-background border border-border px-4 py-3 rounded-lg text-sm font-bold text-foreground shadow-sm">
                  <Award className="text-primary" size={20} />
                  Ugra Certified Expert #1
                </div>
                <div className="flex items-center gap-2 bg-background border border-border px-4 py-3 rounded-lg text-sm font-bold text-foreground shadow-sm">
                  <Briefcase className="text-primary" size={20} />
                  30+ Years Experience
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FeatureCard 
                title="Global Distribution" 
                description="The exclusive worldwide distributor and creator of the Spot Matching System (SMS)."
                icon={<Globe size={24} />}
              />
              <FeatureCard 
                title="Industry Advisory" 
                description="Consulting for businesses aiming to align with international production standards."
                icon={<ShieldCheck size={24} />}
              />
              <FeatureCard 
                title="Simplicity" 
                description="Removing friction from complex workflows to let pure creativity and efficiency thrive."
                icon={<Zap size={24} />}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-secondary rounded-3xl overflow-hidden border border-border shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 md:p-16 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border text-foreground text-xs font-bold uppercase tracking-wider mb-6 w-fit">
                  <Palette size={14} className="text-primary" /> The Color Revolution
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-foreground leading-tight">
                  Spot Matching System® (SMS)
                </h2>
                <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                  The Spot Matching System is our flagship 21st-century color ordering infrastructure. Designed to guarantee consistent brand colors across digital screens, CMYK printing on all paper types, and television broadcasting via exact LAB value targeting.
                </p>
                <Link href="/sms" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors w-fit shadow-md">
                  Discover SMS Infrastructure
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="bg-card border-l border-border p-12 md:p-16 flex flex-col justify-center items-center">
                <div className="w-full max-w-md">
                  <div className="flex h-32 w-full rounded-2xl overflow-hidden shadow-lg border border-border">
                    {['#D85456', '#3D3737', '#4B4846', '#2C5282', '#38A169', '#D69E2E'].map((color, idx) => (
                      <div 
                        key={idx} 
                        className="flex-1 hover:flex-[1.5] transition-all duration-300 ease-in-out cursor-pointer relative group" 
                        style={{ backgroundColor: color }}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-mono font-bold bg-background text-foreground px-2 py-1 rounded shadow-sm">
                            {color}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 text-center text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Precision in every shade
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">World-Class Manufacturing Partners</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-16">
            In addition to our proprietary systems, we proudly represent and distribute solutions from the industry's most respected manufacturers to ensure our clients have access to the best technology available.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {['Pantone', 'TECHKON', 'Just Normlicht', 'Cherlyn', 'Digital Information', 'Rutherford'].map((partner, index) => (
              <div key={index} className="bg-background border border-border rounded-xl p-6 flex items-center justify-center h-24 hover:border-primary/50 transition-colors shadow-sm">
                <span className="font-bold text-foreground opacity-80">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Explore The Spot Nordic Ecosystem</h2>
            <p className="text-lg text-muted-foreground">
              We provide the tools, the physical goods, and the knowledge base required to execute your vision flawlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/shop" className="group block relative overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors shadow-sm">
              <div className="p-10 md:p-14">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-foreground">
                  Spot Nordic Store
                  <ArrowUpRight size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Browse our curated collection of premium goods available worldwide. From physical SMS color palettes to QC tools and workspace essentials, our store embodies our philosophy of uncompromising quality.
                </p>
                <span className="text-primary font-bold uppercase tracking-wider text-sm group-hover:underline underline-offset-4">
                  Visit the Shop
                </span>
              </div>
            </Link>

            <Link href="/docs" className="group block relative overflow-hidden rounded-3xl bg-card border border-border hover:border-blue-500/50 transition-colors shadow-sm">
              <div className="p-10 md:p-14">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-foreground">
                  Extensive Documentation
                  <ArrowUpRight size={24} className="text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Bridge creative intent with manufacturing reality. Our comprehensive technical documentation provides deep dives into ISO 12647 compliance, color management frameworks, and system integrations.
                </p>
                <span className="text-blue-600 font-bold uppercase tracking-wider text-sm group-hover:underline underline-offset-4">
                  Read the Docs
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-32 bg-secondary border-t border-border relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Plane size={400} />
        </div>
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="w-20 h-20 bg-background border border-border text-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <MapPin size={32} />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-6 text-foreground">Time to Visit Iceland</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10">
            Iceland is one of the most breathtaking destinations in the world. If you haven't visited yet, you now have the perfect excuse to book a flight. Meet our team in Reykjavik to discuss how we can elevate your business, then explore the majestic Blue Lagoon, Geysir, and Gullfoss.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/contact" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md">
              Schedule a Consultation
            </Link>
            <div className="flex flex-col text-sm text-muted-foreground text-left sm:border-l-2 sm:border-border sm:pl-6">
              <span className="font-bold text-foreground mb-1">Spot-Nordic HQ</span>
              <span>Spoaholar 4, 111 Reykjavik</span>
              <a href="mailto:info@spot-nordic.com" className="hover:text-primary transition-colors mt-1">info@spot-nordic.com</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}