import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { quizzesApi } from '../../api/axios';
import {
  Clock, CheckCircle, AlertCircle, ChevronRight,
  Trophy, BarChart3, XCircle, ArrowLeft, BookOpen
} from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// Memoized Timer Component to prevent full page re-renders every second
const QuizTimer = memo(({ initialTime, onTimeOut, formatTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [onTimeOut]);

  const timeWarning = timeLeft > 0 && timeLeft <= 120;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${timeWarning ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
      <Clock className="h-4 w-4" />
      {formatTime(timeLeft)}
    </div>
  );
});

// Memoized Question Component
const QuestionCard = memo(({ question, index, totalQuestions, currentAnswer, onSelect }) => {
  const options = [question?.optionA, question?.optionB, question?.optionC, question?.optionD].filter(Boolean);
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5 animate-fade-in">
      <div className="flex items-start gap-3 mb-6">
        <span className="h-7 w-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </span>
        <p className="text-slate-800 font-medium leading-relaxed">{question?.questionText}</p>
      </div>

      <div className="space-y-3">
        {options.map((opt, idx) => {
          const optKey = ['A', 'B', 'C', 'D'][idx];
          const selected = currentAnswer === optKey;
          return (
            <button
              key={optKey}
              onClick={() => onSelect(optKey)}
              className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                selected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-500'
              }`}>
                {optKey}
              </span>
              <span className="text-sm">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default function QuizInterface() {
  const { user } = useAuth();
  const [phase, setPhase] = useState('list');   // 'list' | 'quiz' | 'result'
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quiz-taking state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [qRes, rRes] = await Promise.all([
        quizzesApi.getMyQuiz(),
        quizzesApi.getMyResults(),
      ]);
      
      const myQuiz = qRes.data?.data;
      const availableQuizzes = myQuiz ? [myQuiz] : [];
      const userResults = rRes.data?.data || rRes.data || [];
      
      setQuizzes(availableQuizzes);
      setResults(userResults);
    } catch (err) {
      setError('Failed to load quizzes. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = useCallback(() => {
    // Submit whatever answers we have when time runs out
    document.getElementById('quiz-submit-btn')?.click();
  }, []);

  const handleSelectAnswer = useCallback((optKey) => {
    const qId = activeQuiz?.questions[currentQ]?.id;
    if (!qId) return;
    setAnswers(prev => ({ ...prev, [qId]: optKey }));
  }, [activeQuiz, currentQ]);

  const startQuiz = async (quiz) => {
    setLoading(true);
    setError('');
    try {
      const res = await quizzesApi.getForCandidate(quiz.id);
      const fullQuiz = res.data?.data || res.data;
      setActiveQuiz(fullQuiz);
      setAnswers({});
      setCurrentQ(0);
      setPhase('quiz');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await quizzesApi.submit({
        quizId: activeQuiz.id,
        answers: answers,
      });
      setQuizResult(res.data?.data || res.data);
      setPhase('result');
      fetchData(); // refresh results list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const alreadyAttempted = (quizId) =>
    results.some(r => r.quizId === quizId);

  // ── RESULT SCREEN ─────────────────────────────────────────────────────────
  if (phase === 'result' && quizResult) {
    const pct = quizResult.percentage?.toFixed(1) ?? 0;
    const passed = quizResult.passed;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
          <div className={`h-20 w-20 mx-auto rounded-full flex items-center justify-center mb-5 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {passed
              ? <Trophy className="h-10 w-10 text-green-500" />
              : <XCircle className="h-10 w-10 text-red-500" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {passed ? 'Congratulations!' : 'Better Luck Next Time'}
          </h2>
          <p className="text-slate-500 mb-6">{quizResult.quizTitle}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">{pct}%</p>
              <p className="text-xs text-slate-400 mt-1">Score</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">{quizResult.score}</p>
              <p className="text-xs text-slate-400 mt-1">Points</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">{quizResult.passingScore}%</p>
              <p className="text-xs text-slate-400 mt-1">Required</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${passed ? 'bg-green-500' : 'bg-red-400'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>

          <div className={`rounded-xl p-3 mb-6 text-sm font-semibold ${passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {passed ? '✓ You passed! Your result has been submitted.' : '✗ You did not reach the passing score.'}
          </div>

          <button
            onClick={() => { setPhase('list'); setQuizResult(null); setActiveQuiz(null); }}
            className="w-full border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────────────────────
  if (phase === 'quiz' && activeQuiz) {
    const questions = activeQuiz.questions || [];
    const q = questions[currentQ];
    const options = [q?.optionA, q?.optionB, q?.optionC, q?.optionD].filter(Boolean);
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Top bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Question</p>
              <p className="text-sm font-bold text-slate-800">{currentQ + 1} / {questions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider">{activeQuiz.title}</p>
              <p className="text-sm font-semibold text-slate-700">{answeredCount} answered</p>
            </div>
            <QuizTimer 
              initialTime={(activeQuiz.durationMins || 30) * 60} 
              onTimeOut={handleAutoSubmit} 
              formatTime={formatTime} 
            />
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-5">
            <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* Question card */}
          <QuestionCard 
            question={q} 
            index={currentQ} 
            totalQuestions={questions.length} 
            currentAnswer={answers[q?.id]} 
            onSelect={handleSelectAnswer} 
          />

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all"
            >
              ← Previous
            </button>

            {/* Question dots */}
            <div className="flex gap-1 flex-wrap justify-center flex-1">
              {questions.map((ques, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`h-6 w-6 rounded-md text-xs font-bold transition-all ${
                    i === currentQ ? 'bg-blue-600 text-white scale-110'
                    : answers[ques.id] ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(q => q + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                id="quiz-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-sm font-semibold text-white transition-all"
              >
                {submitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><CheckCircle className="h-4 w-4" /> Submit</>}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── QUIZ LIST SCREEN ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            My Assessments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, {user?.fullName} · Complete your assigned technical quizzes below
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />{error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600" />
          </div>
        ) : (
          <>
            {/* Available Quizzes */}
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Available Quizzes</h2>
            {quizzes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 mb-6">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No quizzes available right now. Check back later.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {quizzes.map(quiz => {
                  const attempted = alreadyAttempted(quiz.id);
                  return (
                    <div key={quiz.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${attempted ? 'bg-green-50' : 'bg-blue-50'}`}>
                          {attempted
                            ? <CheckCircle className="h-6 w-6 text-green-500" />
                            : <BookOpen className="h-6 w-6 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {quiz.questionCount} questions · {quiz.durationMins} min · Pass: {quiz.passingScore}%
                          </p>
                        </div>
                      </div>
                      {attempted ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => startQuiz(quiz)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                        >
                          Start <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Past Results */}
            {results.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">My Results</h2>
                <div className="space-y-3">
                  {results.map(r => (
                    <div key={r.attemptId} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${r.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                          {r.passed ? <Trophy className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{r.quizTitle}</p>
                          <p className="text-xs text-slate-400">{r.score}/{r.totalMarks} points</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${r.passed ? 'text-green-600' : 'text-red-500'}`}>
                          {r.percentage?.toFixed(1)}%
                        </p>
                        <p className={`text-xs font-semibold ${r.passed ? 'text-green-500' : 'text-red-400'}`}>
                          {r.passed ? 'PASSED' : 'FAILED'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}