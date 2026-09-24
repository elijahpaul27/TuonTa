import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account | CSC Reviewer",
  description: "Register for the AI-Powered Civil Service Exam Reviewer.",
};

export default function RegisterPage() {
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
        <RegisterForm />
      </div>
    </div>
  );
}
