'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const AuthGuard = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'ADMIN' | 'USER' }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, requiredRole, router, isHydrated]);

  if (!isHydrated || !isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
};