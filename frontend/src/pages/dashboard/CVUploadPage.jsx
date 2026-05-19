import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { candidatesApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function CVUploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file) => {
    setError('');
    setSuccess('');
    
    // Validate file
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF or DOCX files only.');
      return;
    }

    if (file.size > maxSize) {
      setError('File size exceeds 10MB. Please upload a smaller file.');
      return;
    }

    setUploading(true);
    try {
      const response = await candidatesApi.uploadCV(file);
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });
      setSuccess('CV uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload CV. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setSuccess('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Submit Your CV</h1>
        <p className="text-surface-500 mt-1">Upload your curriculum vitae in PDF or DOCX format</p>
      </div>

      {/* Instructions */}
      <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
        <h3 className="font-semibold text-primary-900 mb-2">Upload Guidelines</h3>
        <ul className="text-sm text-primary-700 space-y-1.5">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-1 shrink-0 text-primary-600" />
            <span>File format: <strong>PDF</strong> or <strong>DOCX</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-1 shrink-0 text-primary-600" />
            <span>Maximum file size: <strong>10 MB</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-1 shrink-0 text-primary-600" />
            <span>Ensure your contact information is up to date</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-1 shrink-0 text-primary-600" />
            <span>Include your education, experience, and skills</span>
          </li>
        </ul>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : uploadedFile
              ? 'border-success-300 bg-success-50'
              : 'border-surface-200 hover:border-primary-300'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            <p className="text-surface-600">Uploading your CV...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-success-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-success-600" />
            </div>
            <div>
              <p className="font-semibold text-surface-900">{uploadedFile.name}</p>
              <p className="text-sm text-surface-500">{uploadedFile.size}</p>
            </div>
            <button
              onClick={handleRemove}
              className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
            >
              <X className="h-4 w-4" /> Remove
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-4 cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-surface-50 flex items-center justify-center">
              <Upload className="h-8 w-8 text-surface-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-surface-900">
                Drag and drop your CV here
              </p>
              <p className="text-sm text-surface-500">or click to browse files</p>
            </div>
            <input
              type="file"
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="cv-upload"
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-50 rounded-lg text-sm text-surface-600">
              <FileText className="h-4 w-4" />
              <span>Supported: PDF, DOC, DOCX</span>
            </div>
          </label>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-success-50 px-4 py-3 text-success-700">
          <Check className="h-5 w-5 shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-surface-50 rounded-2xl p-5">
        <h3 className="font-semibold text-surface-900 mb-3">Tips for a Great CV</h3>
        <div className="grid gap-3 text-sm text-surface-600">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <p>Keep it concise - 1-2 pages maximum</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <p>Highlight relevant skills and experience</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <p>Include your education background</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <p>Add contact information clearly</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {uploadedFile && (
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard/my-applications')}
            className="flex-1 rounded-xl border border-surface-200 px-6 py-3 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors"
          >
            Go to My Applications
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 rounded-xl bg-primary-500 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}