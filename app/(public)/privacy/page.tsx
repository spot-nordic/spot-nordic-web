'use client';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import DOMPurify from 'dompurify';

export default function PrivacyPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['privacy'],
    queryFn: publicApi.getActivePrivacy
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center">Privacy Policy not found</div>;

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen max-w-4xl">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{data.title}</h1>
        <p className="text-muted-foreground">Version: {data.version} | Last Updated: {new Date(data.updatedAt).toLocaleDateString()}</p>
      </header>
      <div 
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.htmlContent) }}
      />
    </div>
  );
}