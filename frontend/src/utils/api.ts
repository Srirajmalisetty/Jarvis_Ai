const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jarvis_token");
  }
  return null;
}

export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("jarvis_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jarvis_token");
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "API Error");
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to log in.");
    }
    return response.json();
  },
  
  register: (email: string, password: string) => 
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
    
  getGoogleStatus: () => request("/api/auth/google/status"),
  getGoogleAuthUrl: (token: string) => request(`/api/auth/google?state=${token}`),
  
  // Chat / Assistant
  sendMessage: (message: string) => 
    request("/api/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message })
    }),
  getChatHistory: () => request("/api/assistant/history"),
  
  // Gmail
  getEmails: (query = "label:INBOX", maxResults = 10) => 
    request(`/api/gmail/emails?query=${encodeURIComponent(query)}&max_results=${maxResults}`),
  starEmail: (id: string) => request(`/api/gmail/emails/${id}/star`, { method: "POST" }),
  archiveEmail: (id: string) => request(`/api/gmail/emails/${id}/archive`, { method: "POST" }),
  deleteEmail: (id: string) => request(`/api/gmail/emails/${id}/delete`, { method: "POST" }),
  replyEmail: (threadId: string, to: string, subject: string, body: string) =>
    request("/api/gmail/emails/reply", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ thread_id: threadId, to, subject, body }).toString()
    }),
  analyzeInbox: () => request("/api/gmail/analyze"),
  
  // Calendar
  getEvents: (days = 7) => request(`/api/calendar/events?days=${days}`),
  createEvent: (eventData: { summary: string; start_time: string; end_time: string; description?: string; location?: string; attendees?: string[] }) =>
    request("/api/calendar/events", {
      method: "POST",
      body: JSON.stringify(eventData)
    }),
  deleteEvent: (id: string) => request(`/api/calendar/events/${id}`, { method: "DELETE" }),
  suggestSlots: (date: string, duration = 30) => request(`/api/calendar/suggest?date=${date}&duration=${duration}`),
  
  // Sheets
  createSheet: (title: string) => request(`/api/sheets/create?title=${encodeURIComponent(title)}`, { method: "POST" }),
  readSheet: (spreadsheetId: string, rangeName?: string) => 
    request(`/api/sheets/read?spreadsheet_id=${spreadsheetId}${rangeName ? `&range_name=${encodeURIComponent(rangeName)}` : ""}`),
  appendSheet: (spreadsheetId: string, values: any[][], rangeName?: string) =>
    request(`/api/sheets/append?spreadsheet_id=${spreadsheetId}${rangeName ? `&range_name=${encodeURIComponent(rangeName)}` : ""}`, {
      method: "POST",
      body: JSON.stringify(values)
    }),
  analyzeSheet: (spreadsheetId: string, rangeName?: string) =>
    request(`/api/sheets/analyze?spreadsheet_id=${spreadsheetId}${rangeName ? `&range_name=${encodeURIComponent(rangeName)}` : ""}`, {
      method: "POST"
    }),
  
  // News
  getArticles: () => request("/api/news/articles"),
  triggerNewsSync: () => request("/api/news/trigger", { method: "POST" }),
  
  // Automations
  getAutomationLogs: () => request("/api/automations/logs"),
  runAutomation: (jobName: string) => request(`/api/automations/run/${jobName}`, { method: "POST" }),
  
  // Memory
  getPreferences: () => request("/api/memory/preferences"),
  updatePreferences: (preferences: string, preferredStyle: string) =>
    request("/api/memory/preferences", {
      method: "POST",
      body: JSON.stringify({ preferences, preferred_style: preferredStyle })
    }),
    
  // Analytics
  getAnalytics: () => request("/api/analytics/dashboard"),
};

// Beautiful Cyberpunk Mock data fallbacks for standalone preview / fallback modes
export const mockData = {
  emails: [
    { id: "e1", subject: "Review Q3 Strategy Plan", from: "Tony Stark <tony@starkindustries.com>", date: "Today, 10:15 AM", snippet: "Sriraj, we need to finalize the clean energy project metrics. Review the sheets model I sent over.", priority: "high", category: "work", is_meeting: false },
    { id: "e2", subject: "Invitation: Google AI Tech Talk", from: "Sundar Pichai <sundar@google.com>", date: "Today, 08:30 AM", snippet: "We are hosting an exclusive roundtable on Gemini's autonomous agents interface.", priority: "medium", category: "work", is_meeting: true },
    { id: "e3", subject: "Tesla Autopilot Release Notes v12.8", from: "Elon Musk <elon@tesla.com>", date: "Yesterday", snippet: "Check the full autonomous driving telemetry summary inside the shared Google folder.", priority: "low", category: "social", is_meeting: false },
    { id: "e4", subject: "Server Node Alert: CPU load > 92%", from: "AWS DevOps <devops@amazon.com>", date: "Yesterday", snippet: "Instance i-09fb2a45a is experiencing heavy caching loads on Redis clusters.", priority: "high", category: "spam", is_meeting: false }
  ],
  calendar: [
    { id: "c1", summary: "Sync with Stark Industries", start: new Date().toISOString(), end: new Date(Date.now() + 60*60*1000).toISOString(), location: "Stark Tower L7", description: "Autonomous operating system architecture alignment." },
    { id: "c2", summary: "Gemini 3.5 Integration Plan Review", start: new Date(Date.now() + 3*60*60*1000).toISOString(), end: new Date(Date.now() + 4*60*60*1000).toISOString(), location: "Virtual Hub 4", description: "Review API endpoints, tool routing and websocket logs." },
    { id: "c3", summary: "Daily Core Diagnostic Run", start: new Date(Date.now() + 24*60*60*1000).toISOString(), end: new Date(Date.now() + 25*60*60*1000).toISOString(), location: "Local Cluster", description: "Automated checks for background jobs and db integrity." }
  ],
  tasks: [
    { id: "t1", title: "Verify Gmail Agent reply triggers", notes: "Test auto classification of important mail threads", status: "needsAction" },
    { id: "t2", title: "Connect Google Sheets News Log", notes: "Confirm columns Date, Headline, URL append correctly", status: "needsAction" },
    { id: "t3", title: "Build glassmorphic HUD component", notes: "Optimize Canvas animation FPS and neon border glowing", status: "completed" }
  ],
  news: [
    { id: 1, date: "2026-06-28", time: "15:45:00", headline: "Google Gemini 3.5 Personal Assistants Enter Public Beta", summary: "Google has announced developers can now build fully stateful autonomous agents on the new API endpoints.", category: "AI Research", country: "Global", source: "TechCrunch", url: "#", importance_score: 9.6, ai_notes: "This unlocks true workflow multi-threading, which JARVIS now utilizes.", status: "synced" },
    { id: 2, date: "2026-06-28", time: "14:20:00", headline: "NVIDIA Quantum-Link Chips Deploying in AWS Clusters", summary: "AWS announces deployment of H300 Tensor Core modules with integrated room-temp quantum nodes.", category: "Tech Hardware", country: "Global", source: "Wired", url: "#", importance_score: 8.8, ai_notes: "Sriraj's dev server latency will improve significantly.", status: "synced" },
    { id: 3, date: "2026-06-28", time: "12:10:00", headline: "Indian AI Unicorn 'Krutrim' Closes $850M Funding Round", summary: "India's prime AI developer seals series B valuation of $6B to build regional datacenter grids.", category: "Business", country: "India", source: "Economic Times", url: "#", importance_score: 7.9, ai_notes: "Expect a rise in high-performance localized Gemini nodes.", status: "synced" }
  ],
  analytics: {
    emails_today: 48,
    meetings_today: 4,
    tasks_completed: 18,
    news_collected: 124,
    sheet_updates: 24,
    api_usage: 412,
    gemini_tokens_used: 184500
  }
};
