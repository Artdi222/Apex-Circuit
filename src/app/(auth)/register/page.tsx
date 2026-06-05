'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, isLoading, isInitialized, user, error, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) refreshUser();
  }, []);

  useEffect(() => {
    if (isInitialized && user) {
      router.push('/dashboard');
    }
  }, [user, isInitialized, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.username.length < 3) {
      setLocalError('Username must be at least 3 characters long');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create an account
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter your details to start booking track sessions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || localError) && (
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
            <AlertDescription className="text-xs font-semibold">{error || localError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 h-11 transition-all rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 h-11 transition-all rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="pl-10 pr-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 h-11 transition-all rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="pl-10 pr-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 h-11 transition-all rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold h-11 transition-all rounded-lg shadow-sm hover:shadow active:scale-[0.99] mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-900">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
