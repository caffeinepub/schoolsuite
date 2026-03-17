import { Heart } from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { Button } from "../ui/button";

export default function SignedOutScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center mb-8">
          <img
            src="/assets/generated/family-memories-logo.dim_512x512.png"
            alt="Family Memories"
            className="w-32 h-32 object-contain"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            Family Memories
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
            Capture, organize, and share your precious family moments in one
            beautiful place
          </p>
        </div>

        <div className="pt-8">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="text-lg px-8 py-6 scrapbook-shadow-lg hover:scale-105 transition-transform"
          >
            {isLoggingIn ? "Signing in..." : "Sign in to get started"}
          </Button>
        </div>

        <div className="pt-12 text-sm text-muted-foreground">
          <p>Secure authentication powered by Internet Identity</p>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} · Built with{" "}
          <Heart className="inline w-4 h-4 text-destructive fill-destructive" />{" "}
          using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
