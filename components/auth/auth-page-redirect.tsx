"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";

export function AuthPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/feed");
    }
  }, [router]);

  return null;
}
