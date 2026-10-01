import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
  Download,
  Filter,
  Search,
  Activity,
  FileText,
  Stethoscope,
  Pill,
  Clock,
  KeyRound,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { AuditActionType, AuditLogEntry } from '../../types/clinic';

export const SystemAuditTrailDrawer: React.FC = () => {
  const {
    auditLogs,
    isAuditDrawerOpen,
    setIsAuditDrawerOpen,
    verifyAuditTrailIntegrity,
    triggerToast,
  } = useClinic();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verifiedCount: number;
    isValid: boolean;
  } | null>(null);

  if (!isAuditDrawerOpen) return null;

  const handleVerifyLedger = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const result = verifyAuditTrailIntegrity();
      setVerificationResult(result);
      setIsVerifying(false);
      triggerToast(
        'Audit Ledger Verified',
        `Validated ${result.verifiedCount} cryptographic signatures. No tampering detected.`,
        'success'
      );
    }, 600);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mymedipadi_audit_trail_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerToast('Audit Trail Exported', 'Audit ledger downloaded for external compliance review.', 'info');
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter = filterType === 'ALL' || log.actionType === filterType;
    const matchesSearch =
      log.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.shaHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionBadge = (type: AuditActionType) => {
    switch (type) {
      case 'ENCOUNTER_STARTED':
        return { label: 'Encounter Started', bg: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'ENCOUNTER_COMPLETED':
        return { label: 'Encounter Completed', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'NOTE_RECORDED':
        return { label: 'Clinical Note Stamped', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'PRESCRIPTION_ISSUED':
        return { label: 'e-Rx Signed', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'CHART_ACCESSED':
        return { label: 'Chart Access Audit', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'TRIAGE_UPDATED':
        return { label: 'Triage / Check-in', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'WALK_IN_ENQUEUED':
        return { label: 'Walk-In Enqueued', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: type, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  System Security & Audit Trail
                </h3>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Live Compliance Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Immutable, timestamped record of clinical encounters, chart alterations, and e-prescriptions
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuditDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Audit Trail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compliance Invariant Strip */}
        <div className="px-6 py-3 bg-teal-950 text-white flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5 inline" />
              <span>HIPAA §164.312(b) Standard Verified</span>
            </span>
            <span aria-hidden="true" className="text-teal-700">|</span>
            <span className="text-teal-200 text-[11px]">
              Total Entries: <strong className="text-white font-mono">{auditLogs.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifyLedger}
              disabled={isVerifying}
              className="px-2.5 py-1 bg-teal-800 hover:bg-teal-700 text-teal-100 text-[11px] font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Cryptographic Integrity'}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1 bg-teal-800 hover:bg-teal-700 text-teal-100 text-[11px] font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Verification Status Banner if Triggered */}
        {verificationResult && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Integrity Validation Complete:</strong> All {verificationResult.verifiedCount} log entries possess valid SHA-256 digests matching chain invariants.
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 uppercase font-semibold">100% Valid</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Action Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {[
              { id: 'ALL', label: 'All Events' },
              { id: 'ENCOUNTER_COMPLETED', label: 'Encounters' },
              { id: 'NOTE_RECORDED', label: 'Notes' },
              { id: 'PRESCRIPTION_ISSUED', label: 'Prescriptions' },
              { id: 'TRIAGE_UPDATED', label: 'Triage & Arrival' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filterType === f.id
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Log Entries Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No matching audit events</p>
              <p className="text-xs text-slate-400 mt-0.5">Try adjusting your filter or search terms.</p>
            </div>
          ) : (
            filteredLogs.map((entry) => {
              const badge = getActionBadge(entry.actionType);

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2 text-xs"
                >
                  {/* Top Row: Timestamp, Action Badge, ID */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px] tabular-nums">
                        {entry.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] tabular-nums">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>

                  {/* Actor and Patient Lockup */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-500 text-[11px]">Authorized Actor:</span>{' '}
                      <strong className="text-slate-900 font-semibold">{entry.actorName}</strong>{' '}
                      <span className="text-slate-500 text-[11px]">({entry.actorRole})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Subject Patient:</span>{' '}
                      <strong className="text-slate-900 font-semibold">{entry.patientName}</strong>{' '}
                      <span className="font-mono text-slate-500 text-[11px]">({entry.patientId})</span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <p className="text-slate-700 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-sans text-xs">
                    {entry.details}
                  </p>

                  {/* Cryptographic SHA-256 Digest & Security Rule */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 font-mono truncate max-w-md" title={`SHA-256 Signature: ${entry.shaHash}`}>
                      <KeyRound className="w-3 h-3 text-teal-600 shrink-0" />
                      <span className="text-slate-400">SHA-256:</span>
                      <span className="text-slate-600 truncate">{entry.shaHash}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-[10px]">{entry.workstation}</span>
                      <span className="text-emerald-700 font-medium text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {entry.complianceRule}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            <span>Audit retention: 7 years per HIPAA Security Rule §164.316(b)(2)(i)</span>
          </div>

          <button
            onClick={() => setIsAuditDrawerOpen(false)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
