import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { Send, Sparkles, FileText, Bot, User as UserIcon } from 'lucide-react';

export default function PdfReaderChat({ selectedDoc, onSelectDoc }) {
  const [docs, setDocs] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [question, setQuestion] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    API.get('/documents').then((res) => {
      setDocs(res.data);
      if (!selectedDoc && res.data.length > 0) onSelectDoc(res.data[0]);
    });
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, loading]);

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedDoc) return;

    const userMsg = question;
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await API.post('/ai/chat', { documentId: selectedDoc._id, question: userMsg });
      setChatLog((prev) => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to get answer.';
      setChatLog((prev) => [...prev, { sender: 'ai', text: `⚠️ Error: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      const res = await API.post('/ai/summary', { documentId: selectedDoc._id });
      setSummary(res.data.summary);
    } catch {
      setSummary('Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8.5rem)]">
      {/* Left: Document Text / Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col h-full overflow-hidden shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <select 
            value={selectedDoc?._id || ''} 
            onChange={(e) => onSelectDoc(docs.find(d => d._id === e.target.value))}
            className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none max-w-[240px] truncate"
          >
            {docs.map(d => <option key={d._id} value={d._id}>{d.fileName}</option>)}
          </select>
          <button 
            onClick={handleSummarize} 
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
          >
            <Sparkles size={14} /> {loading ? 'Summarizing...' : 'Quick Summary'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 p-4 bg-slate-50 rounded-xl text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
          {summary ? (
            <div className="mb-4 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <h4 className="font-bold text-indigo-950 mb-2 text-sm flex items-center gap-1.5">
                <Sparkles size={16} className="text-indigo-600" /> AI Executive Summary:
              </h4>
              <p className="text-slate-800">{summary}</p>
            </div>
          ) : null}

          <h5 className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] mb-2">Document Extracted Text</h5>
          {selectedDoc?.extractedText ? selectedDoc.extractedText : 'No text parsed.'}
        </div>
      </div>

      {/* Right: AI Chat (Fixed Input At Bottom) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col h-full overflow-hidden shadow-sm">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-indigo-600" /> Chat with {selectedDoc?.fileName || 'Document'}
          </h3>
          <span className="text-[11px] text-slate-400">Ask anything from the text</span>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {chatLog.length === 0 && (
            <div className="text-center py-20 text-slate-400 text-xs">
              <Bot size={36} className="mx-auto mb-2 text-slate-300" />
              Ask a question about this document below.
            </div>
          )}

          {chatLog.map((c, i) => (
            <div key={i} className={`flex items-start gap-2.5 ${c.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {c.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  AI
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                c.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}>
                {c.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="animate-spin text-indigo-600">●</span> AI is generating answer...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pinned Input at Bottom */}
        <form onSubmit={handleSendQuestion} className="pt-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            type="submit" 
            disabled={!question.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}