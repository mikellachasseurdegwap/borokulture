import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { MainNavigation } from "@/components/navigation/main-navigation";

export const metadata: Metadata = {
  title: "BORO KULTURE",
  description: "Frontend BORO KULTURE"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body>
        <div className="app-shell">
          <MainNavigation />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
