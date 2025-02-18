"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Changed from 'next/router'
import { useAuthStore } from "@/stores/useAuthStore";
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
import { Loader2 } from "lucide-react";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import apiFactory from "@/factories/apiFactory";
import Link from "next/link";

const ForgotPasswordForm = () => {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams?.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiFactory<{ message: string }>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        {
          method: "POST", // HTTP method
          body: { email }, // Send email to API
        }
      );
      console.log("Reset password email sent:", data);
      setSuccess("A password reset email has been sent!");
    } catch (err) {
      setError(
        err instanceof Error ? JSON.stringify(err) : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <CardTitle className="text-2xl font-bold text-[#127285]">
            Forgot Password?
          </CardTitle>
        </CardHeader>
        <CardContent>
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
