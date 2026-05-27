'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const router = useRouter();

  const forgotPasswordMutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email }),
    onSuccess: () => {
      setStep(2);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to send OTP.');
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () => authApi.verifyOtp({ email, otp, type: 'PASSWORD_RESET' }),
    onSuccess: (data) => {
      setResetToken(data.resetToken);
      setStep(3);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Invalid or expired OTP.');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => authApi.resetPassword({ email, newPassword, resetToken }),
    onSuccess: () => {
      alert('Password reset successful. Please log in with your new password.');
      router.push('/login');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  });

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate();
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    resetPasswordMutation.mutate();
  };

  return (
    <div className="w-full max-w-md p-8 bg-card border border-border rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {step === 1 && 'Enter your email to receive an OTP'}
          {step === 2 && `Enter the OTP sent to ${email}`}
          {step === 3 && 'Create a new secure password'}
        </p>
      </div>
      
      {step === 1 && (
        <form onSubmit={handleSendEmail} className="space-y-4">
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
          <button 
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full p-3 mt-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-all disabled:opacity-70"
          >
            {forgotPasswordMutation.isPending ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
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
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input 
              type="password" 
              className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full p-3 mt-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-all disabled:opacity-70"
          >
            {resetPasswordMutation.isPending ? 'Resetting...' : 'Confirm New Password'}
          </button>
        </form>
      )}
      
      {step === 1 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </div>
      )}
    </div>
  );
}