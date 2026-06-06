const TOKEN_KEY = "boro_kulture_token";

type JwtPayload = {
  exp?: number;
};

const isBrowser = () => typeof window !== "undefined";

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(window.atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  if (!isBrowser()) {
    return true;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
};

export const getToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_KEY);

  if (!token || isTokenExpired(token)) {
    removeToken();
    return null;
  }

  return token;
};

export const setToken = (token: string): void => {
  if (!isBrowser()) {
    return;
  }

  const cleanToken = token.trim();

  if (!cleanToken) {
    removeToken();
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, cleanToken);
};

export const removeToken = (): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return Boolean(getToken());
};
