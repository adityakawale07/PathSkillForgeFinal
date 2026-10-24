import React, { useState, useEffect } from 'react';
import API from '../api';
import { CheckCircle2, XCircle, History, Award, Clock, ArrowLeft, Eye } from 'lucide-react';

export default function QuizSession({ selectedDoc }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Quiz Options
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Past Quizzes & Review Modal
  const [showHistory, setShowHistory] = useState(false);
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [reviewingQuiz, setReviewingQuiz] = useState(null); // specific past quiz to inspect

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    API.get('/quizzes/stats').then((res) => setPastQuizzes(res.data));
  };

  const startQuiz = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      const res = await API.post('/ai/generate-quiz', { 
        documentId: selectedDoc._id, 
        count, 
        difficulty 
      });
      setQuiz(res.data);
      setAnswers({});
      setCompleted(false);
      setShowHistory(false);
      setReviewingQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    const res = await API.post(`/quizzes/${quiz._id}/submit`, { answers, timeSpentSec: 120 });
    setQuiz(res.data);
    setCompleted(true);
    loadHistory();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Self-Assessment Quizzes</h3>
          <p className="text-xs text-slate-400">{selectedDoc?.fileName || 'Select a document'}</p>
        </div>

        <button
          onClick={() => { setShowHistory(!showHistory); setReviewingQuiz(null); }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
        >
          <History size={15} /> {showHistory ? 'Take a Quiz' : 'Past Quizzes'}
        </button>
      </div>

      {/* VIEW 1: Inspect Specific Past Quiz Questions */}
      {showHistory && reviewingQuiz ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              onClick={() => setReviewingQuiz(null)}
              className="text-xs text-slate-600 hover:text-indigo-600 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft size={14} /> Back to All History
            </button>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              reviewingQuiz.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Score: {reviewingQuiz.score} / {reviewingQuiz.totalQuestions} ({reviewingQuiz.percentage}%)
            </span>
          </div>

          <h4 className="font-bold text-slate-800 text-sm">{reviewingQuiz.quizTitle}</h4>

          <div className="space-y-4">
            {reviewingQuiz.questions?.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800">{idx + 1}. {q.questionText}</p>
                  {q.isCorrect ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 size={14} /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                      <XCircle size={14} /> Incorrect
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pl-2">
                  {q.options?.map((opt, optIdx) => {
                    const isUserChoice = q.selectedAnswerIndex === optIdx;
                    const isCorrectAnswer = q.correctAnswerIndex === optIdx;

                    let badgeStyle = 'border-slate-200 bg-white text-slate-600';
                    if (isCorrectAnswer) badgeStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold';
                    else if (isUserChoice && !q.isCorrect) badgeStyle = 'border-red-300 bg-red-50 text-red-900 font-semibold';

                    return (
                      <div key={optIdx} className={`p-2 rounded-lg text-xs border ${badgeStyle} flex justify-between`}>
                        <span>{opt}</span>
                        {isCorrectAnswer && <span className="text-[10px] text-emerald-700 font-bold">Correct Answer</span>}
                        {isUserChoice && !isCorrectAnswer && <span className="text-[10px] text-red-700 font-bold">Your Choice</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                    <strong className="text-slate-800">Explanation: </strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : showHistory ? (
        /* VIEW 2: Past Quizzes List */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Award size={18} className="text-indigo-600" /> Completed Quizzes History
          </h4>

          {pastQuizzes.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No quizzes submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pastQuizzes.map((q) => (
                <div key={q._id} className="py-3.5 flex justify-between items-center hover:bg-slate-50 px-2 rounded-xl transition">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{q.quizTitle}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {new Date(q.createdAt).toLocaleDateString()} · {q.totalQuestions} questions
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      q.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {q.score} / {q.totalQuestions} ({q.percentage}%)
                    </span>
                    <button
                      onClick={() => setReviewingQuiz(q)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold p-1.5 rounded-lg hover:bg-indigo-50 transition"
                      title="Review Questions"
                    >
                      <Eye size={15} /> Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !quiz ? (
        /* VIEW 3: Create & Config Quiz */
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-5">
          <div className="text-center">
            <h3 className="font-bold text-slate-800 text-base">Generate New Quiz</h3>
            <p className="text-slate-400 text-xs mt-1">Configure questions and test your understanding.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Number of Questions</label>
              <select 
                value={count} 
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-indigo-500"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={loading || !selectedDoc}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl disabled:opacity-50 transition"
          >
            {loading ? 'Generating Quiz with Groq...' : 'Start Assessment'}
          </button>
        </div>
      ) : (
        /* VIEW 4: Active Quiz Session */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-100">
            <span className="text-xs font-bold text-indigo-900">{quiz.quizTitle}</span>
            {completed && (
              <span className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-lg">
                Score: {quiz.score} / {quiz.totalQuestions} ({quiz.percentage}%)
              </span>
            )}
          </div>

          {quiz.questions.map((q, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-slate-800">{idx + 1}. {q.questionText}</p>
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = answers[idx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      disabled={completed}
                      onClick={() => setAnswers({ ...answers, [idx]: optIdx })}
                      className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {completed && (
                <div className={`p-3 rounded-xl text-xs ${q.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  <p className="font-bold">{q.isCorrect ? '✓ Correct' : '✕ Incorrect'}</p>
                  <p className="mt-1">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {!completed ? (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < quiz.questions.length}
              className="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition"
            >
              Submit Quiz
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setQuiz(null)}
                className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
              >
                Create Another Quiz
              </button>
              <button
                onClick={() => { setShowHistory(true); setReviewingQuiz(quiz); }}
                className="py-3 px-5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Review This Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}