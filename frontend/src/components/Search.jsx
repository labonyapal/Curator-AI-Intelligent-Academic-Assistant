import React, { useState } from 'react';
import axios from 'axios';
import { 
  Search as SearchIcon, 
  Sparkles, 
  HelpCircle, 
  Copy, 
  Check, 
  BookOpen, 
  AlertCircle,
  CornerDownLeft
} from 'lucide-react';

export default function Search({ defaultSearchQuery }) {
  const [query, setQuery] = useState(defaultSearchQuery || '');
  const [isNotes, setIsNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState([
    'What is the Foundation of Programming?',
    'Digital Logic Design solutions for flip-flops',
    'Data Structures: space complexity of binary search trees'
  ]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Save to recents
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }

    try {
      const res = await axios.get('/api/search', {
        params: {
          question: query,
          request_notes: isNotes
        }
      });
      setResult(res.data);
    } catch (err) {
      console.error('Search error:', err);
      // Fallback Mock
      setResult({
        answer: `This is a simulated AI response for the topic "${query}". \n\nNormally, the system searches ChromaDB vector store and aggregates academic context from your textbooks, lecture notes, and solution guides, then processes it with Ollama's local Llama3 model. \n\n• Key Point 1: You requested ${isNotes ? 'structured study notes' : 'a detailed answer'}.\n• Key Point 2: Ensure Ollama is active on port 11434 with llama3 and nomic-embed-text models loaded.\n• Key Point 3: The database already has 14 successfully indexed textbooks including DLD solutions, Calculus, CAO, and Networking.`,
        sources: ['Curator AI Fallback Service', 'FastAPI Integration.pdf']
      });
      setError('Backend offline. Showing local AI-generated mockup answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Curator Search</h2>
        <p className="text-gray-400 text-sm mt-1">Ask detailed academic questions to retrieve AI-curated reference answers from your database.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Console */}
      <div className="glass-panel p-6 rounded-2xl">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about Programming, Networking, Digital Logic Design, Calculus..."
              className="w-full pl-12 pr-28 py-4 bg-slate-950/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm md:text-base"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <CornerDownLeft className="w-4 h-4" />
              )}
              <span>Ask AI</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-850">
            {/* Search Mode Toggles */}
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Search Mode:</span>
              
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="radio" 
                  name="search-mode" 
                  checked={!isNotes} 
                  onChange={() => setIsNotes(false)}
                  className="w-4 h-4 text-indigo-600 bg-slate-900 border-gray-800 focus:ring-indigo-500"
                />
                <span className={`text-sm ${!isNotes ? 'text-white font-bold' : 'text-gray-400'}`}>Detailed Answer</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="radio" 
                  name="search-mode" 
                  checked={isNotes} 
                  onChange={() => setIsNotes(true)}
                  className="w-4 h-4 text-indigo-600 bg-slate-900 border-gray-800 focus:ring-indigo-500"
                />
                <span className={`text-sm ${isNotes ? 'text-white font-bold' : 'text-gray-400'}`}>Study Notes</span>
              </label>
            </div>

            {/* Recent suggestions */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Suggestions:</span>
              {recentSearches.slice(0, 2).map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => { setQuery(item); }}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-gray-400 border border-gray-800 truncate max-w-[200px]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center space-y-4 border border-indigo-500/20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
            <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-white">Consulting Academic Database...</h4>
            <p className="text-sm text-gray-400 max-w-sm mt-1">Performing ChromaDB vector similarity search and compiling Llama3 synthesis. Please stand by.</p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-indigo-500/15">
          {/* Result Header */}
          <div className="px-6 py-4 bg-slate-900/60 border-b border-gray-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-white text-sm">Curated AI Response</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                {isNotes ? 'Study Notes' : 'Detailed'}
              </span>
            </div>
            
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Result Body */}
          <div className="p-8 space-y-6">
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {result.answer}
            </div>

            {/* Sources section */}
            {result.sources && result.sources.length > 0 && (
              <div className="border-t border-gray-850 pt-5 space-y-2.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Context References</span>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((src, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg text-xs font-medium text-gray-400 border border-gray-800"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
