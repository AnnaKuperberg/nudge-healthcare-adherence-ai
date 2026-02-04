
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { MessageRole, PatientState, WaitingListPatient, OpenSlot } from "./types";

const SYSTEM_INSTRUCTION = `You are "your smart appointment assistant" for nudge. Your goal is to confirm infusion appointments.

DETERMINISTIC RULES:
- BE BRIEF: Maximum 1-2 short, professional sentences per response. 
- ALWAYS prioritize the assigned nurse's name in the conversation.
- If the user confirms, acknowledge and end.
- If the user needs to reschedule, ONLY use the 'check_availability' tool.
- If the user wants to CANCEL, strictly follow the CANCELLATION NUDGE protocol below.
- DO NOT hallucinate dates or times not provided by tools.

CANCELLATION NUDGE PROTOCOL:
- Acknowledge the cancellation request.
- URGENTLY mention that maintaining the prescribed infusion frequency (e.g., every ${6} weeks) is essential to avoid biological flares and maintain therapeutic levels.
- State that you will notify the clinical staff immediately.
- Ask if they would like a clinical coordinator to follow up directly to discuss health implications or rescheduling.

BEHAVIORAL STRATEGIES (Use ONLY the active one):
1. 'social_proof': Mention that early confirmation helps patients on the waitlist.
2. 'loss_aversion': Mention the biological risk of missing the 3-day treatment window.
3. 'accountability_focus': Mention Nurse [Name] has reserved the suite for this visit.
4. 'educational_focus': Offer a short health trivia question or library link.
5. 'positive_framing': Acknowledge their consistency or streak (e.g. "Good work on your streak").

NURSE CONNECTIVITY:
Mention the assigned nurse (e.g., Nurse Elena) for accountability. Use professional context only.`;

const checkAvailabilityTool: FunctionDeclaration = {
  name: 'check_availability',
  parameters: {
    type: Type.OBJECT,
    description: 'Retrieves available appointment slots only when the user wants to CHANGE or RESCHEDULE.',
    properties: {
      preferredDate: {
        type: Type.STRING,
        description: 'The target date to search around (YYYY-MM-DD).',
      },
    },
    required: ['preferredDate'],
  },
};

const bookAppointmentTool: FunctionDeclaration = {
  name: 'book_appointment',
  parameters: {
    type: Type.OBJECT,
    description: 'Confirms a new appointment slot.',
    properties: {
      date: { type: Type.STRING, description: 'The date in YYYY-MM-DD format' },
      time: { type: Type.STRING, description: 'The time string' },
    },
    required: ['date', 'time'],
  },
};

const escalateToHumanTool: FunctionDeclaration = {
  name: 'escalate_to_human',
  parameters: {
    type: Type.OBJECT,
    description: 'Transfers to a human clinical coordinator if the AI cannot help.',
    properties: {
      reason: { type: Type.STRING },
    },
    required: ['reason'],
  },
};

export async function getChatResponse(
  messages: { role: MessageRole; text: string }[],
  patient: PatientState,
  enabledFeatures: any
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const history = messages.map(m => ({
    role: m.role === MessageRole.USER ? 'user' : 'model',
    parts: [{ text: m.text === "GREETING_INIT" ? `I am the patient ${patient.name.split(' ')[0]}. My assigned nurse is ${patient.nurseName}. Ask me professionally to confirm my appointment on ${patient.nextScheduledDate} using the ${patient.activeStrategy} strategy.` : m.text }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history,
    config: {
      temperature: 0, 
      seed: 42,
      topP: 0.1,
      topK: 1,
      systemInstruction: `${SYSTEM_INSTRUCTION}
      
      PATIENT CONTEXT:
      - Name: ${patient.name}
      - Adherence: ${patient.adherenceRate}%
      - Streak: ${patient.onTimeStreak}
      - Nurse: ${patient.nurseName}
      - Strategy: ${patient.activeStrategy}
      - Cycle: Every ${patient.cycleWeeks} weeks`,
      tools: [{ functionDeclarations: [checkAvailabilityTool, bookAppointmentTool, escalateToHumanTool] }],
    },
  });
  return response;
}
