import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  TrendingDown,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Zap,
} from 'lucide-react';

export const ClinicFlowAnalytics: React.FC = () => {
  const { metrics, queue } = useClinic();

  const hourlyFlow = [
    { hour: '08:00', arrivals: 4, avgWait: 8, load: 40 },
    { hour: '09:00', arrivals: 7, avgWait: 11, load: 70 },
    { hour: '10:00', arrivals: 8, avgWait: 14, load: 85 }, // current
    { hour: '11:00', arrivals: 6, avgWait: 12, load: 60 },
    { hour: '12:00', arrivals: 3, avgWait: 6, load: 30 },
    { hour: '13:00', arrivals: 5, avgWait: 9, load: 50 },
    { hour: '14:00', arrivals: 7, avgWait: 13, load: 75 },
    { hour: '15:00', arrivals: 4, avgWait: 8, load: 45 },
  ];

  const rooms = [
    { name: 'Suite 3B', physician: 'Dr. Adeyemi Thorne', status: 'Occupied', currentEncounter: 'General Medicine', turnaround: '18 mins' },
    { name: 'Suite 4A', physician: 'Dr. Elena Rostova', status: 'Occupied', currentEncounter: 'Cardiology Review', turnaround: '22 mins' },
    { name: 'Suite 2C', physician: 'Dr. Marcus Vance', status: 'Available', currentEncounter: 'Ready for Patient', turnaround: '15 mins' },
    { name: 'Lab Phlebotomy', physician: 'Nurse Clara Barton', status: 'In Service', currentEncounter: 'Metabolic Screening', turnaround: '8 mins' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Comparative Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Optimization Engine</span>
              <span aria-hidden="true">·</span>
              <span className="text-teal-700 font-semibold">Active AI Flow Pacing</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Wait-Time Reduction & Clinic Velocity
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              By combining mobile arrival check-ins, staggered slot buffers, and real-time triage pings, patient idle time in the waiting lounge has dropped significantly.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0">
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-medium">Regional Baseline</div>
              <div className="text-xl font-mono text-slate-400 line-through tabular-nums">
                38 mins
              </div>
            </div>
            <div className="text-slate-300 font-bold">→</div>
            <div>
              <div className="text-[11px] text-teal-800 uppercase font-bold">Today's Avg Wait</div>
              <div className="text-2xl font-mono font-bold text-teal-700 tabular-nums">
                {metrics.averageWaitMinutes} mins
              </div>
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md text-xs font-bold font-mono">
              -68.4%
            </div>
          </div>
        </div>

        {/* Hourly Traffic Load Chart Bar */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Hourly Intake vs. Wait Velocity (Today)
            </h4>
            <span className="text-[11px] text-slate-500">
              Peak congestion averted between 10:00 - 11:00 AM via slot throttling
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
            {hourlyFlow.map((h) => {
              const isCurrent = h.hour === '10:00';
              return (
                <div
                  key={h.hour}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="text-xs font-mono font-semibold text-slate-800 tabular-nums">
                    {h.hour}
                  </div>
                  {/* Load Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full my-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        h.load > 75 ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${h.load}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 tabular-nums">
                    {h.avgWait}m wait
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {h.arrivals} patients
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Consultation Room Utilization */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Examination Room & Suite Status
            </h4>
            <p className="text-xs text-slate-500">
              Real-time room occupancy and patient turnaround times
            </p>
          </div>
          <span className="text-xs font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            {metrics.activeConsultationRooms} of {metrics.totalRooms} Suites Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rooms.map((room) => (
            <div
              key={room.name}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{room.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      room.status === 'Occupied'
                        ? 'bg-sky-100 text-sky-800'
                        : room.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="text-xs text-slate-700 mt-1 font-medium">
                  {room.physician}
                </div>
                <div className="text-[11px] text-slate-500">
                  {room.currentEncounter}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Avg Turnaround</span>
                <span className="text-xs font-mono font-bold text-slate-800 tabular-nums">
                  {room.turnaround}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
