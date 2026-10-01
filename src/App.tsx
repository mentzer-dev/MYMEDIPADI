import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/common/Header';
import { NotificationToast } from './components/common/NotificationToast';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { ArrowRightLeft, User, Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react';

const MainPortalView: React.FC = () => {
  const { role, switchRole, patient, doctor } = useClinic();
  const [activeTab, setActiveTab] = useState<string>(() => (role === 'doctor' ? 'queue' : 'overview'));

  // Ensure activeTab matches role capabilities seamlessly
  React.useEffect(() => {
    if (role === 'doctor' && (activeTab === 'overview' || activeTab === 'book')) {
      setActiveTab('queue');
    } else if (role === 'patient' && (activeTab === 'queue' || activeTab === 'analytics' || activeTab === 'audit')) {
      setActiveTab('overview');
    }
  }, [role, activeTab]);


  const handleRoleChange = (newRole: 'patient' | 'doctor') => {
    switchRole(newRole);
    setActiveTab(newRole === 'doctor' ? 'queue' : 'overview');
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Bar Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Quick Interactive Testing Bar (Dual-Sided Portal Banner) */}
      <div className="bg-teal-900 text-teal-100 text-xs py-2 px-4 border-b border-teal-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-teal-800 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded">
              Dual-Sided Prototype
            </span>
            <span>
              Currently viewing as{' '}
              <strong className="text-white">
                {role === 'patient' ? `Patient (${patient.fullName})` : `Doctor (${doctor.name})`}
              </strong>
            </span>
            <span aria-hidden="true" className="text-teal-400">·</span>
            <span className="hidden md:inline text-teal-200">
              Actions in one portal immediately update the other
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-teal-300">Quick Switch:</span>
            <button
              onClick={() => handleRoleChange('patient')}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors ${
                role === 'patient'
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-teal-800/80 hover:bg-teal-700 text-teal-200'
              }`}
            >
              Patient Portal
            </button>
            <button
              onClick={() => handleRoleChange('doctor')}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors ${
                role === 'doctor'
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-teal-800/80 hover:bg-teal-700 text-teal-200'
              }`}
            >
              Doctor Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {role === 'patient' ? (
          <PatientDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          <DoctorDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Quiet Domain Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              M
            </div>
            <span className="font-semibold text-slate-700">MyMediPadi Healthcare</span>
            <span aria-hidden="true">·</span>
            <span>Clinic Workflow & Queue Optimization</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>St. Jude Health Centre</span>
            <span aria-hidden="true">·</span>
            <span>HIPAA Compliant Session</span>
            <span aria-hidden="true">·</span>
            <span>© 2026 MyMediPadi Systems</span>
          </div>
        </div>
      </footer>

      {/* Real-Time Notification Toasts */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainPortalView />
    </ClinicProvider>
  );
}
