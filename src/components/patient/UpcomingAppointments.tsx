import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Timer,
  Sparkles,
} from 'lucide-react';
import { Appointment } from '../../types/clinic';

export const UpcomingAppointments: React.FC<{
  onBookClick: () => void;
  highlightedAptId?: string | null;
}> = ({ onBookClick, highlightedAptId }) => {
  const { appointments, checkInForAppointment, cancelAppointment } = useClinic();
  const [filter, setFilter] = useState<'upcoming' | 'completed'>('upcoming');

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'upcoming') {
      return apt.status === 'Upcoming' || apt.status === 'In Queue' || apt.status === 'In Consultation';
    }
    return apt.status === 'Completed' || apt.status === 'Cancelled';
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Appointments & Visits
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage upcoming visits, mobile check-in, and past consultation history
          </p>
        </div>

        {/* Interactive Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active & Upcoming ({appointments.filter(a => a.status === 'Upcoming' || a.status === 'In Queue' || a.status === 'In Consultation').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past History ({appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled').length})
          </button>
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="mt-5 space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No {filter} appointments found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filter === 'upcoming'
                ? 'You do not have any scheduled appointments. Book a visit to reduce waiting.'
                : 'No past appointment history in this view.'}
            </p>
            {filter === 'upcoming' && (
              <button
                onClick={onBookClick}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Schedule Appointment
              </button>
            )}
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isToday = apt.date === new Date().toISOString().split('T')[0] || apt.id === 'APT-1001';
            const isNewlyBooked = highlightedAptId === apt.id;

            return (
              <div
                key={apt.id}
                id={`appointment-${apt.id}`}
                className={`p-4 rounded-xl border transition-all bg-white ${
                  isNewlyBooked
                    ? 'border-teal-500 ring-2 ring-teal-400/40 bg-teal-50/20 shadow-sm'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-800">{apt.serviceName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-600">{apt.bookingRef}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">{apt.room}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          apt.status === 'Completed'
                            ? 'text-slate-600'
                            : apt.status === 'Cancelled'
                            ? 'text-rose-600'
                            : apt.status === 'In Queue'
                            ? 'text-teal-700'
                            : 'text-sky-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                      {isNewlyBooked && (
                        <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                          Just Scheduled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-900">
                        {apt.doctorName}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        ({apt.doctorSpecialty})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {apt.timeSlot} ({apt.durationMinutes} min)
                      </span>
                      {apt.ticketNumber && (
                        <span className="font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          Ticket #{apt.ticketNumber}
                        </span>
                      )}
                    </div>

                    {apt.reasonForVisit && (
                      <p className="text-xs text-slate-500 pt-1 italic line-clamp-1">
                        "{apt.reasonForVisit}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {apt.status === 'Upcoming' && isToday && !apt.isCheckedIn && (
                      <button
                        onClick={() => checkInForAppointment(apt.id)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Check In Now</span>
                      </button>
                    )}

                    {apt.status === 'Upcoming' && (
                      <button
                        onClick={() => cancelAppointment(apt.id)}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    {apt.status === 'Completed' && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visit Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
