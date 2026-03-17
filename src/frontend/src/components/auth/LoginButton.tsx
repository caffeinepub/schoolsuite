import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut } from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { Button } from "../ui/button";

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const disabled = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? "outline" : "default"}
      size="sm"
      className="gap-2"
    >
      {isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4" />
          Sign out
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          {disabled ? "Signing in..." : "Sign in"}
        </>
      )}
    </Button>
  );
}
