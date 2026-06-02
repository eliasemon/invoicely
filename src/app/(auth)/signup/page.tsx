'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const { signUp, signInWithGoogle, error: authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = '/dashboard';

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      // OAuth will handle the redirect, so we do not push to the router here
    } catch (err) {
      console.error(err);
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signUp({ email, password, displayName: name });
      router.refresh();
      router.push(redirectPath);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[448px] bg-surface-container-lowest border border-outline-variant shadow-lg rounded-2xl p-6 sm:p-xl my-8">
      <div className="mb-lg text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Create an account</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Start invoicing at the speed of business.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleSubmitting || isSubmitting}
        className="w-full h-12 flex items-center justify-center gap-sm bg-surface border border-outline-variant text-on-surface rounded-lg font-body-md text-body-md font-medium hover:bg-surface-variant transition-colors shadow-sm active:scale-[0.98] duration-150 disabled:opacity-70 disabled:cursor-not-allowed mb-md"
      >
        {isGoogleSubmitting ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        Continue with Google
      </button>

      <div className="flex items-center gap-sm mb-md">
        <div className="flex-1 h-px bg-outline-variant"></div>
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">or sign up with email</span>
        <div className="flex-1 h-px bg-outline-variant"></div>
      </div>

      <form className="space-y-md" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="name">
            Full Name
          </label>
          <input 
            id="name"
            type="text" 
            placeholder="Jane Doe" 
            className="w-full h-12 bg-surface border border-outline-variant rounded-lg px-sm font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
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
        
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="password">
            Password
          </label>
          <input 
            id="password"
            type="password" 
            placeholder="••••••••" 
            className="w-full h-12 bg-surface border border-outline-variant rounded-lg px-sm font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
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
               Signing Up...
             </span>
          ) : 'Sign Up'}
        </button>
      </form>

      <div className="mt-lg text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Already have an account?{' '}
          <Link href={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[448px] text-center p-8">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
