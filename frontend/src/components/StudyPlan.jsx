import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  BookOpen, 
  Plus, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  Award
} from 'lucide-react';

export default function StudyPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form input states
  const [topic, setTopic] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Submission States
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [createError, setCreateError] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/study-plans');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Error fetching study plans:', err);
      // Fallback mockup plans
      setPlans([
        { id: 1, topic: 'Foundation of Programming Syllabus', due_date: '2026-06-30', total_chunks: 140 },
        { id: 2, topic: 'Digital Logic Design Flip-Flops', due_date: '2026-07-15', total_chunks: 85 },
        { id: 3, topic: 'Calculus integration exam prep', due_date: '2026-06-25', total_chunks: 210 }
      ]);
      setError('Backend offline. Showing local mock study schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!topic.trim() || !dueDate) return;

    setCreating(true);
    setCreateSuccess(null);
    setCreateError(null);

    // Form data encoding
    const formData = new URLSearchParams();
    formData.append('topic', topic);
    formData.append('due_date', dueDate);

    try {
      const res = await axios.post('/api/create-study-plan', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      setCreateSuccess(res.data.message + ` (${res.data.daily_goal})`);
      setTopic('');
      setDueDate('');
      fetchPlans(); // Refresh the list
    } catch (err) {
      console.error('Create study plan error:', err);
      setCreateError('Failed to save study goal to database.');
    } finally {
      setCreating(false);
    }
  };

  // Helper function to calculate remaining days
  const getDaysRemaining = (dueDateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dueDateStr);
    target.setHours(0,0,0,0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Study Schedules</h2>
          <p className="text-gray-400 text-sm mt-1">Set academic milestones, compile document index chunks, and verify daily work targets.</p>
        </div>
        <button 
          onClick={fetchPlans}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-gray-800 text-xs font-semibold text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Plans
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Create Study Goal
          </h3>

          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Topic / Textbook Subject</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Computer Networking, DLD Lectures"
                className="w-full px-4 py-3 bg-slate-950/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Due Date</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                required
              />
            </div>

            {createSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            {createError && (
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={creating || !topic.trim() || !dueDate}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing database...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Generate Study Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Schedule List panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Active Target Schedules ({plans.length})
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-sm text-gray-400">Loading active plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 border border-gray-800/40 rounded-xl bg-slate-950/20">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <span className="text-gray-400 font-semibold block text-lg">No active study milestones</span>
              <span className="text-sm text-gray-500 mt-1 block">Set your target topic and exam deadlines using the creator.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => {
                const daysLeft = getDaysRemaining(plan.due_date);
                const dailyChunks = Math.max(1, Math.floor(plan.total_chunks / (daysLeft > 0 ? daysLeft : 10)));
                const statusColor = daysLeft < 0 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : daysLeft <= 3 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                return (
                  <div 
                    key={plan.id}
                    className="p-5 rounded-xl border border-gray-800 bg-slate-900/40 hover:border-gray-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                        <h4 className="text-base font-bold text-white leading-tight">
                          {plan.topic}
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
                          Total knowledge segments: <strong className="text-white">{plan.total_chunks} chunks</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                          Target Date: <strong className="text-white">{plan.due_date}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3 md:gap-2 border-t md:border-t-0 border-gray-800/80 pt-3.5 md:pt-0">
                      <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusColor} flex items-center gap-1.5`}>
                        <Clock className="w-3.5 h-3.5" />
                        {daysLeft < 0 
                          ? 'Passed Deadline' 
                          : daysLeft === 0 
                            ? 'Due Today!' 
                            : `${daysLeft} days left`}
                      </div>
                      
                      {daysLeft >= 0 && (
                        <span className="text-xs text-gray-400 font-medium">
                          Suggested pace: <strong className="text-white">{dailyChunks} chunks / day</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
