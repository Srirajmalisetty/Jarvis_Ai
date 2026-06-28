"use client";

import { useState, useEffect } from "react";
import { 
  Database, User, Cpu, Sparkles, Plus, Save, RefreshCw, 
  Trash2, FileSpreadsheet, Users, ShieldAlert, Award
} from "lucide-react";
import { api } from "../utils/api";

export default function MemoryView() {
  const [ownerName, setOwnerName] = useState("Sriraj");
  const [styleGuide, setStyleGuide] = useState("Professional, highly articulate, futuristic, inspired by Iron Man's JARVIS assistant.");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const data = await api.getPreferences();
        if (data.preferences?.owner_name) setOwnerName(data.preferences.owner_name);
        if (data.preferences?.voice_enabled !== undefined) setVoiceEnabled(data.preferences.voice_enabled);
        if (data.preferred_style) setStyleGuide(data.preferred_style);
      } catch (e) {}
    };
    fetchMemory();
  }, []);

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const preferencesJson = JSON.stringify({
        owner_name: ownerName,
        voice_enabled: voiceEnabled
      });
      await api.updatePreferences(preferencesJson, styleGuide);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update cognitive memory tables.");
    } finally {
      setLoading(false);
    }
  };

  const mockContacts = [
    { name: "Tony Stark", email: "tony@starkindustries.com", count: 42 },
    { name: "Sundar Pichai", email: "sundar@google.com", count: 18 },
    { name: "Elon Musk", email: "elon@tesla.com", count: 12 },
    { name: "Pepper Potts", email: "pepper@stark.com", count: 28 }
  ];

  const mockSheets = [
    { name: "JARVIS AI news database logging", id: "1NUNNfqbJoE09j6YNs3v5nsSwg0N5piDTQf2YilT-R4c" },
    { name: "Q3 Financial Performance Metrics", id: "1SpF7bX5y-2u0n" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-cyan-glow" />
          <div>
            <h1 className="text-xl font-bold tracking-wider font-display text-white">Cognitive Memory Database</h1>
            <p className="text-xs text-white/40 font-mono">Manages user preferences, style guides, and ecosystem metrics</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Update Profile and Style Instructions (Span 7) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSaveMemory} className="glass-panel rounded-2xl p-6 border border-electric-blue/15 space-y-5 scanline-effect">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow border-b border-white/5 pb-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Configure Core Personality
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-white/50 uppercase mb-1">System Owner Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-[#0a0a0c]/85 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-glow"
                  />
                  <User className="absolute right-3 top-3 w-4 h-4 text-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-white/50 uppercase mb-1">Linguistic Styling Instructions</label>
                <textarea
                  required
                  value={styleGuide}
                  onChange={(e) => setStyleGuide(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0a0a0c]/85 border border-white/10 rounded-lg p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-glow resize-none leading-relaxed font-mono"
                />
                <p className="text-[10px] text-white/45 mt-1">This guides Gemini's output tone, style, and persona during operations.</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Speak System Output (TTS)</span>
                  <span className="text-[10px] text-white/40 block">Toggles browser audio response speech synthesis.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="w-4 h-4 text-cyan-glow accent-cyan-glow cursor-pointer"
                />
              </div>

              {success && (
                <div className="p-3 bg-cyan-glow/10 border border-cyan-glow/30 rounded-lg text-cyan-glow text-center font-bold">
                  Cognitive memory registers updated successfully.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-electric-blue to-cyan-glow text-[#030303] py-3 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Re-syncing Databases..." : "Save Preferences"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Scoped Ecosystem (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Frequent Contacts */}
          <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow border-b border-white/5 pb-2">
              <Users className="w-4 h-4" /> Frequently Contacted Entities
            </div>
            <div className="space-y-3 font-mono text-xs">
              {mockContacts.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-white/5 border border-white/5 rounded-lg">
                  <div className="truncate pr-4">
                    <span className="font-bold text-white block truncate">{c.name}</span>
                    <span className="text-[9px] text-white/45 block truncate">{c.email}</span>
                  </div>
                  <span className="text-[10px] border border-cyan-glow/20 rounded px-1.5 py-0.5 bg-cyan-glow/5 text-cyan-glow font-bold shrink-0">
                    {c.count} interactions
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently used spreadsheets */}
          <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow border-b border-white/5 pb-2">
              <FileSpreadsheet className="w-4 h-4" /> Registered Spreadsheet Resources
            </div>
            <div className="space-y-3 font-mono text-xs">
              {mockSheets.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg gap-4">
                  <div className="truncate">
                    <span className="font-bold text-white block truncate">{s.name}</span>
                    <span className="text-[9px] text-white/40 block truncate">ID: {s.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
