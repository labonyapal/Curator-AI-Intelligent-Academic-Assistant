import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  FileSearch,
  BookOpen
} from 'lucide-react';

export default function Library({ onSummarizePaper, onSearchDoc }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Fallback mocks
      setDocuments([
        '1201_FOP_ALL(Faculty_Lectures).pdf',
        '1202_DLD Solutions & Lectures.pdf',
        '2101_DSA_ALL(Faculty_Lecture).pdf',
        '2103_EEE_ALL(Faculty_Lecture).pdf',
        '2201_DBMS Solution & Concepts.pdf',
        '2203_Datacom_ALL(Faculty_Lecture).pdf',
        '2204_CAO_ALL_(Faculty_Lecture).pdf'
      ]);
      setError('Backend offline. Displaying demo documents library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported.');
      setUploadSuccess(null);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadSuccess(res.data.message || `Successfully uploaded ${file.name}`);
      fetchDocuments(); // Refresh documents list
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.detail || 'Failed to upload document to backend.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Academic Library</h2>
          <p className="text-gray-400 text-sm mt-1">Manage, upload and browse your curriculum materials.</p>
        </div>
        <button 
          onClick={fetchDocuments}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-gray-800 text-xs font-semibold text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-all ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5' 
            : 'border-gray-850 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".pdf" 
          onChange={handleFileInput}
        />
        
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer flex flex-col items-center group"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20 transition-all group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40">
            {uploading ? (
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          
          <span className="text-lg font-bold text-white mb-1">
            {uploading ? 'Processing Document...' : 'Upload Academic PDF'}
          </span>
          <span className="text-sm text-gray-400 max-w-sm">
            Drag and drop your syllabus, notes, or textbooks here, or <span className="text-indigo-400 font-semibold underline">browse files</span>.
          </span>
        </label>

        {uploadSuccess && (
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-4 h-4" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs font-semibold px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Ingested Files List */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Ingested Documents ({documents.length})
        </h3>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-sm text-gray-400">Loading document list...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border border-gray-800/40 rounded-xl bg-slate-950/20">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <span className="text-gray-400 font-semibold block text-lg">No documents in your library</span>
            <span className="text-sm text-gray-500 block mt-1 max-w-md mx-auto">Upload curriculum guides, textbooks, or assignments above to start utilizing AI search & summaries.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((filename, index) => (
              <div 
                key={index} 
                className="flex flex-col justify-between p-4 rounded-xl border border-gray-800 bg-slate-900/30 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5.5 h-5.5 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate" title={filename}>
                      {filename}
                    </h4>
                    <span className="text-xs text-gray-500 block mt-0.5">PDF Document</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 border-t border-gray-800/60 pt-3">
                  <button 
                    onClick={() => onSummarizePaper(filename)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold text-gray-300"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Summarize
                  </button>
                  <button 
                    onClick={() => onSearchDoc(filename)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white transition-all text-xs font-semibold text-gray-300"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    Query
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
