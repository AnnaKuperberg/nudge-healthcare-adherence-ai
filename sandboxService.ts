
import { PatientState, NudgeStrategy } from "./types";

const NURSE_DATA = {
  'Nurse Elena': { name: 'Nurse Elena', specialty: 'Senior Infusion RN', personalNote: 'Focuses on meticulous monitoring and patient comfort.' },
  'Nurse David': { name: 'Nurse David', specialty: 'Clinical Operations Lead', personalNote: 'Specializes in vascular access and care coordination.' },
  'Nurse Sarah': { name: 'Nurse Sarah', specialty: 'Gastroenterology RN', personalNote: 'Passionate about patient education and long-term adherence.' }
};

const SYNTHETIC_SANDBOX_PATIENTS: PatientState[] = [
  { 
    id: 'sarah-j', 
    name: 'Sarah Jennings', 
    nextScheduledDate: '2025-10-21', 
    lastInfusionDate: '2025-09-12', 
    transportStatus: 'unconfirmed', 
    cycleWeeks: 6, 
    isConfirmed: false, 
    isCanceled: false, 
    adherenceRate: 98, 
    onTimeStreak: 12, 
    totalInfusions: 12, 
    nurseName: 'Nurse Elena', 
    nurseProfile: NURSE_DATA['Nurse Elena'], 
    activeStrategy: 'positive_framing', 
    notes: [{ id: '1', text: 'Software Architect. Highly responsive to data-driven nudges.', timestamp: '2025-09-12', author: 'Nurse David' }] 
  },
  { 
    id: 'marcus-t', 
    name: 'Marcus Thorne', 
    nextScheduledDate: '2025-10-22', 
    lastInfusionDate: '2025-09-01', 
    transportStatus: 'unconfirmed', 
    cycleWeeks: 8, 
    isConfirmed: false, 
    isCanceled: false, 
    adherenceRate: 65, 
    onTimeStreak: 1, 
    totalInfusions: 24, 
    nurseName: 'Nurse David', 
    nurseProfile: NURSE_DATA['Nurse David'], 
    activeStrategy: 'loss_aversion', 
    notes: [{ id: '2', text: 'Rural patient (Brenham). Clinical risk high if 8-week window is missed.', timestamp: '2025-09-01', author: 'Nurse Elena' }], 
    assistanceRequested: { transport: true } 
  },
  { 
    id: 'evelyn-m', 
    name: 'Evelyn Moore', 
    nextScheduledDate: '2025-10-23', 
    lastInfusionDate: '2025-09-10', 
    transportStatus: 'unconfirmed', 
    cycleWeeks: 6, 
    isConfirmed: true, 
    isCanceled: false, 
    adherenceRate: 88, 
    onTimeStreak: 4, 
    totalInfusions: 40, 
    nurseName: 'Nurse David', 
    nurseProfile: NURSE_DATA['Nurse David'], 
    activeStrategy: 'accountability_focus', 
    notes: [{ id: '3', text: 'History teacher. Relies heavily on nurse relationship for care continuity.', timestamp: '2025-09-10', author: 'Nurse Sarah' }] 
  },
  { 
    id: 'james-m', 
    name: 'James Miller', 
    nextScheduledDate: '2025-10-24', 
    lastInfusionDate: '2025-08-30', 
    transportStatus: 'unconfirmed', 
    cycleWeeks: 8, 
    isConfirmed: false, 
    isCanceled: true, 
    adherenceRate: 42, 
    onTimeStreak: 0, 
    totalInfusions: 4, 
    nurseName: 'Nurse Sarah', 
    nurseProfile: NURSE_DATA['Nurse Sarah'], 
    activeStrategy: 'social_proof', 
    notes: [{ id: '4', text: 'UT Student. Low adherence due to academic schedule conflicts.', timestamp: '2025-08-30', author: 'Nurse Elena' }] 
  }
];

export async function fetchSandboxPatients(): Promise<PatientState[]> {
  // Simulate network latency for FHIR API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(SYNTHETIC_SANDBOX_PATIENTS);
    }, 2000);
  });
}

export async function syncPatientToSandbox(patient: PatientState): Promise<boolean> {
  // Simulate POST/PUT to EHR
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[EHR SYNC] Patient ${patient.id} updated in sandbox.`);
      resolve(true);
    }, 800);
  });
}
