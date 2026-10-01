import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  X,
  Stethoscope,
  HeartPulse,
  Pill,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { QueueItem } from '../../types/clinic';

interface ConsultationModalProps {
  queueItem: QueueItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientConsultationModal: React.FC<ConsultationModalProps> = ({
  queueItem,
  isOpen,
  onClose,
}) => {
  const { completeConsultation, patient, doctor } = useClinic();

  const isCurrentPatient = queueItem?.patientId === patient.id;

  const [assessment, setAssessment] = useState(
    isCurrentPatient
      ? 'Patient presents with mild seasonal bronchial reactivity. Chest clear bilaterally to auscultation, no wheezing on forced expiration. Vitals within target limits.'
      : 'Patient examined in good general condition. Vital signs stable, no acute distress.'
  );
  const [plan, setPlan] = useState(
    isCurrentPatient
      ? '1. Continue Albuterol HFA 90mcg prn. 2. Continue daily Fluticasone spray. 3. Return for 6-month check or earlier if peak expiratory flow drops.'
      : '1. Symptomatic relief. 2. Hydration and rest. 3. Follow-up in 10-14 days if symptoms persist.'
  );

  const [prescriptions, setPrescriptions] = useState<
    { name: string; dosage: string; frequency: string; instructions: string }[]
  >([]);

  const [newRxName, setNewRxName] = useState('');
  const [newRxDosage, setNewRxDosage] = useState('');
  const [newRxFrequency, setNewRxFrequency] = useState('');
  const [newRxInstructions, setNewRxInstructions] = useState('');
  const [showAddRx, setShowAddRx] = useState(false);

  if (!isOpen || !queueItem) return null;

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRxName.trim()) return;
    setPrescriptions((prev) => [
      ...prev,
      {
        name: newRxName.trim(),
        dosage: newRxDosage.trim() || 'Standard dosage',
        frequency: newRxFrequency.trim() || 'Once daily',
        instructions: newRxInstructions.trim() || 'Take as directed.',
      },
    ]);
    setNewRxName('');
    setNewRxDosage('');
    setNewRxFrequency('');
    setNewRxInstructions('');
    setShowAddRx(false);
  };

  const handleFinishConsultation = () => {
    completeConsultation(queueItem.id, {
      chiefComplaint: queueItem.chiefComplaint,
      assessment: assessment.trim(),
      plan: plan.trim(),
      prescriptionsToAdd: prescriptions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Clinical Examination & Encounter
                </h3>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  Ticket #{queueItem.ticketNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{queueItem.patientName}</strong> ({queueItem.patientAge}y, {queueItem.patientGender}) · Attending: {doctor.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Patient Quick Vitals & Triage Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-800">
                Chief Complaint / Presenting Concern:
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Checked in at {queueItem.checkInTime || '10:00 AM'}
              </span>
            </div>
            <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
              {queueItem.chiefComplaint}
            </p>

            {isCurrentPatient && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">BP:</span>{' '}
                  <strong className="font-mono text-slate-800">{patient.vitals.bloodPressure}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Pulse:</span>{' '}
                  <strong className="font-mono text-slate-800">{patient.vitals.heartRate} bpm</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">SpO2:</span>{' '}
                  <strong className="font-mono text-slate-800">{patient.vitals.oxygenSat}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Known Allergies:</span>{' '}
                  <span className="text-rose-700 font-medium">Penicillin</span>
                </div>
              </div>
            )}
          </div>

          {/* Form: Clinical Documentation */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Clinical Assessment & Findings *
              </label>
              <textarea
                rows={3}
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="Enter objective clinical examination findings..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Treatment Plan, Lifestyle Recommendations & Next Encounter *
              </label>
              <textarea
                rows={3}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="Document care steps and medications prescribed..."
              />
            </div>

            {/* Prescriptions Section */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-700" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Electronic Prescriptions (e-Rx)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRx(!showAddRx)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddRx ? 'Close Prescription Form' : 'Add Medication'}</span>
                </button>
              </div>

              {prescriptions.length > 0 && (
                <div className="space-y-2">
                  {prescriptions.map((rx, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{rx.name}</span>
                        <span className="text-slate-500 font-mono ml-2">({rx.dosage})</span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {rx.frequency} — {rx.instructions}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPrescriptions((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showAddRx && (
                <div className="p-3 bg-teal-50/40 rounded-lg border border-teal-200 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Medication name (e.g. Amoxicillin)"
                      value={newRxName}
                      onChange={(e) => setNewRxName(e.target.value)}
                      className="text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={newRxDosage}
                      onChange={(e) => setNewRxDosage(e.target.value)}
                      className="text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 1 tab twice daily)"
                      value={newRxFrequency}
                      onChange={(e) => setNewRxFrequency(e.target.value)}
                      className="text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Special instructions (e.g. with meals)"
                      value={newRxInstructions}
                      onChange={(e) => setNewRxInstructions(e.target.value)}
                      className="text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddPrescription}
                      disabled={!newRxName.trim()}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
                    >
                      Append to Rx Order
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Audit Log Simulator Strip */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Encrypted Encounters Audit Trail: Signed by {doctor.name}, {doctor.title}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                SHA-256 Auto-Stamped
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            Save Draft & Close
          </button>
          <button
            type="button"
            onClick={handleFinishConsultation}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Encounter & Record Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
