import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root path to the dashboard (which will then redirect to /login if unauthenticated)
  redirect("/dashboard");
}
