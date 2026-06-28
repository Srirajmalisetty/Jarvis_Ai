"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, Circle, Plus, Trash2, RefreshCw, Sparkles, 
  ListChecks, Calendar, Info, X
} from "lucide-react";
import { api, mockData } from "../utils/api";

export default function TasksView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Direct load from dashboard mock/api
      setTasks(mockData.tasks);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: "local_" + Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      notes: newTaskNotes,
      due: newTaskDue || null,
      status: "needsAction",
      created_at: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle("");
    setNewTaskNotes("");
    setNewTaskDue("");
    setShowAddModal(false);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === "completed" ? "needsAction" : "completed" } 
        : t
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <ListChecks className="w-6 h-6 text-cyan-glow" />
          <div>
            <h1 className="text-xl font-bold tracking-wider font-display text-white">Google Tasks registry</h1>
            <p className="text-xs text-white/40 font-mono">Synchronized with Google Tasks API</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchTasks}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg border border-white/5 cursor-pointer flex items-center gap-1.5 text-xs font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-electric-blue to-cyan-glow text-[#030303] px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </div>
      </div>

      {/* Grid Layout split between Active and Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Tasks Panel */}
        <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-glow flex items-center gap-1.5">
              <Circle className="w-4 h-4 text-cyan-glow" /> Pending Tasks ({pendingTasks.length})
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {pendingTasks.length === 0 ? (
              <div className="text-xs text-white/30 text-center py-12 font-mono">No active tasks. Good work!</div>
            ) : (
              pendingTasks.map((t) => (
                <div key={t.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start justify-between gap-4 group hover:border-cyan-glow/20">
                  <button 
                    onClick={() => handleToggleTask(t.id)}
                    className="flex items-start gap-2.5 text-left cursor-pointer flex-1"
                  >
                    <Circle className="w-4.5 h-4.5 text-white/30 hover:text-cyan-glow shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block leading-snug">{t.title}</span>
                      {t.notes && <p className="text-[10px] text-white/50 font-mono leading-relaxed">{t.notes}</p>}
                      {t.due && <span className="text-[9px] font-mono text-cyan-glow flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {t.due}</span>}
                    </div>
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1 text-white/30 hover:text-red-500 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks Panel */}
        <div className="glass-panel rounded-2xl p-5 border border-electric-blue/15 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
            <span className="text-xs uppercase tracking-widest font-mono text-white/50 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white/40" /> Completed Today ({completedTasks.length})
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {completedTasks.length === 0 ? (
              <div className="text-xs text-white/20 text-center py-12 font-mono">No tasks completed yet today.</div>
            ) : (
              completedTasks.map((t) => (
                <div key={t.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start justify-between gap-4 group opacity-60">
                  <button 
                    onClick={() => handleToggleTask(t.id)}
                    className="flex items-start gap-2.5 text-left cursor-pointer flex-1"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5 text-cyan-glow shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white line-through block leading-snug">{t.title}</span>
                      {t.notes && <p className="text-[10px] text-white/40 line-through leading-relaxed">{t.notes}</p>}
                    </div>
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1 text-white/30 hover:text-red-500 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Task Modal dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 glass-panel rounded-2xl border border-electric-blue/20 shadow-2xl relative scanline-effect">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-sm font-display tracking-widest font-bold uppercase text-cyan-glow flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-cyan-glow" /> Create System Task
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-4 font-mono text-xs">
              <div>
                <label className="block text-white/50 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Verify API endpoints"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-glow"
                />
              </div>

              <div>
                <label className="block text-white/50 uppercase mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-glow"
                />
              </div>

              <div>
                <label className="block text-white/50 uppercase mb-1">Additional Notes</label>
                <textarea
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="Test both callback methods and confirm database rows append properly."
                  rows={3}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-glow resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-electric-blue to-cyan-glow text-[#030303] px-5 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer hover:opacity-90 active:scale-[0.98]"
                >
                  Confirm Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
