// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Toaster } from "sonner";

import "./tailwind.css";
import { AuthProvider } from "./contexts/AuthContext";
import React from "react";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    href: "/coinv2.ico",
    type: "image/x-icon",
  },
  {
    rel: "shortcut icon",
    href: "/coinv2.ico",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap",
  },
];

export const meta: MetaFunction = () => [{ title: "CodeON App" }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />

        {/* --- THEME SCRIPT FIX: Prevents Light Mode Flash --- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (localTheme === 'dark' || (!localTheme && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Theme script error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <AuthProvider>{children}</AuthProvider>

        <ResponsiveToaster />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function ResponsiveToaster() {
  // Default to bottom-center (Desktop)
  const [position, setPosition] = React.useState<
    "bottom-center" | "top-center"
  >("bottom-center");

  React.useEffect(() => {
    const checkMobile = () => {
      // Standard mobile breakpoint check (md is usually 768px in Tailwind)
      if (window.matchMedia("(max-width: 768px)").matches) {
        setPosition("top-center");
      } else {
        setPosition("bottom-center");
      }
    };

    // Initial check
    checkMobile();

    // Listener
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      setPosition(e.matches ? "top-center" : "bottom-center");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return <Toaster position={position} richColors />;
}

export default function App() {
  return <Outlet />;
}
