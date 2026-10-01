import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { QueueManager } from './QueueManager';
import { DoctorPatientRecords } from './DoctorPatientRecords';
import { ClinicFlowAnalytics } from './ClinicFlowAnalytics';
import { AuditTrailView } from './AuditTrailView';
import { SystemAuditTrailDrawer } from './SystemAuditTrailDrawer';
import { SecureMessaging } from '../patient/SecureMessaging';
import {
  Stethoscope,
  Activity,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface DoctorDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ activeTab, setActiveTab }) => {
  const { doctor, metrics, auditLogs, setIsAuditDrawerOpen } = useClinic();

  return (
    <div className="space-y-6 pb-12">
      {/* Clinician Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Clinician Workstation</span>
            <span aria-hidden="true">·</span>
            <span>{doctor.roomNumber}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Shift Active ({doctor.shiftHours})</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {doctor.name} · {doctor.specialty}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Audit Trail Trigger Button */}
          <button
            onClick={() => setIsAuditDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 shadow-xs transition-colors cursor-pointer"
            title="Open Live System Audit Trail Drawer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinic Avg Wait: <strong className="text-teal-800">{metrics.averageWaitMinutes}m</strong></span>
          </div>
        </div>
      </div>

      {/* Main View Router */}
      {activeTab === 'queue' && <QueueManager />}
      {activeTab === 'records' && <DoctorPatientRecords />}
      {activeTab === 'analytics' && <ClinicFlowAnalytics />}
      {activeTab === 'audit' && <AuditTrailView />}
      {activeTab === 'messages' && (
        <div className="max-w-3xl mx-auto">
          <SecureMessaging />
        </div>
      )}

      {/* Slide-Over System Security Audit Trail Drawer */}
      <SystemAuditTrailDrawer />
    </div>
  );
};
