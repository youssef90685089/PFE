import { useEffect, useState } from 'react';
import { auditLogsApi } from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { History, User, Shield } from 'lucide-react';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogsApi.getAll()
      .then(r => setLogs(r.data?.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Activity Log</h1>
        <p className="text-surface-500 mt-1">Track all actions performed across the system</p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-surface-500">No activity recorded yet.</div>
        ) : (
          <div className="divide-y divide-surface-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-surface-50 transition-colors">
                <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-surface-900">{log.user}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-surface-600 font-medium">
                      {log.action}
                    </span>
                    <span className="text-xs text-surface-400">{log.entityType}</span>
                  </div>
                  <p className="text-sm text-surface-500 mt-0.5">{log.details}</p>
                  <p className="text-xs text-surface-400 mt-1">{log.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
