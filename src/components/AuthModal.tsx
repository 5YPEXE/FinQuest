"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, X } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Depending on Supabase settings, email confirmation might be required.
        // For hackathons, we usually turn off "Confirm Email" in Supabase settings.
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="FinQuest Logo" className="w-20 h-20 rounded-2xl shadow-lg object-cover" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">
            {isLogin ? "Tekrar Hoş Geldin" : "FinQuest'e Katıl"}
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            {isLogin ? "Kaldığın yerden finansal zekanı geliştirmeye devam et." : "Finansal özgürlüğe giden yolculuğunu bugün başlat."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresin"
                className="w-full bg-secondary border border-transparent focus:border-primary focus:bg-card pl-12 pr-4 py-3 rounded-xl transition-all outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifren (En az 6 karakter)"
                className="w-full bg-secondary border border-transparent focus:border-primary focus:bg-card pl-12 pr-4 py-3 rounded-xl transition-all outline-none"
              />
            </div>

            {error && (
              <div className="text-rose-500 text-sm text-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Giriş Yap" : "Hesap Oluştur")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Hesabın yok mu?" : "Zaten bir hesabın var mı?"}
            </span>
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-primary font-bold hover:underline"
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
