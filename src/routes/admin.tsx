import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — EUROHULL Careers" },
      { name: "description", content: "EUROHULL careers administration area." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — EUROHULL Careers" },
      { property: "og:description", content: "EUROHULL careers administration area." },
    ],
  }),
  component: AdminPlaceholder,
});

function AdminPlaceholder() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <Lock className="size-8 text-gold" />
        <h1 className="font-display text-3xl">Admin panel</h1>
        <p className="text-sm text-muted-foreground">
          The password-protected dashboard, job manager and application inbox arrive in the next
          build step, once the backend is connected.
        </p>
        <Link to="/jobs" className="text-sm text-gold underline-offset-4 hover:underline">
          Back to open roles
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
