import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { careerApi } from '../api/careerApi.js';
import {
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen
} from 'lucide-react';

export function InterviewPracticePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [practicedCount, setPracticedCount] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Expanded cards state
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [savingId, setSavingId] = useState(null);

  const categories = ['All', 'hr', 'technical', 'project', 'resume'];

  const loadPractice = async () => {
    try {
      const res = await careerApi.getInterviewPractice();
      if (res.success) {
        setQuestions(res.questions || []);
        setTotalQuestions(res.totalQuestions || 0);
        setPracticedCount(res.practicedCount || 0);
        setProgressPercentage(res.progressPercentage || 0);

        // Prepopulate student answers
        const initialAnswers = {};
        (res.questions || []).forEach(q => {
          if (q.user_answer) initialAnswers[q.id] = q.user_answer;
        });
        setUserAnswers(initialAnswers);
      }
    } catch (err) {
      console.error('Failed to load interview practice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPractice();
  }, []);

  const toggleSampleAnswer = (qId) => {
    setExpandedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSaveResponse = async (q, isPracticed = true) => {
    setSavingId(q.id);
    try {
      const res = await careerApi.saveInterviewPractice({
        questionId: q.id,
        category: q.category,
        questionText: q.questionText,
        userAnswer: userAnswers[q.id] || '',
        isPracticed
      });

      if (res.success) {
        toast.success(isPracticed ? 'Marked as Practiced and response saved!' : 'Response saved.');
        loadPractice();
      }
    } catch (err) {
      toast.error('Failed to save interview response.');
    } finally {
      setSavingId(null);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (selectedCategory === 'All') return true;
    return q.category === selectedCategory;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mock Interview Rehearsal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Role-Based Interview Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Practice realistic HR, technical, system design, and resume-based questions. Formulate your answers using the STAR method and compare with model answers.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-slate-400">Rehearsal Progress</span>
          <div className="text-3xl font-black text-indigo-400">
            {practicedCount} / {totalQuestions}
          </div>
          <span className="text-[11px] font-semibold text-emerald-400">
            {progressPercentage}% Practiced
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat === 'All' ? 'All Questions' : `${cat} Questions`}
          </button>
        ))}
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isAnswerVisible = expandedAnswers[q.id];
            const answerValue = userAnswers[q.id] || '';

            return (
              <div
                key={q.id}
                className={`card-base p-5 border transition-all space-y-4 ${
                  q.is_practiced
                    ? 'bg-white border-emerald-300 shadow-soft'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {q.category}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        Target Track: {q.role}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {q.questionText}
                    </h3>
                  </div>

                  {q.is_practiced && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Practiced</span>
                    </span>
                  )}
                </div>

                {/* Evaluation Criteria Checklist */}
                {q.evaluationCriteria && (
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      Key Evaluation Factors Recruiter Looks For:
                    </span>
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-slate-600">
                      {q.evaluationCriteria.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Student Response Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Your Practiced Response / Talking Notes:</span>
                    {q.practiced_at && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        Last practiced: {new Date(q.practiced_at).toLocaleDateString()}
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={3}
                    value={answerValue}
                    onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                    placeholder="Draft your response using the STAR method (Situation, Task, Action, Result)..."
                    className="input-base text-xs py-2 leading-relaxed"
                  />
                </div>

                {/* Model Answer Toggle */}
                {isAnswerVisible && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1.5 animate-slide-up">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Model Answer / Structured Response:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed text-justify">
                      {q.modelAnswer}
                    </p>
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleSampleAnswer(q.id)}
                    className="text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1.5"
                  >
                    {isAnswerVisible ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Model Answer</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Reveal Model Answer</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={savingId === q.id}
                      onClick={() => handleSaveResponse(q, false)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Save Notes
                    </button>
                    <button
                      type="button"
                      disabled={savingId === q.id}
                      onClick={() => handleSaveResponse(q, true)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{q.is_practiced ? 'Update Practice' : 'Mark as Practiced'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transparency Disclaimer */}
      <div className="card-base p-4 border border-slate-200 bg-slate-50 text-slate-500 text-xs italic flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Interview practice responses are self-evaluated rehearsal notes designed to structure your thoughts before real interviews. No simulated AI scoring is fabricated as human evaluation.
        </p>
      </div>
    </div>
  );
}
