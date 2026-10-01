import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { LiveQueueCard } from './LiveQueueCard';
import { UpcomingAppointments } from './UpcomingAppointments';
import { SecureMessaging } from './SecureMessaging';
import { MedicalRecordsView } from './MedicalRecordsView';
import { AppointmentBookingModal } from './AppointmentBookingModal';
import { NextVisitCountdown } from './NextVisitCountdown';
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Activity,
  Plus,
  ArrowRight,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { Appointment } from '../../types/clinic';

interface PatientDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ activeTab, setActiveTab }) => {
  const { patient, appointments, checkInForAppointment } = useClinic();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [highlightedAptId, setHighlightedAptId] = useState<string | null>(null);

  // Find next upcoming appointment for countdown timer
  const upcomingApts = appointments.filter(
    (a) =>
      a.patientId === patient.id &&
      (a.status === 'Upcoming' || a.status === 'In Queue' || a.status === 'In Consultation')
  );

  // The primary next appointment for the timer
  const nextAppointment = upcomingApts.length > 0 ? upcomingApts[0] : null;

  const handleBookingSuccess = (created: Appointment) => {
    setHighlightedAptId(created.id);
    setActiveTab('overview');

    setTimeout(() => {
      const el = document.getElementById(`appointment-${created.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 180);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Patient Greeting & Fast-Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Patient Portal</span>
            <span aria-hidden="true">·</span>
            <span>St. Jude Health Centre</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">Wait Time Status: Normal Flow</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {patient.fullName}
          </h1>
        </div>

        <button
          onClick={() => setIsBookingOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Real-Time Simulated Countdown Timer Widget */}
      <NextVisitCountdown
        appointment={nextAppointment}
        onCheckIn={checkInForAppointment}
        onBookClick={() => setIsBookingOpen(true)}
      />

      {/* Primary Hero Widget: Live Active Visit & Queue Status */}
      <LiveQueueCard onBookClick={() => setIsBookingOpen(true)} />

      {/* Conditional View or Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UpcomingAppointments
              onBookClick={() => setIsBookingOpen(true)}
              highlightedAptId={highlightedAptId}
            />
            <MedicalRecordsView />
          </div>

          <div className="space-y-6">
            <SecureMessaging />
          </div>
        </div>
      )}

      {activeTab === 'book' && (
        <div className="space-y-6">
          <UpcomingAppointments
            onBookClick={() => setIsBookingOpen(true)}
            highlightedAptId={highlightedAptId}
          />
        </div>
      )}

      {activeTab === 'records' && (
        <MedicalRecordsView />
      )}

      {activeTab === 'messages' && (
        <SecureMessaging />
      )}

      {/* Interactive Booking Wizard Modal */}
      <AppointmentBookingModal
        isOpen={isBookingOpen || activeTab === 'book'}
        onClose={() => {
          setIsBookingOpen(false);
          if (activeTab === 'book') setActiveTab('overview');
        }}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};
