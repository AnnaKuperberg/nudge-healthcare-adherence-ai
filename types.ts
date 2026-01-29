
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
  ASSISTANT = 'assistant'
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
  isEscalated?: boolean;
  showFeedback?: boolean;
  feedbackGiven?: 'positive' | 'negative' | null;
}

export interface ClinicalNote {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

/**
 * Added 'positive_framing' to the NudgeStrategy type to align with patient state initialization 
 * and behavioral logic in geminiService.ts.
 */
export type NudgeStrategy = 'social_proof' | 'loss_aversion' | 'educational_focus' | 'accountability_focus' | 'positive_framing';

export interface EnabledFeatures {
  transportation: boolean;
  healthLibrary: boolean;
  trivia: boolean;
  copayAssistance: boolean;
}

export interface NurseProfile {
  name: string;
  photoUrl?: string;
  specialty: string;
  personalNote: string;
}

export interface PatientState {
  id: string;
  name: string;
  nextScheduledDate: string;
  lastInfusionDate: string;
  transportStatus: 'unconfirmed' | 'confirmed' | 'needs_help';
  transportProvider?: 'shuttle' | 'insurance' | 'rideshare' | null;
  cycleWeeks: number;
  isConfirmed: boolean;
  isCanceled: boolean;
  adherenceRate: number;
  onTimeStreak: number;
  totalInfusions: number;
  nurseName: string;
  nurseProfile: NurseProfile;
  activeStrategy: NudgeStrategy;
  notes: ClinicalNote[];
  assistanceRequested?: {
    coPay?: boolean;
    staff?: boolean;
    transport?: boolean;
  };
}

export interface WaitingListPatient {
  id: string;
  name: string;
  requestedWindowStart: string;
  requestedWindowEnd: string;
  priority: 'high' | 'medium' | 'low';
  outreachStatus: 'none' | 'sent' | 'accepted';
}

export interface OpenSlot {
  id: string;
  date: string;
  time: string;
  originalPatient: string;
}
