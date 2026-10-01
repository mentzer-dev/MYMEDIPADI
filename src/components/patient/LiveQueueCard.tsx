import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Volume2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const LiveQueueCard: React.FC<{ onBookClick: () => void }> = ({ onBookClick }) => {
  const {
    patient,
    appointments,
    queue,
    checkInForAppointment,
    setRole,
  } = useClinic();

  // Find today's appointment for the patient
  const todayApt = appointments.find(
    (a) => a.patientId === patient.id && (a.status === 'In Queue' || a.status === 'Upcoming' || a.status === 'In Consultation')
  );

  // Find matching queue item
  const queueItem = todayApt ? queue.find((q) => q.appointmentId === todayApt.id || q.patientId === patient.id) : null;

  // Calculate position in queue
  const waitingPatients = queue.filter(
    (q) => q.status === 'checked_in' || q.status === 'called'
  );
  const positionIndex = queueItem
    ? waitingPatients.findIndex((q) => q.id === queueItem.id)
    : -1;
  const positionNumber = positionIndex !== -1 ? positionIndex + 1 : 1;

  if (!todayApt) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Clinic Status</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">Open & Accepting Patients</span>
              <span aria-hidden="true">·</span>
              <span>Avg Wait: 12 mins</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              No Appointments Active Today
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Schedule your next visit in advance to secure priority queue placement and reduce waiting.
            </p>
          </div>
          <button
            onClick={onBookClick}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap"
          >
            <span>Book New Visit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const isCheckedIn = todayApt.isCheckedIn || (queueItem && queueItem.status !== 'scheduled');
  const isCalled = queueItem?.status === 'called';
  const isInConsultation = queueItem?.status === 'in_consultation' || todayApt.status === 'In Consultation';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Banner Alert when Called */}
      {isCalled && (
        <div className="bg-teal-600 text-white px-5 py-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-bold tracking-tight">
                Now Calling Ticket #{queueItem?.ticketNumber}: Please proceed to {todayApt.room}
              </p>
              <p className="text-xs text-teal-100">
                Dr. Adeyemi Thorne is ready to begin your consultation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRole('doctor')}
            className="text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            Switch to Doctor View
          </button>
        </div>
      )}

      {isInConsultation && (
        <div className="bg-sky-700 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-200" />
            <p className="text-xs font-medium">
              Consultation in progress with {todayApt.doctorName} in {todayApt.room}.
            </p>
          </div>
          <span className="text-xs font-mono text-sky-200">Active</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Appointment Metadata */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{todayApt.serviceName}</span>
              <span aria-hidden="true">·</span>
              <span>{todayApt.doctorName}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">{todayApt.room}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-600">Ref: {todayApt.bookingRef}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {todayApt.timeSlot} — Scheduled Visit
            </h2>

            <p className="text-xs text-slate-600 max-w-xl line-clamp-1">
              {todayApt.reasonForVisit}
            </p>
          </div>

          {/* Right Action / Ticket Card */}
          <div className="flex items-center gap-4 shrink-0">
            {!isCheckedIn ? (
              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={() => checkInForAppointment(todayApt.id)}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check In On Arrival</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  Tap when you enter clinic to receive queue ticket
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
                <div className="text-center px-2 border-r border-slate-200">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Ticket</div>
                  <div className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {todayApt.ticketNumber || queueItem?.ticketNumber || 'A-104'}
                  </div>
                </div>

                <div className="text-center px-2 border-r border-slate-200">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Queue Spot</div>
                  <div className="text-xl font-mono font-bold text-teal-700 tabular-nums">
                    {isInConsultation ? 'Active' : isCalled ? 'Calling' : `#${positionNumber}`}
                  </div>
                </div>

                <div className="text-center px-2">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Est. Wait</div>
                  <div className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {isInConsultation ? '0m' : `${queueItem?.estimatedWaitMinutes ?? 12}m`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4-Step Visual Queue Progress Flow */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 text-xs">
            {/* Step 1 */}
            <div className="flex flex-col gap-1.5">
              <div className={`h-1.5 rounded-full ${isCheckedIn ? 'bg-teal-600' : 'bg-slate-200'}`} />
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <span>1. Check-In</span>
                {isCheckedIn && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 inline" />}
              </div>
              <span className="text-[11px] text-slate-400">
                {isCheckedIn ? 'Confirmed via app' : 'Pending entry'}
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  isInConsultation || isCalled ? 'bg-teal-600' : isCheckedIn ? 'bg-teal-500' : 'bg-slate-200'
                }`}
              />
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <span>2. Triage & Wait</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {isCalled || isInConsultation ? 'Completed' : isCheckedIn ? 'In queue lounge' : 'Estimated 12m'}
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  isInConsultation ? 'bg-teal-600' : isCalled ? 'bg-teal-500 animate-pulse' : 'bg-slate-200'
                }`}
              />
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <span>3. Suite Paging</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {isInConsultation ? 'Seated in 3B' : isCalled ? 'Calling now!' : 'Assigned Suite 3B'}
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  isInConsultation ? 'bg-sky-600' : 'bg-slate-200'
                }`}
              />
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <span>4. Doctor Consult</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {isInConsultation ? 'In progress' : 'Upcoming review'}
              </span>
            </div>
          </div>
        </div>


        {/* Ambient Clinic Guidance Footnote */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>St. Jude Health Centre · 2nd Floor Outpatient</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Guest Wi-Fi: <strong className="font-mono text-slate-700">MediPadi_Guest</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">Testing both workflows?</span>
            <button
              onClick={() => setRole('doctor')}
              className="text-teal-700 hover:text-teal-800 font-medium underline underline-offset-2"
            >
              Simulate calling this patient in Doctor View →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
