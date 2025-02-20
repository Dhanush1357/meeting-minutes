"use client";

import React, { useState } from "react";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import apiFactory from "@/factories/apiFactory";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      await apiFactory<{ message: string }>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          method: "POST",
          body: {
            resetToken,
            newPassword
          },
        }
      );
      setSuccess("Password reset successful!");
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
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

  return (
    <form onSubmit={handleSubmit} className="">
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
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pr-10 focus:ring-[#127285] focus:border-[#127285]"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pr-10 focus:ring-[#127285] focus:border-[#127285]"
            required
            minLength={8}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-2 bg-[#127285] hover:bg-[#0e5a6a] text-white"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
};

const LoadingFallback = () => (
  <div className="flex justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-[#127285]" />
  </div>
);

const ResetPasswordForm = () => {
  return (
    <div className="mt-10 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <CardTitle className="text-2xl font-bold text-[#127285]">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <React.Suspense fallback={<LoadingFallback />}>
            <FormContent />
          </React.Suspense>
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

export default ResetPasswordForm;