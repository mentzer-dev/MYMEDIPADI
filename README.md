**MYMEDIPADI**
> A healthtech workflow optimization platform designed to reduce outpatient wait times, eliminate missed appointments, and streamline clinical operations through automated tracking and dual-sided portal management.

---

##  Overview
**MyMediPadi** is an interactive, dual-sided frontend prototype built to solve a major friction point in clinical settings: disorganized scheduling and prolonged patient wait times. The platform bridges the gap between patients and clinicians, providing a seamless workflow from appointment booking to real-time queue triage and security audit logging.

##  KEY FEATURES

### 👤 Patient Portal
* **Frictionless Booking Wizard:** Select clinical services, choose available time slots, and receive instant booking confirmation.
* **Active Status Dashboards:** Real-time countdown timers and status badges (e.g., "Confirmed", "In Queue") tracking upcoming visits.
* **Record Summaries:** Quick-view interface for reviewing past appointments and medical notes.

### 🩺 Doctor / Clinician Portal
* **Live Queue Manager:** A real-time triage dashboard tracking checked-in patients and dynamic wait times.
* **Interactive State Transitions:** Instantly update patient statuses (e.g., *Check In* ➔ *In Consultation* ➔ *Completed*) to keep the clinical flow moving.
* **Clinical Record Quick-View:** Clean data layouts to review history and append session notes with built-in audit logging.

### 🔒 Core Architecture & Reliability
* **Role-Based Toggle:** Seamlessly switch between Patient and Clinician perspectives within a unified layout.
* **Persistent State:** Synchronized with local browser storage (`localStorage`) so test data, queue updates, and bookings persist across page refreshes.
* **Audit Trail Simulation:** Automatic tracking of system modifications to ensure security compliance and transparency.

---

## 🛠️ Tech Stack
* **Frontend:** React, Tailwind CSS
* **State Management:** React Hooks & LocalStorage synchronization

---

## 📦 Getting Started Locally

If you want to run or inspect the code locally:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/mentzer-dev/MYMEDIPADI.git](https://github.com/mentzer-dev/MYMEDIPADI.git)
