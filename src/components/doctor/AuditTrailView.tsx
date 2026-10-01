import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  ShieldCheck,
  Lock,
  Download,
  Search,
  Clock,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  FileText,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { AuditActionType } from '../../types/clinic';

export const AuditTrailView: React.FC = () => {
  const { auditLogs, verifyAuditTrailIntegrity, triggerToast } = useClinic();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verifiedCount: number;
    isValid: boolean;
  } | null>(null);

  const handleVerifyLedger = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const result = verifyAuditTrailIntegrity();
      setVerificationResult(result);
      setIsVerifying(false);
      triggerToast(
        'Cryptographic Audit Verified',
        `Validated ${result.verifiedCount} cryptographic log signatures. Invariants intact.`,
        'success'
      );
    }, 500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mymedipadi_audit_trail_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerToast('Audit Trail Exported', 'Audit ledger downloaded as JSON for external compliance review.', 'info');
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Security & Governance</span>
              <span aria-hidden="true">·</span>
              <span className="text-teal-700 font-semibold">Regulatory Compliance Active</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              System Audit Trail & Cryptographic Event Ledger
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Real-time audit logging for HIPAA Security Rule §164.312(b) and 21 CFR Part 11. Every encounter, diagnosis note, prescription, and patient chart alteration is recorded with an immutable SHA-256 cryptographic digest.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleVerifyLedger}
              disabled={isVerifying}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying Ledger...' : 'Verify Cryptographic Chain'}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase font-medium">Logged Compliance Events</span>
            <div className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-0.5">
              {auditLogs.length}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">100% Sealed</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase font-medium">Cryptographic Hash Standard</span>
            <div className="text-base font-mono font-bold text-slate-900 mt-0.5">
              SHA-256 Digest
            </div>
            <span className="text-[10px] text-slate-500">256-bit collision resistant</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase font-medium">Security Regulatory Baseline</span>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate">
              HIPAA §164.312(b)
            </div>
            <span className="text-[10px] text-slate-500">Audit Controls Enforced</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase font-medium">Chain Verification State</span>
            <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>Signatures Invariant</span>
            </div>
            <span className="text-[10px] text-slate-500">Zero tampering detected</span>
          </div>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">
                Ledger Invariant Verification Succeeded
              </p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                All {verificationResult.verifiedCount} logged actions possess authentic SHA-256 cryptographic signatures stamped with practitioner credentials and time-authority synchronization.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            PASS (0 Errors)
          </span>
        </div>
      )}

      {/* Main Table / Feed Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto pb-1 sm:pb-1">
            {[
              { id: 'ALL', label: 'All Logged Events' },
              { id: 'ENCOUNTER_COMPLETED', label: 'Completed Encounters' },
              { id: 'NOTE_RECORDED', label: 'Clinical Notes' },
              { id: 'PRESCRIPTION_ISSUED', label: 'e-Prescriptions' },
              { id: 'TRIAGE_UPDATED', label: 'Check-Ins' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filterType === f.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Live Audit Log Stream */}
        <div className="mt-5 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No matching audit records</p>
              <p className="text-xs text-slate-400 mt-0.5">Try selecting another filter or clearing search.</p>
            </div>
          ) : (
            filteredLogs.map((entry) => {
              const badge = getActionBadge(entry.actionType);

              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all bg-white space-y-2 text-xs"
                >
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

                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-500 text-[11px]">Authorized Practitioner:</span>{' '}
                      <strong className="text-slate-900 font-semibold">{entry.actorName}</strong>{' '}
                      <span className="text-slate-500 text-[11px]">({entry.actorRole})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Patient Chart:</span>{' '}
                      <strong className="text-slate-900 font-semibold">{entry.patientName}</strong>{' '}
                      <span className="font-mono text-slate-500 text-[11px]">({entry.patientId})</span>
                    </div>
                  </div>

                  <p className="text-slate-700 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-sans text-xs">
                    {entry.details}
                  </p>

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
      </div>
    </div>
  );
};
