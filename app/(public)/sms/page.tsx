'use client';

import React from 'react';
import Link from 'next/link';
import { Monitor, Printer, Smartphone, Factory, CheckCircle2, ArrowRight, Activity, BookOpen, Layers, Zap, Palette } from 'lucide-react';

interface InfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ApplicationCard: React.FC<InfoCardProps> = ({ title, description, icon }) => (
  <div className="bg-background border border-border p-6 rounded-2xl flex items-start gap-4 hover:border-primary/50 transition-colors group">
    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function SMSPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary via-[#D69E2E] to-[#2C5282] blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-foreground text-sm font-bold mb-8 uppercase tracking-widest shadow-sm">
            Overview Guide
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-8 text-foreground leading-[1.1]">
            The Spot Matching System <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#B4518C]">
              (SMS)
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            A 21st-century colour palette for designers, where all colours can be consistently reproduced on digital screens, CMYK printing on coated and uncoated paper, and for Television.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/shop" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-1">
              Shop SMS Ready Tools
            </Link>
            <Link href="/docs" className="bg-secondary text-secondary-foreground border border-border px-8 py-4 rounded-xl font-bold hover:bg-secondary/80 transition-all flex items-center justify-center">
              View Technical Documentation
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
            <div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <BookOpen size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4">The History</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                The Spot Matching System was developed to address longstanding challenges in colour consistency across industries. Traditional methods often led to unpredictable colour shifts due to variations in print processes, digital displays, and material textures. SMS emerged as a definitive solution, allowing graphic designers, brand owners, and manufacturers to maintain absolute colour integrity efficiently.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Activity size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4">The Technology</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                SMS operates on a rigorous LAB-based colour specification system, enabling precise colour matching across different surfaces. Unlike legacy spot color systems based on ink recipes, SMS assigns each colour a unique, verifiable LAB value ensuring measurable precision without discrepancies.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 mb-24 shadow-sm">
            <h3 className="text-2xl font-bold mb-8 text-center">Core Technological Advantages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center mb-4">
                  <Layers size={28} className="text-primary" />
                </div>
                <h4 className="font-bold text-lg mb-2">Cross-Media Consistency</h4>
                <p className="text-sm text-muted-foreground">Colours remain uniform across digital screens, paper, textiles, and analog manufacturing processes.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h4 className="font-bold text-lg mb-2">Standard Verification</h4>
                <p className="text-sm text-muted-foreground">Each SMS colour can be verified using a 0/45 spectral instrument, the standard tool in professional printing.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center mb-4">
                  <Zap size={28} className="text-yellow-600" />
                </div>
                <h4 className="font-bold text-lg mb-2">Ease of Adoption</h4>
                <p className="text-sm text-muted-foreground">Integrate seamlessly into existing workflows, reducing production errors and increasing brand recognition rapidly.</p>
              </div>
            </div>
          </div>

          <div className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Industry Applications</h2>
              <p className="text-lg text-muted-foreground">SMS is widely applicable and trusted across a diverse range of professional sectors.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ApplicationCard 
                title="Graphic Design" 
                description="Ensuring accurate colour representation for branding and visual identity across all collateral."
                icon={<Palette size={24} />}
              />
              <ApplicationCard 
                title="App & Game Design" 
                description="Maintaining striking colour consistency in fast-paced digital environments, VR, AR, and Metaverse."
                icon={<Smartphone size={24} />}
              />
              <ApplicationCard 
                title="TV & Broadcast" 
                description="Precise colour matching for broadcast, media production, and high-end projector systems."
                icon={<Monitor size={24} />}
              />
              <ApplicationCard 
                title="Print & Textile" 
                description="Reliable, verifiable colour reproduction across coated/uncoated paper, fabrics, and merchandise."
                icon={<Printer size={24} />}
              />
              <ApplicationCard 
                title="Analog Manufacturing" 
                description="Facilitating exact ink and dye matching for manufacturers through direct LAB value alignment."
                icon={<Factory size={24} />}
              />
            </div>
          </div>

        </div>
      </section>

      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-gradient-to-br from-primary/10 to-background border border-border rounded-3xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">Adoption & Accessibility</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              With its cost-effective licensing model, SMS makes precision colour management accessible to businesses of all sizes. 
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12 text-left">
              <div className="bg-background border border-border p-8 rounded-2xl shadow-sm">
                <h3 className="text-2xl font-bold mb-2">Get Started</h3>
                <div className="text-4xl font-extrabold text-foreground mb-4">€140 <span className="text-sm text-muted-foreground font-normal tracking-normal">/ palette</span></div>
                <p className="text-muted-foreground mb-6">Companies and individuals can purchase an official SMS colour palette to immediately begin working with SMS colours.</p>
                <Link href="/shop" className="block text-center w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
                  Purchase Palette
                </Link>
              </div>
              <div className="bg-background border border-border p-8 rounded-2xl shadow-sm">
                <h3 className="text-2xl font-bold mb-2">Brand Registration</h3>
                <div className="text-4xl font-extrabold text-foreground mb-4">Free <span className="text-sm text-muted-foreground font-normal tracking-normal">/ unlimited</span></div>
                <p className="text-muted-foreground mb-6">SMS users can register an unlimited number of SMS brands with Spot-Nordic (providing artwork in SMS sRGB) free of charge.</p>
                <Link href="/contact" className="block text-center w-full bg-secondary text-secondary-foreground border border-border py-3 rounded-lg font-bold hover:bg-secondary/80 transition-colors">
                  Register Brand
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm font-bold text-muted-foreground">
              <a href="/SMScatalog04.2026.pdf" target="_blank" className="flex items-center gap-2 hover:text-primary transition-colors">
                <BookOpen size={16} /> Read the SMS Catalog
                <ArrowRight size={14} />
              </a>
              <Link href="/contact" className="flex items-center gap-2 hover:text-primary transition-colors">
                Contact Spot-Nordic HQ
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}