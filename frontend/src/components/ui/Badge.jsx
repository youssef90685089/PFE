/**
 * Badge — status badge with semantic colors.
 */
const VARIANTS = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  UNDER_REVIEW: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  QUIZ_PENDING: 'bg-purple-50 text-purple-700 ring-purple-200/60',
  QUIZ_COMPLETED: 'bg-indigo-50 text-indigo-700 ring-indigo-200/60',
  AI_EVALUATING: 'bg-cyan-50 text-cyan-700 ring-cyan-200/60',
  MANAGER_REVIEW: 'bg-orange-50 text-orange-700 ring-orange-200/60',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200/60',
  SUBMITTED: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  DRAFT: 'bg-surface-100 text-surface-600 ring-surface-200/60',
  ONLINE: 'bg-primary-50 text-primary-700 ring-primary-200/60',
  PHYSICAL: 'bg-orange-50 text-orange-700 ring-orange-200/60',
  SUCCESS: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  WARNING: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  ERROR: 'bg-red-50 text-red-700 ring-red-200/60',
  INFO: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  default: 'bg-surface-100 text-surface-600 ring-surface-200/60',
};

export default function Badge({ status, text, className = '' }) {
  const variant = VARIANTS[status] || VARIANTS.default;
  const label = text || status?.replace(/_/g, ' ') || 'N/A';

  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${variant} ${className}`}>
      {label}
    </span>
  );
}
