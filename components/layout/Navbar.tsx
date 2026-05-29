'use client';

import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Package, LifeBuoy, LogOut, ChevronDown, ShoppingCart, Menu, X, Sun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sharedApi } from '@/api/shared';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isClient, setIsClient] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);

  const isDocsPage = pathname?.startsWith('/docs');

  useEffect(() => {
    setIsClient(true);
    setHasValidToken(!!localStorage.getItem('token'));
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAuthenticated]);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => sharedApi.getCart(),
    enabled: isClient && isAuthenticated && hasValidToken,
    retry: false
  });

  const cartCount = cartData?.items?.length || 0;

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'SMS', path: '/sms' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Docs', path: '/docs' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      <nav className="w-full bg-background text-foreground border-b border-border shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
         <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary tracking-tighter">
            <Image src="/logo.svg" alt="Spot Nordic Logo" width={32} height={32} className="w-6 h-6" priority />
           <span><span className="text-[#FF4D4E]">SPOT</span><span className="text-foreground">NORDIC</span></span>
          </Link>

          {!isDocsPage && (
            <div className="hidden md:flex items-center gap-6 font-medium text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path} className="hover:text-primary transition-colors">{link.name}</Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            {isClient && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            {isClient && isAuthenticated && hasValidToken && (
              <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background animate-in zoom-in duration-300">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {isClient && (
              isAuthenticated && user && user.firstName && hasValidToken ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold uppercase">
                      {user.firstName?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{user.firstName}</span>
                    <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-border mb-2">
                        <p className="text-sm font-bold text-foreground truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      
                      {user.role === 'ADMIN' ? (
                        <Link href="/admin/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                          <User size={16} /> Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                            <User size={16} /> My Profile
                          </Link>
                          <Link href="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                            <Package size={16} /> Order History
                          </Link>
                          <Link href="/support" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                            <LifeBuoy size={16} /> Support Tickets
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-border mt-2 pt-2">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full text-left transition-colors"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Log in</Link>
                  <Link href="/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">Sign up</Link>
                </div>
              )
            )}

            {!isDocsPage && (
              <button 
                className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && !isDocsPage && (
        <div className="md:hidden bg-background border-b border-border animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col p-6 space-y-4 font-medium text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-primary transition-colors border-b border-border pb-2"
              >
                {link.name}
              </Link>
            ))}
            {(!isAuthenticated || !hasValidToken) && (
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-primary font-bold">Log in</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};