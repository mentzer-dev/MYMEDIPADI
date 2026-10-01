import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Bell, CheckCircle2, AlertCircle, Volume2, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useClinic();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {notifications.map((notif) => {
        let Icon = Bell;
        let borderColor = 'border-slate-200';
        let iconBg = 'bg-slate-100 text-slate-700';

        if (notif.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'border-emerald-200';
          iconBg = 'bg-emerald-50 text-emerald-700';
        } else if (notif.type === 'call') {
          Icon = Volume2;
          borderColor = 'border-teal-300';
          iconBg = 'bg-teal-100 text-teal-800';
        } else if (notif.type === 'alert') {
          Icon = AlertCircle;
          borderColor = 'border-amber-300';
          iconBg = 'bg-amber-100 text-amber-800';
        }

        return (
          <div
            key={notif.id}
            role="status"
            className={`pointer-events-auto bg-white rounded-lg shadow-lg border ${borderColor} p-3.5 flex items-start gap-3 transition-all duration-200 ease-out`}
          >
            <div className={`p-2 rounded-md shrink-0 ${iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-slate-900 truncate">{notif.title}</h4>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-slate-400 hover:text-slate-600 p-1 shrink-0 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
