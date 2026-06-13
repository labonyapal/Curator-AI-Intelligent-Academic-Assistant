import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Terminal
} from 'lucide-react';

export default function Summarizer({ defaultPaperName }) {
  const [activeTab, setActiveTab] = useState(defaultPaperName ? 'paper' : 'topic');
  
  // General Summarizer states
  const [topic, setTopic] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState(null);
  
  // Specific Paper Summarizer states
  const [documents, setDocuments] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(defaultPaperName || '');
  const [paperSummary, setPaperSummary] = useState('');
  const [paperLoading, setPaperLoading] = useState(false);
  const [paperError, setPaperError] = useState(null);
  const [docsLoading, setDocsLoading] = useState(false);

  // Copy states
  const [copiedTopic, setCopiedTopic] = useState(false);
  const [copiedPaper, setCopiedPaper] = useState(false);

  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data.documents || []);
      if (res.data.documents && res.data.documents.length > 0 && !selectedPaper) {
        setSelectedPaper(res.data.documents[0]);
      }
    } catch (err) {
      console.error('Error fetching docs in summarizer:', err);
      setDocuments([
        '1201_FOP_ALL(Faculty_Lectures).pdf',
        '1202_DLD Solutions & Lectures.pdf',
        '2101_DSA_ALL(Faculty_Lecture).pdf',
        '2201_DBMS Solution & Concepts.pdf'
      ]);
      setSelectedPaper('1201_FOP_ALL(Faculty_Lectures).pdf');
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSummarizeTopic = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setTopicLoading(true);
    setTopicError(null);
    setTopicSummary('');

    // Form data encoding
    const formData = new URLSearchParams();
    formData.append('topic', topic);

    try {
      const res = await axios.post('/api/summarize', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      setTopicSummary(res.data.summary);
    } catch (err) {
      console.error('Summarize topic error:', err);
      setTopicSummary(`### AI Mock Summary: ${topic}\n\n• **Core Theme:** This is a simulated summary for the topic "${topic}".\n• **Theoretical Foundations:** Modern database parsing splits textbooks into semantic vectors for local LLM processing.\n• **Practical Insights:** To generate real summaries, verify that the Llama3 model has been pulled inside Ollama.\n• **Important Notes:** When executing locally, Llama3 generates comprehensive responses by evaluating search context.`);
      setTopicError('Backend offline. Showing local demonstration summary.');
    } finally {
      setTopicLoading(false);
    }
  };

  const handleSummarizePaper = async (e) => {
    e.preventDefault();
    if (!selectedPaper) return;

    setPaperLoading(true);
    setPaperError(null);
    setPaperSummary('');

    // Form data encoding
    const formData = new URLSearchParams();
    formData.append('filename', selectedPaper);

    try {
      const res = await axios.post('/api/summarize-specific-paper', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (res.data.error) {
        setPaperError(res.data.error);
      } else {
        setPaperSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Summarize paper error:', err);
      setPaperSummary(`### Research Summary: ${selectedPaper}\n\n• **Overview:** Summary extraction details for the file "${selectedPaper}".\n• **Extraction Methodology:** The backend opens the PDF from \`data/academic/${selectedPaper}\` via \`pdfplumber\`, falling back to OCR when text structures are missing.\n• **Key Concepts:** Focuses on the core curriculum components. Large documents are truncated to the first 10,000 characters for stable processing on local Ollama server.\n• **Conclusion:** Successfully parsed academic structure.`);
      setPaperError('Backend offline. Showing simulated PDF text summary.');
    } finally {
      setPaperLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'topic') {
      setCopiedTopic(true);
      setTimeout(() => setCopiedTopic(false), 2000);
    } else {
      setCopiedPaper(true);
      setTimeout(() => setCopiedPaper(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Summarizer</h2>
        <p className="text-gray-400 text-sm mt-1">Extract key insights and summaries from topics or specific PDF papers.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-slate-950/60 border border-gray-850 w-fit">
        <button
          onClick={() => setActiveTab('topic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'topic' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          General Topic Summarizer
        </button>
        <button
          onClick={() => setActiveTab('paper')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'paper' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Specific Paper Summarizer
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'topic' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General form */}
          <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Topic Analysis
              </h3>
              <p className="text-xs text-gray-400">Provide an academic subject or chapter topic. The AI will pull related chunks from all vector stores to generate a concise summary.</p>
            </div>

            {topicError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{topicError}</span>
              </div>
            )}

            <form onSubmit={handleSummarizeTopic} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Topic / Concept Name</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Kmap minimization, TCP handshake, Recursion trees"
                  className="w-full px-4 py-3 bg-slate-950/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={topicLoading || !topic.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {topicLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Generate Topic Summary</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results column */}
          <div className="glass-panel p-6 rounded-2xl min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-850 pb-4 mb-4">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Topic Summary Output</span>
              {topicSummary && (
                <button 
                  onClick={() => handleCopy(topicSummary, 'topic')}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1 rounded bg-slate-800"
                >
                  {copiedTopic ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTopic ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {topicLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-sm text-gray-400 text-center max-w-xs">Generating detailed summary from indexed curriculum files...</span>
              </div>
            ) : topicSummary ? (
              <div className="flex-1 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {topicSummary}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-600">
                <BookOpen className="w-12 h-12 mb-3 opacity-40" />
                <span>Submit a topic to generate a dynamic study guide.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Paper summarizer form */}
          <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Specific Document Summary
              </h3>
              <p className="text-xs text-gray-400">Select an ingested PDF document. The AI will extract raw text from that specific paper and compile a summary.</p>
            </div>

            {paperError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{paperError}</span>
              </div>
            )}

            <form onSubmit={handleSummarizePaper} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Select PDF Document</label>
                {docsLoading ? (
                  <div className="w-full py-3 bg-slate-950/30 border border-gray-850 rounded-xl text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading library files...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="w-full py-3 px-4 bg-slate-950/50 border border-rose-950/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> No files available. Upload documents in library first.
                  </div>
                ) : (
                  <select
                    value={selectedPaper}
                    onChange={(e) => setSelectedPaper(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  >
                    {documents.map((filename, index) => (
                      <option key={index} value={filename} className="bg-slate-950 text-white">
                        {filename}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={paperLoading || !selectedPaper || documents.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {paperLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Paper Summary</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results column */}
          <div className="glass-panel p-6 rounded-2xl min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-850 pb-4 mb-4">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Paper Summary Output</span>
              {paperSummary && (
                <button 
                  onClick={() => handleCopy(paperSummary, 'paper')}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1 rounded bg-slate-800"
                >
                  {copiedPaper ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPaper ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {paperLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-sm text-gray-400 text-center max-w-xs">Reading PDF layout and running local AI model evaluation...</span>
              </div>
            ) : paperSummary ? (
              <div className="flex-1 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {paperSummary}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-600">
                <FileText className="w-12 h-12 mb-3 opacity-40" />
                <span>Select an academic paper to generate an outline summary.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
