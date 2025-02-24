"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import apiFactory from "@/factories/apiFactory";
import Link from "next/link";

// Separate component for the form content
const FormContent = () => {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const emailFromQuery = searchParams?.get("email") || "";
    setEmail(emailFromQuery);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiFactory<{ message: string }>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        {
          method: "POST",
          body: { email },
        }
      );
      console.log("Reset password email sent:", data);
      setSuccess("Password reset instructions have been sent to your email!");
    } catch (err) {
      setError(
        err instanceof Error
          ? JSON.stringify(err)
          : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 text-green-700 border-green-200 animate-in fade-in-50">
          <AlertDescription className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full transition-colors focus-visible:ring-2 focus-visible:ring-[#127285]"
          required
        />
        <p className="text-sm text-gray-500">
          Enter the email address associated with your account
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#127285] hover:bg-[#0e5a6a] text-white transition-colors font-medium"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Reset Instructions...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#127285] mx-auto" />
      <p className="mt-2 text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

// Main component with Suspense boundary
const ForgotPasswordForm = () => {
  return (
    <div className="flex items-center justify-center bg-gray-50 py-16 sm:py-20 lg:py-32">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#127285]">
            Forgot Your Password?
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            No worries, we'll send you reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingFallback />}>
            <FormContent />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-100 pt-6">
          <Link
            href="/auth/login"
            className="flex items-center text-sm font-medium text-[#127285] hover:text-[#0e5a6a] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
