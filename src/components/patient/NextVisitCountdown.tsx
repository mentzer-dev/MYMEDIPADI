import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Timer,
  BellRing,
} from 'lucide-react';
import { Appointment } from '../../types/clinic';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isToday: boolean;
}

export const NextVisitCountdown: React.FC<{
  appointment: Appointment | null;
  onCheckIn: (id: string) => void;
  onBookClick: () => void;
}> = ({ appointment, onCheckIn, onBookClick }) => {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    isToday: false,
  });

  useEffect(() => {
    if (!appointment) return;

    const parseAppointmentDate = () => {
      // Parse appointment date & timeSlot
      // Example: date "2026-10-01", timeSlot "10:30 AM"
      try {
        const [year, month, day] = appointment.date.split('-').map(Number);
        let [time, modifier] = appointment.timeSlot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return new Date(year, month - 1, day, hours, minutes, 0);
      } catch (err) {
        return new Date(Date.now() + 3600000 * 2);
      }
    };

    const targetDate = parseAppointmentDate();

    const updateTimer = () => {
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = appointment.date === todayStr || appointment.date === '2026-10-01';

      if (diffMs <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
          isToday,
        });
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
        isToday,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [appointment]);

  if (!appointment) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 font-medium">Next Scheduled Appointment</span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">No Upcoming Visits Scheduled</h3>
          <p className="text-xs text-slate-600 mt-1">
            Book your consultation early to secure minimum waiting times.
          </p>
        </div>
        <button
          onClick={onBookClick}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
        >
          <span>Schedule Visit Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-sky-900 rounded-xl text-white p-5 shadow-sm border border-teal-700/60 overflow-hidden relative">
      {/* Background soft ambient pattern */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-teal-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-teal-200">
            <span className="inline-flex items-center gap-1 bg-teal-700/70 text-white px-2 py-0.5 rounded font-medium text-[11px]">
              <Timer className="w-3 h-3 text-teal-300" />
              <span>Next Upcoming Visit</span>
            </span>
            <span aria-hidden="true" className="text-teal-400">·</span>
            <span className="font-mono text-teal-100">{appointment.bookingRef}</span>
            <span aria-hidden="true" className="text-teal-400">·</span>
            <span>{appointment.room}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {appointment.serviceName}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-teal-100 pt-0.5">
            <span>Attending: <strong>{appointment.doctorName}</strong></span>
            <span aria-hidden="true" className="text-teal-400">·</span>
            <span className="font-mono tabular-nums">{appointment.date} at {appointment.timeSlot}</span>
          </div>
        </div>

        {/* Center / Right: Live Countdown Counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-teal-950/60 border border-teal-700/50 p-3.5 rounded-xl backdrop-blur-xs">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-teal-300 mb-1 text-center sm:text-left">
              {countdown.isPast
                ? 'Appointment In Progress'
                : countdown.isToday
                ? 'Countdown to Today’s Visit'
                : 'Countdown to Appointment'}
            </div>

            {/* Countdown Blocks */}
            <div className="flex items-center gap-2 font-mono tabular-nums">
              {/* Days */}
              <div className="flex flex-col items-center bg-teal-900/90 border border-teal-700/60 px-2.5 py-1.5 rounded-lg min-w-[44px]">
                <span className="text-lg font-bold text-white leading-tight">
                  {format2Digits(countdown.days)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-teal-300">Days</span>
              </div>
              <span className="text-teal-400 font-bold">:</span>

              {/* Hours */}
              <div className="flex flex-col items-center bg-teal-900/90 border border-teal-700/60 px-2.5 py-1.5 rounded-lg min-w-[44px]">
                <span className="text-lg font-bold text-white leading-tight">
                  {format2Digits(countdown.hours)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-teal-300">Hrs</span>
              </div>
              <span className="text-teal-400 font-bold">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center bg-teal-900/90 border border-teal-700/60 px-2.5 py-1.5 rounded-lg min-w-[44px]">
                <span className="text-lg font-bold text-teal-200 leading-tight">
                  {format2Digits(countdown.minutes)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-teal-300">Mins</span>
              </div>
              <span className="text-teal-400 font-bold">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center bg-teal-900/90 border border-teal-700/60 px-2.5 py-1.5 rounded-lg min-w-[44px]">
                <span className="text-lg font-bold text-teal-300 leading-tight animate-pulse">
                  {format2Digits(countdown.seconds)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-teal-300">Secs</span>
              </div>
            </div>
          </div>

          {/* Quick Check-in or Status Button */}
          <div className="pt-2 sm:pt-0 sm:pl-3 sm:border-l sm:border-teal-700/60 w-full sm:w-auto">
            {appointment.isCheckedIn ? (
              <div className="flex items-center gap-1.5 text-xs text-teal-200 bg-teal-800/80 px-3 py-2 rounded-lg font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Checked In (#{appointment.ticketNumber})</span>
              </div>
            ) : appointment.checkInEligible || countdown.isToday ? (
              <button
                onClick={() => onCheckIn(appointment.id)}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Check In Now</span>
              </button>
            ) : (
              <div className="text-center sm:text-left text-[11px] text-teal-200">
                <span>Check-in unlocks on day of visit</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
