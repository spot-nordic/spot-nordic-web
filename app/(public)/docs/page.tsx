'use client';

import Link from 'next/link';
import { BookOpen, Compass, Newspaper, ShoppingBag } from 'lucide-react';

export default function DocsLandingPage() {
  return (
    <div className="w-full max-w-5xl py-16 px-6 lg:px-12 mx-auto">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
          Spotmatching Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Everything you need to integrate, customize, and master the Spotmatching System. Explore our technical guides and architectural overviews.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/docs/sms_getting_started" className="flex flex-col p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <Compass size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">Getting Started</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">Learn the fundamentals of SMS, basic integration principles, and environment setup.</p>
        </Link>
        
        <Link href="/docs/sms_technical" className="flex flex-col p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-blue-500 transition-colors">Technical Architecture</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">Deep dive into CMYK gamuts, Fogra compliance, and optical brightener interactions.</p>
        </Link>

        <Link href="/docs/sms_news" className="flex flex-col p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
            <Newspaper size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-purple-500 transition-colors">SMS News & Updates</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">Stay up-to-date with the latest releases, palette versions, and industry announcements.</p>
        </Link>

        <Link href="/docs/sms_products_and_services" className="flex flex-col p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
            <ShoppingBag size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-amber-500 transition-colors">Products & Services</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">Explore physical control strips, certification programs, and software tools available to users.</p>
        </Link>
      </div>
    </div>
  );
}