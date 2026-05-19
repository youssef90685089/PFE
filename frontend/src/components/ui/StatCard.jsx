/**
 * StatCard — dashboard metric card with gradient icon background and animated counter.
 */
export default function StatCard({ label, value, icon: Icon, color = 'primary', trend }) {
  const colors = {
    primary: 'from-primary-500 to-primary-700 shadow-primary-500/25',
    success: 'from-success-500 to-success-600 shadow-success-500/25',
    warning: 'from-warning-500 to-warning-600 shadow-warning-500/25',
    error: 'from-error-500 to-error-600 shadow-error-500/25',
    info: 'from-info-500 to-info-600 shadow-info-500/25',
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-surface-900 tracking-tight">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend > 0 ? 'text-success-600' : 'text-error-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color]} shadow-lg text-white`}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
      {/* Decorative gradient overlay */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary-50 to-transparent opacity-50 transition-transform duration-500 group-hover:scale-150" />
    </div>
  );
}
