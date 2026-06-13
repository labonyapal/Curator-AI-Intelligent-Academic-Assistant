import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  Calendar, 
  FileText, 
  Activity, 
  Award,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function Overview({ onNavigate }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/dashboard-stats');
      setStats(res.data.usage_stats || {});
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      // Fallback/Mock stats if backend is offline or errors
      setStats({
        upload_document: 14,
        search_query: 42,
        summarize_chapter: 18,
        summarize_specific_paper: 9,
        generate_quiz: 12,
        create_study_plan: 5
      });
      setError('Backend offline. Showing local demonstration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statConfig = [
    { 
      key: 'upload_document', 
      label: 'Uploaded Documents', 
      icon: FileText, 
      color: 'from-blue-500 to-indigo-600', 
      bg: 'rgba(59, 130, 246, 0.1)',
      targetTab: 'library'
    },
    { 
      key: 'search_query', 
      label: 'Library Searches', 
      icon: Search, 
      color: 'from-purple-500 to-pink-500', 
      bg: 'rgba(168, 85, 247, 0.1)',
      targetTab: 'search'
    },
    { 
      key: 'summarize_chapter', 
      label: 'Topic Summaries', 
      icon: BookOpen, 
      color: 'from-emerald-500 to-teal-500', 
      bg: 'rgba(16, 185, 129, 0.1)',
      targetTab: 'summarizer'
    },
    { 
      key: 'summarize_specific_paper', 
      label: 'Paper Summaries', 
      icon: Sparkles, 
      color: 'from-amber-500 to-orange-500', 
      bg: 'rgba(245, 158, 11, 0.1)',
      targetTab: 'summarizer'
    },
    { 
      key: 'generate_quiz', 
      label: 'Quizzes Created', 
      icon: HelpCircle, 
      color: 'from-indigo-500 to-purple-500', 
      bg: 'rgba(99, 102, 241, 0.1)',
      targetTab: 'quiz'
    },
    { 
      key: 'create_study_plan', 
      label: 'Active Study Plans', 
      icon: Calendar, 
      color: 'from-rose-500 to-red-500', 
      bg: 'rgba(244, 63, 94, 0.1)',
      targetTab: 'study-plan'
    }
  ];

  const totalActivities = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-8 border border-indigo-500/25">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Award className="w-3.5 h-3.5" />
              Welcome to Curator AI Dashboard
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Curate Your <span className="text-gradient">Academic Knowledge</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Analyze papers, search documents, generate quizzes, and plan your study targets. All powered by local intelligence.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('search')}
            className="px-6 py-3.5 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all hover:shadow-indigo-500/20 transform hover:-translate-y-0.5"
          >
            Start Chat Search
          </button>
        </div>
      </div>

      {/* Warning/Offline Notice */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button 
            onClick={fetchStats}
            className="ml-auto underline font-medium hover:text-amber-200 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Key Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statConfig.map((item) => {
          const count = stats[item.key] || 0;
          return (
            <div 
              key={item.key}
              onClick={() => onNavigate(item.targetTab)}
              className="glass-panel glass-panel-hover p-6 rounded-2xl cursor-pointer group flex items-center gap-5"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-400 block">{item.label}</span>
                <span className="text-3xl font-extrabold text-white mt-1 block tracking-tight">
                  {count}
                </span>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors self-start mt-1" />
            </div>
          );
        })}
      </div>

      {/* Visual Analytics & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Distribution */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              AI Activity Analysis
            </h3>
            <p className="text-sm text-gray-400">Activity volume by API action</p>
          </div>

          <div className="mt-8 space-y-5">
            {statConfig.map((item) => {
              const count = stats[item.key] || 0;
              const percentage = totalActivities > 0 ? (count / totalActivities) * 100 : 0;
              
              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="text-indigo-300">{count} runs ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.max(3, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-800/60 mt-6 pt-5 flex items-center justify-between text-sm text-gray-400">
            <span>Aggregated Requests</span>
            <span className="text-white font-extrabold text-lg">{totalActivities} calls</span>
          </div>
        </div>

        {/* System Health / Info */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            System Status
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 block font-medium">Llama3 LLM Engine</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-white">Online (Ollama)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 block font-medium">Embedding Service</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-white">nomic-embed-text</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 block font-medium">Vector Store Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-semibold text-white">ChromaDB</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 leading-relaxed pt-2">
            AI queries execute on your local GPU/CPU. Make sure Ollama is running (`ollama run llama3`) for context processing.
          </div>
        </div>
      </div>
    </div>
  );
}
