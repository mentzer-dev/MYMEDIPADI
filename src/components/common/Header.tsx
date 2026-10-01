import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Stethoscope,
  User,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Building2,
  Clock,
  HeartPulse,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { role, switchRole, patient, doctor, metrics, resetToDefaults } = useClinic();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleRoleSelect = (targetRole: 'patient' | 'doctor') => {
    switchRole(targetRole);
    setActiveTab(targetRole === 'patient' ? 'overview' : 'queue');
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand Zone */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(role === 'patient' ? 'overview' : 'queue');
              }}
              className="flex items-center gap-2.5 text-slate-900 font-bold text-lg tracking-tight hover:opacity-95 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                M
              </div>
              <span className="font-bold text-slate-900 tracking-tight">MyMediPadi</span>
            </a>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
              · Health Flow Platform
            </span>
          </div>

          {/* Zone 2: Clean 4-6 text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {role === 'patient' ? (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                    activeTab === 'overview'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  My Visits & Queue
                </button>
                <button
                  onClick={() => setActiveTab('book')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                    activeTab === 'book'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                    activeTab === 'records'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Prescriptions & Records
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                    activeTab === 'messages'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Care Team Messages
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                    activeTab === 'queue'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Live Clinic Queue
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                    activeTab === 'records'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Clinical Records
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Wait-Time Analytics
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'audit'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Security Audit Trail</span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                    activeTab === 'messages'
                      ? 'text-teal-700 border-teal-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Patient Inbox
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: 1-2 primary actions (Seamless Role Switcher & Profile Card) */}
          <div className="flex items-center gap-2.5 relative">
            {/* Interactive Role Switcher Segmented Control */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => handleRoleSelect('patient')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  role === 'patient'
                    ? 'bg-white text-teal-800 shadow-xs ring-1 ring-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Patient Portal (Amara Chen)"
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient</span>
              </button>
              <button
                onClick={() => handleRoleSelect('doctor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  role === 'doctor'
                    ? 'bg-white text-teal-800 shadow-xs ring-1 ring-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Doctor Portal (Dr. Adeyemi Thorne)"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors text-left"
                aria-expanded={profileDropdownOpen}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    role === 'patient'
                      ? 'bg-teal-100 text-teal-800 border border-teal-200'
                      : 'bg-sky-100 text-sky-800 border border-sky-200'
                  }`}
                >
                  {role === 'patient' ? 'AC' : 'AT'}
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {role === 'patient' ? patient.fullName : doctor.name}
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    {role === 'patient' ? `ID: ${patient.id}` : doctor.roomNumber}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Card Flyout */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          role === 'patient'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {role === 'patient' ? 'AC' : 'AT'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {role === 'patient' ? patient.fullName : doctor.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {role === 'patient' ? `Patient ID: ${patient.id}` : doctor.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Metadata */}
                  <div className="py-3 text-xs space-y-2 border-b border-slate-100">
                    {role === 'patient' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Age / Gender:</span>
                          <span className="font-semibold text-slate-800">{patient.age}y · {patient.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Blood Group:</span>
                          <span className="font-mono font-semibold text-slate-800">{patient.bloodGroup}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Insurance:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[170px]" title={patient.insuranceProvider}>
                            {patient.insuranceProvider}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Known Allergies:</span>
                          <span className="text-rose-700 font-medium">Penicillin</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Department:</span>
                          <span className="font-semibold text-slate-800">{doctor.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Consultation Room:</span>
                          <span className="font-mono font-semibold text-slate-800">{doctor.roomNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">License Number:</span>
                          <span className="font-mono text-slate-700">{doctor.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Shift Schedule:</span>
                          <span className="text-slate-700">{doctor.shiftHours}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions in Dropdown */}
                  <div className="pt-3 space-y-2">
                    <button
                      onClick={() => handleRoleSelect(role === 'patient' ? 'doctor' : 'patient')}
                      className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Switch to {role === 'patient' ? 'Doctor Portal' : 'Patient Portal'}</span>
                    </button>

                    <button
                      onClick={() => {
                        resetToDefaults();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-[11px] text-slate-500 hover:text-slate-800 py-1.5 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Reset mock schedule and queue to default demo state"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Mock Data to Default</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Strip */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50/95 px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
          {role === 'patient' ? (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                My Visits
              </button>
              <button
                onClick={() => setActiveTab('book')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'book'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Book
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Prescriptions
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'messages'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Messages
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'queue'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Live Queue
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Records
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Wait Analytics
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'audit'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Audit Trail</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'messages'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Inbox
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
