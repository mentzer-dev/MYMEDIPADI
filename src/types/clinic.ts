export type UserRole = 'patient' | 'doctor';

export interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number; // in Fahrenheit
  oxygenSat: number; // percentage
  respiratoryRate: number;
  weightKg: number;
  lastRecordedTime: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  prescribingDoctor: string;
  refillsRemaining: number;
  status: 'Active' | 'Completed' | 'Pending Refill';
  instructions: string;
}

export interface ClinicalNote {
  id: string;
  timestamp: string;
  author: string;
  authorRole: string;
  chiefComplaint: string;
  assessment: string;
  plan: string;
  auditHash: string;
}

export interface Patient {
  id: string;
  fullName: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  vitals: VitalSigns;
  insuranceId: string;
  insuranceProvider: string;
  recentNotes: ClinicalNote[];
  prescriptions: Prescription[];
}

export type QueueStatus = 'scheduled' | 'checked_in' | 'called' | 'in_consultation' | 'completed' | 'cancelled';
export type QueuePriority = 'standard' | 'urgent';

export interface QueueItem {
  id: string;
  ticketNumber: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  serviceName: string;
  doctorId: string;
  doctorName: string;
  roomNumber: string;
  scheduledTime: string;
  checkInTime?: string;
  callTime?: string;
  startTime?: string;
  completedTime?: string;
  estimatedWaitMinutes: number;
  status: QueueStatus;
  priority: QueuePriority;
  chiefComplaint: string;
  triageColor: 'green' | 'amber' | 'red';
}

export interface Appointment {
  id: string;
  bookingRef: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  room: string;
  status: 'Upcoming' | 'In Queue' | 'In Consultation' | 'Completed' | 'Cancelled';
  reasonForVisit: string;
  notes?: string;
  estimatedWaitMinutes: number;
  checkInEligible: boolean;
  isCheckedIn: boolean;
  ticketNumber?: string;
}

export interface ClinicService {
  id: string;
  name: string;
  department: string;
  duration: number; // minutes
  description: string;
  avgWait: string;
  popularFor: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  qualification: string;
  licenseNumber: string;
  department: string;
  roomNumber: string;
  email: string;
  phone: string;
  shiftHours: string;
  availabilityToday: string[];
  totalSeenToday: number;
  onDuty: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor' | 'nurse' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ClinicMetrics {
  averageWaitMinutes: number;
  targetWaitMinutes: number;
  historicalBaselineMinutes: number;
  patientsWaiting: number;
  patientsCompletedToday: number;
  onTimeRatePercentage: number;
  activeConsultationRooms: number;
  totalRooms: number;
}

export type AuditActionType =
  | 'ENCOUNTER_STARTED'
  | 'ENCOUNTER_COMPLETED'
  | 'NOTE_RECORDED'
  | 'PRESCRIPTION_ISSUED'
  | 'CHART_ACCESSED'
  | 'TRIAGE_UPDATED'
  | 'WALK_IN_ENQUEUED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actionType: AuditActionType;
  patientId: string;
  patientName: string;
  details: string;
  complianceRule: string;
  shaHash: string;
  workstation: string;
  verified: boolean;
}

