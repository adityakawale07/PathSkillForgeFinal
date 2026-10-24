import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';
import { 
  Star, 
  Shuffle, 
  Volume2, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  HelpCircle, 
  Layers, 
  LayoutGrid, 
  Maximize2, 
  Download, 
  Plus, 
  Lightbulb 
} from 'lucide-react';

export default function Flashcards({ selectedDoc }) {
  const [allCards, setAllCards] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [currIdx, setCurrIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState('study'); // 'study' or 'grid'
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generator Options Drawer
  const [showConfig, setShowConfig] = useState(false);
  const [cardCount, setCardCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');

  const loadCards = () => {
    API.get('/flashcards').then((res) => {
      const filtered = selectedDoc ? res.data.filter((c) => c.documentId === selectedDoc._id) : res.data;
      setAllCards(filtered);
      setCurrIdx(0);
      setIsFlipped(false);
      setShowHint(false);
    });
  };

  useEffect(() => {
    loadCards();
  }, [selectedDoc]);

  const activeCards = showOnlyFavorites ? allCards.filter(c => c.isFavorite) : allCards;
  const current = activeCards[currIdx];

  // Keyboard navigation: Space = Flip, Arrows = Nav
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'study' || activeCards.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight' && currIdx < activeCards.length - 1) {
        setCurrIdx((i) => i + 1);
        setIsFlipped(false);
        setShowHint(false);
      } else if (e.code === 'ArrowLeft' && currIdx > 0) {
        setCurrIdx((i) => i - 1);
        setIsFlipped(false);
        setShowHint(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, activeCards.length, currIdx]);

  // Generate with AI
  const generateCards = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      await API.post('/ai/generate-flashcards', {
        documentId: selectedDoc._id,
        count: cardCount,
        difficulty
      });
      setShowConfig(false);
      loadCards();
    } finally {
      setLoading(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (id, e) => {
    e?.stopPropagation();
    await API.patch(`/flashcards/${id}/toggle-favorite`);
    setAllCards(allCards.map((c) => (c._id === id ? { ...c, isFavorite: !c.isFavorite } : c)));
  };

  // Toggle Mastered
  const toggleMastered = (id, e) => {
    e?.stopPropagation();
    setAllCards(allCards.map((c) => (c._id === id ? { ...c, isMastered: !c.isMastered } : c)));
  };

  // Shuffle Deck
  const shuffleDeck = () => {
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    setAllCards(shuffled);
    setCurrIdx(0);
    setIsFlipped(false);
  };

  // Text-to-Speech
  const speakText = (text, e) => {
    e?.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Export Deck as Text file
  const exportDeck = () => {
    if (activeCards.length === 0) return;
    const content = activeCards.map((c, i) => `Card ${i + 1}:\nQ: ${c.frontPrompt}\nA: ${c.backSolution}\n\n`).join('');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc?.fileName || 'flashcards'}-deck.txt`;
    a.click();
  };

  const masteredCount = activeCards.filter((c) => c.isMastered).length;
  const masteryPercentage = activeCards.length ? Math.round((masteredCount / activeCards.length) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">
              {selectedDoc?.fileName || 'Flashcard Deck'}
            </h3>
            <p className="text-[11px] text-slate-400">{activeCards.length} Cards available</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorites Filter */}
          <button
            onClick={() => { setShowOnlyFavorites(!showOnlyFavorites); setCurrIdx(0); }}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition ${
              showOnlyFavorites 
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold shadow-sm' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star size={13} fill={showOnlyFavorites ? 'currentColor' : 'none'} />
            Starred ({allCards.filter((c) => c.isFavorite).length})
          </button>

          {/* Toggle View Mode: Single vs Grid */}
          <button
            onClick={() => setViewMode(viewMode === 'study' ? 'grid' : 'study')}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
            title={viewMode === 'study' ? 'Switch to Grid View' : 'Switch to Study Mode'}
          >
            {viewMode === 'study' ? <LayoutGrid size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <Plus size={14} /> Generate
          </button>
        </div>
      </div>

      {/* Generator Configuration Drawer */}
      {showConfig && (
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-md space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Flashcard Generator</h4>
            <span className="text-[11px] text-indigo-600 font-semibold">Groq Powered</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Deck Size</label>
              <select 
                value={cardCount} 
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value={5}>5 Flashcards</option>
                <option value={10}>10 Flashcards</option>
                <option value={15}>15 Flashcards</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Easy">Easy (Definitions & Keywords)</option>
                <option value="Medium">Medium (Conceptual Understanding)</option>
                <option value="Hard">Hard (Analysis & Application)</option>
              </select>
            </div>
          </div>
          <button
            onClick={generateCards}
            disabled={loading || !selectedDoc}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-md shadow-indigo-600/20"
          >
            {loading ? 'Synthesizing with Groq...' : 'Generate Deck'}
          </button>
        </div>
      )}

      {/* Mastery Progress Bar */}
      {activeCards.length > 0 && (
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-500">Deck Mastery Progress</span>
              <span className="text-indigo-600 font-bold">{masteredCount}/{activeCards.length} Mastered ({masteryPercentage}%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={shuffleDeck}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition"
              title="Shuffle Deck"
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={exportDeck}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition"
              title="Download Deck as Text"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: STUDY MODE (3D Interactive Flip) */}
      {viewMode === 'study' ? (
        activeCards.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Layers size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No cards in this deck.</p>
            <p className="text-xs text-slate-400 mt-1">Click "+ Generate" to create cards from your document.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center select-none">
            {/* Card Index & Badge Header */}
            <div className="w-full flex justify-between items-center mb-2.5 px-2">
              <span className="text-xs font-semibold text-slate-400">
                Card {currIdx + 1} of {activeCards.length}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                current.difficultyLevel === 'Hard' ? 'bg-red-50 text-red-700 border border-red-200' :
                current.difficultyLevel === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {current.difficultyLevel || 'Medium'}
              </span>
            </div>

            {/* 3D Flip Container */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-80 cursor-pointer perspective-1000 group"
            >
              <div 
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT OF CARD */}
                <div className="absolute inset-0 w-full h-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm flex flex-col justify-between backface-hidden group-hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-indigo-600 text-[10px] bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Question / Concept
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => speakText(current.frontPrompt, e)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition"
                        title="Read aloud"
                      >
                        <Volume2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => toggleFavorite(current._id, e)}
                        className={`p-1.5 rounded-lg transition ${current.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                        title="Favorite"
                      >
                        <Star size={17} fill={current.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-slate-800 text-center px-4 leading-relaxed">
                    {current.frontPrompt}
                  </p>

                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
                      className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold hover:underline"
                    >
                      <Lightbulb size={13} /> {showHint ? 'Hide Hint' : 'Need a hint?'}
                    </button>
                    <span className="flex items-center gap-1 text-[11px]">
                      <RotateCw size={12} /> Click or Space to flip
                    </span>
                  </div>

                  {showHint && (
                    <div className="absolute bottom-14 left-8 right-8 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 animate-in fade-in">
                      💡 Focus on the core definition from the text.
                    </div>
                  )}
                </div>

                {/* BACK OF CARD */}
                <div className="absolute inset-0 w-full h-full bg-indigo-900 border border-indigo-800 rounded-3xl p-8 shadow-md flex flex-col justify-between backface-hidden rotate-y-180 text-white">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-indigo-300 text-[10px] bg-indigo-800/80 px-2.5 py-1 rounded-lg">
                      Explanation / Solution
                    </span>
                    <button 
                      onClick={(e) => speakText(current.backSolution, e)}
                      className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-800/50 transition"
                      title="Read aloud"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>

                  <p className="text-base font-normal text-indigo-50 text-center px-4 leading-relaxed">
                    {current.backSolution}
                  </p>

                  <div className="flex justify-center items-center text-xs text-indigo-300 border-t border-indigo-800/60 pt-3">
                    <span className="text-[11px] flex items-center gap-1">
                      <RotateCw size={12} /> Click to flip back
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Controls */}
            <div className="w-full flex items-center justify-between mt-5">
              {/* Mastery toggle button */}
              <button
                onClick={(e) => toggleMastered(current._id, e)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border transition ${
                  current.isMastered 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle size={15} className={current.isMastered ? 'text-emerald-600' : 'text-slate-400'} />
                {current.isMastered ? 'Mastered' : 'Mark as Mastered'}
              </button>

              {/* Navigation arrows */}
              <div className="flex items-center gap-2">
                <button 
                  disabled={currIdx === 0} 
                  onClick={() => { setCurrIdx((i) => i - 1); setIsFlipped(false); setShowHint(false); }}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  disabled={currIdx === activeCards.length - 1} 
                  onClick={() => { setCurrIdx((i) => i + 1); setIsFlipped(false); setShowHint(false); }}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* VIEW MODE 2: FULL GRID BROWSER */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeCards.map((c, i) => (
            <div key={c._id || i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400">#{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => toggleFavorite(c._id, e)}
                      className={`p-1 rounded-md ${c.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                    >
                      <Star size={14} fill={c.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={(e) => toggleMastered(c._id, e)}
                      className={`p-1 rounded-md ${c.isMastered ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-600'}`}
                    >
                      <CheckCircle size={14} />
                    </button>
                  </div>
                </div>
                <h5 className="font-bold text-slate-800 text-xs mb-1.5">{c.frontPrompt}</h5>
                <p className="text-slate-600 text-xs leading-relaxed">{c.backSolution}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span>{c.difficultyLevel || 'Medium'}</span>
                {c.isMastered && <span className="text-emerald-600 font-bold">✓ Mastered</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}