"use client";

import { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, Mail, Calendar, FileSpreadsheet, HardDrive, 
  Rss, ListChecks, Database, Cpu, Activity, Settings, Terminal,
  Cpu as OrbIcon, LogOut, Search, Bell
} from "lucide-react";

import { getToken } from "../utils/api";
import LoginScreen from "../components/LoginScreen";
import DashboardView from "../components/DashboardView";
import AssistantView from "../components/AssistantView";
import InboxView from "../components/InboxView";
import CalendarView from "../components/CalendarView";
import SheetsView from "../components/SheetsView";
import DriveView from "../components/DriveView";
import NewsView from "../components/NewsView";
import TasksView from "../components/TasksView";
import MemoryView from "../components/MemoryView";
import AutomationsView from "../components/AutomationsView";
import AnalyticsView from "../components/AnalyticsView";
import SettingsView from "../components/SettingsView";
import DeveloperConsoleView from "../components/DeveloperConsoleView";

type TabName = 
  | "Dashboard" 
  | "AI Assistant" 
  | "Inbox" 
  | "Calendar" 
  | "Sheets" 
  | "Drive" 
  | "News" 
  | "Tasks" 
  | "Memory" 
  | "Automations" 
  | "Analytics" 
  | "Settings" 
  | "Developer Console";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("Dashboard");
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Notification logs
  const [notifications, setNotifications] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Authentication check
  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
    }
    setCheckingAuth(false);
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Space -> Opens AI Assistant
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        setActiveTab("AI Assistant");
        addNotification("Voice activation pathway initialized.");
      }
      // Ctrl + K -> Global Search focus
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, 4000);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303] text-cyan-glow font-mono text-xs uppercase tracking-widest">
        Initializing JARVIS Core Kernel...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => {
      setIsLoggedIn(true);
      addNotification("Identity verified. Welcome back, Sriraj.");
    }} />;
  }

  // Sidebar Items Mapper
  const sidebarItems = [
    { name: "Dashboard" as TabName, icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "AI Assistant" as TabName, icon: <OrbIcon className="w-4 h-4 text-cyan-glow animate-pulse" /> },
    { name: "Inbox" as TabName, icon: <Mail className="w-4 h-4" /> },
    { name: "Calendar" as TabName, icon: <Calendar className="w-4 h-4" /> },
    { name: "Sheets" as TabName, icon: <FileSpreadsheet className="w-4 h-4" /> },
    { name: "Drive" as TabName, icon: <HardDrive className="w-4 h-4" /> },
    { name: "News" as TabName, icon: <Rss className="w-4 h-4" /> },
    { name: "Tasks" as TabName, icon: <ListChecks className="w-4 h-4" /> },
    { name: "Memory" as TabName, icon: <Database className="w-4 h-4" /> },
    { name: "Automations" as TabName, icon: <Cpu className="w-4 h-4" /> },
    { name: "Analytics" as TabName, icon: <Activity className="w-4 h-4" /> },
    { name: "Settings" as TabName, icon: <Settings className="w-4 h-4" /> },
    { name: "Developer Console" as TabName, icon: <Terminal className="w-4 h-4" /> },
  ];

  // Render core tab views
  const renderContentView = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <DashboardView 
            onNavigate={(tab) => setActiveTab(tab as TabName)}
            onVoiceTrigger={() => {
              setActiveTab("AI Assistant");
              addNotification("Acoustic voice synthesis active.");
            }}
            onQuickCommand={(cmd) => {
              setActiveTab("AI Assistant");
              addNotification(`Forwarded command sequence: ${cmd}`);
            }}
          />
        );
      case "AI Assistant":
        return <AssistantView />;
      case "Inbox":
        return <InboxView />;
      case "Calendar":
        return <CalendarView />;
      case "Sheets":
        return <SheetsView />;
      case "Drive":
        return <DriveView />;
      case "News":
        return <NewsView />;
      case "Tasks":
        return <TasksView />;
      case "Memory":
        return <MemoryView />;
      case "Automations":
        return <AutomationsView />;
      case "Analytics":
        return <AnalyticsView />;
      case "Settings":
        return <SettingsView />;
      case "Developer Console":
        return <DeveloperConsoleView />;
      default:
        return <div className="text-white/40 font-mono text-xs">Under construction.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#030303] overflow-hidden text-[#f5f5f7] font-sans relative">
      
      {/* Background Matrix mesh */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40 z-0"></div>

      {/* Futuristic floating toaster notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {notifications.map((msg, i) => (
          <div 
            key={i} 
            className="p-3.5 bg-[#0a0a0c]/90 border border-cyan-glow/40 text-cyan-glow font-mono text-xs rounded-xl shadow-[0_0_15px_rgba(0,210,255,0.2)] flex items-center gap-2.5 animate-bounce"
          >
            <Bell className="w-4 h-4 text-cyan-glow animate-pulse" />
            <span>{msg}</span>
          </div>
        ))}
      </div>

      {/* Left Dock Sidebar */}
      <aside className="w-64 bg-[#0a0a0c]/80 border-r border-white/5 flex flex-col z-10 relative backdrop-blur-xl shrink-0">
        
        {/* Sidebar Header Logo */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-cyan-glow bg-cyan-glow/5 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,242,0.15)] animate-pulse">
            <Cpu className="w-4 h-4 text-cyan-glow" />
          </div>
          <div>
            <span className="text-sm font-black font-display tracking-widest text-white">JARVIS AI</span>
            <span className="text-[9px] font-mono text-cyan-glow block uppercase tracking-widest mt-0.5">Autonomous OS</span>
          </div>
        </div>

        {/* Search Everywhere Box */}
        <div className="p-4 border-b border-white/5">
          <div className="relative flex items-center">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Everywhere... (Ctrl+K)"
              className="w-full bg-[#030303] border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-cyan-glow"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/30" />
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full text-left font-mono text-[11px] uppercase tracking-wider px-3.5 py-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer ${activeTab === item.name ? "bg-cyan-glow/5 text-cyan-glow border border-cyan-glow/30 shadow-[0_0_10px_rgba(0,255,242,0.1)]" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/5 bg-[#030303]/40 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full border border-electric-blue/30 bg-electric-blue/5 flex items-center justify-center shrink-0">
              <span className="font-bold text-white">S</span>
            </div>
            <div className="truncate">
              <span className="text-white font-bold block truncate">Sriraj</span>
              <span className="text-[9px] text-white/40 block truncate">Developer Session</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 flex flex-col z-10 relative overflow-hidden bg-[#030303]/50">
        
        {/* Upper Topbar */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-[#0a0a0c]/60 backdrop-blur-md">
          <span className="text-sm font-bold uppercase tracking-widest font-mono text-white/70">
            {activeTab} PANEL
          </span>
          
          <div className="flex items-center gap-4 text-xs font-mono text-white/45">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400"></span> API: VERIFIED</span>
            <span>v1.0.0</span>
          </div>
        </header>

        {/* Scrollable central viewport */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {renderContentView()}
        </div>
      </main>

    </div>
  );
}
