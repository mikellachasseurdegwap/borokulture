"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { isAuthenticated } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/feed" : "/login");
  }, [router]);

  return (
    <main className="boro-home grid min-h-screen place-items-center">
      <div className="bk-noise" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <BrandLogo variant="full" className="w-36" />
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF6B00]">BORO KULTURE</p>
      </div>
    </main>
  );
}
