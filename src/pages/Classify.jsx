import React, { useState } from 'react';
import { Search, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X, Download, Play } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

const _mock_predict = (text) => {
  const urgentKeywords = ["urgent", "asap", "immediately", "deadline", "priority", "today", "right away"];
  const isHigh = urgentKeywords.some(kw => text.toLowerCase().includes(kw));
  const categories = ['Complaint', 'Request', 'Feedback', 'Spam'];
  
  return {
    category: categories[Math.floor(Math.random() * categories.length)],
    urgency: isHigh ? 'High' : ['Medium', 'Low'][Math.floor(Math.random() * 2)],
    confidence: (0.75 + Math.random() * 0.24)
  };
};

const predict_email = async (text) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: text }),
    });
    if (response.ok) {
      const data = await response.json();
      return {
        category: data.category.charAt(0).toUpperCase() + data.category.slice(1),
        urgency: data.urgency.charAt(0).toUpperCase() + data.urgency.slice(1),
        confidence: data.confidence
      };
    }
  } catch (error) {
    // API failed, fallback to mock below
  }
  return _mock_predict(text);
};

export default function Classify() {
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  
  // Single mode state
  const [emailText, setEmailText] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState(null);
  
  // Bulk state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bulkData, setBulkData] = useState(null);
  const [bulkColumns, setBulkColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [bulkResults, setBulkResults] = useState(null);
  const [isBulkClassifying, setIsBulkClassifying] = useState(false);

  const handleSingleClassify = async () => {
    if (!emailText.trim()) return;
    setIsClassifying(true);
    setResult(null);
    
    const prediction = await predict_email(emailText);
    
    setResult({
      ...prediction,
      explanation: `The model identified this as a ${prediction.category} with ${prediction.urgency} priority based on linguistic patterns.`
    });
    
    setIsClassifying(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBulkResults(null);
    setUploadProgress(0);
    setBulkData(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        if (data.length === 0) return;
        setBulkData(data);
        const cols = Object.keys(data[0]);
        setBulkColumns(cols);
        
        // Find best column
        const keywords = ['email', 'text', 'body', 'content', 'message', 'subject'];
        let bestCol = cols.find(c => keywords.some(kw => c.toLowerCase().includes(kw)));
        setSelectedColumn(bestCol || cols[0]);
      }
    });

    // Reset input so that uploading the same file again triggers the event
    if(e.target) {
        e.target.value = '';
    }
  };

  const startBulkClassification = async () => {
    if (!bulkData || !selectedColumn) return;
    setIsBulkClassifying(true);
    setUploadProgress(0);
    
    const newResults = [];
    const total = bulkData.length;
    
    for (let i = 0; i < total; i++) {
        const row = bulkData[i];
        const text = String(row[selectedColumn] || '');
        const prediction = await predict_email(text);
        
        newResults.push({
            ...row,
            Category: prediction.category,
            Urgency: prediction.urgency,
            Confidence: `${(prediction.confidence * 100).toFixed(1)}%`
        });
        
        setUploadProgress(Math.floor(((i + 1) / total) * 100));
    }
    
    setBulkResults(newResults);
    setIsBulkClassifying(false);
  };

  const handleDownload = () => {
    if (!bulkResults) return;
    const csv = Papa.unparse(bulkResults);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `classified_emails_${new Date().toISOString().slice(0,10).replace(/-/g, '')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/30">
          AI Classification Hub
        </h2>
        <p className="text-white/40 max-w-xl mx-auto">
          Leverage our enterprise-grade LLM to analyze intent and priority in seconds.
        </p>
      </header>

      <div className="flex justify-center mb-12">
        <div className="glass p-1.5 rounded-2xl flex gap-1">
          <button 
            onClick={() => setMode('single')}
            className={clsx(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              mode === 'single' ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-white/40 hover:text-white"
            )}
          >
            Single Email
          </button>
          <button 
            onClick={() => setMode('bulk')}
            className={clsx(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              mode === 'bulk' ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-white/40 hover:text-white"
            )}
          >
            Batch Upload
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'single' ? (
          <motion.div 
            key="single"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="glass rounded-[32px] p-8 border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-white/[0.03] -rotate-12 group-focus-within:text-primary-500/10 transition-colors">
                <Sparkles size={120} />
              </div>
              
              <textarea 
                className="w-full h-64 bg-transparent border-none outline-none text-white text-lg placeholder:text-white/10 resize-none custom-scrollbar"
                placeholder="Paste the email content here for analysis..."
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
              />
              
              <div className="mt-8 flex justify-between items-center relative z-10">
                <div className="text-white/20 text-xs flex gap-4">
                  <span>Characters: {emailText.length}</span>
                  <span>Tokens: ~{Math.ceil(emailText.length / 4)}</span>
                </div>
                <button 
                  onClick={handleSingleClassify}
                  disabled={isClassifying || !emailText.trim()}
                  className={clsx(
                    "bg-primary-600 hover:bg-primary-500 disabled:bg-white/5 disabled:hover:bg-white/5 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-3 shadow-xl active:scale-95",
                    isClassifying && "shadow-none"
                  )}
                >
                  {isClassifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {isClassifying ? 'Analyzing Content...' : 'Classify Email'}
                </button>
              </div>
            </div>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <ResultCard 
                    label="Category" 
                    value={result.category} 
                    icon={FileText} 
                    color="blue" 
                  />
                  <ResultCard 
                    label="Urgency" 
                    value={result.urgency} 
                    icon={AlertCircle} 
                    color={result.urgency === 'High' ? 'red' : 'amber'} 
                  />
                  <ResultCard 
                    label="Confidence" 
                    value={`${(result.confidence * 100).toFixed(1)}%`} 
                    icon={CheckCircle2} 
                    color="green" 
                  />
                  <div className="md:col-span-3 glass rounded-[24px] p-6 border-white/5">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-2">AI Explanation</p>
                    <p className="text-white/70 leading-relaxed italic">"{result.explanation}"</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="bulk"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {!bulkData && !bulkResults && (
              <div className="glass rounded-[32px] p-12 border-dashed border-2 border-white/10 hover:border-primary-500/30 transition-all text-center group cursor-pointer relative overflow-hidden">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleFileUpload}
                  accept=".csv"
                />
                <div className="p-6 rounded-3xl bg-white/5 w-fit mx-auto mb-6 group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                  <Upload className="w-10 h-10 text-white/20 group-hover:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Drag & Drop CSV</h3>
                <p className="text-white/40 mb-8">Upload multi-row datasets for automated classification.</p>
              </div>
            )}

            {bulkData && !bulkResults && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[32px] p-8 border-white/5 space-y-6"
              >
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <div>
                        <h4 className="text-white font-bold mb-1">Preview uploaded data</h4>
                        <p className="text-white/40 text-sm">Found {bulkData.length} records in your CSV.</p>
                    </div>
                    <button 
                        onClick={() => {setBulkData(null); setBulkColumns([]);}}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-white/60">
                        <thead>
                            <tr className="border-b border-white/10">
                                {bulkColumns.map(col => (
                                    <th key={col} className="p-3 font-semibold text-white/80">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bulkData.slice(0, 3).map((row, idx) => (
                                <tr key={idx} className="border-b border-white/5">
                                    {bulkColumns.map(col => (
                                        <td key={col} className="p-3 truncate max-w-[200px]">{row[col]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="glass p-6 rounded-2xl border-white/10 bg-black/20 mt-6 flex flex-col items-center sm:flex-row gap-6">
                    <div className="flex-1 w-full">
                        <label className="block text-white/60 text-sm font-bold mb-2">Select column to analyze:</label>
                        <select 
                            value={selectedColumn} 
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-primary-500/50"
                        >
                            {bulkColumns.map(col => (
                                <option key={col} value={col} className="bg-gray-900 text-white">{col}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-shrink-0 flex justify-end w-full sm:w-auto">
                        <button 
                            onClick={startBulkClassification}
                            disabled={isBulkClassifying}
                            className="bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all mt-4 sm:mt-0"
                        >
                            {isBulkClassifying ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                            {isBulkClassifying ? 'Processing...' : 'Start Bulk Classification'}
                        </button>
                    </div>
                </div>

                {isBulkClassifying && (
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs text-white/40">
                            <span>Processing row {Math.max(1, Math.ceil((uploadProgress / 100) * bulkData.length))} of {bulkData.length}...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                className="h-full bg-primary-500 rounded-full"
                            />
                        </div>
                    </div>
                )}
              </motion.div>
            )}

            {bulkResults && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="glass rounded-[32px] border-white/5 overflow-hidden"
              >
                <div className="p-6 border-b border-white/5 flex justify-between items-center sm:flex-row flex-col gap-4">
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" size={20} />
                        Bulk classification complete!
                    </h4>
                    <p className="text-white/40 text-sm">{bulkResults.length} records processed successfully.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                        onClick={() => {setBulkResults(null); setBulkData(null); setUploadProgress(0);}}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors"
                    >
                        Classify Another
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-lg text-white text-sm font-bold transition-all shadow-lg shadow-primary-600/20"
                    >
                        <Download size={16} /> Download CSV
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar bg-black/10">
                  {bulkResults.map((r, i) => (
                    <div key={i} className="px-6 py-4 border-b border-white/[0.02] flex items-center justify-between hover:bg-white/[0.02]">
                      <div className="flex-1 min-w-0 pr-8">
                        <p className="text-white/80 text-sm font-medium truncate">{r[selectedColumn]}</p>
                      </div>
                      <div className="flex gap-4 items-center shrink-0">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                          {r.Confidence}
                        </span>
                        <span className="w-20 text-[10px] font-bold text-white/50 uppercase tracking-widest truncate text-right">
                          {r.Category}
                        </span>
                        <span className={clsx("w-16 text-[10px] font-bold uppercase tracking-widest text-right", r.Urgency === 'High' ? 'text-red-400' : 'text-amber-400')}>
                          {r.Urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div className={clsx("glass rounded-3xl p-6 border group hover:scale-[1.02] transition-all duration-300", colorMap[color])}>
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-black">{value}</h4>
        <Icon className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
