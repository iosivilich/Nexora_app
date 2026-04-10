import type { Metadata } from "next";
import "../src/styles/index.css";

export const metadata: Metadata = {
  title: "Nexora App",
  description: "Frontend de Nexora montado sobre Next.js.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
