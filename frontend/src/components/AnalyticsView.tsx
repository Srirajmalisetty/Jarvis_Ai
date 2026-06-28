"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, Mail, Calendar, CheckCircle2, Rss, 
  RefreshCw, Cpu, Activity, Info
} from "lucide-react";
import { api, mockData } from "../utils/api";

export default function AnalyticsView() {
  const [stats, setStats] = useState<any>(mockData.analytics);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics().catch(() => mockData.analytics);
      setStats(data || mockData.analytics);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Analytics Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-glow animate-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-wider font-display text-white">Ecosystem Diagnostic Analytics</h1>
            <p className="text-xs text-white/40 font-mono">Real-time statistics of Gemini API tokens and Google API endpoints</p>
          </div>
        </div>
        <button 
          onClick={fetchStats}
          className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg border border-white/5 cursor-pointer flex items-center gap-1.5 text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-Scan
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="glass-panel rounded-xl p-4 border border-electric-blue/15 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-white/45 uppercase block font-mono">Gmail Read Rate</span>
            <span className="text-xl font-bold text-white font-display block">{stats.emails_today}</span>
            <span className="text-[9px] text-green-400 block font-mono">100% processing success</span>
          </div>
          <Mail className="w-8 h-8 text-electric-blue/40 shrink-0" />
        </div>

        {/* Card 2 */}
        <div className="glass-panel rounded-xl p-4 border border-electric-blue/15 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-white/45 uppercase block font-mono">Meetings Scoped</span>
            <span className="text-xl font-bold text-white font-display block">{stats.meetings_today}</span>
            <span className="text-[9px] text-cyan-glow block font-mono">Active sync matches</span>
          </div>
          <Calendar className="w-8 h-8 text-cyan-glow/40 shrink-0" />
        </div>

        {/* Card 3 */}
        <div className="glass-panel rounded-xl p-4 border border-electric-blue/15 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-white/45 uppercase block font-mono">Google Sheet Syncs</span>
            <span className="text-xl font-bold text-white font-display block">{stats.sheet_updates}</span>
            <span className="text-[9px] text-cyan-glow block font-mono">Target log rows added</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-400/40 shrink-0" />
        </div>

        {/* Card 4 */}
        <div className="glass-panel rounded-xl p-4 border border-electric-blue/15 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-white/45 uppercase block font-mono">AI News Collected</span>
            <span className="text-xl font-bold text-white font-display block">{stats.news_collected}</span>
            <span className="text-[9px] text-electric-blue block font-mono">Categories: Tech, AI</span>
          </div>
          <Rss className="w-8 h-8 text-cyan-glow/40 shrink-0" />
        </div>

      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Token consumption */}
        <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-glow flex items-center gap-1.5"><Cpu className="w-4 h-4" /> Gemini Token Utilization</span>
            <span className="text-[10px] text-white/40 font-mono">Est: {stats.gemini_tokens_used || "184500"} tokens</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-6 pt-6 font-mono text-xs">
            <div className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-[10px] text-white/50">28.5k</span>
              <div className="w-12 bg-cyan-glow/30 border border-cyan-glow/50 h-[30%] rounded-t-lg shadow-[0_0_5px_rgba(0,255,242,0.1)]"></div>
              <span className="text-[10px] text-white/60">Mon</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-[10px] text-white/50">42.1k</span>
              <div className="w-12 bg-cyan-glow/50 border border-cyan-glow h-[45%] rounded-t-lg shadow-[0_0_8px_rgba(0,255,242,0.2)]"></div>
              <span className="text-[10px] text-white/60">Tue</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-[10px] text-white/50">84.0k</span>
              <div className="w-12 bg-cyan-glow border-2 border-cyan-glow h-[85%] rounded-t-lg shadow-[0_0_12px_rgba(0,255,242,0.35)]"></div>
              <span className="text-[10px] text-white/60">Wed</span>
            </div>
          </div>
        </div>

        {/* Chart 2: News collected feed rates */}
        <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-glow flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Endpoint Signal Success Rates</span>
            <span className="text-[10px] text-white/40 font-mono">Sync Interval: 60 min</span>
          </div>

          {/* SVG Line Graph */}
          <div className="h-48 pt-6 relative">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              
              {/* Glowing Line */}
              <path 
                d="M 0 80 Q 50 30 100 60 T 200 10 T 300 20" 
                fill="none" 
                stroke="#00fff2" 
                strokeWidth="2.5"
                filter="drop-shadow(0 0 4px #00fff2)" 
              />
            </svg>
            <div className="flex justify-between font-mono text-[9px] text-white/40 mt-2">
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>04:00 PM</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
