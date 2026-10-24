import React, { useEffect, useState } from 'react';
import API from '../api';
import { BookOpen, Layers, HelpCircle, Clock, ChevronRight } from 'lucide-react';

export default function Dashboard({ setActiveTab, setSelectedDoc }) {
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState({ flashcards: 0, quizzes: 0 });

  useEffect(() => {
    API.get('/documents').then(res => setDocs(res.data)).catch(() => {});
    API.get('/flashcards').then(res => setStats(s => ({ ...s, flashcards: res.data.length }))).catch(() => {});
    API.get('/quizzes/stats').then(res => setStats(s => ({ ...s, quizzes: res.data.length }))).catch(() => {});
  }, []);

  const cards = [
    { title: 'Documents', count: docs.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Flashcards', count: stats.flashcards, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Quizzes Completed', count: stats.quizzes, icon: HelpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Study Time', count: '6.5 hrs', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome Back 👋</h2>
        <p className="text-slate-500 text-sm">Your learning journey, organized in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{c.count}</p>
              </div>
              <div className={`p-3 rounded-xl ${c.bg} ${c.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Documents</h3>
        <div className="divide-y divide-slate-100">
          {docs.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No documents uploaded yet. Go to Upload PDF to start!</p>
          ) : (
            docs.map((doc) => (
              <div key={doc._id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{doc.fileName}</p>
                    <p className="text-xs text-slate-400">{(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedDoc(doc); setActiveTab('reader'); }}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Study with AI <ChevronRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}