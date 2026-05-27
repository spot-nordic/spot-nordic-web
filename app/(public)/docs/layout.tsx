'use client';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DocNode { id: string; title: string; slug: string; parentId: string | null; isGroup: boolean; sortOrder: number; }
interface DocTreeItem extends DocNode { children: DocTreeItem[]; }

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(288); 
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const { data: nodes, isLoading } = useQuery<DocNode[]>({
    queryKey: ['docsTree'], queryFn: publicApi.getDocsTree, staleTime: 60 * 1000
  });

  const tree = nodes ? nodes.filter(d => d.isGroup).map(group => ({
    ...group,
    children: nodes.filter(item => !item.isGroup && item.parentId === group.id).sort((a, b) => a.sortOrder - b.sortOrder)
  })).sort((a, b) => a.sortOrder - b.sortOrder) : [];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 220) newWidth = 220;
      if (newWidth > 600) newWidth = 600;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden relative w-full">
      
      <div className="lg:hidden absolute top-0 left-0 right-0 h-14 bg-card border-b border-border z-30 flex items-center justify-between px-4">
        <span className="font-bold text-foreground">Docs Navigation</span>
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="p-2 -mr-2 text-foreground">
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside 
        style={{ width: `${sidebarWidth}px` }}
        className={`
          fixed inset-y-0 left-0 z-40 bg-card border-r border-border overflow-y-auto overflow-x-hidden transform duration-300 max-w-[85vw]
          lg:static lg:translate-x-0 lg:flex lg:flex-col lg:shrink-0
          ${mobileSidebarOpen ? 'translate-x-0 top-14' : '-translate-x-full lg:top-0'}
          ${isResizing ? 'transition-none' : 'transition-transform'}
        `}
      >
        <div className="px-6 py-6 border-b border-border/50 hidden lg:block pr-8">
          <Link href="/docs" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
            Documentation Overview
          </Link>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground animate-pulse">Loading navigation...</div>
        ) : (
          <nav className="p-4 space-y-6">
            {tree.map((group) => (
              <div key={group.id} className="space-y-2">
                <h4 className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{group.title}</h4>
                <div className="flex flex-col space-y-1">
                  {group.children.map((child) => (
                    <Link 
                      key={child.id} href={`/docs/${child.slug}`} onClick={() => setMobileSidebarOpen(false)}
                      className={`px-3 py-2.5 text-sm rounded-lg transition-all flex items-center justify-between ${pathname === `/docs/${child.slug}` ? 'bg-primary/10 text-primary font-semibold shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                    >
                      <span className="truncate pr-2">{child.title}</span>
                      {pathname === `/docs/${child.slug}` && <ChevronRight size={14} className="text-primary shrink-0" />}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}

        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          className={`hidden lg:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-primary/50 ${isResizing ? 'bg-primary/50' : ''}`}
        />
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm top-14" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <div className="flex-1 overflow-y-auto scroll-smooth relative pt-14 lg:pt-0 w-full">
        {children}
      </div>

    </div>
  );
}