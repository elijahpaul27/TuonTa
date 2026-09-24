import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-csc-blue-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-csc-blue-dark tracking-tight">
            CSC Reviewer
          </h1>
          <p className="text-slate-600 mt-2 font-medium">
            AI-Powered Civil Service Preparation
          </p>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
