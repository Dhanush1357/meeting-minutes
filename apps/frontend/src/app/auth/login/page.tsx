"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import API_ENDPOINTS from '@/lib/apiEndpoints';
import apiFactory from '@/factories/apiFactory';

const LoginForm = () => {
  const { login } = useAuthStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFactory<{ user: any; token: string }>(
        API_ENDPOINTS.AUTH.LOGIN, // API endpoint
        {
          method: 'POST', // HTTP method
          body: formData, // Form data to send
        }
      );
      // Store user data in Zustand store
      login({
        currentUser: data.user,
        token: data.token
      });

      router.push('/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className='items-center'>
          <CardTitle className="text-2xl font-bold text-[#127285]">Welcome Back!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full focus:ring-[#127285] focus:border-[#127285]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full focus:ring-[#127285] focus:border-[#127285]"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#127285] hover:bg-[#0e5a6a] text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href={`/auth/forgot-password?email=${encodeURIComponent(formData.email)}`} className="text-[#127285] hover:underline">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;