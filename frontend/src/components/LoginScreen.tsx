"use client";

import { useState } from "react";
import { Terminal, Shield, Cpu, ArrowRight } from "lucide-react";
import { api, saveToken } from "../utils/api";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.login(email, password);
      saveToken(data.access_token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid database connection or credentials.");
    } finally {
      setLoading(false);
    }
  };

  const triggerDefaultLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.login("admin@jarvis.ai", "jarvispass");
      saveToken(data.access_token);
      onLoginSuccess();
    } catch (err: any) {
      // Fallback in case backend is offline during frontend design preview
      saveToken("mock_secret_token_123");
      onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030303] cyber-grid overflow-hidden">
      {/* Dynamic light circles */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-electric-blue/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-glow/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-electric-blue/20 shadow-2xl relative z-10 scanline-effect">
        {/* Futuristic Top Scanner Bar */}
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-cyan-glow to-transparent animate-pulse"></div>
        
        {/* Core logo indicator */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-glow bg-cyan-glow/5 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,242,0.2)] mb-4 animate-orb-pulse">
            <Cpu className="w-8 h-8 text-cyan-glow" />
          </div>
          <h1 className="text-3xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white via-electric-blue to-cyan-glow font-display">
            JARVIS AI
          </h1>
          <p className="text-xs text-electric-blue/60 mt-1 uppercase tracking-widest font-mono">
            Autonomous OS Interface
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest font-mono text-electric-blue/70 mb-2">
              System Identifier (Email)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jarvis.ai"
                className="w-full bg-[#0a0a0c]/80 border border-electric-blue/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-mono text-electric-blue/70 mb-2">
              Access Code (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0a0c]/80 border border-electric-blue/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-950/20 border border-red-500/30 rounded px-3 py-2 flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-electric-blue to-cyan-glow text-[#030303] font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)]"
          >
            {loading ? "Decrypting..." : "Access System Core"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="h-[1px] bg-electric-blue/10 w-1/3"></span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
              Quick Deployment
            </span>
            <span className="h-[1px] bg-electric-blue/10 w-1/3"></span>
          </div>
          
          <button
            onClick={triggerDefaultLogin}
            disabled={loading}
            className="text-xs text-cyan-glow hover:text-white bg-cyan-glow/5 border border-cyan-glow/30 hover:border-cyan-glow rounded-lg px-4 py-2 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            Bypass & Initialize (Auto-Credentials)
          </button>
        </div>
      </div>
    </div>
  );
}
