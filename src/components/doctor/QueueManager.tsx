import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Clock,
  UserCheck,
  Volume2,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  FileText,
  Search,
  Activity,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { QueueItem, QueueStatus } from '../../types/clinic';
import { PatientConsultationModal } from './PatientConsultationModal';
import { WalkInModal } from './WalkInModal';
import { ClinicalRecordQuickView } from './ClinicalRecordQuickView';

export const QueueManager: React.FC = () => {
  const {
    queue,
    metrics,
    auditLogs,
    callNextPatient,
    startConsultation,
    updateQueueStatus,
    setRole,
    setIsAuditDrawerOpen,
  } = useClinic();

  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'in_consultation' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEncounter, setSelectedEncounter] = useState<QueueItem | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  // Quick View state
  const [quickViewItem, setQuickViewItem] = useState<QueueItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Filtered queue items
  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'waiting') {
      return item.status === 'checked_in' || item.status === 'called' || item.status === 'scheduled';
    }
    if (statusFilter === 'in_consultation') {
      return item.status === 'in_consultation';
    }
    if (statusFilter === 'completed') {
      return item.status === 'completed';
    }
    return true;
  });

  const nextWaiting = queue.find((q) => q.status === 'checked_in');

  const openConsultationEncounter = (item: QueueItem) => {
    setSelectedEncounter(item);
    setIsConsultationOpen(true);
  };

  const handleOpenQuickView = (item: QueueItem) => {
    setQuickViewItem(item);
    setIsQuickViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Clinical Operational Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Patients in Waiting Lounge</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
            {metrics.patientsWaiting}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            <span>2 in triage · 1 called</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Average Patient Wait</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-teal-700 tabular-nums mt-1">
            {metrics.averageWaitMinutes} <span className="text-xs font-sans font-normal text-slate-500">mins</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 inline" />
            <span>68% below regional baseline (38m)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Consultations Completed</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
            {metrics.patientsCompletedToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Target: 14 today · On track
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Audit Trail Invariants</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
            {auditLogs.length} <span className="text-xs font-sans font-normal text-emerald-700">Sealed</span>
          </div>
          <button
            onClick={() => setIsAuditDrawerOpen(true)}
            className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold mt-1 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>View Security Audit Trail →</span>
          </button>
        </div>
      </div>

      {/* Main Clinic Queue Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
        {/* Table Control Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live Queue & Encounter Management
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time patient flow, triage pings, and consultation status updates
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Call Next Action */}
            <button
              onClick={() => callNextPatient()}
              disabled={!nextWaiting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              title={nextWaiting ? `Call Ticket #${nextWaiting.ticketNumber}` : 'No patients waiting'}
            >
              <Volume2 className="w-4 h-4" />
              <span>Call Next Patient {nextWaiting ? `(${nextWaiting.ticketNumber})` : ''}</span>
            </button>

            {/* Walk-in Action */}
            <button
              onClick={() => setIsWalkInOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Walk-In</span>
            </button>

            {/* Live Security Audit Trail Trigger */}
            <button
              onClick={() => setIsAuditDrawerOpen(true)}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-teal-200 cursor-pointer"
              title="Open System Audit Trail for compliance verification"
            >
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Filter bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 pb-4">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Enqueued ({queue.length})
            </button>
            <button
              onClick={() => setStatusFilter('waiting')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'waiting'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting / Called ({queue.filter(q => q.status === 'checked_in' || q.status === 'called' || q.status === 'scheduled').length})
            </button>
            <button
              onClick={() => setStatusFilter('in_consultation')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'in_consultation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Consultation ({queue.filter(q => q.status === 'in_consultation').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({queue.filter(q => q.status === 'completed').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, ticket, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* High-Density Clinical Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Ticket</th>
                <th className="py-3 px-3">Patient Name</th>
                <th className="py-3 px-3">Service / Complaint</th>
                <th className="py-3 px-3">Check-In / Slot</th>
                <th className="py-3 px-3 text-right">Est. Wait</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-3 text-right">Workflow & Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 bg-teal-50 border border-teal-200 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">
                          {statusFilter === 'waiting'
                            ? 'All Caught Up! Waiting Lounge is Clear'
                            : statusFilter === 'in_consultation'
                            ? 'No Active Consultations at this Moment'
                            : statusFilter === 'completed'
                            ? 'No Encounters Marked Completed in this View'
                            : 'No Matching Patients in the Queue'}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {statusFilter === 'waiting'
                            ? 'All checked-in patients have been called into examination suites. Great job keeping wait times low!'
                            : 'Adjust your status filter above or register an incoming walk-in patient directly.'}
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        {statusFilter !== 'all' && (
                          <button
                            onClick={() => setStatusFilter('all')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors cursor-pointer"
                          >
                            View All Patients ({queue.length})
                          </button>
                        )}
                        <button
                          onClick={() => setIsWalkInOpen(true)}
                          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Register Walk-In</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => {

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Ticket */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                            {item.ticketNumber}
                          </span>
                          {item.priority === 'urgent' && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              Urgent
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Patient Name */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{item.patientName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.patientAge}y · {item.patientGender} · {item.patientId}
                        </div>
                      </td>

                      {/* Service / Complaint */}
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{item.serviceName}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={item.chiefComplaint}>
                          {item.chiefComplaint}
                        </div>
                      </td>

                      {/* Check-In / Slot */}
                      <td className="py-3.5 px-3 font-mono text-slate-600 tabular-nums">
                        <div>{item.scheduledTime}</div>
                        {item.checkInTime && (
                          <div className="text-[11px] text-slate-400">
                            Arr: {item.checkInTime}
                          </div>
                        )}
                      </td>

                      {/* Est. Wait */}
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                        {item.status === 'in_consultation' ? (
                          <span className="text-teal-700 font-semibold">Active</span>
                        ) : item.status === 'completed' ? (
                          <span className="text-slate-400">0m</span>
                        ) : (
                          <span className="font-bold text-slate-800">{item.estimatedWaitMinutes}m</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {item.status === 'checked_in' && (
                          <span className="text-amber-800 bg-amber-50 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-medium">
                            Waiting in Lounge
                          </span>
                        )}
                        {item.status === 'called' && (
                          <span className="text-teal-800 bg-teal-50 border border-teal-300 text-[11px] px-2 py-0.5 rounded font-medium animate-pulse">
                            Paging to {item.roomNumber}
                          </span>
                        )}
                        {item.status === 'in_consultation' && (
                          <span className="text-sky-800 bg-sky-50 border border-sky-300 text-[11px] px-2 py-0.5 rounded font-medium">
                            In Consultation
                          </span>
                        )}
                        {item.status === 'completed' && (
                          <span className="text-slate-600 bg-slate-100 text-[11px] px-2 py-0.5 rounded font-medium">
                            Encounter Completed
                          </span>
                        )}
                        {item.status === 'scheduled' && (
                          <span className="text-slate-500 text-[11px] font-medium">
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick-View Chart Button */}
                          <button
                            onClick={() => handleOpenQuickView(item)}
                            className="px-2.5 py-1 text-slate-600 hover:text-teal-800 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Quick-View Patient Record & Vitals"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>Quick-View</span>
                          </button>

                          {item.status === 'checked_in' && (
                            <button
                              onClick={() => callNextPatient(item.id)}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Page patient to enter room"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Page</span>
                            </button>
                          )}

                          {item.status === 'called' && (
                            <button
                              onClick={() => startConsultation(item.id)}
                              className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Stethoscope className="w-3 h-3" />
                              <span>Start Consult</span>
                            </button>
                          )}

                          {(item.status === 'in_consultation' || item.status === 'called') && (
                            <button
                              onClick={() => openConsultationEncounter(item)}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Examine & Note</span>
                            </button>
                          )}

                          {item.status === 'completed' && (
                            <button
                              onClick={() => openConsultationEncounter(item)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Review Note</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Ambient Footer Hint */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>St. Jude Health Centre · Dr. Adeyemi Thorne (Suite 3B)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HIPAA Compliant System Audit Active</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Verify live updates in patient screen:</span>
            <button
              onClick={() => setRole('patient')}
              className="text-teal-700 hover:text-teal-800 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Switch to Patient View →
            </button>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      <PatientConsultationModal
        isOpen={isConsultationOpen}
        queueItem={selectedEncounter}
        onClose={() => setIsConsultationOpen(false)}
      />

      {/* Walk-in Modal */}
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
      />

      {/* Clinical Record Quick-View Drawer */}
      <ClinicalRecordQuickView
        isOpen={isQuickViewOpen}
        queueItem={quickViewItem}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewItem(null);
        }}
      />
    </div>
  );
};
