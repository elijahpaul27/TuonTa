"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show success banner when arriving from /register
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Account created! Please sign in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      // Fetch the session to read the user's role for routing
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "ADMIN") {
        router.push("/admin/qa-dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-csc-blue-mid shadow-md bg-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-csc-blue-dark text-center">
          Sign In
        </CardTitle>
        <CardDescription className="text-center text-slate-500">
          Enter your email and password to access your dashboard
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Success banner (post-registration) */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-none" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-csc-blue-mid/50 focus-visible:ring-csc-blue-dark"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-csc-blue-mid/50 focus-visible:ring-csc-blue-dark"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full bg-csc-yellow text-slate-900 font-bold hover:brightness-95 shadow-sm h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-sm text-slate-500 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-csc-blue-dark font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
