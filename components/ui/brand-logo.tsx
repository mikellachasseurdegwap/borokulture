"use client";

import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "full" | "icon" | "text";
  className?: string;
  href?: string;
}

export function BrandLogo({ variant = "full", className = "", href = "/" }: BrandLogoProps) {
  const logoSrc = "/assets/logofinal.png";

  if (variant === "icon") {
    return (
      <Link href={href} className={className}>
        <div className="relative w-10 h-10">
          <Image
            src={logoSrc}
            alt="BORO KULTURE"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>
    );
  }

  if (variant === "text") {
    return (
      <Link href={href} className={`text-xl font-bold tracking-tight ${className}`}>
        BORO KULTURE
      </Link>
    );
  }

  // variant === "full" (default)
  return (
    <Link href={href} className={`relative w-32 h-10 ${className}`}>
      <Image
        src={logoSrc}
        alt="BORO KULTURE"
        fill
        className="object-contain"
        priority
      />
    </Link>
  );
}
