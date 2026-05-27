'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Menu, Sun, Moon } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  const [mounted, setMounted] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthGuard requiredRole="ADMIN">
      <div className="flex h-screen bg-muted/20 overflow-hidden">
        <AdminSidebar 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          pathname={pathname}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0 transition-all duration-300">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" onClick={() => setMobileOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="hidden sm:block text-lg font-semibold capitalize text-foreground">
                {pathname.split('/').pop()}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {mounted && (
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
              
              <div className="w-px h-6 bg-border hidden sm:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground leading-none">Administrator</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold uppercase text-sm shrink-0">
                  {user?.firstName?.[0]}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        )}
      </div>
    </AuthGuard>
  );
}