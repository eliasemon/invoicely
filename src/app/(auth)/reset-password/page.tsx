'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { updatePassword, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (password !== confirmPassword) {
      setValidationError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updatePassword(password);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[448px] bg-surface-container-lowest border border-outline-variant shadow-lg rounded-2xl p-6 sm:p-xl">
      <div className="mb-lg text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Set new password</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Please enter your new password below.
        </p>
      </div>

      <form className="space-y-md" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="password">
            New Password
          </label>
          <input 
            id="password"
            type="password" 
            placeholder="••••••••" 
            className="w-full h-12 bg-surface border border-outline-variant rounded-lg px-sm font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input 
            id="confirmPassword"
            type="password" 
            placeholder="••••••••" 
            className="w-full h-12 bg-surface border border-outline-variant rounded-lg px-sm font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        
        {(authError || validationError) && (
          <div className="text-error text-sm font-body-sm p-2 bg-error-container rounded-md">
            {validationError || authError}
          </div>
        )}

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 flex items-center justify-center bg-primary text-on-primary rounded-lg font-body-md text-body-md font-medium hover:bg-primary-container transition-colors shadow-md mt-sm active:scale-[0.98] duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
             <span className="flex items-center gap-2">
               <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
               Updating...
             </span>
          ) : 'Update password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[448px] text-center p-8">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
