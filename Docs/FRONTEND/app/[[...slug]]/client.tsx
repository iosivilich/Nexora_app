"use client";

import dynamic from "next/dynamic";

const LegacyApp = dynamic(() => import("../../src/app/App"), {
  ssr: false,
});

export function ClientApp() {
  return <LegacyApp />;
}
