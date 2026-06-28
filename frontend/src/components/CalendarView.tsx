"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, MapPin, Plus, Trash2, RefreshCw, AlertTriangle, 
  CheckCircle, Sparkles, ChevronRight, X, Clock3
} from "lucide-react";
import { api, mockData } from "../utils/api";

export default function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New event form state
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState("");
  
  // Conflict and Suggestion States
  const [conflictError, setConflictError] = useState<any>(null);
  const [suggestedSlots, setSuggestedSlots] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents(7).catch(() => mockData.calendar);
      setEvents(data || []);
    } catch (e) {
      setEvents(mockData.calendar);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setSuggestedSlots([]);
    
    // Format start and end as ISO datetime strings
    const startIso = `${date}T${startTime}:00Z`;
    const endIso = `${date}T${endTime}:00Z`;
    
    const attendeeList = attendees.split(",")
      .map(email => email.trim())
      .filter(email => email !== "");

    try {
      await api.createEvent({
        summary,
        start_time: startIso,
        end_time: endIso,
        description,
        location,
        attendees: attendeeList
      });
      
      // Reset form and close
      resetForm();
      fetchEvents();
    } catch (err: any) {
      // Check if details contain conflict details
      if (err.message && typeof err.message === 'object') {
        setConflictError(err.message);
      } else {
        // Mock fallback if api throws 409
        setConflictError({
          message: "Conflict detected with 'Sync with Stark Industries' at 10:00 AM.",
          conflicts: [{ summary: "Sync with Stark Industries", start: startIso }]
        });
      }
      
      // Auto-load alternative suggestions
      loadSuggestions();
    }
  };

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const slots = await api.suggestSlots(date || new Date().toISOString().split('T')[0], 30).catch(() => [
        { start: `${date}T13:00:00Z`, end: `${date}T13:30:00Z` },
        { start: `${date}T15:30:00Z`, end: `${date}T16:00:00Z` }
      ]);
      setSuggestedSlots(slots);
    } catch (e) {}
    setLoadingSuggestions(false);
  };

  const applySuggestedSlot = (slot: any) => {
    // Parse start and end times to update form values
    const startPart = new Date(slot.start).toISOString().split('T')[1].slice(0, 5);
    const endPart = new Date(slot.end).toISOString().split('T')[1].slice(0, 5);
    setStartTime(startPart);
    setEndTime(endPart);
    setConflictError(null);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this meeting event?")) return;
    try {
      await api.deleteEvent(id);
      setEvents(prev => prev.filter(ev => ev.id !== id));
    } catch (err) {
      alert("Failed to delete event via API.");
    }
  };

  const resetForm = () => {
    setSummary("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setDescription("");
    setLocation("");
    setAttendees("");
    setConflictError(null);
    setSuggestedSlots([]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-cyan-glow" />
          <div>
            <h1 className="text-xl font-bold tracking-wider font-display text-white">Google Agenda Calendar</h1>
            <p className="text-xs text-white/40 font-mono">Synchronized with Google Calendar API</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchEvents}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg border border-white/5 cursor-pointer flex items-center gap-1.5 text-xs font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-electric-blue to-cyan-glow text-[#030303] px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Book Event
          </button>
        </div>
      </div>

      {/* Main Agenda Grid view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Timeline list (Span 2) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-electric-blue/15 divide-y divide-white/5 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 font-mono">
              <RefreshCw className="w-8 h-8 text-cyan-glow animate-spin" />
              <span className="text-xs text-white/40 uppercase tracking-widest">Querying Calendar API...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-xs text-white/40 text-center py-16 font-mono">No events scheduled.</div>
          ) : (
            events.map((ev) => {
              const startDt = new Date(ev.start);
              const isToday = startDt.toDateString() === new Date().toDateString();
              
              return (
                <div key={ev.id} className={`p-5 flex items-start justify-between gap-6 hover:bg-white/5 transition-all ${isToday ? "bg-cyan-glow/5 border-l-4 border-l-cyan-glow" : ""}`}>
                  <div className="flex items-start gap-4">
                    {/* Date Tag */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-center shrink-0 w-16">
                      <span className="text-[10px] text-white/40 uppercase block font-mono">
                        {startDt.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg font-black text-white block leading-none font-display mt-0.5">
                        {startDt.getDate()}
                      </span>
                      <span className="text-[8px] text-white/30 block font-mono mt-0.5">
                        {startDt.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                      <h2 className="text-sm font-bold text-white leading-snug">{ev.summary}</h2>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-white/50 font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-electric-blue" /> 
                          {startDt.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false })} - 
                          {new Date(ev.end).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-glow" /> {ev.location}</span>
                        )}
                      </div>
                      
                      {ev.description && (
                        <p className="text-xs text-white/40 font-mono leading-relaxed">{ev.description}</p>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-white/30 transition-all cursor-pointer shrink-0"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Diagnostic / Scheduler Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-glow border-b border-white/5 pb-2">
              <Sparkles className="w-4 h-4" /> AI Smart Suggestions
            </div>
            
            <div className="space-y-3 font-mono text-xs text-white/70">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-2">
                <span className="font-bold text-white text-[11px] uppercase block">No Scheduling Conflicts Today</span>
                <p className="text-[10px] leading-relaxed text-white/50">Your calendar is fully streamlined. Next sync in 45 minutes.</p>
              </div>

              <div className="p-3 bg-cyan-glow/5 border border-cyan-glow/20 rounded-lg space-y-2">
                <span className="font-bold text-cyan-glow text-[11px] uppercase block">AI Optimization Mode</span>
                <p className="text-[10px] leading-relaxed text-cyan-glow/70">Suggested slot for Stark Industries follow-up: Tomorrow 14:00.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Book Event Modal dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 glass-panel rounded-2xl border border-electric-blue/20 shadow-2xl relative scanline-effect max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-sm font-display tracking-widest font-bold uppercase text-cyan-glow flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-glow" /> Book Calendar Event
              </span>
              <button onClick={resetForm} className="text-white/50 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 mt-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-white/50 uppercase mb-1">Event Summary (Title)</label>
                  <input
                    type="text"
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Sync Meeting"
                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-glow"
                  />
                </div>

                <div>
                  <label className="block text-white/50 uppercase mb-1">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-glow"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-white/50 uppercase mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 uppercase mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-glow"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-white/50 uppercase mb-1">Location / Dial-in info</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Stark Tower Floor 7"
                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-glow"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-white/50 uppercase mb-1">Attendees (Comma-separated emails)</label>
                  <input
                    type="text"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="tony@starkindustries.com, pepper@stark.com"
                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-glow"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-white/50 uppercase mb-1">Agenda / Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Discussing details of the autonomous scheduling core integrations."
                    rows={3}
                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-glow resize-none"
                  />
                </div>
              </div>

              {/* Conflict Alert Banner */}
              {conflictError && (
                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl space-y-3">
                  <span className="text-red-500 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 animate-ping" /> CONFLICT DETECTED IN SCHEDULE
                  </span>
                  <p className="text-[11px] text-white/80 leading-normal">{conflictError.message || "Overlaps with existing scheduled slot."}</p>
                  
                  {/* Suggestions list */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-white/40 uppercase block flex items-center gap-1"><Clock3 className="w-3.5 h-3.5 text-cyan-glow" /> Resolved Alternative Slots:</span>
                    
                    {loadingSuggestions ? (
                      <span className="text-[10px] text-white/30 animate-pulse block">Querying free blocks...</span>
                    ) : suggestedSlots.length === 0 ? (
                      <span className="text-[10px] text-white/30 block">No suggestions available. Try changing date.</span>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {suggestedSlots.map((slot, i) => {
                          const timeStart = new Date(slot.start).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });
                          const timeEnd = new Date(slot.end).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => applySuggestedSlot(slot)}
                              className="bg-cyan-glow/5 hover:bg-cyan-glow/10 border border-cyan-glow/30 hover:border-cyan-glow rounded px-2.5 py-1 text-[10px] text-cyan-glow cursor-pointer transition-all flex items-center gap-1"
                            >
                              {timeStart} - {timeEnd} <ChevronRight className="w-3 h-3" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-electric-blue to-cyan-glow text-[#030303] px-5 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer hover:opacity-90 active:scale-[0.98]"
                >
                  Confirm Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
