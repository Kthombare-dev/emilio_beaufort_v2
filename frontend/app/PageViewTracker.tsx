"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/tracking";

export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackPageView(pathname || '/');
  }, [pathname]);
  return null;
} 