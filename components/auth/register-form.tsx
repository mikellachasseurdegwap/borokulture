"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api, { type ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth";

type RegisterResponse = {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
};

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await api.post<RegisterResponse>("/auth/register", {
        email,
        username,
        password
      });

      setToken(data.token);
      router.push("/profile");
      router.refresh();
    } catch (requestError) {
      const apiError = requestError as Partial<ApiError>;
      setError(apiError.message || "Inscription impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="register-email">Email</label>
        <div className="input-shell">
          <span className="input-icon input-icon--mail" aria-hidden="true" />
          <input
            id="register-email"
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
        <label htmlFor="register-username">Nom d'utilisateur</label>
        <div className="input-shell">
          <span className="input-icon input-icon--user" aria-hidden="true" />
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="votre pseudo"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="register-password">Mot de passe</label>
        <div className="input-shell">
          <span className="input-icon input-icon--lock" aria-hidden="true" />
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            minLength={8}
            required
          />
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button" type="submit" disabled={isSubmitting}>
        <span>{isSubmitting ? "Création..." : "Créer un compte"}</span>
        <span className="button-arrow" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
