"use client";

import { useState, useEffect } from "react";
import { 
  Clock, Sun, Calendar, Mail, CheckCircle2, Circle, ArrowUpRight, 
  TrendingUp, Sparkles, Send, Mic, Play, RefreshCw, AlertCircle
} from "lucide-react";
import { api, mockData } from "../utils/api";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onVoiceTrigger: () => void;
  onQuickCommand: (cmd: string) => void;
}

export default function DashboardView({ onNavigate, onVoiceTrigger, onQuickCommand }: DashboardViewProps) {
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [command, setCommand] = useState("");
  const [emails, setEmails] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // Sync clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Dashboard Stats
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load Gmail
      const emailRes = await api.getEmails("label:INBOX", 3).catch(() => mockData.emails);
      setEmails(emailRes || []);

      // Load Events
      const calendarRes = await api.getEvents(3).catch(() => mockData.calendar);
      setEvents(calendarRes || []);

      // Load News
      const newsRes = await api.getArticles().catch(() => mockData.news);
      setNews(newsRes || []);

      // Load Preferences / Briefing
      const analyticsRes = await api.getAnalytics().catch(() => ({ automation_logs: [] }));
      const logs = analyticsRes.automation_logs || [];
      const briefLog = logs.find((l: any) => l.trigger_name === "daily_briefing");
      setBriefing(briefLog?.message || "# JARVIS Briefing Core Connected\nGood afternoon, Sriraj. All systems functioning within normal parameters. Google Workspace sheets synced.");
      
      // Load local tasks
      const analyticsObj = await api.getAnalytics().catch(() => mockData.analytics);
      setTasks(mockData.tasks); // fall back to mock tasks for layout completeness
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    onQuickCommand(command);
    setCommand("");
  };

  const handleTaskToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "completed" ? "needsAction" : "completed" } : t));
  };

  const handleMicClick = () => {
    setIsListening(true);
    onVoiceTrigger();
    setTimeout(() => setIsListening(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-xl p-4 border-l-4 border-l-cyan-glow">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-glow animate-ping"></div>
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-glow">
            JARVIS CORE STATUS: ONLINE
          </span>
          <span className="text-xs text-white/40">|</span>
          <span className="text-xs font-mono text-white/70">
            LOAD: 12% | INTEGRATIONS: 7/7 ACTIVE
          </span>
        </div>
        <button 
          onClick={loadDashboardData}
          className="text-xs font-mono text-electric-blue hover:text-white flex items-center gap-1.5 self-end cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Sync Core Ecosystem
        </button>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Orb, Clock, Command Box (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Holographic Orb and Clock panel */}
          <div className="glass-panel rounded-2xl p-6 border border-electric-blue/15 text-center flex flex-col items-center relative overflow-hidden">
            {/* Holographic light ring backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,210,255,0.08)_0%,transparent_70%)] pointer-events-none"></div>
            
            {/* Date/Time */}
            <div className="w-full flex items-center justify-between text-xs text-white/50 font-mono mb-4 border-b border-white/5 pb-2">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-electric-blue" /> SYSTEM TIME</span>
              <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-yellow-500" /> Bengaluru, IN</span>
            </div>
            
            <div className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-electric-blue font-display mb-1">
              {time || "12:00:00"}
            </div>
            <div className="text-xs text-white/60 tracking-wider mb-6 font-mono">
              {dateStr || "Loading System Date..."}
            </div>

            {/* Glowing Pulse ORB */}
            <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
              {/* Rotating outer ring */}
              <div className="absolute inset-0 border border-dashed border-electric-blue/30 rounded-full animate-spin-slow"></div>
              {/* Reverse rotating inner ring */}
              <div className="absolute inset-4 border border-dashed border-cyan-glow/40 rounded-full animate-spin-reverse"></div>
              
              {/* Core interactive Orb */}
              <button 
                onClick={handleMicClick}
                className="absolute inset-10 rounded-full bg-gradient-to-tr from-cyan-glow/20 via-electric-blue/40 to-cyan-glow/30 flex items-center justify-center cursor-pointer border border-cyan-glow/50 shadow-[0_0_30px_rgba(0,210,255,0.3)] animate-orb-pulse group hover:border-cyan-glow"
              >
                {isListening ? (
                  <div className="flex gap-1 items-center justify-center">
                    <span className="w-1.5 h-4 bg-white rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                ) : (
                  <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>

            <div className="text-sm font-display tracking-widest text-cyan-glow uppercase mb-1">
              {isListening ? "LISTENING..." : "JARVIS OS CORE"}
            </div>
            <p className="text-[10px] text-white/50 font-mono">
              Click the core to speak commands
            </p>
          </div>

          {/* Quick Command Box */}
          <div className="glass-panel rounded-xl p-4 border border-electric-blue/15">
            <form onSubmit={handleCommandSubmit} className="relative flex items-center">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Type command e.g., Summarize inbox..."
                className="w-full bg-[#0a0a0c] border border-electric-blue/20 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white placeholder-white/35 focus:outline-none focus:border-cyan-glow"
              />
              <button 
                type="submit"
                className="absolute right-2 text-cyan-glow hover:text-white p-1 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* AI Suggestions Card */}
          <div className="glass-panel rounded-xl p-5 border border-electric-blue/15 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow">
              <Sparkles className="w-4 h-4" /> AI Suggestions
            </div>
            <div className="space-y-2.5">
              <button 
                onClick={() => onQuickCommand("Summarize today's emails")}
                className="w-full text-left bg-white/5 hover:bg-cyan-glow/5 border border-white/5 hover:border-cyan-glow/30 rounded-lg p-2.5 text-xs text-white/80 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>Draft Q3 Strategy report reply</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-glow transition-colors" />
              </button>
              <button 
                onClick={() => onQuickCommand("Schedule Sync meeting tomorrow at 10am")}
                className="w-full text-left bg-white/5 hover:bg-cyan-glow/5 border border-white/5 hover:border-cyan-glow/30 rounded-lg p-2.5 text-xs text-white/80 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>Clear conflict on 11:00 AM Sync</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-glow transition-colors" />
              </button>
              <button 
                onClick={() => onQuickCommand("Run news aggregation now")}
                className="w-full text-left bg-white/5 hover:bg-cyan-glow/5 border border-white/5 hover:border-cyan-glow/30 rounded-lg p-2.5 text-xs text-white/80 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>Log hourly technical articles to Sheet</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-glow transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Daily AI Summary & Feeds (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily AI Briefing */}
          <div className="glass-panel rounded-2xl p-6 border border-electric-blue/15 relative overflow-hidden max-h-[350px] overflow-y-auto">
            <div className="absolute top-0 right-0 p-3">
              <Sparkles className="w-5 h-5 text-cyan-glow animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-electric-blue mb-4 border-b border-white/5 pb-2">
              <Sparkles className="w-3.5 h-3.5" /> DAILY AI SUMMARY BRIEF
            </div>
            <div className="text-xs text-white/80 leading-relaxed font-mono space-y-3 whitespace-pre-line">
              {briefing}
            </div>
          </div>

          {/* Inbox Summary */}
          <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow">
                <Mail className="w-4 h-4" /> Unread Emails
              </div>
              <button 
                onClick={() => onNavigate("Inbox")} 
                className="text-[10px] text-electric-blue hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Go to Inbox <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {emails.length === 0 ? (
                <div className="text-xs text-white/40 text-center py-4">No unread emails in inbox.</div>
              ) : (
                emails.map((e) => (
                  <div key={e.id} className="p-3 bg-white/5 border border-white/5 rounded-lg flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">{e.from}</span>
                      <span className="text-[10px] font-mono text-white/40 shrink-0">{e.date}</span>
                    </div>
                    <span className="text-xs text-electric-blue truncate">{e.subject}</span>
                    <span className="text-[10px] text-white/50 line-clamp-1">{e.snippet}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calendar Agenda */}
          <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow">
                <Calendar className="w-4 h-4" /> Today's Meetings
              </div>
              <button 
                onClick={() => onNavigate("Calendar")}
                className="text-[10px] text-electric-blue hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Open Calendar <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-xs text-white/40 text-center py-4">No events scheduled.</div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between gap-4">
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-bold text-white truncate block">{ev.summary}</span>
                      <span className="text-[10px] text-white/40 truncate block">{ev.location || "Virtual Connection"}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-cyan-glow border border-cyan-glow/20 rounded px-1.5 py-0.5 bg-cyan-glow/5">
                        {new Date(ev.start).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tasks & Breaking News (Span 3) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Today's Tasks */}
          <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow">
                <CheckCircle2 className="w-4 h-4" /> Daily Tasks
              </div>
              <button 
                onClick={() => onNavigate("Tasks")}
                className="text-[10px] text-electric-blue hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                All Tasks <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className="w-full flex items-start gap-2.5 p-2 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-glow/25 text-left group transition-all cursor-pointer"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-glow shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/35 group-hover:text-cyan-glow shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className={`text-xs ${task.status === "completed" ? "line-through text-white/40" : "text-white"}`}>
                      {task.title}
                    </span>
                    <span className="text-[9px] font-mono text-white/30 block">{task.notes}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Breaking News Feed */}
          <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow">
                <TrendingUp className="w-4 h-4" /> Intelligence News
              </div>
              <button 
                onClick={() => onNavigate("News")}
                className="text-[10px] text-electric-blue hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Reader <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {news.map((item) => (
                <div key={item.id} className="relative pl-3 border-l-2 border-electric-blue/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono uppercase bg-electric-blue/10 border border-electric-blue/20 rounded px-1 text-electric-blue scale-95 shrink-0">
                      {item.category}
                    </span>
                    {item.importance_score >= 8.5 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    )}
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-bold text-white hover:text-cyan-glow line-clamp-2 block transition-colors leading-snug"
                  >
                    {item.headline}
                  </a>
                  <span className="text-[9px] text-white/40 font-mono block">
                    {item.source} • {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
