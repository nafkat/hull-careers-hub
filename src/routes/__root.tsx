import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Anchor } from "lucide-react";

import appCss from "../styles.css?url";
import { Toaster } from "../components/ui/sonner";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "../lib/i18n/context";
import { useTranslation } from "../lib/i18n/useTranslation";

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="grid-bg grid min-h-screen place-items-center px-5">
      <div className="page-enter flex max-w-md flex-col items-center text-center">
        <Anchor className="size-12 text-primary" aria-hidden />
        <p className="font-display text-[clamp(72px,20vw,120px)] leading-none tracking-[6px] text-steel">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl tracking-[3px] text-foreground">{t.notFound.title}</h1>
        <p className="mt-3 text-muted-foreground">
          {t.notFound.subtitle}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-[44px] items-center rounded-[2px] border-2 border-primary bg-card px-8 py-3 font-display text-sm tracking-[3px] text-foreground uppercase transition-colors hover:bg-primary/10"
        >
          {t.notFound.cta}
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EUROHULL Careers" },
      { name: "description", content: "Καριέρα στα ναυπηγεία EUROHULL" },
      { name: "author", content: "EUROHULL" },
      { name: "theme-color", content: "#0B1F3A" },
      { property: "og:site_name", content: "EUROHULL Careers" },
      { property: "og:title", content: "EUROHULL Careers" },
      { property: "og:description", content: "Careers at EUROHULL shipyards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap",
      },

      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="el">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-center" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
