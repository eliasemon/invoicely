'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[448px] bg-surface-container-lowest border border-outline-variant shadow-lg rounded-2xl p-6 sm:p-xl">
      <div className="mb-lg text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Reset password</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-md">
          <div className="text-primary font-body-md p-4 bg-primary-container rounded-md">
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </div>
          <Link href="/login" className="inline-block w-full h-12 flex items-center justify-center bg-surface border border-outline-variant text-on-surface rounded-lg font-body-md text-body-md font-medium hover:bg-surface-variant transition-colors shadow-sm mt-md">
            Return to sign in
          </Link>
        </div>
      ) : (
        <form className="space-y-md" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="email">
              Email Address
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="you@company.com" 
              className="w-full h-12 bg-surface border border-outline-variant rounded-lg px-sm font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {authError && (
            <div className="text-error text-sm font-body-sm p-2 bg-error-container rounded-md">
              {authError}
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
                 Sending link...
               </span>
            ) : 'Send reset link'}
          </button>
          
          <div className="mt-lg text-center">
            <Link href="/login" className="font-body-md text-body-md text-primary font-medium hover:underline">
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[448px] text-center p-8">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
