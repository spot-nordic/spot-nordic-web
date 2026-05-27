'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { setCredentials } from '@/store/slices/authSlice';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (data) => {
      dispatch(setCredentials({ 
        user: data.user, 
        token: data.token, 
        refreshToken: data.refreshToken 
      }));
      router.push(data.user.role === 'ADMIN' ? '/admin/dashboard' : '/shop');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="w-full max-w-md p-8 bg-card border border-border rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mt-2">Sign in to your Spot Nordic account</p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input 
            type="email" 
            className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full p-3 mt-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-all disabled:opacity-70"
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account? <Link href="/signup" className="text-primary hover:underline font-medium">Create one</Link>
      </div>
    </div>
  );
}