'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout } from '@/store/slices/authSlice';

export const AuthGuard = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'ADMIN' | 'USER' }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // BREAK THE LOOP: If Redux thinks we are logged in, but the token was wiped by the interceptor, 
    // we must immediately clear the Redux state to stop the infinite reload loop.
    if (isAuthenticated && !token) {
      dispatch(logout());
      router.replace('/login');
      return;
    }

    if (!isAuthenticated || !token) {
      router.replace('/login');
    } else if (requiredRole && user?.role !== requiredRole) {
      router.replace('/');
    } else {
      setIsAuthorized(true);
    }
  }, [isAuthenticated, user, requiredRole, router, dispatch]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center animate-pulse">Authenticating...</div>;
  }

  return <>{children}</>;
};