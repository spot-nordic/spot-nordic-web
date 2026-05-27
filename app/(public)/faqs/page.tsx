'use client';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqsPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: publicApi.getFaqs
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading FAQs...</div>;

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">Find answers to common questions about our products and services.</p>
      </div>

      <div className="space-y-4">
        {data?.map((faq: any) => (
          <div key={faq.id} className="border border-border rounded-lg bg-card overflow-hidden transition-all">
            <button 
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="w-full text-left px-6 py-5 font-semibold text-lg flex justify-between items-center focus:outline-none"
            >
              {faq.question}
              <ChevronDown className={`transition-transform duration-300 ${openId === faq.id ? 'rotate-180' : ''}`} />
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ${openId === faq.id ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}