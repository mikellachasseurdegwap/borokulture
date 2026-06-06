import Link from "next/link";
import Image from "next/image";
import { AuthPageRedirect } from "@/components/auth/auth-page-redirect";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <section className="auth-layout">
      <AuthPageRedirect />
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

      <div className="auth-card auth-card--register">
        <h1 className="auth-title">Inscription</h1>
        <p className="auth-subtitle">Creez votre compte pour rejoindre BORO KULTURE</p>
        <RegisterForm />
        <p className="auth-switch">
          Deja inscrit ? <Link href="/login">Se connecter</Link>
        </p>
      </div>
    </section>
  );
}
