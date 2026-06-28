"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, Mic, MicOff, Paperclip, Sparkles, User, Cpu, Volume2, VolumeX,
  FileText, Database, ShieldAlert, CheckCircle2, ChevronRight, X, Info
} from "lucide-react";
import { api, mockData } from "../utils/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isChart?: boolean;
  chartData?: any;
}

export default function AssistantView() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Good afternoon, Sriraj. I am JARVIS. Active memory loaded. Google ecosystem endpoints connected and verified. How may I assist you with your operations today?", timestamp: "12:00" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState<any>(null);
  
  // File upload state
  const [showFileModal, setShowFileModal] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Preference details
  const [ownerName, setOwnerName] = useState("Sriraj");
  const [styleGuide, setStyleGuide] = useState("Professional, highly articulate, futuristic, inspired by Iron Man's JARVIS assistant.");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load preferences
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await api.getPreferences();
        if (data.preferences?.owner_name) setOwnerName(data.preferences.owner_name);
        if (data.preferred_style) setStyleGuide(data.preferred_style);
      } catch (e) {}
    };
    fetchPrefs();
  }, []);

  // Web Speech API - TTS
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/[*#`_\-]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/```[\s\S]*?```/g, "Code block skipped.")
      .slice(0, 300); // Truncate so it doesn't speak forever

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to locate a cool futuristic/robotic voice (usually Google UK English or Microsoft David)
    const voices = window.speechSynthesis.getVoices();
    const desiredVoice = voices.find(v => v.name.includes("Google UK English") || v.name.includes("Natural") || v.lang.startsWith("en-GB"));
    if (desiredVoice) utterance.voice = desiredVoice;
    
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    
    utterance.onstart = () => setActiveSpeech(utterance);
    utterance.onend = () => setActiveSpeech(null);
    
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API - Voice recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRegObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRegObj) {
        const rec = new SpeechRegObj();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";
        
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported on this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachedFile) return;

    let messageText = input;
    if (attachedFile) {
      messageText = `[Uploaded File: ${attachedFile.name}]\n\n` + messageText;
    }

    const timestamp = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const userMsg: Message = { role: "user", content: messageText, timestamp };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAttachedFile(null);
    setLoading(true);

    try {
      const data = await api.sendMessage(messageText);
      
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      };
      
      // Inject simulated chart if response asks for charts or stats
      if (messageText.toLowerCase().includes("chart") || messageText.toLowerCase().includes("report")) {
        assistantMsg.isChart = true;
        assistantMsg.chartData = {
          title: "Intelligent Signal Telemetry",
          labels: ["Gmail", "Calendar", "Sheets", "News", "System"],
          values: [48, 12, 86, 124, 75]
        };
      }

      setMessages(prev => [...prev, assistantMsg]);
      speakText(data.response);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sir, I encountered an issue interacting with the core server: ${err.message}. Running diagnostics.`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
      setShowFileModal(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* LEFT CHAT CONSOLE PANEL (Span 8) */}
      <div className="lg:col-span-8 flex flex-col glass-panel rounded-2xl border border-electric-blue/15 relative overflow-hidden h-full">
        {/* Dynamic Scanline Grid Panel */}
        <div className="absolute inset-0 bg-[#060608]/40 pointer-events-none z-0"></div>
        
        {/* Top Chat Header */}
        <div className="relative z-10 px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full border border-cyan-glow bg-cyan-glow/5 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-glow" />
              {activeSpeech && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-glow animate-ping"></span>
              )}
            </div>
            <div>
              <span className="text-sm font-display tracking-widest text-cyan-glow font-bold uppercase">JARVIS Assistant</span>
              <span className="text-[9px] font-mono text-white/40 block">MODEL: GEMINI CORE COMPILER</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg cursor-pointer transition-all border ${voiceEnabled ? "border-cyan-glow/40 bg-cyan-glow/5 text-cyan-glow" : "border-white/10 text-white/40"}`}
              title={voiceEnabled ? "Mute Voice Output" : "Enable Voice Output"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="text-[10px] uppercase tracking-widest font-mono text-white/45 bg-white/5 px-2.5 py-1 rounded border border-white/5">
              Secure Channel
            </div>
          </div>
        </div>

        {/* Message logs view */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3.5 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full border border-cyan-glow/40 bg-cyan-glow/5 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_8px_rgba(0,210,255,0.15)]">
                  <Cpu className="w-4 h-4 text-cyan-glow" />
                </div>
              )}

              <div className="max-w-[80%] space-y-1.5">
                <div className={`p-4 rounded-xl leading-relaxed text-sm ${
                  msg.role === "user" 
                    ? "bg-gradient-to-tr from-electric-blue/15 to-cyan-glow/10 border border-electric-blue/30 text-white" 
                    : "bg-[#0c0c12]/80 border border-white/5 text-white/90"
                }`}>
                  <div className="whitespace-pre-wrap font-mono text-xs leading-normal">
                    {msg.content}
                  </div>
                  
                  {/* Dynamic SVG chart if included in metadata */}
                  {msg.isChart && msg.chartData && (
                    <div className="mt-4 p-4 bg-black/45 border border-cyan-glow/20 rounded-lg space-y-3">
                      <div className="text-xs uppercase font-mono tracking-wider text-cyan-glow">{msg.chartData.title}</div>
                      <div className="h-32 flex items-end justify-between gap-2 pt-4">
                        {msg.chartData.values.map((v: number, i: number) => {
                          const max = Math.max(...msg.chartData.values);
                          const pct = (v / max) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                              <span className="text-[9px] font-mono text-white/50">{v}</span>
                              <div 
                                className="w-full bg-gradient-to-t from-electric-blue to-cyan-glow rounded-t-sm shadow-[0_0_8px_rgba(0,210,255,0.2)] transition-all duration-1000"
                                style={{ height: `${pct}%` }}
                              ></div>
                              <span className="text-[9px] font-mono text-white/40 truncate max-w-[40px] uppercase">{msg.chartData.labels[i]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <span className={`text-[9px] font-mono text-white/30 block ${msg.role === "user" ? "text-right" : ""}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full border border-electric-blue/40 bg-electric-blue/5 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-electric-blue" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full border border-cyan-glow/40 bg-cyan-glow/5 flex items-center justify-center shrink-0 animate-spin">
                <Cpu className="w-4 h-4 text-cyan-glow" />
              </div>
              <div className="bg-[#0c0c12]/80 border border-white/5 rounded-xl p-4 flex flex-col gap-2 max-w-[80%]">
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-ping"></span>
                  <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Processing command signals...</span>
                </div>
                {/* Custom simulated audio wave loader */}
                <div className="h-6 flex items-center gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-cyan-glow rounded-full animate-pulse" 
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        animationDuration: `${0.4 + i*0.1}s` 
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </div>

        {/* File upload drawer indicator */}
        {attachedFile && (
          <div className="relative z-10 px-4 py-2 bg-cyan-glow/5 border-t border-cyan-glow/20 flex items-center justify-between text-xs text-cyan-glow">
            <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Selected File: {attachedFile.name} ({Math.round(attachedFile.size / 1024)} KB)</span>
            <button onClick={() => setAttachedFile(null)} className="p-1 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative z-10 p-4 border-t border-white/5 bg-black/10">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setShowFileModal(true)}
              className="p-3 bg-white/5 border border-white/10 hover:border-cyan-glow/30 text-white/60 hover:text-cyan-glow rounded-xl transition-all cursor-pointer shrink-0"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Send instruction to JARVIS, e.g., 'Draft meeting invitation request...'"
              rows={1}
              className="flex-1 bg-[#0a0a0c] border border-white/10 focus:border-cyan-glow rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none resize-none min-h-[46px] max-h-[120px]"
            />

            <button 
              type="button"
              onClick={toggleListening}
              className={`p-3 border rounded-xl transition-all cursor-pointer shrink-0 ${
                isListening 
                  ? "border-red-500 bg-red-950/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse" 
                  : "border-white/10 bg-white/5 text-white/60 hover:text-cyan-glow hover:border-cyan-glow/30"
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button 
              type="submit"
              disabled={loading || (!input.trim() && !attachedFile)}
              className="p-3 bg-gradient-to-r from-electric-blue to-cyan-glow text-[#030303] rounded-xl hover:opacity-90 transition-all cursor-pointer shrink-0 font-bold disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE PANEL: Preferences & Cognitive Memory (Span 4) */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full">
        {/* Core preferences */}
        <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow border-b border-white/5 pb-2">
            <Database className="w-4 h-4" /> Persisted Cognitive Memory
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <span className="text-[10px] text-white/40 uppercase block mb-1">SYSTEM USER / OWNER</span>
              <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-white/95">{ownerName}</div>
            </div>

            <div>
              <span className="text-[10px] text-white/40 uppercase block mb-1">PREFERRED LINGUISTIC STYLE</span>
              <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-white/85 leading-relaxed break-words whitespace-pre-wrap">
                {styleGuide}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-white/40 uppercase block mb-1">INTEGRATED COGNITIVE ABILITIES</span>
              <div className="space-y-1.5 mt-1 text-[11px]">
                <div className="flex items-center gap-2 text-white/70"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-glow shrink-0" /> Contextual email drafting</div>
                <div className="flex items-center gap-2 text-white/70"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-glow shrink-0" /> Auto conflict scheduling</div>
                <div className="flex items-center gap-2 text-white/70"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-glow shrink-0" /> Sheets formulas & charts</div>
                <div className="flex items-center gap-2 text-white/70"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-glow shrink-0" /> Real-time news summarizer</div>
              </div>
            </div>

            <div className="p-3 bg-cyan-glow/5 border border-cyan-glow/20 rounded-lg flex gap-2 text-[10px] text-cyan-glow leading-normal">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>JARVIS remembers settings across browser refresh sessions using the SQLite persistence registry.</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal dialog */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 glass-panel rounded-xl border border-electric-blue/20 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs uppercase tracking-widest font-mono text-cyan-glow">Upload File Attachment</span>
              <button onClick={() => setShowFileModal(false)} className="text-white/50 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <label className="border-2 border-dashed border-electric-blue/20 hover:border-cyan-glow/60 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all">
              <Paperclip className="w-8 h-8 text-electric-blue animate-bounce" />
              <span className="text-xs text-white/80">Choose local file or drop here</span>
              <span className="text-[10px] text-white/40">PDF, TXT, CSV or images up to 10MB</span>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
      )}

    </div>
  );
}
