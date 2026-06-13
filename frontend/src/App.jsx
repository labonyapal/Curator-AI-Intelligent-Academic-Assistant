import React, { useState } from 'react';
import Overview from './components/Overview';
import Library from './components/Library';
import Search from './components/Search';
import Summarizer from './components/Summarizer';
import Quiz from './components/Quiz';
import StudyPlan from './components/StudyPlan';

import { 
  LayoutDashboard, 
  FileText, 
  Search as SearchIcon, 
  BookOpen, 
  HelpCircle, 
  Calendar,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Shared navigation states for seamless experience
  const [summarizerPaper, setSummarizerPaper] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigateToSummarizer = (filename) => {
    setSummarizerPaper(filename);
    setActiveTab('summarizer');
  };

  const navigateToSearch = (filename) => {
    setSearchQuery(`Summarize the contents and source of the paper "${filename}"`);
    setActiveTab('search');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Clear pre-fills when switching tabs manually
    if (tabId !== 'summarizer') setSummarizerPaper('');
    if (tabId !== 'search') setSearchQuery('');
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Academic Library', icon: FileText },
    { id: 'search', label: 'AI Search & Query', icon: SearchIcon },
    { id: 'summarizer', label: 'AI Summarizer', icon: BookOpen },
    { id: 'quiz', label: 'Interactive Quizzes', icon: HelpCircle },
    { id: 'study-plan', label: 'Study Planner', icon: Calendar }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080b13] text-gray-100 font-sans">
      {/* Mobile Sidebar Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-white tracking-wider text-base">CURATOR AI</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-950/70 backdrop-blur-md border-r border-gray-850 p-5 flex flex-col justify-between transition-transform duration-300 md:translate-x-0`}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2.5 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-wider text-lg block leading-none">CURATOR AI</span>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase block mt-1">Workspace</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/10' 
                      : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer details */}
        <div className="pt-4 border-t border-gray-850 text-[10px] text-gray-500 font-medium space-y-1">
          <div>Local AI Assistant v1.0.0</div>
          <div>FastAPI + Llama3 Integration</div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 max-w-7xl mx-auto w-full">
        {/* Render View Components dynamically based on Tab Selection */}
        {activeTab === 'overview' && <Overview onNavigate={handleTabChange} />}
        {activeTab === 'library' && (
          <Library 
            onSummarizePaper={navigateToSummarizer} 
            onSearchDoc={navigateToSearch} 
          />
        )}
        {activeTab === 'search' && <Search defaultSearchQuery={searchQuery} />}
        {activeTab === 'summarizer' && <Summarizer defaultPaperName={summarizerPaper} />}
        {activeTab === 'quiz' && <Quiz />}
        {activeTab === 'study-plan' && <StudyPlan />}
      </main>
    </div>
  );
}
