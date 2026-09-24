"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Registration successful → go to login with a flag so they auto sign-in
      // Then middleware will send them to /onboarding
      router.push("/login?registered=true");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-csc-blue-mid shadow-md bg-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-csc-blue-dark text-center">
          Create Account
        </CardTitle>
        <CardDescription className="text-center text-slate-500">
          Join the AI-Powered CSC Reviewer
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          {/* Full name */}
          <div className="space-y-2">
            <Label htmlFor="reg-name" className="text-slate-700">
              Full Name
            </Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Juan dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-csc-blue-mid/50 focus-visible:ring-csc-blue-dark"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-slate-700">
              Email
            </Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-csc-blue-mid/50 focus-visible:ring-csc-blue-dark"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-slate-700">
              Password
            </Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-csc-blue-mid/50 focus-visible:ring-csc-blue-dark"
              required
            />
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="reg-confirm" className="text-slate-700">
              Confirm Password
            </Label>
            <Input
              id="reg-confirm"
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border-csc-blue-mid/50 focus-visible:ring-csc-blue-dark"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full bg-csc-yellow text-slate-900 font-bold hover:brightness-95 shadow-sm h-11 flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create Account
              </>
            )}
          </Button>

          <p className="text-sm text-slate-500 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-csc-blue-dark font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
