import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  X,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Building2,
  Timer,
  AlertCircle,
  HeartPulse,
} from 'lucide-react';
import { ClinicService, Doctor, Appointment } from '../../types/clinic';

interface BookingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdAppointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<BookingProps> = ({ isOpen, onClose, onSuccess }) => {
  const { services, doctors, bookNewAppointment } = useClinic();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<ClinicService>(services[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(doctors[0]);

  // Default to tomorrow or today
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  // Departments list extracted from services
  const departments = ['All', 'Outpatient Care', 'Specialty Care', 'Pediatrics', 'Dermatology', 'Diagnostics'];

  const filteredServices = selectedDepartment === 'All'
    ? services
    : services.filter(s => s.department.toLowerCase().includes(selectedDepartment.toLowerCase()));

  // Available physicians filtered by department relevance
  const filteredDoctors = doctors.filter(d => {
    if (selectedService.department.includes('Pediatrics')) {
      return d.specialty.includes('Pediatrics');
    }
    if (selectedService.department.includes('Specialty Care') || selectedService.name.includes('Cardiology')) {
      return d.specialty.includes('Cardiovascular');
    }
    return true; // Dr. Thorne and generalists available for all
  });

  // Next 6 days options
  const upcomingDates = [
    { label: 'Today (Walk-In Slots)', dateStr: '2026-10-01', dayName: 'Thu' },
    { label: 'Tomorrow', dateStr: '2026-10-02', dayName: 'Fri' },
    { label: 'Saturday', dateStr: '2026-10-03', dayName: 'Sat' },
    { label: 'Next Monday', dateStr: '2026-10-05', dayName: 'Mon' },
    { label: 'Next Tuesday', dateStr: '2026-10-06', dayName: 'Tue' },
    { label: 'Next Wednesday', dateStr: '2026-10-07', dayName: 'Wed' },
  ];

  const morningSlots = [
    { time: '09:00 AM', traffic: 'Optimal Flow', waitEst: '5m wait' },
    { time: '09:30 AM', traffic: 'Optimal Flow', waitEst: '6m wait' },
    { time: '10:00 AM', traffic: 'Lowest Congestion', waitEst: '5m wait' },
    { time: '10:30 AM', traffic: 'Moderate Pace', waitEst: '10m wait' },
    { time: '11:15 AM', traffic: 'Moderate Pace', waitEst: '12m wait' },
  ];

  const afternoonSlots = [
    { time: '01:30 PM', traffic: 'Optimal Flow', waitEst: '7m wait' },
    { time: '02:15 PM', traffic: 'Lowest Congestion', waitEst: '5m wait' },
    { time: '03:00 PM', traffic: 'Optimal Flow', waitEst: '8m wait' },
    { time: '03:45 PM', traffic: 'Moderate Pace', waitEst: '12m wait' },
  ];

  const quickSymptoms = [
    'Periodic asthma review & inhaler refill',
    'Routine annual wellness exam',
    'Blood pressure check & medication follow-up',
    'Allergy skin rash assessment',
    'General fatigue & routine lab diagnostics',
  ];

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const created = bookNewAppointment({
        serviceId: selectedService.id,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason: reason.trim() || `${selectedService.name} - General consultation`,
      });
      setIsSubmitting(false);
      setConfirmedAppointment(created);
    }, 450);
  };

  const handleFinishAndNavigate = () => {
    const apt = confirmedAppointment;
    setStep(1);
    setConfirmedAppointment(null);
    setReason('');
    onClose();
    if (onSuccess && apt) {
      onSuccess(apt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {confirmedAppointment ? 'Booking Confirmed!' : 'Interactive Appointment Booking Wizard'}
            </h3>
            <p className="text-xs text-slate-500">
              {confirmedAppointment
                ? 'Your appointment has been added to your dashboard with a live countdown timer'
                : `Step ${step} of 4 · Real-time wait-time prediction`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmed State View */}
        {confirmedAppointment ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto flex-1">
            <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto border border-teal-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-teal-700 font-bold tracking-wider">
                Digital Booking Confirmation
              </span>
              <h2 className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
                {confirmedAppointment.bookingRef}
              </h2>
              <p className="text-xs text-slate-500">
                Synchronized instantly with the clinic queue and clinician calendar.
              </p>
            </div>

            {/* Appointment Recap Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-md mx-auto text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Department / Service</span>
                <span className="font-semibold text-slate-800 text-right">{confirmedAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Attending Physician</span>
                <span className="font-semibold text-slate-800">{confirmedAppointment.doctorName} ({confirmedAppointment.room})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Date & Slot</span>
                <span className="font-mono font-bold text-teal-800">{confirmedAppointment.date} at {confirmedAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Predicted Wait</span>
                <span className="font-mono font-semibold text-emerald-700">~{confirmedAppointment.estimatedWaitMinutes} minutes</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Reason</span>
                <span className="text-slate-700 italic truncate max-w-[220px]">{confirmedAppointment.reasonForVisit}</span>
              </div>
            </div>

            {/* Countdown Banner Highlight */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-900 max-w-md mx-auto flex items-center gap-2.5">
              <Timer className="w-5 h-5 text-teal-700 shrink-0" />
              <div className="text-left">
                <strong>Simulated Countdown Live:</strong> A real-time countdown timer has been activated on your dashboard for this visit.
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleFinishAndNavigate}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <span>View on Dashboard & Start Countdown</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Step Progress Bar */}
            <div className="grid grid-cols-4 border-b border-slate-100 text-xs shrink-0">
              {[
                { num: 1, label: 'Department' },
                { num: 2, label: 'Clinician' },
                { num: 3, label: 'Date & Time' },
                { num: 4, label: 'Reason' },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => s.num < step && setStep(s.num as any)}
                  disabled={s.num > step}
                  className={`py-2.5 text-center font-medium transition-colors ${
                    step === s.num
                      ? 'border-b-2 border-teal-600 text-teal-800 bg-teal-50/40 font-semibold'
                      : s.num < step
                      ? 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {s.num}. {s.label}
                </button>
              ))}
            </div>

            {/* Step 1: Department & Service Selection */}
            {step === 1 && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Filter by Clinical Department:
                  </label>
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSelectedDepartment(dept)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                          selectedDepartment === dept
                            ? 'bg-teal-600 text-white font-semibold shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs text-slate-500 font-medium">Available Clinical Services:</span>
                  <div className="space-y-2">
                    {filteredServices.map((srv) => {
                      const isSelected = selectedService.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-500/50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{srv.name}</span>
                              <span className="text-[10px] font-mono text-teal-800 bg-teal-100/60 px-1.5 py-0.5 rounded">
                                {srv.department}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 font-medium">
                              {srv.duration} mins
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {srv.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                            <span>Predicted wait: <strong className="text-emerald-700">{srv.avgWait}</strong></span>
                            <span aria-hidden="true">·</span>
                            <span>Indications: {srv.popularFor}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next: Select Physician</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Physician Selection */}
            {step === 2 && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Select Attending Clinician for {selectedService.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clinicians with active shifts and scheduled clinic hours
                  </p>
                </div>

                <div className="space-y-3">
                  {(filteredDoctors.length > 0 ? filteredDoctors : doctors).map((doc) => {
                    const isSelected = selectedDoctor.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-500/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-xs font-bold text-teal-800 shrink-0">
                              {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">{doc.name}</h5>
                              <p className="text-xs text-teal-700 font-medium">{doc.specialty}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{doc.qualification}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {doc.roomNumber}
                            </span>
                            <span className="block text-[10px] text-emerald-700 mt-1 font-medium">
                              On Duty Today
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => setStep(1)}
                    className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next: Choose Time Slot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Date & Available Time Slot */}
            {step === 3 && (
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Date Picker Buttons */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800">
                      1. Select Visit Date
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      St. Jude Outpatient Wing
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {upcomingDates.map((d) => (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(d.dateStr)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedDate === d.dateStr
                            ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs ring-1 ring-teal-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">
                          {d.dayName}
                        </div>
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {d.label}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 tabular-nums">
                          {d.dateStr}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800">
                      2. Choose Available Time Slot
                    </label>
                    <span className="text-[11px] text-teal-700 font-medium">
                      Wait times estimated by clinic algorithm
                    </span>
                  </div>

                  {/* Morning Slots */}
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Morning Sessions
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {morningSlots.map((slot) => {
                        const isSelected = selectedSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs ring-1 ring-teal-500'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <div className="text-xs font-mono font-bold tabular-nums">
                              {slot.time}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                              <span>⚡ {slot.waitEst}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Afternoon Sessions
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {afternoonSlots.map((slot) => {
                        const isSelected = selectedSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs ring-1 ring-teal-500'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <div className="text-xs font-mono font-bold tabular-nums">
                              {slot.time}
                            </div>
                            <div className="text-[10px] text-teal-700 font-medium mt-0.5 flex items-center gap-1">
                              <span>🌿 {slot.waitEst}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => setStep(2)}
                    className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next: Add Symptoms</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Reason & Symptoms Review */}
            {step === 4 && (
              <form onSubmit={handleCompleteBooking} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Summary Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-semibold text-slate-800">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Physician:</span>
                    <span className="font-semibold text-slate-800">{selectedDoctor.name} ({selectedDoctor.roomNumber})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Time:</span>
                    <span className="font-mono font-bold text-teal-800">{selectedDate} · {selectedSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Duration:</span>
                    <span className="font-semibold text-slate-800">{selectedService.duration} minutes</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Quick Reason Presets:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickSymptoms.map((sym, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReason(sym)}
                        className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 px-2.5 py-1 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Describe Symptoms / Clinical Concern:
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter any specific symptoms, duration, or questions for Dr. Thorne..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Providing symptom notes allows the nursing desk to prepare preliminary triage protocols.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Reserving Slot & Starting Timer...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Appointment & Activate Timer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
