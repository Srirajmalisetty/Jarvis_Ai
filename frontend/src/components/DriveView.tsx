"use client";

import { useState, useEffect } from "react";
import { 
  Folder, FileText, FileSpreadsheet, Image, File, Search, RefreshCw, 
  ArrowUpRight, Plus, ExternalLink, HardDrive, Filter
} from "lucide-react";
import { api } from "../utils/api";

export default function DriveView() {
  const [files, setFiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const mockFiles = [
    { id: "d1", name: "Stark Industries clean energy formulas", type: "document", size: "1.2 MB", updated: "Yesterday, 14:10", owner: "Tony Stark" },
    { id: "d2", name: "JARVIS AI news database logging", type: "spreadsheet", size: "450 KB", updated: "Today, 15:45", owner: "Me" },
    { id: "d3", name: "Project Telemetry CAD Model v2", type: "file", size: "48.6 MB", updated: "3 days ago", owner: "Me" },
    { id: "d4", name: "Security audit compliance credentials", type: "pdf", size: "2.4 MB", updated: "Last week", owner: "Pepper Potts" },
    { id: "d5", name: "Tesla Autopilot training dataset", type: "folder", size: "--", updated: "Last month", owner: "Elon Musk" }
  ];

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Direct integration calls
      const list = mockFiles; // Using mock files for visualization
      setFiles(list);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "folder": return <Folder className="w-5 h-5 text-cyan-glow fill-cyan-glow/10" />;
      case "document": return <FileText className="w-5 h-5 text-blue-400" />;
      case "spreadsheet": return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
      case "image": return <Image className="w-5 h-5 text-yellow-400" />;
      default: return <File className="w-5 h-5 text-white/50" />;
    }
  };

  const filteredFiles = files
    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(f => activeFilter === "ALL" ? true : f.type === activeFilter.toLowerCase());

  return (
    <div className="space-y-6">
      
      {/* Drive Action Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-cyan-glow" />
          <div>
            <h1 className="text-xl font-bold tracking-wider font-display text-white">Google Drive Space</h1>
            <p className="text-xs text-white/40 font-mono">Synchronized with Google Drive & Docs APIs</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchFiles}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg border border-white/5 cursor-pointer flex items-center gap-1.5 text-xs font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload
          </button>
          <button 
            onClick={() => alert("Creating file template in Drive root...")}
            className="bg-gradient-to-r from-electric-blue to-cyan-glow text-[#030303] px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Document
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-electric-blue/15 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-glow"
          />
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["ALL", "Folder", "Document", "Spreadsheet", "PDF"].map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveFilter(f)}
              className={`font-mono text-[9px] uppercase tracking-wider px-3 py-1 rounded-lg border cursor-pointer shrink-0 transition-all ${activeFilter === f ? "bg-cyan-glow/5 border-cyan-glow text-cyan-glow" : "bg-white/5 border-white/5 text-white/60 hover:border-white/20"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* File List Grid */}
      <div className="glass-panel rounded-2xl border border-electric-blue/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-white/80 border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white font-bold">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Last Modified</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40 uppercase tracking-widest font-mono text-xs animate-pulse">
                    Scanning Drive Index...
                  </td>
                </tr>
              ) : filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40 font-mono">
                    No files found in Drive.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-white/5 transition-all">
                    <td className="px-5 py-3.5 font-bold text-white flex items-center gap-3">
                      {getIcon(file.type)}
                      <span className="truncate max-w-[250px]">{file.name}</span>
                    </td>
                    <td className="px-5 py-3.5 uppercase text-[10px] text-white/50">{file.type}</td>
                    <td className="px-5 py-3.5 text-white/50">{file.size}</td>
                    <td className="px-5 py-3.5 text-white/50">{file.updated}</td>
                    <td className="px-5 py-3.5">{file.owner}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => alert(`Launching document viewer for ${file.name}`)}
                        className="text-cyan-glow hover:text-white p-1 cursor-pointer transition-colors"
                        title="Open Document Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
