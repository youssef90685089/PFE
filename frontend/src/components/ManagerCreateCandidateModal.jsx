import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Plus } from 'lucide-react';
import { candidatesApi } from '../api/axios';

export default function ManagerCreateCandidateModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Candidate Info, Step 2: Internship Files (optional)
  
  const [candidateForm, setCandidateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cin: '',
  });

  const [internshipForm, setInternshipForm] = useState({
    year: new Date().getFullYear(),
    university: '',
    degree: '',
    skillsTags: '',
  });
  const [fileDoc, setFileDoc] = useState(null);

  const handleCandidateChange = (e) => {
    const { name, value } = e.target;
    setCandidateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleInternshipChange = (e) => {
    const { name, value } = e.target;
    setInternshipForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAndSendQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Step 1: Create candidate profile
      const createRes = await candidatesApi.create(candidateForm);
      if (!createRes.data?.success) {
        toast.error(createRes.data?.message || 'Failed to create candidate');
        setLoading(false);
        return;
      }

      const candidateId = createRes.data.data.id;
      toast.success('✓ Candidate profile created');

      // Step 2: Add internship file if provided (with optional document)
      if (internshipForm.university || internshipForm.degree || internshipForm.skillsTags) {
        try {
          if (fileDoc) {
            const formData = new FormData();
            formData.append('year', Number(internshipForm.year));
            formData.append('university', internshipForm.university);
            formData.append('degree', internshipForm.degree);
            formData.append('skillsTags', internshipForm.skillsTags);
            formData.append('file', fileDoc);
            await candidatesApi.addInternshipFileWithDocument(candidateId, formData);
          } else {
            await candidatesApi.addInternshipFile(candidateId, internshipForm);
          }
          toast.success('✓ Internship file added');
        } catch (err) {
          console.warn('Could not add internship file:', err);
        }
      }

      // Step 3: Approve and send quiz
      const approveRes = await candidatesApi.approveAndSendQuiz(candidateId, {
        quizTitle: 'SIPMS Internship Assessment',
      });

      if (approveRes.data?.success) {
        toast.success('✓ User account created & quiz email sent!');
        onSuccess?.();
        onClose();
        resetForm();
      } else {
        toast.error('Failed to send quiz');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error processing candidate';
      toast.error(errorMsg);
      console.error('Create candidate error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCandidateForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      cin: '',
    });
    setInternshipForm({
      year: new Date().getFullYear(),
      university: '',
      degree: '',
      skillsTags: '',
    });
    setFileDoc(null);
    setStep(1);
  };

  const handleSkip = () => {
    // Skip internship file and go directly to creation
    handleCreateAndSendQuiz({ preventDefault: () => {} });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-surface-900">
            New Candidate & Quiz
          </h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-surface-400 hover:text-surface-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 flex gap-2">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-surface-200'}`}></div>
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-surface-200'}`}></div>
        </div>

        <form onSubmit={handleCreateAndSendQuiz} className="space-y-4">
          {/* STEP 1: Candidate Profile */}
          {step === 1 && (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-surface-900 mb-3">
                  Step 1: Candidate Profile
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={candidateForm.firstName}
                  onChange={handleCandidateChange}
                  required
                  className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={candidateForm.lastName}
                  onChange={handleCandidateChange}
                  required
                  className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={candidateForm.email}
                onChange={handleCandidateChange}
                required
                className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone (optional)"
                  value={candidateForm.phone}
                  onChange={handleCandidateChange}
                  className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="cin"
                  placeholder="CIN (optional)"
                  value={candidateForm.cin}
                  onChange={handleCandidateChange}
                  className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="flex-1 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
                >
                  Next →
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Internship File (Optional) */}
          {step === 2 && (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-surface-900 mb-3">
                  Step 2: Internship File (Optional)
                </h3>
                <p className="text-xs text-surface-500">
                  Add details about their internship year and education
                </p>
              </div>

              <input
                type="number"
                name="year"
                placeholder="Graduation Year"
                value={internshipForm.year}
                onChange={handleInternshipChange}
                className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="text"
                name="university"
                placeholder="University (optional)"
                value={internshipForm.university}
                onChange={handleInternshipChange}
                className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="text"
                name="degree"
                placeholder="Degree/Program (optional)"
                value={internshipForm.degree}
                onChange={handleInternshipChange}
                className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <textarea
                name="skillsTags"
                placeholder="Skills (comma separated, optional)"
                value={internshipForm.skillsTags}
                onChange={handleInternshipChange}
                rows="3"
                className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />

              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">Document (PDF, DOC — optional)</label>
                <input type="file" accept=".pdf,.doc,.docx"
                  onChange={e => setFileDoc(e.target.files[0] || null)}
                  className="w-full text-sm text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
                {fileDoc && <p className="text-xs text-green-600 mt-1">{fileDoc.name}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                📧 After creation, an account will be created and a quiz invitation email will be sent automatically.
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-all disabled:opacity-50"
                >
                  Skip Files
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create & Send Quiz
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
