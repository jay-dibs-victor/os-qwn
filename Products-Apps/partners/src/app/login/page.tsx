"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { login } from "@/lib/saas-api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("tenant-001");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await login({ email, password, tenantId });
      if ("mfa_required" in response && response.mfa_required) {
        setMessage("MFA is required for this account. MFA verification can be added to the next screen.");
      } else {
        setMessage("Login successful. Redirecting to partner onboarding.");
        window.setTimeout(() => {
          window.location.href = "/become-partner";
        }, 600);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-grid-white opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,184,0,0.16),transparent_35%,rgba(14,165,233,0.08))]" />

      <section className="section-inner relative z-10 grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <Link href="/" className="mb-12 flex items-center gap-3">
            <Image src="/logo.svg" alt="Queens OS" width={42} height={42} />
            <div>
              <p className="font-outfit text-xl font-bold">Queens OS Partners</p>
              <p className="text-sm text-foreground-muted">Mobility partner portal</p>
            </div>
          </Link>

          <h1 className="max-w-xl font-outfit text-6xl font-bold leading-tight">
            Sign in to manage KYC, settlement, and launch readiness.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-foreground-muted">
            Existing partners can continue onboarding, verify operational details,
            and review settlement readiness from the same SaaS backend identity.
          </p>

          <div className="mt-10 grid max-w-lg gap-3">
            {["JWT tenant login", "KYC status continuity", "Settlement account setup"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/5 p-4">
                <ShieldCheck size={18} className="text-primary" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-[8px] border border-white/10 bg-black/72 p-6 shadow-[0_32px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-8">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <Image src="/logo.svg" alt="Queens OS" width={38} height={38} />
            <span className="font-outfit text-lg font-bold">Queens OS Partners</span>
          </Link>

          <div>
            <p className="text-sm font-bold uppercase text-primary">Partner login</p>
            <h2 className="mt-3 font-outfit text-4xl font-bold">Welcome back</h2>
            <p className="mt-3 text-foreground-muted">Use your SaaS tenant credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Tenant ID</span>
              <input className="field" value={tenantId} onChange={(event) => setTenantId(event.target.value)} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold">Email</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                  className="field pl-12"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="partner@example.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold">Password</span>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                  className="field px-12"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="SecurePassword123!"
                  required
                />
                <button
                  type="button"
                  aria-label="Toggle password"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[8px] p-2 text-foreground-muted hover:text-white"
                >
                  <Eye size={18} />
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-6 py-4 font-bold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-[8px] border border-white/10 bg-white/5 p-4 text-sm text-foreground-muted">
              {message}
            </p>
          )}

          <p className="mt-8 text-center text-sm text-foreground-muted">
            New partner?{" "}
            <Link href="/become-partner" className="font-bold text-primary">
              Start the signup wizard
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
