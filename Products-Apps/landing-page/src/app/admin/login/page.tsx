"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_auth", "true");
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image src="/logo.svg" alt="Queens OS" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">Admin Gateway</h1>
          <p className="text-foreground-muted mt-2">Authorized Access Only</p>
        </div>

        <div className="glass-dark p-8 lg:p-10 rounded-[40px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/80" size={20} />
                <input
                  autoFocus
                  required
                  type="password"
                  placeholder="••••••••"
                  className="demo-modal-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-sm font-bold bg-red-400/10 p-4 rounded-2xl border border-red-400/20 text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="demo-modal-btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Access Terminal
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] text-foreground-muted uppercase tracking-[0.2em] font-bold opacity-40">
          Powered by Intelligence · Queens OS © 2026
        </p>
      </motion.div>
    </div>
  );
}
