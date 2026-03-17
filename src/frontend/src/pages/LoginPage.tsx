import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.5 0.22 265 / 0.25), transparent), radial-gradient(ellipse 60% 80% at 80% 100%, oklch(0.62 0.18 220 / 0.15), transparent)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg mb-4">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              EduLite
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              School Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                data-ocid="login.input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                data-ocid="login.password_input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <div
                data-ocid="login.error_state"
                className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <Button
              data-ocid="login.submit_button"
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Default admin credentials:{" "}
              <span className="font-mono font-semibold text-foreground">
                admin / admin123
              </span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Built with caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
