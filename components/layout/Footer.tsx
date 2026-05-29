import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary tracking-tighter">
              <Image src="/logo.svg" alt="Spot Nordic Logo" width={32} height={32} className="w-6 h-6" priority />
              <span><span className="text-[#FF4D4E]">SPOT</span><span className="text-foreground">NORDIC</span></span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Premium Nordic designs and comprehensive documentation for modern creators.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/shop" className="hover:text-primary transition-colors">All Products</Link>
              <Link href="/shop?category=featured" className="hover:text-primary transition-colors">Featured</Link>
              <Link href="/shop?category=new" className="hover:text-primary transition-colors">New Arrivals</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
              <Link href="/blogs" className="hover:text-primary transition-colors">Journal</Link>
              <Link href="/faqs" className="hover:text-primary transition-colors">FAQs</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Spot Nordic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};