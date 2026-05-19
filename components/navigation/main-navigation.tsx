"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { BrandLogo } from "@/components/ui/brand-logo";

export function MainNavigation() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isImmersivePage = pathname === "/" || pathname === "/profile" || pathname === "/feed";

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [pathname]);

  if (isAuthPage || isImmersivePage) {
    return null;
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <BrandLogo className="brand" />

        <nav className="nav" aria-label="Navigation principale">
          <Link href="/">Accueil</Link>
          {isLoggedIn ? (
            <>
              <Link href="/feed">Feed</Link>
              <Link href="/profile">Profil</Link>
            </>
          ) : (
            <>
              <Link href="/login">Connexion</Link>
              <Link href="/register">Créer un compte</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
