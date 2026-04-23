import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from "./providers";
import { clerkPublishableKey } from '../src/lib/clerk-server';
import "../src/styles/index.css";

export const metadata: Metadata = {
  title: "Nexora App",
  description: "Marketplace B2B que conecta empresas con consultores elite.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = <Providers>{children}</Providers>;

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@600;700&family=Sora:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/logo.png" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body>
        {clerkPublishableKey ? <ClerkProvider>{content}</ClerkProvider> : content}
      </body>
    </html>
  );
}
