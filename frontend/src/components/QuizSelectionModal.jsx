import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { X, FileText, Plus } from 'lucide-react';
import { quizzesApi } from '../api/axios';

export default function QuizSelectionModal({ candidate, onClose, onSelect, onSkip }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const r = await quizzesApi.getAll();
      setQuizzes(r.data?.data || []);
      if ((r.data?.data || []).length > 0) {
        setSelectedQuizId(r.data.data[0].id);
      }
    } catch (err) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedQuizId) {
      onSelect(selectedQuizId);
    } else {
      onSkip();
    }
  };

  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-surface-900">
            Approve & Send Quiz
          </h2>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-surface-600 mb-4">
          Approving <strong>{candidate.firstName} {candidate.lastName}</strong> ({candidate.email})
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600/30 border-t-blue-600" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500 text-sm mb-1">No quizzes found</p>
            <p className="text-surface-400 text-xs">A default quiz will be created automatically</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-surface-700">Select a quiz to assign:</p>
            {quizzes.map((q) => (
              <label
                key={q.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedQuizId === q.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                }`}
              >
                <input
                  type="radio"
                  name="quiz"
                  value={q.id}
                  checked={selectedQuizId === q.id}
                  onChange={() => setSelectedQuizId(q.id)}
                  className="h-4 w-4 text-blue-600 accent-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">{q.title}</p>
                  <div className="flex gap-3 mt-0.5">
                    {q.questionCount != null && (
                      <span className="text-xs text-surface-400">{q.questionCount} questions</span>
                    )}
                    {q.specialty && (
                      <span className="text-xs text-surface-400">{q.specialty}</span>
                    )}
                    {q.durationMins && (
                      <span className="text-xs text-surface-400">{q.durationMins} min</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-surface-100">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-all"
          >
            Cancel
          </button>
          {quizzes.length > 0 && (
            <button
              onClick={() => { setSelectedQuizId(null); onSkip(); }}
              className="flex-1 rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-all"
            >
              Create Default
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {selectedQuizId ? 'Assign & Send' : 'Create Default & Send'}
          </button>
        </div>
      </div>
    </div>
  );
}