"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import apiFactory from "@/factories/apiFactory";
import Link from "next/link";

const FormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetToken = searchParams?.get("token") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!resetToken) {
      setError("Reset token is missing");
      setLoading(false);
      return;
    }

    try {
      await apiFactory<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: "POST",
        body: {
          resetToken,
          newPassword,
        },
      });
      setSuccess("Password reset successful! Redirecting to login...");
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password strength indicators
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 text-green-700 border-green-200 animate-in fade-in-50">
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pr-10 transition-colors focus-visible:ring-2 focus-visible:ring-[#127285]"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="space-y-2 mt-2">
            <p className="text-sm text-gray-500">Password requirements:</p>
            <ul className="space-y-1 text-sm">
              <li
                className={`flex items-center gap-2 ${hasMinLength ? "text-green-600" : "text-gray-500"}`}
              >
                <CheckCircle
                  className={`h-4 w-4 ${hasMinLength ? "opacity-100" : "opacity-40"}`}
                />
                Minimum 8 characters
              </li>
              <li
                className={`flex items-center gap-2 ${hasNumber ? "text-green-600" : "text-gray-500"}`}
              >
                <CheckCircle
                  className={`h-4 w-4 ${hasNumber ? "opacity-100" : "opacity-40"}`}
                />
                Contains a number
              </li>
              <li
                className={`flex items-center gap-2 ${hasSpecialChar ? "text-green-600" : "text-gray-500"}`}
              >
                <CheckCircle
                  className={`h-4 w-4 ${hasSpecialChar ? "opacity-100" : "opacity-40"}`}
                />
                Contains a special character
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pr-10 transition-colors focus-visible:ring-2 focus-visible:ring-[#127285]"
              required
              minLength={8}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#127285] hover:bg-[#0e5a6a] text-white transition-colors"
        disabled={loading || !hasMinLength || !hasNumber || !hasSpecialChar}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
};

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#127285] mx-auto" />
      <p className="mt-2 text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

const ResetPasswordForm = () => {
  return (
    <div className=" flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#127285]">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <React.Suspense fallback={<LoadingFallback />}>
            <FormContent />
          </React.Suspense>
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

export default ResetPasswordForm;
