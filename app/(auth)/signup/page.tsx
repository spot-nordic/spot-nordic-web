'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { setCredentials } from '@/store/slices/authSlice';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    captchaToken: 'dummy-captcha-token'
  });
  const [otp, setOtp] = useState('');
  
  const dispatch = useDispatch();
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: () => authApi.register(formData),
    onSuccess: () => {
      setStep(2);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () => authApi.verifyOtp({ email: formData.email, otp, type: 'REGISTER' }),
    onSuccess: (data) => {
      dispatch(setCredentials({ 
        user: data.user, 
        token: data.token, 
        refreshToken: data.refreshToken 
      }));
      router.push('/shop');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate();
  };

  return (
    <div className="w-full max-w-md p-8 bg-card border border-border rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {step === 1 ? 'Join Spot Nordic today' : `Enter the OTP sent to ${formData.email}`}
        </p>
      </div>
      
      {step === 1 ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input 
                type="text" 
                className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input 
                type="text" 
                className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full p-3 mt-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-all disabled:opacity-70"
          >
            {registerMutation.isPending ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">One-Time Password</label>
            <input 
              type="text" 
              className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center tracking-widest text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
            />
          </div>
          <button 
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="w-full p-3 mt-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-all disabled:opacity-70"
          >
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="w-full p-3 bg-transparent text-primary font-medium hover:underline transition-all"
          >
            Back
          </button>
        </form>
      )}
      
      {step === 1 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </div>
      )}
    </div>
  );
}