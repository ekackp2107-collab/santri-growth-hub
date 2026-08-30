import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDemoCredentials } from "@/lib/demo.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Masuk — SantriOS" },
      { name: "description", content: "Masuk ke SantriOS untuk mengelola perkembangan santri." },
      { property: "og:title", content: "Masuk — SantriOS" },
      { property: "og:description", content: "Masuk ke SantriOS untuk mengelola perkembangan santri." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Email tidak valid." }).max(255),
  password: z.string().min(6, { message: "Minimal 6 karakter." }).max(128),
});

function AuthPage() {
  const navigate = useNavigate();
  const demoFn = useServerFn(getDemoCredentials);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | undefined; password?: string | undefined }>({});
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function signIn(mail: string, pass: string) {
    const parsed = schema.safeParse({ email: mail, password: pass });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ email: f.email?.[0], password: f.password?.[0] });
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error("Login gagal");
      setErrors({ password: "Email atau password salah." });
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function devLogin(role: "admin" | "pengasuhan") {
    setDevLoading(role);
    try {
      const creds = await demoFn({ data: { role } });
      setEmail(creds.email);
      setPassword(creds.password);
      await signIn(creds.email, creds.password);
    } catch {
      toast.error("Gagal memuat akun");
    } finally {
      setDevLoading(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="hero-gradient relative hidden flex-1 flex-col justify-between p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="size-5" aria-hidden />
          SantriOS
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl leading-tight font-semibold">
            Perkembangan santri, terlihat utuh.
          </h1>
          <p className="text-sm/6 opacity-85">
            Prestasi, kedisiplinan, pembinaan, dan pertumbuhan dalam satu sistem.
          </p>
        </div>
        <p className="text-xs opacity-70">Pesantren Nurul Hikmah</p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm rise-in">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-5" aria-hidden />
              <span className="font-display text-lg font-semibold">SantriOS</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold">Masuk</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gunakan akun pesantren.</p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void signIn(email, password);
            }}
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {loading ? "Memuat..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5" aria-hidden />
              Dev Login
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!!devLoading}
                onClick={() => void devLogin("admin")}
              >
                {devLoading === "admin" ? "Memuat..." : "Admin"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!!devLoading}
                onClick={() => void devLogin("pengasuhan")}
              >
                {devLoading === "pengasuhan" ? "Memuat..." : "Pengasuhan"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
