import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { quizzesApi } from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { Clock, CheckCircle2, AlertTriangle, Timer, ArrowRight, ArrowLeft, Plus, Trash2, X, Save } from 'lucide-react';

export default function QuizPage() {
  const { isCandidate, isManager, isAdmin } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // ── Admin Modal State ────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    specialty: '',
    durationMins: 30,
    passingScore: 60,
    questions: [
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 5 }
    ]
  });

  // ── Timer State ──────────────────────────────────────
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef(null);
  const answersRef = useRef({});

  // Keep answersRef in sync
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const loadData = async () => {
    setLoading(true);
    const isManagerOrAdmin = isManager?.() || isAdmin?.();
    const quizPromise = isManagerOrAdmin ? quizzesApi.getAll() : quizzesApi.getActive();
    const resultsPromise = isManagerOrAdmin ? Promise.resolve({ data: { data: [] } }) : quizzesApi.getMyResults();

    try {
      const [q, r] = await Promise.all([quizPromise, resultsPromise]);
      setQuizzes(q.data?.data || []);
      setResults(r.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Admin Quiz Creation ──────────────────────────────
  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 5 }]
    });
  };

  const removeQuestion = (idx) => {
    if (newQuiz.questions.length <= 1) return;
    const qs = [...newQuiz.questions];
    qs.splice(idx, 1);
    setNewQuiz({ ...newQuiz, questions: qs });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await quizzesApi.create(newQuiz);
      setShowCreateModal(false);
      setNewQuiz({
        title: '', description: '', specialty: '', durationMins: 30, passingScore: 60,
        questions: [{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 5 }]
      });
      loadData();
      toast.success('Quiz created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Timer Logic ──────────────────────────────────────
  useEffect(() => {
    if (activeQuiz && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeQuiz]);

  const handleAutoSubmit = useCallback(async () => {
    if (!activeQuiz || submitting) return;
    setSubmitting(true);
    try {
      const res = await quizzesApi.submit({ quizId: activeQuiz.id, answers: answersRef.current });
      setResult(res.data?.data);
      setActiveQuiz(null);
      setTimeRemaining(0);
      const r = await quizzesApi.getMyResults();
      setResults(r.data?.data || []);
      toast.success('Quiz auto-submitted (time expired)');
    } catch (e) { toast.error(e.response?.data?.message || 'Auto-submission failed'); }
    finally { setSubmitting(false); }
  }, [activeQuiz, submitting]);

  const startQuiz = async (quizId) => {
    try {
      const res = await quizzesApi.getForCandidate(quizId);
      const quiz = res.data?.data;
      setActiveQuiz(quiz);
      setAnswers({});
      setResult(null);
      setCurrentQuestion(0);
      setTimeRemaining(quiz.durationMins * 60);
      toast.success('Quiz started. Good luck!');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to load quiz'); }
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const res = await quizzesApi.submit({ quizId: activeQuiz.id, answers });
      setResult(res.data?.data);
      setActiveQuiz(null);
      setTimeRemaining(0);
      const r = await quizzesApi.getMyResults();
      setResults(r.data?.data || []);
      toast.success('Quiz submitted successfully');
    } catch (e) { toast.error(e.response?.data?.message || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerColor = timeRemaining <= 60 ? 'text-red-500' : timeRemaining <= 300 ? 'text-amber-500' : 'text-surface-700';
  const timerBg = timeRemaining <= 60 ? 'bg-red-50 border-red-200' : timeRemaining <= 300 ? 'bg-amber-50 border-amber-200' : 'bg-surface-50 border-surface-200';

  if (loading) return <LoadingSpinner />;

  // ── Active Quiz View ────────────────────────────────
  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const answered = Object.keys(answers).length;
    const q = questions[currentQuestion];
    const progress = (answered / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header with Timer */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{activeQuiz.title}</h1>
            <p className="text-surface-500 mt-1">{questions.length} questions · Pass: {activeQuiz.passingScore}%</p>
          </div>
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 ${timerBg}`}>
            <Timer className={`h-5 w-5 ${timerColor} ${timeRemaining <= 60 ? 'animate-pulse-subtle' : ''}`} />
            <span className={`text-xl font-mono font-bold ${timerColor}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-surface-500">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{answered}/{questions.length} answered</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-200 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {questions.map((question, idx) => (
            <button key={question.id} onClick={() => setCurrentQuestion(idx)}
              className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                idx === currentQuestion
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 scale-110'
                  : answers[question.id]
                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-200'
                    : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
              }`}>
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Current Question Card */}
        {q && (
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm animate-fade-in" key={q.id}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-primary-600">Question {currentQuestion + 1}</p>
              <span className="text-xs text-surface-400">{q.marks} marks</span>
            </div>
            <p className="text-surface-800 font-medium text-lg mb-6">{q.questionText}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['A', 'B', 'C', 'D'].map(opt => (
                <button key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-sm text-left transition-all ${
                    answers[q.id] === opt
                      ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                      : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                  }`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    answers[q.id] === opt ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600'
                  }`}>{opt}</span>
                  <span className="flex-1">{q[`option${opt}`]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation + Submit */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 disabled:opacity-30 transition-all">
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>
          {currentQuestion < questions.length - 1 ? (
            <button onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-all shadow-sm">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting || answered === 0}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all">
              {submitting ? 'Submitting...' : `Submit Quiz (${answered}/${questions.length})`}
            </button>
          )}
        </div>

        {/* Time Warning Banner */}
        {timeRemaining <= 120 && timeRemaining > 0 && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center text-sm text-red-700 animate-pulse-subtle">
            ⚠️ Less than {Math.ceil(timeRemaining / 60)} minute{timeRemaining > 60 ? 's' : ''} remaining! Your quiz will auto-submit when time expires.
          </div>
        )}
      </div>
    );
  }

  // ── Result View ────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-md mx-auto text-center animate-fade-in">
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${result.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {result.passed ? <CheckCircle2 className="h-10 w-10 text-emerald-600" /> : <AlertTriangle className="h-10 w-10 text-red-600" />}
        </div>
        <h2 className="text-2xl font-bold text-surface-900">{result.passed ? 'Congratulations!' : 'Better Luck Next Time'}</h2>
        <p className="mt-2 text-surface-500">You scored {result.score}/{result.totalMarks} ({result.percentage.toFixed(1)}%)</p>
        <div className="mt-6 rounded-2xl border border-surface-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-surface-400">Score</p><p className="text-xl font-bold text-surface-900">{result.score}/{result.totalMarks}</p></div>
            <div><p className="text-surface-400">Percentage</p><p className="text-xl font-bold text-surface-900">{result.percentage.toFixed(1)}%</p></div>
            <div><p className="text-surface-400">Passing</p><p className="text-xl font-bold text-surface-900">{result.passingScore}%</p></div>
            <div><p className="text-surface-400">Result</p><Badge status={result.passed ? 'ACCEPTED' : 'REJECTED'} /></div>
          </div>
        </div>
        <button onClick={() => setResult(null)} className="mt-4 text-sm text-primary-600 font-medium hover:underline">
          ← Back to Quizzes
        </button>
      </div>
    );
  }

  // ── Quiz List View ────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Technical Quizzes</h1>
          <p className="text-surface-500 mt-1">
            {isCandidate?.() ? 'Complete technical assessments for your applications' : 'Manage technical assessment quizzes'}
          </p>
        </div>
        {(isAdmin?.() || isManager?.()) && (
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all">
            <Plus className="h-4 w-4" /> Create Quiz
          </button>
        )}
      </div>

      {/* Available Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map(q => {
          const attempted = results.some(r => r.quizId === q.id);
          return (
            <div key={q.id} className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-surface-800">{q.title}</h3>
                {q.specialty && <Badge status="NEUTRAL" text={q.specialty} />}
              </div>
              <p className="text-sm text-surface-500 mt-1 line-clamp-2">{q.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-surface-400">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {q.durationMins} min</span>
                <span>{q.questionCount} questions</span>
                <span>Pass: {q.passingScore}%</span>
              </div>
              {isCandidate?.() && (
                <button onClick={() => startQuiz(q.id)} disabled={attempted}
                  className={`mt-4 w-full rounded-xl py-2.5 text-sm font-medium transition-all ${
                    attempted ? 'bg-surface-100 text-surface-400 cursor-not-allowed' : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                  }`}>
                  {attempted ? '✓ Completed' : 'Start Quiz'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Past Results (Candidates) */}
      {results.length > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="font-bold text-surface-800 mb-4">Your Results</h3>
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.attemptId} className="flex items-center justify-between rounded-xl border border-surface-100 p-3">
                <div>
                  <p className="font-medium text-surface-800 text-sm">{r.quizTitle}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{r.score}/{r.totalMarks} ({r.percentage.toFixed(1)}%)</p>
                </div>
                <Badge status={r.passed ? 'ACCEPTED' : 'REJECTED'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create Quiz Modal ────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-up">
            <div className="p-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
              <h2 className="text-xl font-bold text-surface-900">Create New Assessment</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-surface-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-surface-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateQuiz} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700">Quiz Title</label>
                  <input required type="text" value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})}
                    placeholder="e.g. React & Frontend Fundamentals"
                    className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700">Target Specialty</label>
                  <select required value={newQuiz.specialty} onChange={e => setNewQuiz({...newQuiz, specialty: e.target.value})}
                    className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all">
                    <option value="">Select Specialty...</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Security">Security</option>
                    <option value="Power BI">Power BI</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-surface-700">Description</label>
                  <textarea required value={newQuiz.description} onChange={e => setNewQuiz({...newQuiz, description: e.target.value})}
                    placeholder="Briefly describe what this assessment covers..." rows={2}
                    className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700">Duration (Minutes)</label>
                  <input required type="number" value={newQuiz.durationMins} onChange={e => setNewQuiz({...newQuiz, durationMins: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700">Passing Score (%)</label>
                  <input required type="number" value={newQuiz.passingScore} onChange={e => setNewQuiz({...newQuiz, passingScore: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" />
                </div>
              </div>

              {/* Question Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-surface-800 text-lg">Questions ({newQuiz.questions.length})</h3>
                  <button type="button" onClick={addQuestion}
                    className="flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors">
                    <Plus className="h-4 w-4" /> Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {newQuiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-6 rounded-2xl border border-surface-100 bg-surface-50/30 space-y-4 relative group">
                      <button type="button" onClick={() => removeQuestion(qIdx)}
                        className="absolute top-4 right-4 p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-400 uppercase tracking-wider">Question {qIdx + 1}</label>
                        <input required type="text" value={q.questionText} placeholder="Enter question..."
                          onChange={e => {
                            const qs = [...newQuiz.questions];
                            qs[qIdx].questionText = e.target.value;
                            setNewQuiz({...newQuiz, questions: qs});
                          }}
                          className="w-full bg-white rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <div key={opt} className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${q.correctOption === opt ? 'bg-primary-500 text-white' : 'bg-surface-200 text-surface-600'}`}>
                              {opt}
                            </span>
                            <input required type="text" value={q[`option${opt}`]} placeholder={`Option ${opt}`}
                              onChange={e => {
                                const qs = [...newQuiz.questions];
                                qs[qIdx][`option${opt}`] = e.target.value;
                                setNewQuiz({...newQuiz, questions: qs});
                              }}
                              className="flex-1 bg-white rounded-xl border border-surface-200 px-4 py-2 text-sm focus:border-primary-500 transition-all" />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4">
                          <label className="text-sm font-medium text-surface-600">Correct Answer:</label>
                          <div className="flex gap-2">
                            {['A', 'B', 'C', 'D'].map(opt => (
                              <button key={opt} type="button" onClick={() => {
                                const qs = [...newQuiz.questions];
                                qs[qIdx].correctOption = opt;
                                setNewQuiz({...newQuiz, questions: qs});
                              }}
                              className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${q.correctOption === opt ? 'bg-primary-500 text-white shadow-md' : 'bg-white border border-surface-200 text-surface-500 hover:border-surface-300'}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-surface-600">Marks:</label>
                          <input type="number" value={q.marks} onChange={e => {
                            const qs = [...newQuiz.questions];
                            qs[qIdx].marks = parseInt(e.target.value);
                            setNewQuiz({...newQuiz, questions: qs});
                          }} className="w-16 bg-white rounded-lg border border-surface-200 px-3 py-1 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-surface-100 bg-surface-50/50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 text-sm font-semibold text-surface-600 hover:bg-surface-100 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={handleCreateQuiz} disabled={submitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 disabled:opacity-50 transition-all">
                {submitting ? 'Creating...' : <><Save className="h-4 w-4" /> Save Quiz</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

