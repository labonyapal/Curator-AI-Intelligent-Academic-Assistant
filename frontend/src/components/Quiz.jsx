import React, { useState } from 'react';
import axios from 'axios';
import { 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCw, 
  BookOpen, 
  Copy, 
  Check, 
  AlertCircle,
  RefreshCw,
  Award
} from 'lucide-react';

export default function Quiz() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  
  // Interactive Flashcards state
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  // Helper parser for flashcards
  const parseFlashcards = (text) => {
    try {
      const cards = [];
      // Look for typical LLM formats like "Flashcard 1: Question: X Answer: Y" or Q&A patterns
      // A common pattern: Q: <question> \n A: <answer> or Question: <q> \n Answer: <a>
      const lines = text.split('\n');
      let currentQ = '';
      let currentA = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Match Flashcard headers or Question headers
        if (line.toLowerCase().startsWith('question:') || line.toLowerCase().startsWith('q:') || line.toLowerCase().match(/^flashcard \d+:/)) {
          if (currentQ && currentA) {
            cards.push({ question: currentQ, answer: currentA });
            currentQ = '';
            currentA = '';
          }
          currentQ = line.replace(/^(question:|q:|flashcard \d+:\s*(question:)?)/i, '').trim();
        } else if (line.toLowerCase().startsWith('answer:') || line.toLowerCase().startsWith('a:')) {
          currentA = line.replace(/^(answer:|a:)/i, '').trim();
        } else if (currentQ && !currentA) {
          // Multiline question or separator
          if (line) currentQ += ' ' + line;
        } else if (currentQ && currentA) {
          if (line) currentA += ' ' + line;
        }
      }
      
      if (currentQ && currentA) {
        cards.push({ question: currentQ, answer: currentA });
      }

      // If we couldn't parse any cards, try fallback splitting
      if (cards.length === 0) {
        // Look for numbered flashcards like "1. Q: ... A: ..."
        const sections = text.split(/flashcard/i);
        sections.forEach(sec => {
          const parts = sec.split(/answer:|a:/i);
          if (parts.length >= 2) {
            const q = parts[0].replace(/^[0-9:\s.]+question:/i, '').replace(/^[0-9:\s.]+/i, '').trim();
            const a = parts[1].split(/\n/)[0].trim();
            if (q && a) {
              cards.push({ question: q, answer: a });
            }
          }
        });
      }

      return cards;
    } catch (e) {
      console.error('Error parsing flashcards:', e);
      return [];
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setContent('');
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);

    const formData = new URLSearchParams();
    formData.append('topic', topic);

    try {
      const res = await axios.post('/api/generate-quiz', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      setContent(res.data.content);
      
      // Parse flashcards from response
      const parsedCards = parseFlashcards(res.data.content);
      setFlashcards(parsedCards);
    } catch (err) {
      console.error('Quiz generation error:', err);
      const mockText = `### Academic Quiz & Flashcards: ${topic}

#### Multiple-Choice Questions (MCQs)

1. What is the fundamental goal when designing study structures for "${topic}"?
   A) Minimizing access latency
   B) Formatting documents with Markdown
   C) Running local LLM services
   D) None of the above
   **Answer: A**

2. How are chunks matching "${topic}" represented in ChromaDB?
   A) Raw PDF binary records
   B) Floating-point embedding vectors
   C) Markdown text files
   D) JSON datasets
   **Answer: B**

#### Flashcards

Flashcard 1:
Question: What is the primary service port for local Ollama APIs?
Answer: Port 11434

Flashcard 2:
Question: Which embedding model is used by Curator AI to create vector points?
Answer: nomic-embed-text

Flashcard 3:
Question: How long is the default character overlap for text chunks?
Answer: 64 characters

Flashcard 4:
Question: What fallback mechanism does the ingestor use if standard PDF extraction fails?
Answer: pytesseract OCR`;
      
      setContent(mockText);
      setFlashcards(parseFlashcards(mockText));
      setError('Backend offline. Displaying local quiz & flashcards demonstration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Quiz & Flashcards</h2>
        <p className="text-gray-400 text-sm mt-1">Generate multiple-choice assignments and interactive flashcards from your documents.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inputs */}
      <div className="glass-panel p-6 rounded-2xl">
        <form onSubmit={handleGenerateQuiz} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Quiz Topic / Chapter</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Database Normalization, Computer Networking layers, Alternating Currents"
              className="w-full px-4 py-3 bg-slate-950/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4" />
                <span>Generate Quiz & Cards</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center space-y-4 border border-indigo-500/20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
            <Award className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-white">Synthesizing Assignment Materials...</h4>
            <p className="text-sm text-gray-400 max-w-sm mt-1">Retrieving related academic paragraphs and writing MCQs with question flashcards using local Llama3.</p>
          </div>
        </div>
      )}

      {/* Main Results panels */}
      {content && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Markdown View (left 3 columns) */}
          <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden flex flex-col border border-gray-800">
            <div className="px-6 py-4 bg-slate-900/60 border-b border-gray-850 flex items-center justify-between">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Generated Quiz Materials</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1.5 rounded bg-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-6 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono overflow-y-auto max-h-[500px]">
              {content}
            </div>
          </div>

          {/* Flashcard interactive View (right 2 columns) */}
          <div className="lg:col-span-2 space-y-4 flex flex-col">
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/15">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                Interactive Flashcards
              </span>
              <span className="text-xs text-gray-400 block mt-1">
                Flip the card to reveal the answers and test your recollection.
              </span>
            </div>

            {flashcards.length > 0 ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                {/* Card box */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex-1 min-h-[260px] relative cursor-pointer select-none group perspective-1000"
                >
                  <div className={`relative w-full h-full rounded-2xl duration-500 transform-style-3d border ${
                    isFlipped 
                      ? 'bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/10' 
                      : 'bg-indigo-950/20 border-gray-800 hover:border-indigo-500/40'
                  } flex flex-col items-center justify-center p-8 text-center`}>
                    
                    {/* Rotate indicator */}
                    <div className="absolute top-4 right-4 text-xs font-semibold text-gray-500 flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                      <RotateCw className="w-3 h-3" />
                      <span>Flip</span>
                    </div>

                    {/* Question / Answer toggle */}
                    {!isFlipped ? (
                      <div className="space-y-4">
                        <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider">Question</span>
                        <p className="text-white text-base md:text-lg font-bold leading-relaxed px-4">
                          {flashcards[currentCardIndex].question}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">Answer</span>
                        <p className="text-emerald-200 text-base md:text-lg font-bold leading-relaxed px-4">
                          {flashcards[currentCardIndex].answer}
                        </p>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-0 right-0 text-xs font-semibold text-gray-500">
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-gray-800 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
                    }}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-1"
                  >
                    <span>Next Card</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 glass-panel border border-gray-800/40 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-gray-600 min-h-[200px]">
                <BookOpen className="w-10 h-10 mb-2 opacity-40" />
                <span className="text-sm font-semibold">No flashcards parsed</span>
                <span className="text-xs text-gray-500 max-w-[200px] mt-1">Unable to extract structured cards. Please view raw quiz output.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
