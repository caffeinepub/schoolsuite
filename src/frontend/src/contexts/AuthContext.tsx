import { createContext, useContext, useEffect, useState } from "react";
import type { UserAccount } from "../backend";
import { useActor } from "../hooks/useActor";

const TOKEN_KEY = "authToken";

interface AuthContextValue {
  currentUser: UserAccount | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Still waiting for actor to load
    if (isFetching) return;

    // Actor not available - show login immediately
    if (!actor) {
      setIsLoading(false);
      return;
    }

    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    actor
      .getCurrentUser(storedToken)
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          setToken(storedToken);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [actor, isFetching]);

  async function login(username: string, password: string) {
    if (!actor) throw new Error("Not ready");
    const res = await actor.login(username, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setCurrentUser(res.user);
    // seed data after first login
    actor.seedData(res.token).catch(() => {});
  }

  async function logout() {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (actor && storedToken) {
      await actor.logout(storedToken).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, token, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
