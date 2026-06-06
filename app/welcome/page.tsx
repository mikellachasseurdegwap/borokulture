"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, CircleUserRound, Sparkles, UsersRound } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { clearWelcomePending, hasWelcomePending, isAuthenticated } from "@/lib/auth";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    if (!hasWelcomePending()) {
      router.replace("/feed");
    }
  }, [router]);

  const continueTo = (href: string) => {
    clearWelcomePending();
    router.push(href);
  };

  return (
    <main className="welcome-page min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-[#FF6B00] selection:text-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_22%_8%,rgba(255,107,0,0.22),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(255,61,90,0.14),transparent_32%),linear-gradient(180deg,#111_0%,#050505_48%,#050505_100%)]" />

      <nav className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <BrandLogo variant="full" className="w-32" />
        <button type="button" onClick={() => continueTo("/feed")} className="text-sm font-black text-[#B3B3B3] transition hover:text-white">
          Passer
        </button>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl place-items-center px-5 py-10 sm:px-8">
        <div className="w-full">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-[#FF6B00]/40 bg-[#FF6B00]/12 text-[#FF6B00] shadow-[0_0_38px_rgba(255,107,0,0.18)]">
              <Sparkles className="h-8 w-8" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#FF6B00]">Bienvenue sur boro</p>
            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-7xl">
              BORO KULTURE est ton espace créatif.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#B3B3B3] sm:text-lg">
              Publie tes idées, construis ton profil, suis d'autres créateurs et fais circuler ton univers dans une plateforme sociale inspirée par l'énergie culturelle ivoirienne.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            <button type="button" onClick={() => continueTo("/feed")} className="group rounded-[30px] border border-white/[0.08] bg-[#121212]/82 p-6 text-left shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-[#FF6B00]/40 hover:shadow-[0_24px_70px_rgba(255,107,0,0.12)]">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B00] text-black">
                <UsersRound className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black">Découvrir le feed</h2>
              <p className="mt-3 text-sm leading-6 text-[#B3B3B3]">Voir les publications, liker, commenter et commencer à suivre la communauté.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#FF8A1F]">
                Entrer dans boro <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            <button type="button" onClick={() => continueTo("/profile")} className="group rounded-[30px] border border-white/[0.08] bg-[#121212]/82 p-6 text-left shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-[#FF6B00]/40 hover:shadow-[0_24px_70px_rgba(255,107,0,0.12)]">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                <CircleUserRound className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black">Compléter mon profil</h2>
              <p className="mt-3 text-sm leading-6 text-[#B3B3B3]">Ajouter ton nom, ta bio, ton avatar, ta couverture et donner une vraie présence à ton compte.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-white">
                Préparer mon profil <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>
          </div>

          <div className="mx-auto mt-8 flex max-w-4xl justify-center">
            <Button asChild variant="ghost">
              <Link href="/feed" onClick={() => clearWelcomePending()}>
                Continuer plus tard
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
