import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  FileText,
  User,
  HeartPulse,
  Pill,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { PatientConsultationModal } from './PatientConsultationModal';
import { ClinicalRecordQuickView } from './ClinicalRecordQuickView';

export const DoctorPatientRecords: React.FC = () => {
  const { patient, doctor, queue, saveClinicalNote, setIsAuditDrawerOpen, auditLogs } = useClinic();
  const [activePatientTab, setActivePatientTab] = useState<'chart' | 'vitals' | 'notes' | 'prescriptions'>('chart');
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState('');
  const [newAssessment, setNewAssessment] = useState('');
  const [newPlan, setNewPlan] = useState('');

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessment.trim() || !newPlan.trim()) return;

    saveClinicalNote(patient.id, {
      chiefComplaint: newComplaint.trim() || 'General follow-up and monitoring',
      assessment: newAssessment.trim(),
      plan: newPlan.trim(),
    });

    setNewComplaint('');
    setNewAssessment('');
    setNewPlan('');
    setNewNoteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-base">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {patient.fullName}
                </h2>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  {patient.id}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {patient.age}y · {patient.gender} · DOB: {patient.dob}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Primary Physician: {doctor.name} · Insurance: {patient.insuranceProvider} ({patient.insuranceId})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Slide-Over Quick-View</span>
            </button>

            <button
              onClick={() => setIsAuditDrawerOpen(true)}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-teal-200 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>

            <button
              onClick={() => setNewNoteOpen(!newNoteOpen)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{newNoteOpen ? 'Cancel Note' : 'Add Clinical Progress Note'}</span>
            </button>
          </div>
        </div>


        {/* Allergy and Conditions Tag Strip */}
        <div className="pt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700">Clinical Flags:</span>
          <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-md font-medium">
            Allergies: {patient.allergies.join(', ')}
          </span>
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md">
            Conditions: {patient.chronicConditions.join(' · ')}
          </span>
          <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-md font-mono">
            Blood Type: {patient.bloodGroup}
          </span>
        </div>
      </div>

      {/* Add Progress Note Form */}
      {newNoteOpen && (
        <form onSubmit={handleSaveNote} className="bg-white rounded-xl border border-teal-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">
                New Consultation Progress Note (Audit-Logged)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Author: {doctor.name}, {doctor.title}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chief Complaint / Reason for Encounter
            </label>
            <input
              type="text"
              value={newComplaint}
              onChange={(e) => setNewComplaint(e.target.value)}
              placeholder="e.g. Asthma control review and seasonal rhinitis assessment"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Assessment & Objective Findings *
            </label>
            <textarea
              required
              rows={3}
              value={newAssessment}
              onChange={(e) => setNewAssessment(e.target.value)}
              placeholder="Enter physical exam findings, breath sounds, heart sounds, vitals evaluation..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Care Plan & Clinical Recommendations *
            </label>
            <textarea
              required
              rows={3}
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              placeholder="Document medication changes, lifestyle guidance, follow-up timeline..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Stamped into permanent medical record with SHA-256 audit log</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewNoteOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Note & Append Audit</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabs for Doctor View: Chart / Vitals / Notes / Prescriptions */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-fit mb-5">
          <button
            onClick={() => setActivePatientTab('chart')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activePatientTab === 'chart'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clinical History & Vitals
          </button>
          <button
            onClick={() => setActivePatientTab('notes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activePatientTab === 'notes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Encounter Notes ({patient.recentNotes.length})
          </button>
          <button
            onClick={() => setActivePatientTab('prescriptions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activePatientTab === 'prescriptions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prescription Summary ({patient.prescriptions.length})
          </button>
        </div>

        {/* Tab 1: Vitals & Chart */}
        {activePatientTab === 'chart' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                Recorded Vitals (Last Taken: {patient.vitals.lastRecordedTime})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500 uppercase">Blood Pressure</div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {patient.vitals.bloodPressure}
                  </div>
                  <div className="text-[10px] text-emerald-700">Normotensive</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500 uppercase">Heart Rate</div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {patient.vitals.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Regular sinus rhythm</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500 uppercase">Oxygen Saturation</div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {patient.vitals.oxygenSat}%
                  </div>
                  <div className="text-[10px] text-emerald-700">Optimal room air</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500 uppercase">Temperature</div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {patient.vitals.temperature}°F
                  </div>
                  <div className="text-[10px] text-slate-500">Afebrile</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                Patient Contact & Demographic Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Phone:</span>{' '}
                  <span className="font-mono text-slate-800">{patient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>{' '}
                  <span className="font-mono text-slate-800">{patient.email}</span>
                </div>
                <div>
                  <span className="text-slate-500">Weight:</span>{' '}
                  <span className="font-mono text-slate-800">{patient.vitals.weightKg} kg (BMI: 21.8)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Encounter Notes */}
        {activePatientTab === 'notes' && (
          <div className="space-y-4">
            {patient.recentNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{note.author}</span>
                    <span className="text-slate-500 font-mono">({note.timestamp})</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>Audit Hash: {note.auditHash}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <p>
                    <strong className="text-slate-800">Reason:</strong>{' '}
                    <span className="text-slate-700">{note.chiefComplaint}</span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Assessment:</strong>{' '}
                    <span className="text-slate-700">{note.assessment}</span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Plan:</strong>{' '}
                    <span className="text-slate-700">{note.plan}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Prescriptions */}
        {activePatientTab === 'prescriptions' && (
          <div className="space-y-3">
            {patient.prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs bg-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rx.medicationName}</span>
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {rx.dosage}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                        rx.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : rx.status === 'Pending Refill'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    {rx.frequency} · {rx.instructions}
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-500">
                  <div>Refills: {rx.refillsRemaining}</div>
                  <div>Prescribed: {rx.prescribedDate}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-Over Quick-View Modal */}
      <ClinicalRecordQuickView
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
};

