import React, { useState } from 'react';
import ProfileSettings from './components/ProfileSettings';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  TrendingUp,
  User as UserIcon, 
  LogOut 
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import DocumentUpload from './components/DocumentUpload';
import PdfReaderChat from './components/PdfReaderChat';
import Flashcards from './components/Flashcards';
import QuizSession from './components/QuizSession';
import StudyProgress from './components/StudyProgress';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) {
    return <AuthModal onLoginSuccess={(u) => setUser(u)} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload PDF', icon: UploadCloud },
    { id: 'reader', label: 'My Documents', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
    { id: 'progress', label: 'Study Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile / Settings', icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              P
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-wide">PathSkillForge</h1>
              <p className="text-[11px] text-slate-400">AI Learning Assistant</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-semibold">
              {user.fullName?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium border border-emerald-100">
            Groq LLaMA-3.3 Active
          </span>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} setSelectedDoc={setSelectedDoc} />}
          {activeTab === 'upload' && <DocumentUpload onUploadSuccess={(doc) => { setSelectedDoc(doc); setActiveTab('reader'); }} />}
          {activeTab === 'reader' && <PdfReaderChat selectedDoc={selectedDoc} onSelectDoc={setSelectedDoc} />}
          {activeTab === 'flashcards' && <Flashcards selectedDoc={selectedDoc} />}
          {activeTab === 'quizzes' && <QuizSession selectedDoc={selectedDoc} />}
          {activeTab === 'progress' && <StudyProgress />}
          {activeTab === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
        </div>
      </main>
    </div>
  );
}