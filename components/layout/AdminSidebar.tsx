'use client';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingCart, Package,
  FileText, MessageSquare, Ticket, FileCode2,
  ShieldCheck, ScrollText, LogOut, UserCircle,
  PanelLeftClose, PanelLeftOpen, HelpCircle, X
} from 'lucide-react';
import { logout } from '@/store/slices/authSlice';
import Image from 'next/image';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Blogs', path: '/admin/blogs', icon: FileText },
  { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
  { name: 'Contacts', path: '/admin/contacts', icon: MessageSquare },
  { name: 'Docs', path: '/admin/docs', icon: FileCode2 },
  { name: 'Privacy', path: '/admin/privacy', icon: ShieldCheck },
  { name: 'Terms', path: '/admin/terms', icon: ScrollText },
  { name: 'Faqs', path: '/admin/faqs', icon: HelpCircle },
  { name: 'Profile', path: '/admin/profile', icon: UserCircle },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  pathname: string;
}

export const AdminSidebar = ({ mobileOpen, setMobileOpen, isCollapsed, setIsCollapsed, pathname }: AdminSidebarProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 lg:static ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
      <div className="flex items-center h-16 px-4 border-b border-border shrink-0 relative">
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-2 font-bold tracking-tighter text-primary whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed && !mobileOpen ? 'w-0 opacity-0' : 'w-40 opacity-100 text-xl'
            }`}
        >
          <Image
            src="/logo.svg"
            alt="Spot Nordic Logo"
            width={24}
            height={24}
            className="w6 h6"
            priority
          />
          <span>
            <span className="text-[#FF4D4E]">SPOT</span>
            <span className="text-foreground">ADMIN</span>
          </span>
        </Link>
        <button className="lg:hidden absolute right-4 p-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
        <button
          className={`hidden lg:flex absolute p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-300 ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          const isVisuallyCollapsed = isCollapsed && !mobileOpen;

          return (
            <Link
              key={link.path}
              href={link.path}
              title={isVisuallyCollapsed ? link.name : undefined}
              className={`flex items-center h-11 px-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
            >
              <div className="flex items-center justify-center shrink-0 w-6">
                <Icon size={20} />
              </div>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isVisuallyCollapsed ? 'w-0 opacity-0 ml-0' : 'w-40 opacity-100 ml-3 text-sm'}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-border shrink-0">
        <button
          onClick={() => { dispatch(logout()); router.push('/login'); }}
          title={isCollapsed && !mobileOpen ? 'Logout' : undefined}
          className="flex items-center h-11 px-3 w-full rounded-md text-destructive hover:bg-destructive/10 transition-colors"
        >
          <div className="flex items-center justify-center shrink-0 w-6">
            <LogOut size={20} />
          </div>
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed && !mobileOpen ? 'w-0 opacity-0 ml-0' : 'w-40 opacity-100 ml-3 text-sm font-medium text-left'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};