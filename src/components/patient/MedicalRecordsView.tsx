import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  FileText,
  Pill,
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const MedicalRecordsView: React.FC = () => {
  const { patient, requestPrescriptionRefill } = useClinic();
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'notes' | 'vitals'>('prescriptions');

  return (
    <div className="space-y-6">
      {/* Patient Vital Stats Header Strip */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Patient Chart</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-600 font-semibold">{patient.id}</span>
              <span aria-hidden="true">·</span>
              <span>DOB: {patient.dob} ({patient.age}y)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {patient.fullName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-mono">
              Blood: {patient.bloodGroup}
            </span>
            <span className="text-xs bg-rose-50 text-rose-800 px-2.5 py-1 rounded-md border border-rose-200 font-medium">
              Allergies: {patient.allergies.join(', ')}
            </span>
          </div>
        </div>

        {/* Vitals Quick Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide">Blood Pressure</div>
            <div className="text-base font-mono font-bold text-slate-900 tabular-nums mt-0.5">
              {patient.vitals.bloodPressure}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Normal resting range</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide">Heart Rate</div>
            <div className="text-base font-mono font-bold text-slate-900 tabular-nums mt-0.5">
              {patient.vitals.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Regular rhythm</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide">Oxygen Sat (SpO2)</div>
            <div className="text-base font-mono font-bold text-slate-900 tabular-nums mt-0.5">
              {patient.vitals.oxygenSat}%
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Adequate oxygenation</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide">Body Temp</div>
            <div className="text-base font-mono font-bold text-slate-900 tabular-nums mt-0.5">
              {patient.vitals.temperature}°F
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Afebrile</div>
          </div>
        </div>
      </div>

      {/* Main Records Tab Box */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'prescriptions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Medications ({patient.prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'notes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinical Visit Summaries ({patient.recentNotes.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Insurance: {patient.insuranceProvider} ({patient.insuranceId})
          </div>
        </div>

        {/* Tab 1: Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="mt-5 space-y-3">
            {patient.prescriptions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <Pill className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">No Active Prescriptions on File</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When your physician prescribes medication or approves an e-refill, your dosage instructions and refill counts will appear here.
                </p>
              </div>
            ) : (
              patient.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 rounded-lg border border-slate-200/90 hover:border-slate-300 transition-all bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {rx.medicationName}
                        </h4>
                        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {rx.dosage}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700">
                        <strong>Directions:</strong> {rx.frequency}
                      </p>

                      <p className="text-xs text-slate-500">
                        <strong>Special Instructions:</strong> {rx.instructions}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                        <span>Prescriber: {rx.prescribingDoctor}</span>
                        <span aria-hidden="true">·</span>
                        <span>Date: {rx.prescribedDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>Refills Available: {rx.refillsRemaining}</span>
                      </div>
                    </div>

                    {/* Refill Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      {rx.status === 'Pending Refill' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Refill In Review</span>
                        </span>
                      ) : rx.refillsRemaining > 0 ? (
                        <button
                          onClick={() => requestPrescriptionRefill(rx.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors shadow-xs cursor-pointer"
                        >
                          Request Pharmacy Refill
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Refills Exhausted · Consult Doctor
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Clinical Summaries & Audit Logs */}
        {activeTab === 'notes' && (
          <div className="mt-5 space-y-4">
            {patient.recentNotes.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">No Past Clinical Notes on Record</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Summaries of physician physical exams and clinical assessments will be archived here following your visits.
                </p>
              </div>
            ) : (
              patient.recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{note.author}</span>
                      <span className="text-slate-500">({note.authorRole})</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500 font-mono">{note.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>Audit SHA: {note.auditHash}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">Reason / Chief Complaint:</span>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{note.chiefComplaint}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-800">Clinical Assessment & Vitals:</span>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{note.assessment}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-800">Care Plan & Next Steps:</span>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{note.plan}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
