import type { Metadata } from "next";
import { Providers } from "./providers";
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
