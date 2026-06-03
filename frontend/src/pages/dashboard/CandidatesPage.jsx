import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { candidatesApi, quizzesApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import QuizSelectionModal from '../../components/QuizSelectionModal';
import { Send, UserCheck, FileText } from 'lucide-react';

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(null);
  const [quizModal, setQuizModal] = useState(null); // candidate object when selecting quiz

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
      header: 'Files',
      accessor: (r) => r.internshipFiles?.length || 0,
      render: (r) => (
        <span className="text-xs text-surface-500">
          {r.internshipFiles?.length || 0} file{(r.internshipFiles?.length || 0) !== 1 ? 's' : ''}
        </span>
      ),
    },
    ...(canInvite ? [{
      header: 'Action',
      accessor: 'id',
      render: (r) => (
        !r.hasUserAccount ? (
          <button
            onClick={() => setQuizModal(r)}
            disabled={inviting === r.id}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
            title="Select quiz, approve & send invitation"
          >
            {inviting === r.id ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Approve & Send Quiz
          </button>
        ) : (
          <span className="text-xs text-surface-400 italic">Approved ✓</span>
        )
      ),
    }] : []),
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Candidates</h1>
          <p className="text-surface-500 mt-1">{candidates.length} registered candidates</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={candidates}
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
