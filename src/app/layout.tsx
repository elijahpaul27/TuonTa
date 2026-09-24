import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { GlobalNav } from "@/components/layout/GlobalNav";

export const metadata = {
  title: 'CSC Reviewer',
  description: 'AI-Powered Civil Service Preparation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-50 via-[#E0F2FE] to-white bg-doodle relative min-h-screen">
        <AuthProvider>
          <GlobalNav />
          <main className="pt-10">
            {children}
          </main>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
