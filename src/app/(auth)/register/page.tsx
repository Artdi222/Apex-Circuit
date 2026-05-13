'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  
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
      // The useEffect will handle redirection once the user state is updated
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <Card className="border-[#E5E7EB] shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-[#111827]">Create an account</CardTitle>
        <CardDescription className="text-[#6B7280]">
          Enter your details to start booking track sessions
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {(error || localError) && (
            <Alert variant="destructive">
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#111827]">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              className="border-[#D1D5DB] focus:ring-[#2563EB]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#111827]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="border-[#D1D5DB] focus:ring-[#2563EB]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#111827]">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border-[#D1D5DB] focus:ring-[#2563EB]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#111827]">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="border-[#D1D5DB] focus:ring-[#2563EB]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-[#1C1C1E] text-white hover:bg-[#2D2D2F]"
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
          <div className="text-center text-sm text-[#6B7280]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#2563EB] hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
