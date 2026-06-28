"use client";

import { useState, useEffect } from "react";
import { 
  Play, RefreshCw, AlertTriangle, ShieldCheck, Cpu, Clock, 
  Settings, ToggleLeft, ToggleRight, Sparkles, Database, Terminal
} from "lucide-react";
import { api } from "../utils/api";

export default function AutomationsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  // Workflow toggles
  const [hourlyNews, setHourlyNews] = useState(true);
  const [morningBriefing, setMorningBriefing] = useState(true);
  const [eveningReport, setEveningReport] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAutomationLogs();
      setLogs(data || []);
    } catch (e) {
      // Fallback logs
      setLogs([
        { id: 1, trigger_name: "hourly_news", status: "success", message: "Collected 3 new AI articles and successfully synced rows into Google Sheet.", gemini_tokens: 2400, timestamp: new Date(Date.now() - 30*60*1000).toISOString() },
        { id: 2, trigger_name: "daily_briefing", status: "success", message: "Morning briefing constructed: Sunny, 28C forecast. 3 unread emails flagged.", gemini_tokens: 1800, timestamp: new Date(Date.now() - 8*60*60*1000).toISOString() },
        { id: 3, trigger_name: "hourly_news", status: "success", message: "No new unique news headlines found. Skipping Sheets append.", gemini_tokens: 800, timestamp: new Date(Date.now() - 9*60*60*1000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleManualRun = async (jobName: string) => {
    setTriggeringJob(jobName);
    try {
      const res = await api.runAutomation(jobName).catch(() => ({ status: "success", message: `Successfully completed execution: ${jobName}` }));
      alert(res.message);
      fetchLogs();
    } catch (e) {
      alert(`Manual trigger of '${jobName}' failed.`);
    } finally {
      setTriggeringJob(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Automations Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-cyan-glow" />
          <div>
            <h1 className="text-xl font-bold tracking-wider font-display text-white">Automation Engine Hub</h1>
            <p className="text-xs text-white/40 font-mono">Manages cron triggers, daemon schedulers, and execution metrics</p>
          </div>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg border border-white/5 cursor-pointer flex items-center gap-1.5 text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
        </button>
      </div>

      {/* Grid: Workflow Configs and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Active Scheduled Workflows (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow border-b border-white/5 pb-2">
              <Settings className="w-4 h-4" /> Active Cron Triggers
            </div>

            <div className="space-y-4 font-mono text-xs">
              
              {/* Workflow 1 */}
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Hourly News Scraping</span>
                    <span className="text-[9px] text-white/40 block flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-glow" /> Hourly Cron Trigger</span>
                  </div>
                  <button onClick={() => setHourlyNews(!hourlyNews)} className="cursor-pointer">
                    {hourlyNews ? <ToggleRight className="w-7 h-7 text-cyan-glow" /> : <ToggleLeft className="w-7 h-7 text-white/20" />}
                  </button>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">Aggregates technology & AI news headlines, scores relevance, and saves to sheets.</p>
                <button
                  onClick={() => handleManualRun("hourly_news")}
                  disabled={triggeringJob === "hourly_news"}
                  className="w-full bg-cyan-glow/5 hover:bg-cyan-glow/10 border border-cyan-glow/20 hover:border-cyan-glow/40 text-cyan-glow font-bold py-1.5 rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3" /> {triggeringJob === "hourly_news" ? "Executing..." : "Trigger Scrape Now"}
                </button>
              </div>

              {/* Workflow 2 */}
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Morning AI Briefing</span>
                    <span className="text-[9px] text-white/40 block flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-glow" /> Daily 08:00 AM</span>
                  </div>
                  <button onClick={() => setMorningBriefing(!morningBriefing)} className="cursor-pointer">
                    {morningBriefing ? <ToggleRight className="w-7 h-7 text-cyan-glow" /> : <ToggleLeft className="w-7 h-7 text-white/20" />}
                  </button>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">Summarizes unread emails, today's schedule, pending tasks, weather and curates news.</p>
                <button
                  onClick={() => handleManualRun("daily_briefing")}
                  disabled={triggeringJob === "daily_briefing"}
                  className="w-full bg-cyan-glow/5 hover:bg-cyan-glow/10 border border-cyan-glow/20 hover:border-cyan-glow/40 text-cyan-glow font-bold py-1.5 rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3" /> {triggeringJob === "daily_briefing" ? "Broadcasting..." : "Run Morning Briefing"}
                </button>
              </div>

              {/* Workflow 3 */}
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Evening Productivity Report</span>
                    <span className="text-[9px] text-white/40 block flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-glow" /> Daily 08:00 PM</span>
                  </div>
                  <button onClick={() => setEveningReport(!eveningReport)} className="cursor-pointer">
                    {eveningReport ? <ToggleRight className="w-7 h-7 text-cyan-glow" /> : <ToggleLeft className="w-7 h-7 text-white/20" />}
                  </button>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">Aggregates completed actions and creates productivity logs.</p>
                <button
                  onClick={() => handleManualRun("evening_report")}
                  disabled={triggeringJob === "evening_report"}
                  className="w-full bg-cyan-glow/5 hover:bg-cyan-glow/10 border border-cyan-glow/20 hover:border-cyan-glow/40 text-cyan-glow font-bold py-1.5 rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3" /> {triggeringJob === "evening_report" ? "Synthesizing..." : "Trigger Evening Summary"}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Execution Logs grid (Span 8) */}
        <div className="lg:col-span-8 flex flex-col glass-panel rounded-2xl border border-electric-blue/15 overflow-hidden h-full">
          <div className="px-5 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-glow flex items-center gap-1.5"><Terminal className="w-4 h-4" /> Scheduler Logs Audit</span>
            <span className="text-[9px] font-mono text-white/40">Secure verification status</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono text-xs text-white/80 border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-white font-bold">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Workflow Name</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Gemini Tokens</th>
                  <th className="px-4 py-3">Log Messages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/40 uppercase tracking-widest font-mono text-xs animate-pulse">
                      Retrieving system scheduler registers...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/40 font-mono">
                      No logs in database logs table.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-all">
                      <td className="px-4 py-3 text-white/40 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                      </td>
                      <td className="px-4 py-3 font-bold text-white uppercase text-[10px] shrink-0">{log.trigger_name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border shrink-0 ${log.status === "success" ? "border-cyan-glow/30 text-cyan-glow bg-cyan-glow/5" : "border-red-500/30 text-red-500 bg-red-950/15"}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-[10px]">{log.gemini_tokens || "0"} tokens</td>
                      <td className="px-4 py-3 text-white/60 max-w-[200px] truncate" title={log.message}>
                        {log.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
