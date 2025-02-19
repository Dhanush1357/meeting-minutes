"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
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
      setSuccess("A password reset email has been sent!");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            Sending...
          </>
        ) : (
          "Send Mail"
        )}
      </Button>
    </form>
  );
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-[#127285]" />
  </div>
);

// Main component with Suspense boundary
const ForgotPasswordForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <CardTitle className="text-2xl font-bold text-[#127285]">
            Forgot Password?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingFallback />}>
            <FormContent />
          </Suspense>
        </CardContent>
        <CardFooter>
          <Link href="/auth/login" className="text-[#127285] hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;