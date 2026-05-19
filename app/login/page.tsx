import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <section className="auth-layout">
      <div className="auth-logo-panel" aria-hidden="true">
        <Image
          src="/assets/logofinal.png"
          alt=""
          width={669}
          height={373}
          className="auth-logo"
          priority
        />
      </div>

      <div className="auth-card">
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">Entrez vos identifiants pour acceder a votre compte</p>
        <LoginForm />
        <p className="auth-switch">
          Pas encore de compte ? <Link href="/register">S'inscrire</Link>
        </p>
      </div>
    </section>
  );
}
