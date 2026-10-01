import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { QueuePriority } from '../../types/clinic';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkInModal: React.FC<WalkInModalProps> = ({ isOpen, onClose }) => {
  const { addWalkInPatient, services } = useClinic();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState('Female');
  const [serviceName, setServiceName] = useState(services[0].name);
  const [priority, setPriority] = useState<QueuePriority>('standard');
  const [chiefComplaint, setChiefComplaint] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !chiefComplaint.trim()) return;

    addWalkInPatient({
      fullName: fullName.trim(),
      age: Number(age) || 30,
      gender,
      serviceName,
      priority,
      chiefComplaint: chiefComplaint.trim(),
    });

    setFullName('');
    setChiefComplaint('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Register Walk-In Patient
            </h3>
            <p className="text-xs text-slate-500">
              Direct entry into clinic queue with automated triage priority
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Samuel Okonjo"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="115"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Service
            </label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.duration}m)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Triage Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPriority('standard')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  priority === 'standard'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="font-semibold">Standard Queue</div>
                <div className="text-[11px] text-slate-500">Standard wait order</div>
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  priority === 'urgent'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="font-semibold text-rose-700">Urgent / Fast-Track</div>
                <div className="text-[11px] text-slate-500">Priority bump to top</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chief Complaint / Triage Notes *
            </label>
            <textarea
              required
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., Acute migraine with photophobia, sudden onset 2 hours ago..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Issue Ticket & Enqueue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
