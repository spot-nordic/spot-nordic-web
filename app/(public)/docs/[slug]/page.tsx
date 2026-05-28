'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface DocDetail {
  id: string;
  title: string;
  htmlContent: string;
}

export default function DocDetailPage() {
  const { slug } = useParams();
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [sanitizedContent, setSanitizedContent] = useState<string>('');

  const { data: doc, isLoading, error } = useQuery<DocDetail>({
    queryKey: ['doc', slug],
    queryFn: () => publicApi.getDocPage(slug as string)
  });

  useEffect(() => {
    // Enable smooth scrolling on the document body when jumping to hash links
    document.documentElement.style.scrollBehavior = 'smooth';
    
    if (doc?.htmlContent) {
      // Allowed target and rel so external links and downloads work
      // Removed FORBID_ATTR: ['style'] to allow general styles, but we strip them from buttons below
      const cleanHtml = DOMPurify.sanitize(doc.htmlContent, { 
        ADD_ATTR: ['id', 'target', 'rel'] 
      });
      
      const parser = new DOMParser();
      const docElement = parser.parseFromString(cleanHtml, 'text/html');
      
      // Extract headers and assign IDs for the Right TOC Digest
      const headers = Array.from(docElement.querySelectorAll('h2, h3'));
      const items: TOCItem[] = headers.map((h, i) => {
        const generatedId = h.id || `section-${i}`;
        h.id = generatedId; // This mutates the DOM to attach the jump link ID
        return { 
          id: generatedId, 
          text: h.textContent || '', 
          level: h.tagName === 'H2' ? 2 : 3 
        };
      });

      // Organically size images
      const images = Array.from(docElement.querySelectorAll('img'));
      images.forEach(img => {
        img.removeAttribute('class');
        img.removeAttribute('width');
        img.removeAttribute('height');
        
        const figure = docElement.createElement('figure');
        figure.className = 'my-10 flex flex-col items-center justify-center';
        img.parentNode?.insertBefore(figure, img);
        figure.appendChild(img);
      });

      // Enhance Links: Automatically turn download/PDF links into beautiful buttons
      const links = Array.from(docElement.querySelectorAll('a'));
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        const text = a.textContent?.toLowerCase() || '';
        
        // Check if it's a file download or explicitly says 'download'
        if (href.endsWith('.pdf') || text.includes('download')) {
          a.removeAttribute('style'); // Strip inline styles to ensure theme consistency
          
          // 'not-prose' escapes the tailwind typography plugin's text-link styling
          a.className = 'not-prose inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm my-4 text-sm';
          
          // Inject an SVG download icon next to the text
          const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
          a.innerHTML = `${svgIcon} <span>${a.textContent}</span>`;
          
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
        } else if (href.startsWith('http')) {
          // Normal external links
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
        }
      });

      setToc(items);
      setSanitizedContent(docElement.body.innerHTML);
    }
    
    return () => { document.documentElement.style.scrollBehavior = 'auto'; }
  }, [doc?.htmlContent]);

  if (isLoading) return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-md mb-4"></div>
      <div className="h-4 w-96 bg-muted rounded-md"></div>
    </div>
  );
  
  if (error || !doc) return (
    <div className="w-full flex items-center justify-center min-h-[50vh] text-destructive font-medium">
      Documentation page not found.
    </div>
  );

  return (
    <div className="flex w-full xl:max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* MIDDLE: Main Document Content */}
      <main className="flex-1 min-w-0 py-12 lg:pr-8 xl:pr-12">
        <header className="mb-14 pb-8 border-b border-border">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {doc.title}
          </h1>
        </header>

        <article 
          className="
            prose prose-slate dark:prose-invert max-w-none 
            
            /* Modern Headers with Scroll Margin for sticky headers */
            prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:text-3xl prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-2 prose-h2:mt-16 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
            
            /* Text Polish */
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-[1.05rem] prose-p:mb-6
            prose-strong:text-foreground prose-strong:font-semibold
            
            /* Modern Links (Ignored by elements with not-prose) */
            prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/30 hover:prose-a:decoration-primary transition-colors
            
            /* Beautiful Lists */
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-li:text-muted-foreground prose-li:my-2 prose-li:marker:text-primary/70
            
            /* Organic Images */
            prose-img:m-0 prose-img:w-auto prose-img:max-w-full prose-img:max-h-[600px] prose-img:object-contain prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-border prose-img:bg-card/50
          "
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </main>

      {/* RIGHT SIDEBAR: Section Digest / Table of Contents */}
      <aside className="hidden lg:block w-64 shrink-0 py-12">
        <div className="sticky top-24 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 mb-4">
            <FileText size={14} className="text-primary" /> On this page
          </h4>
          
          <nav className="flex flex-col space-y-3 border-l-2 border-border/50 pl-4 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2 scrollbar-thin">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`text-sm transition-colors hover:text-primary leading-snug ${
                  item.level === 3 
                    ? 'ml-4 text-muted-foreground/70 text-[13px] border-l border-transparent hover:border-primary/50 pl-2' 
                    : 'text-foreground/80 font-medium'
                }`}
              >
                {item.text}
              </a>
            ))}
            {toc.length === 0 && <p className="text-xs text-muted-foreground italic">No subsections to display.</p>}
          </nav>
        </div>
      </aside>
      
    </div>
  );
}