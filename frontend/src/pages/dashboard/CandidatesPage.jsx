import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { candidatesApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import QuizSelectionModal from '../../components/QuizSelectionModal';
import { Send, UserCheck, FileText, Filter, Calendar } from 'lucide-react';

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(null);
  const [quizModal, setQuizModal] = useState(null); // candidate object when selecting quiz
  const [yearFilter, setYearFilter] = useState(''); // '' = all years

  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.roles?.includes('MANAGER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');
  const canInvite = isManager || isAdmin;

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const r = await candidatesApi.getAll();
      setCandidates(r.data?.data || []);
    } catch (err) {
      toast.error('Failed to load candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Collect all unique years from internship files ──────────
  const availableYears = useMemo(() => {
    const years = new Set();
    candidates.forEach(c => {
      (c.internshipFiles || []).forEach(f => {
        if (f.year) years.add(f.year);
      });
    });
    return Array.from(years).sort((a, b) => b - a); // newest first
  }, [candidates]);

  // ── Filter candidates by selected year ────────────────────
  const filteredCandidates = useMemo(() => {
    if (!yearFilter) return candidates;
    return candidates.filter(c =>
      (c.internshipFiles || []).some(f => String(f.year) === String(yearFilter))
    );
  }, [candidates, yearFilter]);

  const handleApproveAndSendQuiz = async (candidateId, quizId) => {
    setInviting(candidateId);
    try {
      const res = await candidatesApi.approveAndSendQuiz(candidateId, { quizId });
      if (res.data?.success) {
        toast.success('✓ Account created & quiz email sent!');
        await loadCandidates();
      } else {
        toast.error(res.data?.message || 'Failed to approve candidate');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve candidate');
    } finally {
      setInviting(null);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (r) => `${r.firstName || ''} ${r.lastName || ''}`,
      render: (r) => <span className="font-medium text-surface-800">{r.firstName} {r.lastName}</span>,
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Phone',
      accessor: (r) => r.phone || '—',
    },
    {
      header: 'Account',
      accessor: 'hasUserAccount',
      render: (r) => r.hasUserAccount ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
          <UserCheck className="h-3 w-3" /> Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
          Pending
        </span>
      ),
    },
    {
      header: 'Quiz Result',
      accessor: (r) => r.quizPassed == null ? 'not taken' : r.quizPassed ? 'passed' : 'failed',
      render: (r) => {
        if (!r.hasUserAccount || r.quizPassed == null) {
          return <span className="text-xs text-surface-400 italic">—</span>;
        }
        if (r.quizPassed) {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              ✓ Passed {r.quizScore != null ? `(${r.quizScore}%)` : ''}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
            ✗ Failed {r.quizScore != null ? `(${r.quizScore}%)` : ''}
          </span>
        );
      },
    },
    {
      header: 'Files',
      accessor: (r) => r.internshipFiles?.length || 0,
      render: (r) => {
        const count = r.internshipFiles?.length || 0;
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${count > 0 ? 'text-emerald-700' : 'text-red-500'}`}>
            <FileText className="h-3 w-3" />
            {count} file{count !== 1 ? 's' : ''}
          </span>
        );
      },
    },
    {
      header: 'Year',
      accessor: (r) => {
        const years = (r.internshipFiles || []).map(f => f.year).filter(Boolean);
        return years.length > 0 ? Math.max(...years) : '—';
      },
      render: (r) => {
        const years = (r.internshipFiles || []).map(f => f.year).filter(Boolean);
        if (years.length === 0) return <span className="text-xs text-surface-400">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-600 bg-surface-100 rounded-full px-2 py-0.5">
            <Calendar className="h-3 w-3" />
            {Math.max(...years)}
          </span>
        );
      },
    },
    ...(canInvite ? [{
      header: 'Action',
      accessor: 'id',
      render: (r) => {
        const hasFiles = (r.internshipFiles?.length || 0) > 0;
        if (r.hasUserAccount) {
          return <span className="text-xs text-surface-400 italic">Approved ✓</span>;
        }
        return (
          <div className="relative group/btn inline-block">
            <button
              onClick={() => hasFiles && setQuizModal(r)}
              disabled={inviting === r.id || !hasFiles}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm whitespace-nowrap
                ${hasFiles
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
                  : 'bg-surface-200 text-surface-400 cursor-not-allowed opacity-70'
                }`}
              title={!hasFiles ? 'Cannot send quiz: candidate has no internship file' : 'Select quiz, approve & send invitation'}
            >
              {inviting === r.id ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Approve & Send Quiz
            </button>
            {/* Tooltip for no file */}
            {!hasFiles && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:flex items-center gap-1.5 bg-surface-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-10 pointer-events-none">
                <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                No internship file uploaded yet
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-900" />
              </div>
            )}
          </div>
        );
      },
    }] : []),
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Candidates</h1>
          <p className="text-surface-500 mt-1">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
            {yearFilter ? ` for year ${yearFilter}` : ` (${candidates.length} total)`}
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-surface-400" />
          <label className="text-sm font-medium text-surface-600" htmlFor="year-filter">
            Filter by year:
          </label>
          <select
            id="year-filter"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            <option value="">All years</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {yearFilter && (
            <button
              onClick={() => setYearFilter('')}
              className="text-xs text-primary-600 font-medium hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCandidates}
        searchPlaceholder="Search candidates..."
      />

      {quizModal && (
        <QuizSelectionModal
          candidate={quizModal}
          onClose={() => setQuizModal(null)}
          onSelect={(quizId) => {
            const cid = quizModal.id;
            setQuizModal(null);
            handleApproveAndSendQuiz(cid, quizId);
          }}
          onSkip={() => {
            const cid = quizModal.id;
            setQuizModal(null);
            handleApproveAndSendQuiz(cid, null);
          }}
        />
      )}
    </div>
  );
}
