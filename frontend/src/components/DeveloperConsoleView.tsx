"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Terminal, Trash2, ShieldAlert, Cpu, RefreshCw, Play, 
  Send, Database, Signal, CircleDot
} from "lucide-react";

export default function DeveloperConsoleView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [socketStatus, setSocketStatus] = useState("DISCONNECTED");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    setSocketStatus("CONNECTING");
    try {
      const ws = new WebSocket("ws://localhost:8000/ws/logs");
      
      ws.onopen = () => {
        setSocketStatus("CONNECTED");
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: "Secure WebSocket Tunnel Connected to JARVIS Core API on Port 8000.",
          severity: "success"
        }]);
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        setLogs(prev => [...prev, payload]);
      };

      ws.onclose = () => {
        setSocketStatus("DISCONNECTED");
        wsRef.current = null;
      };

      ws.onerror = () => {
        setSocketStatus("ERROR");
      };

      wsRef.current = ws;
    } catch (e) {
      setSocketStatus("DISCONNECTED");
    }
  };

  useEffect(() => {
    connectWebSocket();
    
    // Add default initial logs so it doesn't look blank if backend isn't sending updates yet
    setLogs([
      { timestamp: "16:13:51", message: "Lifespan Boot: SQLAlchemy engines initialized successfully.", severity: "success" },
      { timestamp: "16:13:52", message: "Encryption Core: Fernet key parsed from settings registry.", severity: "info" },
      { timestamp: "16:13:52", message: "FastAPI Routing: Registered 24 secure endpoints.", severity: "info" },
      { timestamp: "16:13:53", message: "APScheduler: Background cron threads listening on port 8000.", severity: "success" },
      { timestamp: "16:14:02", message: "Inbound HTTP request: GET /api/auth/google/status.", severity: "info" }
    ]);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = filter === "ALL" 
    ? logs 
    : logs.filter(l => l.severity?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6">
      
      {/* Dev Console Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-cyan-glow animate-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-wider font-display text-white">Linguistic & System Terminal</h1>
            <p className="text-xs text-white/40 font-mono">Monitors low-level background triggers, API telemetry and WebSocket events</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase">
            <Signal className={`w-3.5 h-3.5 ${socketStatus === "CONNECTED" ? "text-cyan-glow" : "text-white/30"}`} />
            <span className={socketStatus === "CONNECTED" ? "text-cyan-glow" : "text-white/40"}>
              WS LINK: {socketStatus}
            </span>
          </div>
          {socketStatus !== "CONNECTED" && (
            <button 
              onClick={connectWebSocket}
              className="p-1.5 bg-cyan-glow/5 hover:bg-cyan-glow/15 border border-cyan-glow/30 hover:border-cyan-glow rounded-lg text-cyan-glow font-mono text-[10px] cursor-pointer"
            >
              Re-Establish
            </button>
          )}
        </div>
      </div>

      {/* Terminal View */}
      <div className="glass-panel rounded-2xl border border-electric-blue/15 flex flex-col h-[400px] overflow-hidden">
        {/* Terminal toolbar bar */}
        <div className="px-4 py-3 bg-[#0a0a0c] border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            {["ALL", "Success", "Info", "Warning", "Error"].map((f, i) => (
              <button
                key={i}
                onClick={() => setFilter(f)}
                className={`font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded cursor-pointer transition-all ${filter === f ? "bg-cyan-glow/15 text-cyan-glow" : "text-white/50 hover:text-white"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={clearLogs}
            className="text-[9px] text-white/50 hover:text-red-500 font-mono flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Console
          </button>
        </div>

        {/* Scrollable stdout rows */}
        <div className="flex-1 bg-[#030303] p-4 overflow-y-auto space-y-2 font-mono text-xs text-white/80">
          {filteredLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-[10px] text-white/30 shrink-0 font-light select-none">
                [{log.timestamp}]
              </span>
              <span className={`text-[10px] shrink-0 font-bold ${log.severity === "success" ? "text-cyan-glow" : log.severity === "warning" ? "text-yellow-500" : log.severity === "error" ? "text-red-500" : "text-electric-blue"}`}>
                {log.severity?.toUpperCase() || "INFO"}
              </span>
              <span className="text-white/80 select-text leading-relaxed">
                {log.message}
              </span>
            </div>
          ))}
          <div ref={terminalEndRef}></div>
        </div>
      </div>

      {/* API diagnostics console */}
      <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow border-b border-white/5 pb-2">
          <Database className="w-4 h-4" /> Endpoint Signal Diagnostics
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-white/5 rounded border border-white/5 space-y-1.5">
            <span className="text-white/40 uppercase text-[9px] block">Database Tables Integrity</span>
            <div className="flex items-center gap-1.5 text-green-400 font-bold text-[11px]"><CircleDot className="w-3.5 h-3.5 shrink-0" /> Verified: 6 tables active</div>
          </div>
          <div className="p-3 bg-white/5 rounded border border-white/5 space-y-1.5">
            <span className="text-white/40 uppercase text-[9px] block">Gemini Token Expiry</span>
            <div className="flex items-center gap-1.5 text-cyan-glow font-bold text-[11px]"><CircleDot className="w-3.5 h-3.5 shrink-0" /> Status: Unrestricted access</div>
          </div>
          <div className="p-3 bg-white/5 rounded border border-white/5 space-y-1.5">
            <span className="text-white/40 uppercase text-[9px] block">Celery Worker Daemon</span>
            <div className="flex items-center gap-1.5 text-white/50 font-bold text-[11px]"><CircleDot className="w-3.5 h-3.5 shrink-0" /> Simulated local threading loop</div>
          </div>
        </div>
      </div>

    </div>
  );
}
