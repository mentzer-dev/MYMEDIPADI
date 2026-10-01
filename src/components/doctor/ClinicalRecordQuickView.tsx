import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  X,
  FileText,
  User,
  HeartPulse,
  Pill,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Patient, QueueItem } from '../../types/clinic';

interface ClinicalRecordQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  patientData?: Patient | null;
  queueItem?: QueueItem | null;
}

export const ClinicalRecordQuickView: React.FC<ClinicalRecordQuickViewProps> = ({
  isOpen,
  onClose,
  patientData,
  queueItem,
}) => {
  const {
    patient: defaultPatient,
    doctor,
    saveClinicalNote,
    logAuditEvent,
    setIsAuditDrawerOpen,
    triggerToast,
  } = useClinic();

  // If patientData is provided use it, otherwise fallback to defaultPatient
  const activePatient = patientData || defaultPatient;

  const [quickNote, setQuickNote] = useState('');
  const [quickComplaint, setQuickComplaint] = useState(
    queueItem?.chiefComplaint || 'Periodic evaluation & vitals check'
  );
  const [quickPlan, setQuickPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'vitals' | 'notes' | 'prescriptions'>('vitals');

  if (!isOpen) return null;

  const handleRecordProgressNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      saveClinicalNote(activePatient.id, {
        chiefComplaint: quickComplaint.trim(),
        assessment: quickNote.trim(),
        plan: quickPlan.trim() || 'Continue current therapy. Re-evaluate as needed.',
      });

      setIsSubmitting(false);
      setQuickNote('');
      setQuickPlan('');
      setActiveTab('notes');

      triggerToast(
        'Note Appended & Audit Logged',
        `Clinical encounter entry stamped with SHA-256 hash. Viewable in System Audit Trail.`,
        'success'
      );
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center font-bold text-teal-800 text-sm">
              {activePatient.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {activePatient.fullName}
                </h3>
                <span className="font-mono text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  {activePatient.id}
                </span>
                {queueItem && (
                  <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
                    Ticket #{queueItem.ticketNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                DOB: {activePatient.dob} ({activePatient.age}y, {activePatient.gender}) · Blood Group: {activePatient.bloodGroup}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuditDrawerOpen(true)}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold px-2.5 py-1.5 rounded-lg border border-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Open Live Audit Trail"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">View Audit Trail</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Allergy Red-Flag Alert Strip */}
        {activePatient.allergies.length > 0 && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-xs text-rose-900 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Documented Allergies:</strong> {activePatient.allergies.join(' · ')}
            </span>
          </div>
        )}

        {/* Quick Nav Tabs */}
        <div className="px-6 py-2 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vitals & Chart
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Encounters & Notes ({activePatient.recentNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'prescriptions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Medications ({activePatient.prescriptions.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Ins: {activePatient.insuranceProvider.slice(0, 18)}...
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: VITALS */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Recorded Vitals Snapshot ({activePatient.vitals.lastRecordedTime})
                  </h4>
                  <span className="text-[11px] text-teal-700 font-medium">Auto-Triage Verified</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-medium">BP</span>
                    <div className="text-base font-mono font-bold text-slate-900 tabular-nums">
                      {activePatient.vitals.bloodPressure}
                    </div>
                    <span className="text-[10px] text-emerald-700">Normotensive</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-medium">Pulse</span>
                    <div className="text-base font-mono font-bold text-slate-900 tabular-nums">
                      {activePatient.vitals.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Regular sinus</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-medium">Oxygen (SpO2)</span>
                    <div className="text-base font-mono font-bold text-slate-900 tabular-nums">
                      {activePatient.vitals.oxygenSat}%
                    </div>
                    <span className="text-[10px] text-emerald-700">Room air</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-medium">Temp</span>
                    <div className="text-base font-mono font-bold text-slate-900 tabular-nums">
                      {activePatient.vitals.temperature}°F
                    </div>
                    <span className="text-[10px] text-slate-500">Afebrile</span>
                  </div>
                </div>
              </div>

              {/* Conditions & Background */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wide block">
                  Chronic Conditions & History
                </span>
                <p className="text-slate-700">
                  {activePatient.chronicConditions.join(' · ')}
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Weight: <strong>{activePatient.vitals.weightKg} kg</strong></span>
                  <span>Contact: <strong>{activePatient.phone}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLINICAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              {activePatient.recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                    <span className="font-bold text-slate-900">{note.author}</span>
                    <span className="font-mono text-[11px] text-slate-400">{note.timestamp}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Reason:</strong>{' '}
                    <span className="text-slate-700">{note.chiefComplaint}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Assessment:</strong>{' '}
                    <span className="text-slate-700">{note.assessment}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Plan:</strong>{' '}
                    <span className="text-slate-700">{note.plan}</span>
                  </div>
                  <div className="pt-1 text-[10px] font-mono text-teal-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>Audit SHA: {note.auditHash}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-2.5">
              {activePatient.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rx.medicationName}</span>
                    <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {rx.dosage}
                    </span>
                  </div>
                  <p className="text-slate-600">{rx.frequency}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                    <span>Prescribed: {rx.prescribedDate}</span>
                    <span>Refills remaining: {rx.refillsRemaining}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Note Composer - Directly Appends to System Audit Trail */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Append Clinical Progress Note (Live Audit-Stamped)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                SHA-256 Auto-Sealed
              </span>
            </div>

            <form onSubmit={handleRecordProgressNote} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-teal-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Encounter Focus / Chief Complaint:
                </label>
                <input
                  type="text"
                  value={quickComplaint}
                  onChange={(e) => setQuickComplaint(e.target.value)}
                  placeholder="e.g. Mid-encounter vitals check & respiratory evaluation"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Clinical Examination & Findings: *
                </label>
                <textarea
                  required
                  rows={2}
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Document objective findings, patient response, and current assessment..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Plan & Follow-Up Directions:
                </label>
                <input
                  type="text"
                  value={quickPlan}
                  onChange={(e) => setQuickPlan(e.target.value)}
                  placeholder="e.g. Continue current dosage; schedule 3-month lipid panel"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">
                  Signed: {doctor.name}, {doctor.title}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || !quickNote.trim()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Signing Audit...' : 'Sign & Stamp to Audit Trail'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
