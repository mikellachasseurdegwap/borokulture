"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api, { type ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth";

type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        email,
        password
      });

      setToken(data.token);
      router.push("/profile");
      router.refresh();
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message || "Connexion impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-form auth-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <div className="input-shell">
          <span className="input-icon input-icon--mail" aria-hidden="true" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="password">Mot de passe</label>
        <div className="input-shell">
          <span className="input-icon input-icon--lock" aria-hidden="true" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button" type="submit" disabled={isSubmitting}>
        <span>{isSubmitting ? "Connexion..." : "Se connecter"}</span>
        <span className="button-arrow" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
