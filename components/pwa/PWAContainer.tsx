"use client";

import { useEffect } from "react";
import {
  registerServiceWorker,
  PWAInstallPrompt,
  SWUpdateBanner,
  OfflineIndicator,
} from "./PWAInstall";

export default function PWAContainer() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <>
      <PWAInstallPrompt />
      <SWUpdateBanner />
      <OfflineIndicator />
    </>
  );
}
