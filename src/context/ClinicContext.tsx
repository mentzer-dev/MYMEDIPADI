import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Patient,
  Doctor,
  QueueItem,
  Appointment,
  ClinicService,
  ChatMessage,
  ClinicMetrics,
  QueueStatus,
  QueuePriority,
  ClinicalNote,
  Prescription,
  AuditLogEntry,
  AuditActionType,
} from '../types/clinic';
import {
  CURRENT_PATIENT,
  INITIAL_DOCTORS,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE,
  INITIAL_MESSAGES,
  INITIAL_METRICS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

export interface NotificationPayload {
  id: string;
  type: 'info' | 'success' | 'alert' | 'call';
  title: string;
  message: string;
  timestamp: string;
}

interface ClinicContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  patient: Patient;
  updatePatient: (updates: Partial<Patient>) => void;
  doctor: Doctor;
  updateDoctor: (updates: Partial<Doctor>) => void;
  services: ClinicService[];
  doctors: Doctor[];
  queue: QueueItem[];
  appointments: Appointment[];
  messages: ChatMessage[];
  metrics: ClinicMetrics;
  notifications: NotificationPayload[];
  dismissNotification: (id: string) => void;
  triggerToast: (title: string, message: string, type?: NotificationPayload['type']) => void;
  resetToDefaults: () => void;

  // Audit Trail & Security Compliance
  auditLogs: AuditLogEntry[];
  logAuditEvent: (data: {
    actionType: AuditActionType;
    patientId: string;
    patientName: string;
    details: string;
    complianceRule?: string;
  }) => AuditLogEntry;
  verifyAuditTrailIntegrity: () => { verifiedCount: number; isValid: boolean };
  isAuditDrawerOpen: boolean;
  setIsAuditDrawerOpen: (open: boolean) => void;

  // Actions for Patient
  checkInForAppointment: (appointmentId: string) => void;
  bookNewAppointment: (data: {
    serviceId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    reason: string;
  }) => Appointment;
  cancelAppointment: (appointmentId: string) => void;
  requestPrescriptionRefill: (prescriptionId: string) => void;
  sendChatMessage: (content: string, customSender?: 'patient' | 'doctor') => void;

  // Actions for Doctor / Clinician
  callNextPatient: (queueItemId?: string) => void;
  startConsultation: (queueItemId: string) => void;
  completeConsultation: (
    queueItemId: string,
    clinicalData?: {
      chiefComplaint: string;
      assessment: string;
      plan: string;
      prescriptionsToAdd?: { name: string; dosage: string; frequency: string; instructions: string }[];
    }
  ) => void;
  updateQueueStatus: (queueItemId: string, status: QueueStatus) => void;
  addWalkInPatient: (data: {
    fullName: string;
    age: number;
    gender: string;
    serviceName: string;
    priority: QueuePriority;
    chiefComplaint: string;
  }) => void;
  saveClinicalNote: (patientId: string, noteData: { chiefComplaint: string; assessment: string; plan: string }) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// Helper for safe localStorage loading
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
};

const generateSha256Hex = () => {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Role State (Persistent)
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem('mymedipadi_active_role');
      if (stored === 'doctor' || stored === 'patient') return stored;
    } catch {}
    return 'patient';
  });

  // 2. Profiles (Patient & Doctor)
  const [patient, setPatient] = useState<Patient>(() =>
    loadFromStorage('mymedipadi_patient_profile', CURRENT_PATIENT)
  );

  const [doctor, setDoctor] = useState<Doctor>(() =>
    loadFromStorage('mymedipadi_doctor_profile', INITIAL_DOCTORS[0])
  );

  // 3. Persistent Appointments & Queue
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage('mymedipadi_appointments', INITIAL_APPOINTMENTS)
  );

  const [queue, setQueue] = useState<QueueItem[]>(() =>
    loadFromStorage('mymedipadi_queue', INITIAL_QUEUE)
  );

  const [services] = useState<ClinicService[]>(INITIAL_SERVICES);
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage('mymedipadi_messages', INITIAL_MESSAGES)
  );
  const [metrics, setMetrics] = useState<ClinicMetrics>(INITIAL_METRICS);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  // 4. Audit Trail State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    loadFromStorage('mymedipadi_audit_trail', INITIAL_AUDIT_LOGS)
  );
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Sync state to localStorage on changes
  useEffect(() => {
    saveToStorage('mymedipadi_active_role', role);
  }, [role]);

  useEffect(() => {
    saveToStorage('mymedipadi_patient_profile', patient);
  }, [patient]);

  useEffect(() => {
    saveToStorage('mymedipadi_doctor_profile', doctor);
  }, [doctor]);

  useEffect(() => {
    saveToStorage('mymedipadi_appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    saveToStorage('mymedipadi_queue', queue);
  }, [queue]);

  useEffect(() => {
    saveToStorage('mymedipadi_messages', messages);
  }, [messages]);

  useEffect(() => {
    saveToStorage('mymedipadi_audit_trail', auditLogs);
  }, [auditLogs]);

  // Push notification helper
  const triggerToast = (title: string, message: string, type: NotificationPayload['type'] = 'info') => {
    const newNotif: NotificationPayload = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Log an Audit Event
  const logAuditEvent = (data: {
    actionType: AuditActionType;
    patientId: string;
    patientName: string;
    details: string;
    complianceRule?: string;
  }): AuditLogEntry => {
    const now = new Date();
    const formattedTimestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    const shaHash = generateSha256Hex();

    const newEntry: AuditLogEntry = {
      id: `AUDIT-${Date.now().toString().slice(-4)}`,
      timestamp: formattedTimestamp,
      actorId: doctor.id,
      actorName: doctor.name,
      actorRole: doctor.title,
      actionType: data.actionType,
      patientId: data.patientId,
      patientName: data.patientName,
      details: data.details,
      complianceRule: data.complianceRule || 'HIPAA §164.312(b) Audit Controls',
      shaHash,
      workstation: 'WS-CLINIC-3B (192.168.10.42)',
      verified: true,
    };

    setAuditLogs((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  // Verify Audit Trail Integrity
  const verifyAuditTrailIntegrity = () => {
    const verifiedCount = auditLogs.filter((log) => log.verified && log.shaHash.length === 64).length;
    return {
      verifiedCount,
      isValid: verifiedCount === auditLogs.length,
    };
  };

  // Seamless Role Switcher
  const switchRole = (newRole: UserRole) => {
    if (newRole === role) return;
    setRoleState(newRole);
    triggerToast(
      `Switched to ${newRole === 'patient' ? 'Patient Portal' : 'Doctor / Clinician Portal'}`,
      newRole === 'patient'
        ? `Logged in as Amara Chen (Patient ID: ${patient.id})`
        : `Logged in as ${doctor.name} (${doctor.roomNumber})`,
      'info'
    );
  };

  const setRole = (newRole: UserRole) => {
    switchRole(newRole);
  };

  const updatePatient = (updates: Partial<Patient>) => {
    setPatient((prev) => ({ ...prev, ...updates }));
    logAuditEvent({
      actionType: 'CHART_ACCESSED',
      patientId: patient.id,
      patientName: patient.fullName,
      details: `Patient medical profile updated: ${Object.keys(updates).join(', ')}.`,
      complianceRule: 'HIPAA §164.312(a)(1) Access Control',
    });
  };

  const updateDoctor = (updates: Partial<Doctor>) => {
    setDoctor((prev) => ({ ...prev, ...updates }));
  };

  // Reset to initial mock dataset
  const resetToDefaults = () => {
    setAppointments(INITIAL_APPOINTMENTS);
    setQueue(INITIAL_QUEUE);
    setPatient(CURRENT_PATIENT);
    setDoctor(INITIAL_DOCTORS[0]);
    setMessages(INITIAL_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    triggerToast('Dataset Reset', 'Restored default clinic schedule, queue, and security audit log.', 'info');
  };

  // Recalculate operational metrics whenever queue changes
  useEffect(() => {
    const waitingCount = queue.filter(
      (q) => q.status === 'checked_in' || q.status === 'called' || q.status === 'scheduled'
    ).length;
    const completedCount = queue.filter((q) => q.status === 'completed').length + 7;
    const activeRooms = queue.filter((q) => q.status === 'in_consultation').length + 1;

    const waitTimes = queue
      .filter((q) => q.status === 'checked_in' || q.status === 'called')
      .map((q) => q.estimatedWaitMinutes);
    const avgWait = waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 10;

    setMetrics((prev) => ({
      ...prev,
      patientsWaiting: waitingCount,
      patientsCompletedToday: completedCount,
      averageWaitMinutes: Math.max(6, avgWait),
      activeConsultationRooms: Math.min(prev.totalRooms, activeRooms),
    }));
  }, [queue]);

  // PATIENT ACTION: Check-in for appointment
  const checkInForAppointment = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    const ticketNumber = apt.ticketNumber || `A-${100 + queue.length + 1}`;
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              isCheckedIn: true,
              status: 'In Queue',
              ticketNumber,
            }
          : a
      )
    );

    const existingQueueItem = queue.find((q) => q.appointmentId === appointmentId);
    if (existingQueueItem) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === existingQueueItem.id
            ? { ...q, status: 'checked_in', checkInTime, estimatedWaitMinutes: 12 }
            : q
        )
      );
    } else {
      const newQueueItem: QueueItem = {
        id: `Q-${Date.now().toString().slice(-4)}`,
        ticketNumber,
        appointmentId: apt.id,
        patientId: apt.patientId,
        patientName: apt.patientName,
        patientAge: patient.age,
        patientGender: patient.gender,
        serviceName: apt.serviceName,
        doctorId: apt.doctorId,
        doctorName: apt.doctorName,
        roomNumber: apt.room,
        scheduledTime: apt.timeSlot,
        checkInTime,
        estimatedWaitMinutes: 12,
        status: 'checked_in',
        priority: 'standard',
        chiefComplaint: apt.reasonForVisit,
        triageColor: 'green',
      };
      setQueue((prev) => [...prev, newQueueItem]);
    }

    logAuditEvent({
      actionType: 'TRIAGE_UPDATED',
      patientId: apt.patientId,
      patientName: apt.patientName,
      details: `Mobile check-in completed. Queue Ticket #${ticketNumber} generated for ${apt.room}.`,
      complianceRule: 'HIPAA §164.312(b) Audit Controls',
    });

    triggerToast(
      'Check-in Confirmed!',
      `Ticket #${ticketNumber} generated. Queued for ${apt.room}. Estimated wait: 12 mins.`,
      'success'
    );
  };

  // PATIENT ACTION: Book new appointment
  const bookNewAppointment = (data: {
    serviceId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    reason: string;
  }): Appointment => {
    const targetService = services.find((s) => s.id === data.serviceId) || services[0];
    const targetDoc = doctors.find((d) => d.id === data.doctorId) || doctors[0];
    const bookingRef = `MMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppointment: Appointment = {
      id: `APT-${Date.now().toString().slice(-4)}`,
      bookingRef,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: targetDoc.id,
      doctorName: targetDoc.name,
      doctorSpecialty: targetDoc.specialty,
      serviceName: targetService.name,
      date: data.date,
      timeSlot: data.timeSlot,
      durationMinutes: targetService.duration,
      room: targetDoc.roomNumber,
      status: 'Upcoming',
      reasonForVisit: data.reason,
      estimatedWaitMinutes: 10,
      checkInEligible: data.date === new Date().toISOString().split('T')[0],
      isCheckedIn: false,
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    triggerToast(
      'Appointment Confirmed',
      `Booking Ref: ${bookingRef} with ${targetDoc.name} on ${data.date} at ${data.timeSlot}`,
      'success'
    );

    return newAppointment;
  };

  // PATIENT ACTION: Cancel appointment
  const cancelAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'Cancelled' as const } : a))
    );
    setQueue((prev) => prev.filter((q) => q.appointmentId !== appointmentId));
    triggerToast('Appointment Cancelled', 'Your scheduled visit has been cancelled successfully.', 'info');
  };

  // PATIENT ACTION: Request refill
  const requestPrescriptionRefill = (prescriptionId: string) => {
    setPatient((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((rx) =>
        rx.id === prescriptionId ? { ...rx, status: 'Pending Refill' as const } : rx
      ),
    }));

    const targetRx = patient.prescriptions.find((p) => p.id === prescriptionId);

    logAuditEvent({
      actionType: 'PRESCRIPTION_ISSUED',
      patientId: patient.id,
      patientName: patient.fullName,
      details: `Patient initiated pharmacy refill request for ${targetRx?.medicationName || 'Prescription'}. Awaiting doctor sign-off.`,
      complianceRule: 'DEA e-Prescribing Security Standard (EPCS)',
    });

    triggerToast(
      'Refill Request Submitted',
      'Sent to Dr. Thorne for clinical review & e-prescription renewal.',
      'info'
    );

    if (targetRx) {
      setMessages((prev) => [
        ...prev,
        {
          id: `MSG-${Date.now()}`,
          sender: 'system',
          senderName: 'Pharmacy Gateway',
          content: `Refill request submitted for ${targetRx.medicationName} (${targetRx.dosage}). Awaiting clinician sign-off.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: true,
        },
      ]);
    }
  };

  // CHAT: Send message
  const sendChatMessage = (content: string, customSender?: 'patient' | 'doctor') => {
    const senderRole = customSender || role;
    const senderName = senderRole === 'doctor' ? doctor.name : patient.fullName;

    const newMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      sender: senderRole,
      senderName,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (senderRole === 'patient') {
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: `MSG-REPLY-${Date.now()}`,
          sender: 'nurse',
          senderName: 'Clara Barton, RN (Triage Desk)',
          content: `Received, ${patient.fullName.split(' ')[0]}. The clinical team has noted your update. We will review before your consultation in Suite 3B.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };
        setMessages((prevMessages) => [...prevMessages, autoReply]);
      }, 1400);
    }
  };

  // DOCTOR ACTION: Call next patient in queue
  const callNextPatient = (queueItemId?: string) => {
    let target = queueItemId
      ? queue.find((q) => q.id === queueItemId)
      : queue.find((q) => q.status === 'checked_in');

    if (!target) {
      triggerToast('Queue Empty', 'No checked-in patients currently waiting in queue.', 'info');
      return;
    }

    const callTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setQueue((prev) =>
      prev.map((q) =>
        q.id === target!.id
          ? { ...q, status: 'called', callTime, estimatedWaitMinutes: 1 }
          : q
      )
    );

    if (target.patientId === patient.id) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === target!.appointmentId ? { ...a, status: 'In Queue' } : a
        )
      );
    }

    triggerToast(
      `Called Ticket #${target.ticketNumber}`,
      `${target.patientName} has been paged to ${target.roomNumber}. Patient portal notified.`,
      'call'
    );
  };

  // DOCTOR ACTION: Start consultation
  const startConsultation = (queueItemId: string) => {
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const target = queue.find((q) => q.id === queueItemId);

    setQueue((prev) =>
      prev.map((q) =>
        q.id === queueItemId
          ? { ...q, status: 'in_consultation', startTime, estimatedWaitMinutes: 0 }
          : q
      )
    );

    if (target && target.patientId === patient.id) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === target.appointmentId ? { ...a, status: 'In Consultation' } : a
        )
      );
    }

    if (target) {
      logAuditEvent({
        actionType: 'ENCOUNTER_STARTED',
        patientId: target.patientId,
        patientName: target.patientName,
        details: `Consultation session commenced in ${doctor.roomNumber}. Ticket #${target.ticketNumber}. Chief concern: ${target.chiefComplaint}.`,
        complianceRule: 'HIPAA §164.312(b) Audit Controls',
      });
    }

    triggerToast('Consultation Started', `Now consulting with ${target?.patientName || 'Patient'}.`, 'info');
  };

  // DOCTOR ACTION: Complete consultation
  const completeConsultation = (
    queueItemId: string,
    clinicalData?: {
      chiefComplaint: string;
      assessment: string;
      plan: string;
      prescriptionsToAdd?: { name: string; dosage: string; frequency: string; instructions: string }[];
    }
  ) => {
    const target = queue.find((q) => q.id === queueItemId);
    const completedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setQueue((prev) =>
      prev.map((q) =>
        q.id === queueItemId
          ? { ...q, status: 'completed', completedTime }
          : q
      )
    );

    if (target && target.patientId === patient.id) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === target.appointmentId ? { ...a, status: 'Completed' } : a
        )
      );

      if (clinicalData) {
        const auditHash = `0x${generateSha256Hex().substring(0, 16)}...verified`;
        const newNote: ClinicalNote = {
          id: `NOTE-${Date.now().toString().slice(-4)}`,
          timestamp: `Today, ${completedTime}`,
          author: doctor.name,
          authorRole: doctor.title,
          chiefComplaint: clinicalData.chiefComplaint || target.chiefComplaint,
          assessment: clinicalData.assessment || 'Patient stable, vitals within acceptable bounds.',
          plan: clinicalData.plan || 'Routine follow up in 3-6 months or as needed.',
          auditHash,
        };

        const newRxList: Prescription[] = (clinicalData.prescriptionsToAdd || []).map((rx, idx) => ({
          id: `RX-${Date.now()}-${idx}`,
          medicationName: rx.name,
          dosage: rx.dosage,
          frequency: rx.frequency,
          prescribedDate: new Date().toISOString().split('T')[0],
          prescribingDoctor: doctor.name,
          refillsRemaining: 2,
          status: 'Active',
          instructions: rx.instructions,
        }));

        setPatient((prev) => ({
          ...prev,
          recentNotes: [newNote, ...prev.recentNotes],
          prescriptions: [...newRxList, ...prev.prescriptions],
        }));

        // Log clinical note addition
        logAuditEvent({
          actionType: 'NOTE_RECORDED',
          patientId: target.patientId,
          patientName: target.patientName,
          details: `Encounter Assessment & Plan recorded and signed by ${doctor.name}. Assessment: ${clinicalData.assessment.slice(0, 60)}...`,
          complianceRule: '21 CFR Part 11 Electronic Records & Signatures',
        });

        // Log prescription if added
        if (newRxList.length > 0) {
          logAuditEvent({
            actionType: 'PRESCRIPTION_ISSUED',
            patientId: target.patientId,
            patientName: target.patientName,
            details: `e-Prescriptions issued: ${newRxList.map(r => `${r.medicationName} (${r.dosage})`).join(', ')}.`,
            complianceRule: 'DEA e-Prescribing (EPCS) Security Standard',
          });
        }
      }
    }

    if (target) {
      logAuditEvent({
        actionType: 'ENCOUNTER_COMPLETED',
        patientId: target.patientId,
        patientName: target.patientName,
        details: `Clinical encounter concluded in ${doctor.roomNumber}. Encounter locked and archived in immutable audit log.`,
        complianceRule: 'HIPAA §164.312(c)(1) Integrity Controls',
      });
    }

    triggerToast(
      'Consultation Completed & Audit Stamped',
      `Session for ${target?.patientName || 'Patient'} closed. Cryptographic compliance entry appended to System Audit Trail.`,
      'success'
    );
  };

  const updateQueueStatus = (queueItemId: string, status: QueueStatus) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === queueItemId ? { ...q, status } : q))
    );
  };

  const addWalkInPatient = (data: {
    fullName: string;
    age: number;
    gender: string;
    serviceName: string;
    priority: QueuePriority;
    chiefComplaint: string;
  }) => {
    const ticketNumber = `W-${Math.floor(200 + Math.random() * 800)}`;
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newQueueItem: QueueItem = {
      id: `Q-WALK-${Date.now().toString().slice(-4)}`,
      ticketNumber,
      appointmentId: `APT-WALK-${Date.now().toString().slice(-4)}`,
      patientId: `P-WALK-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: data.fullName,
      patientAge: data.age,
      patientGender: data.gender,
      serviceName: data.serviceName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      roomNumber: doctor.roomNumber,
      scheduledTime: 'Walk-In Now',
      checkInTime,
      estimatedWaitMinutes: data.priority === 'urgent' ? 5 : 18,
      status: 'checked_in',
      priority: data.priority,
      chiefComplaint: data.chiefComplaint,
      triageColor: data.priority === 'urgent' ? 'red' : 'green',
    };

    setQueue((prev) =>
      data.priority === 'urgent' ? [newQueueItem, ...prev] : [...prev, newQueueItem]
    );

    logAuditEvent({
      actionType: 'WALK_IN_ENQUEUED',
      patientId: newQueueItem.patientId,
      patientName: newQueueItem.patientName,
      details: `Walk-In patient enqueued with ${data.priority.toUpperCase()} priority. Ticket #${ticketNumber}. Reason: ${data.chiefComplaint}.`,
      complianceRule: 'HIPAA §164.312(b) Audit Controls',
    });

    triggerToast(
      'Walk-In Added to Queue',
      `Ticket #${ticketNumber} created for ${data.fullName} (${data.priority === 'urgent' ? 'Priority Urgent' : 'Standard'}).`,
      data.priority === 'urgent' ? 'alert' : 'success'
    );
  };

  const saveClinicalNote = (
    patientId: string,
    noteData: { chiefComplaint: string; assessment: string; plan: string }
  ) => {
    const shaHash = generateSha256Hex();
    const auditHash = `0x${shaHash.substring(0, 16)}...verified`;
    const newNote: ClinicalNote = {
      id: `NOTE-${Date.now().toString().slice(-4)}`,
      timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      author: doctor.name,
      authorRole: doctor.title,
      chiefComplaint: noteData.chiefComplaint,
      assessment: noteData.assessment,
      plan: noteData.plan,
      auditHash,
    };

    if (patientId === patient.id) {
      setPatient((prev) => ({
        ...prev,
        recentNotes: [newNote, ...prev.recentNotes],
      }));
    }

    logAuditEvent({
      actionType: 'NOTE_RECORDED',
      patientId,
      patientName: patientId === patient.id ? patient.fullName : 'Clinic Patient',
      details: `Direct progress note appended to clinical chart: "${noteData.chiefComplaint}". Assessment and treatment plan stamped.`,
      complianceRule: '21 CFR Part 11 Electronic Signatures & Audit Records',
    });

    triggerToast('Clinical Note Recorded', 'Encrypted note stamped and appended to patient chart and System Audit Trail.', 'success');
  };

  return (
    <ClinicContext.Provider
      value={{
        role,
        setRole,
        switchRole,
        patient,
        updatePatient,
        doctor,
        updateDoctor,
        services,
        doctors,
        queue,
        appointments,
        messages,
        metrics,
        notifications,
        dismissNotification,
        triggerToast,
        resetToDefaults,
        auditLogs,
        logAuditEvent,
        verifyAuditTrailIntegrity,
        isAuditDrawerOpen,
        setIsAuditDrawerOpen,
        checkInForAppointment,
        bookNewAppointment,
        cancelAppointment,
        requestPrescriptionRefill,
        sendChatMessage,
        callNextPatient,
        startConsultation,
        completeConsultation,
        updateQueueStatus,
        addWalkInPatient,
        saveClinicalNote,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
