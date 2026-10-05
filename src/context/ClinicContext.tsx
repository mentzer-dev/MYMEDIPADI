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
  AuditActorType,
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
    actor?: {
      id: string;
      name: string;
      role: string;
      type?: AuditActorType;
    };
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

const sha256Hex = (value: string): string => {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const bytes = new TextEncoder().encode(value);
  const bitLength = bytes.length * 8;
  const padded = new Uint8Array(bytes.length + 1 + 64);
  padded.set(bytes, 0);
  padded[bytes.length] = 0x80;

  const totalLength = padded.length;
  const lengthBytes = new Uint8Array(8);
  const view = new DataView(lengthBytes.buffer);
  view.setUint32(0, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(4, bitLength >>> 0, false);

  let offset = bytes.length + 1;
  while ((padded.length - offset) % 64 !== 56) {
    padded[offset] = 0;
    offset += 1;
  }
  padded.set(lengthBytes, totalLength - 8);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  const ch = (x: number, y: number, z: number) => (x & y) ^ (~x & z);
  const maj = (x: number, y: number, z: number) => (x & y) ^ (x & z) ^ (y & z);
  const sigma0 = (x: number) => rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  const sigma1 = (x: number) => rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  const gamma0 = (x: number) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
  const gamma1 = (x: number) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);

  for (let chunkStart = 0; chunkStart < padded.length; chunkStart += 64) {
    const w = new Array<number>(64).fill(0);
    for (let i = 0; i < 16; i++) {
      const index = chunkStart + i * 4;
      w[i] = (
        (padded[index] << 24) |
        (padded[index + 1] << 16) |
        (padded[index + 2] << 8) |
        padded[index + 3]
      ) >>> 0;
    }

    for (let i = 16; i < 64; i++) {
      w[i] = (gamma1(w[i - 2]) + w[i - 7] + gamma0(w[i - 15]) + w[i - 16]) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const t1 = (h + sigma1(e) + ch(e, f, g) + K[i] + w[i]) >>> 0;
      const t2 = (sigma0(a) + maj(a, b, c)) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((value) => value.toString(16).padStart(8, '0'))
    .join('');
};

const generateSha256Hex = (value?: string) => sha256Hex(value ?? `${Date.now()}-mymedipadi-audit`);

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
    actor?: {
      id: string;
      name: string;
      role: string;
      type?: AuditActorType;
    };
  }): AuditLogEntry => {
    const now = new Date();
    const formattedTimestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    const actor = data.actor ?? {
      id: doctor.id,
      name: doctor.name,
      role: doctor.title,
      type: 'doctor' as const,
    };

    const baseEntry = {
      id: `AUDIT-${Date.now().toString().slice(-4)}`,
      timestamp: formattedTimestamp,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actorType: actor.type ?? 'system',
      actionType: data.actionType,
      patientId: data.patientId,
      patientName: data.patientName,
      details: data.details,
      complianceRule: data.complianceRule || 'HIPAA §164.312(b) Audit Controls',
      workstation: 'WS-CLINIC-3B (192.168.10.42)',
      verified: true,
    };

    const newEntry: AuditLogEntry = {
      ...baseEntry,
      shaHash: sha256Hex(JSON.stringify(baseEntry)),
    };

    setAuditLogs((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  // Verify Audit Trail Integrity
  const verifyAuditTrailIntegrity = () => {
    const verifiedCount = auditLogs.filter((log) => {
      const expectedHash = sha256Hex(JSON.stringify({
        id: log.id,
        timestamp: log.timestamp,
        actorId: log.actorId,
        actorName: log.actorName,
        actorRole: log.actorRole,
        actorType: log.actorType,
        actionType: log.actionType,
        patientId: log.patientId,
        patientName: log.patientName,
        details: log.details,
        complianceRule: log.complianceRule,
        workstation: log.workstation,
        verified: log.verified,
      }));

      return log.verified && log.shaHash.length === 64 && log.shaHash === expectedHash;
    }).length;

    return {
      verifiedCount,
      isValid: auditLogs.length > 0 && verifiedCount === auditLogs.length,
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
      actor: {
        id: doctor.id,
        name: doctor.name,
        role: doctor.title,
        type: 'doctor',
      },
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
      actor: {
        id: patient.id,
        name: patient.fullName,
        role: 'Patient',
        type: 'patient',
      },
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
      actor: {
        id: patient.id,
        name: patient.fullName,
        role: 'Patient',
        type: 'patient',
      },
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
        actor: {
          id: doctor.id,
          name: doctor.name,
          role: doctor.title,
          type: 'doctor',
        },
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
        const auditHash = `0x${generateSha256Hex(JSON.stringify({
          patientId: target.patientId,
          completedTime,
          chiefComplaint: clinicalData.chiefComplaint || target.chiefComplaint,
          assessment: clinicalData.assessment,
          plan: clinicalData.plan,
        })).substring(0, 16)}...verified`;
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
          actor: {
            id: doctor.id,
            name: doctor.name,
            role: doctor.title,
            type: 'doctor',
          },
        });

        // Log prescription if added
        if (newRxList.length > 0) {
          logAuditEvent({
            actionType: 'PRESCRIPTION_ISSUED',
            patientId: target.patientId,
            patientName: target.patientName,
            details: `e-Prescriptions issued: ${newRxList.map(r => `${r.medicationName} (${r.dosage})`).join(', ')}.`,
            complianceRule: 'DEA e-Prescribing (EPCS) Security Standard',
            actor: {
              id: doctor.id,
              name: doctor.name,
              role: doctor.title,
              type: 'doctor',
            },
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
        actor: {
          id: doctor.id,
          name: doctor.name,
          role: doctor.title,
          type: 'doctor',
        },
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
      actor: {
        id: doctor.id,
        name: doctor.name,
        role: doctor.title,
        type: 'doctor',
      },
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
    const shaHash = generateSha256Hex(JSON.stringify({
      patientId,
      noteData,
      timestamp: new Date().toISOString(),
      author: doctor.name,
    }));
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
      actor: {
        id: doctor.id,
        name: doctor.name,
        role: doctor.title,
        type: 'doctor',
      },
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


































































































































































































































































































































