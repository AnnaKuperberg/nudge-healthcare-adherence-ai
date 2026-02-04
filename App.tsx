
import React, { useState, useRef, useEffect } from 'react';
import { MessageRole, ChatMessage, PatientState, WaitingListPatient, OpenSlot, ClinicalNote, EnabledFeatures, NudgeStrategy } from './types';
import { getChatResponse } from './geminiService';
import { AppointmentCard } from './components/AppointmentCard';
import { VisualCalendar } from './components/VisualCalendar';
import { 
  Check, Users, Settings, Layout, Send, Clock, 
  CalendarDays, CheckCircle2, UserCircle2, 
  TrendingDown, TrendingUp, XCircle, CreditCard, ShieldCheck, 
  Bus, Smartphone, Home, PlayCircle, BrainCircuit, 
  MessageSquareText, PlusCircle, MoreVertical, AlertCircle,
  BookOpen, FileText, ExternalLink, Library, FlaskConical,
  ToggleLeft, ToggleRight, Sparkles, UserCheck, Heart, Info,
  Car, HelpCircle, ChevronRight, Zap, ListOrdered, Activity, UserPlus, MousePointerClick, BarChart3,
  BellRing, Mail, PhoneCall
} from 'lucide-react';

interface Slot {
  date: string;
  time: string;
}

const TRACKED_URL = "https://rb.gy/qcmpqc";

const CROHNS_LIBRARY = [
  { title: "Crohn's: The Basics", type: "Article", duration: "5 min read", icon: <FileText className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Understanding Infliximab", type: "Video", duration: "3:20", icon: <PlayCircle className="w-4 h-4" />, color: "text-rose-600", bg: "bg-rose-50" },
  { title: "Dietary Guidelines", type: "Guide", duration: "12 min read", icon: <BookOpen className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Managing Flares", type: "Protocol", duration: "8 min read", icon: <ShieldCheck className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50" }
];

const STRATEGY_INFO: Record<string, { title: string, desc: string, icon: any }> = {
  'social_proof': { title: 'Social Proof', desc: 'Prioritizes clinic waitlist impact and how early confirmation helps other patients access care.', icon: <Users className="w-3 h-3" /> },
  'loss_aversion': { title: 'Loss Aversion', desc: 'Highlights clinical risks and the specific biological window needed for treatment efficacy.', icon: <TrendingDown className="w-3 h-3" /> },
  'accountability_focus': { title: 'Staff Connection', desc: 'Leverages the professional commitment between the patient and their assigned nurse.', icon: <Heart className="w-3 h-3" /> },
  'educational_focus': { title: 'Educational', desc: 'Builds adherence through health literacy, trivia, and engaging informational resources.', icon: <BookOpen className="w-3 h-3" /> },
  'positive_framing': { title: 'Positive Reinforcement', desc: 'Acknowledges and celebrates positive behavior, specifically on-time streaks and lab results.', icon: <Zap className="w-3 h-3" /> }
};

const NURSE_DATA = {
  'Nurse Elena': { name: 'Nurse Elena', specialty: 'Senior Infusion RN', personalNote: 'Focuses on meticulous monitoring and patient comfort during biologic delivery.' },
  'Nurse David': { name: 'Nurse David', specialty: 'Clinical Operations Lead', personalNote: 'Specializes in vascular access and care coordination for complex Crohn\'s cases.' },
  'Nurse Sarah': { name: 'Nurse Sarah', specialty: 'Gastroenterology RN', personalNote: 'Passionate about patient education and long-term adherence management.' }
};

const INITIAL_PATIENTS: PatientState[] = [
  { 
    id: 'sarah', 
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
    notes: [{ id: '1', text: 'Patient is a tech professional in Houston; prefers 09:30 AM starts to avoid morning traffic.', timestamp: '2025-09-12', author: 'Nurse David' }],
    linkEngagementCount: 0
  },
  { 
    id: 'marcus', 
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
    notes: [{ id: '2', text: 'Lives in Brenham; 1.5 hour drive. Frequent rescheduling due to transit issues.', timestamp: '2025-09-01', author: 'Nurse Elena' }], 
    assistanceRequested: { transport: true },
    linkEngagementCount: 3
  },
  { 
    id: 'evelyn', 
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
    activeStrategy: 'educational_focus', 
    notes: [{ id: '3', text: 'History teacher in Dallas; sensitive to timing during semester. Very communicative.', timestamp: '2025-09-10', author: 'Nurse Sarah' }],
    linkEngagementCount: 1
  }
];

const WAITLIST_INITIAL: WaitingListPatient[] = [
  { id: 'ws1', name: 'John Smith', requestedWindowStart: '2025-10-21', requestedWindowEnd: '2025-10-23', priority: 'high', outreachStatus: 'none' },
  { id: 'ws2', name: 'Maria Garcia', requestedWindowStart: '2025-10-23', requestedWindowEnd: '2025-10-25', priority: 'medium', outreachStatus: 'none' },
  { id: 'ws3', name: 'Robert Chen', requestedWindowStart: '2025-10-20', requestedWindowEnd: '2025-10-30', priority: 'low', outreachStatus: 'none' }
];

const HOUSTON_ADDRESS = "1500 Louisiana St, Houston, TX 77002";
const ACID_LIME = "#C1FF00";

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'patient' | 'clinic' | 'waitlist'>('patient');
  const [patients, setPatients] = useState<PatientState[]>(INITIAL_PATIENTS);
  const [waitlist, setWaitlist] = useState<WaitingListPatient[]>(WAITLIST_INITIAL);
  const [activePatientId, setActivePatientId] = useState<string>(INITIAL_PATIENTS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState<Slot[] | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showCalendarNudge, setShowCalendarNudge] = useState(false);
  const [showOtherIssues, setShowOtherIssues] = useState(false);
  const [showEducationNudge, setShowEducationNudge] = useState(false);
  const [transportContext, setTransportContext] = useState(false);
  const [showAddressVerify, setShowAddressVerify] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(HOUSTON_ADDRESS);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [triviaActive, setTriviaActive] = useState(false);
  const [openSlots, setOpenSlots] = useState<OpenSlot[]>([]);
  const [showCancelStaffNudge, setShowCancelStaffNudge] = useState(false);
  
  const [enabledFeatures, setEnabledFeatures] = useState<EnabledFeatures>({
    transportation: true,
    healthLibrary: true,
    trivia: true,
    copayAssistance: true
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const patient = patients.find(p => p.id === activePatientId) || patients[0];

  useEffect(() => {
    if (viewMode === 'patient') {
      const triggerGreeting = async () => {
         setMessages([]);
         resetNudges();
         setIsTyping(true);
         try {
           const response = await getChatResponse([{ role: MessageRole.USER, text: "GREETING_INIT" }], patient, enabledFeatures);
           setMessages([{ role: MessageRole.MODEL, text: response.text || `Hello ${patient.name.split(' ')[0]}. Can you confirm your appointment with ${patient.nurseName}?` }]);
         } catch (e) {
           setMessages([{ role: MessageRole.MODEL, text: `Hello ${patient.name.split(' ')[0]}. Can you confirm your appointment with ${patient.nurseName}?` }]);
         } finally {
           setIsTyping(false);
         }
      };
      triggerGreeting();
    }
  }, [activePatientId, viewMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, suggestedSlots, showCalendarNudge, showOtherIssues, showEducationNudge, transportContext, showAddressVerify, isEditingAddress, addedToCalendar, triviaActive, showCancelStaffNudge]);

  const resetNudges = () => {
    setShowCalendarNudge(false);
    setShowOtherIssues(false);
    setShowEducationNudge(false);
    setSuggestedSlots(null);
    setShowQuickActions(true);
    setTransportContext(false);
    setShowAddressVerify(false);
    setIsEditingAddress(false);
    setIsEscalated(false);
    setTriviaActive(false);
    setAddedToCalendar(false);
    setShowCancelStaffNudge(false);
  };

  const updatePatientState = (id: string, updates: Partial<PatientState>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleTrackedLinkClick = () => {
    updatePatientState(patient.id, { linkEngagementCount: patient.linkEngagementCount + 1 });
    window.open(TRACKED_URL, '_blank');
  };

  const processAIResponse = async (currentMessages: ChatMessage[]) => {
    setIsTyping(true);
    setSuggestedSlots(null);
    setShowQuickActions(false);

    try {
      const lastUserMsg = currentMessages[currentMessages.length - 1].text.toLowerCase();
      
      // Context detection for follow-up requests after cancellation
      const isStaffFollowupConfirmation = lastUserMsg.includes("staff to contact me") || lastUserMsg.includes("yes, please");
      const userIsConfirming = (lastUserMsg.includes("be there") || lastUserMsg.includes("yes") || (lastUserMsg.length < 5 && lastUserMsg.includes("confirm"))) && !isStaffFollowupConfirmation;
      const userWantsTransport = lastUserMsg.includes("transportation") || lastUserMsg.includes("shuttle") || lastUserMsg.includes("ride");
      const userWantsCancel = lastUserMsg.includes("cancel") || lastUserMsg.includes("not able to come") || lastUserMsg.includes("can't make it");

      if (isStaffFollowupConfirmation) {
        setMessages(prev => [...prev, { role: MessageRole.MODEL, text: `Confirmed, staff will contact you shortly to discuss your treatment window.` }]);
        setIsTyping(false);
        return;
      }

      const response = await getChatResponse(currentMessages, patient, enabledFeatures);
      
      if (userIsConfirming) {
        updatePatientState(patient.id, { isConfirmed: true, isCanceled: false });
        setShowCalendarNudge(true);
        if (enabledFeatures.healthLibrary || enabledFeatures.trivia) setShowEducationNudge(true);
        setShowOtherIssues(true);
        setMessages(prev => [...prev, { role: MessageRole.MODEL, text: response.text || `Confirmed. ${patient.nurseName} is prepared for your visit.` }]);
      } else if (userWantsCancel) {
        // Log the opening for the waitlist
        setOpenSlots(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9), 
          date: patient.nextScheduledDate, 
          time: '09:30 AM', 
          originalPatient: patient.name 
        }]);
        updatePatientState(patient.id, { isConfirmed: false, isCanceled: true });
        setShowCancelStaffNudge(true);
        setMessages(prev => [...prev, { role: MessageRole.MODEL, text: response.text || `Acknowledge your cancellation. Please keep in mind that maintaining your infusion frequency is vital for your health. Would you like our clinical team to contact you to discuss rescheduling?` }]);
      } else if (userWantsTransport) {
        setTransportContext(true);
        setMessages(prev => [...prev, { role: MessageRole.MODEL, text: response.text || "I can help coordinate transportation. Which option works best for you?" }]);
      } else if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === 'escalate_to_human') {
            setIsEscalated(true);
            updatePatientState(patient.id, { assistanceRequested: { ...patient.assistanceRequested, staff: true } });
            setMessages(prev => [...prev, { role: MessageRole.MODEL, text: `Connecting you to clinic staff now. One moment.`, isEscalated: true }]);
          } else if (call.name === 'check_availability') {
            const slots: Slot[] = [
              { date: '2025-10-25', time: '09:00 AM' },
              { date: '2025-10-26', time: '02:30 PM' }
            ];
            setSuggestedSlots(slots);
            setMessages(prev => [...prev, { role: MessageRole.MODEL, text: `I've found these openings with ${patient.nurseName}:` }]);
          } else if (call.name === 'book_appointment') {
             const { date } = call.args as any;
             const oldDate = patient.nextScheduledDate;
             
             // Log the opening for the waitlist
             setOpenSlots(prev => [...prev, { 
               id: Math.random().toString(36).substr(2, 9), 
               date: oldDate, 
               time: '09:30 AM', 
               originalPatient: patient.name 
             }]);

             updatePatientState(patient.id, { nextScheduledDate: date, isConfirmed: true, isCanceled: false });
             setMessages(prev => [...prev, { role: MessageRole.MODEL, text: `Confirmed for ${date}. ${patient.nurseName} has opened up your Oct ${oldDate.split('-')[2]} slot for another patient.` }]);
             setShowCalendarNudge(true);
             if (enabledFeatures.healthLibrary || enabledFeatures.trivia) setShowEducationNudge(true);
             setShowOtherIssues(true);
          }
        }
      } else {
        const text = response.text || "How else can I help today?";
        setMessages(prev => [...prev, { role: MessageRole.MODEL, text: text }]);
        setShowQuickActions(true);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: MessageRole.MODEL, text: "Connection error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping || isEscalated) return;
    const userMsg: ChatMessage = { role: MessageRole.USER, text: textToSend };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    processAIResponse(newMessages);
  };

  const handleCancelStaffChoice = (choice: boolean) => {
    setShowCancelStaffNudge(false);
    if (choice) {
       handleSend("Yes, I would like staff to contact me.");
    } else {
       handleSend("No, I'll contact the office later if needed.");
    }
  };

  const handleTransportSelect = (type: 'shuttle' | 'insurance' | 'rideshare') => {
    if (type === 'shuttle') {
        setShowAddressVerify(true);
        setMessages(prev => [...prev, { role: MessageRole.USER, text: "I'd like to book the clinic shuttle." }, { role: MessageRole.MODEL, text: `Is your pickup address still ${tempAddress}?` }]);
        setTransportContext(false);
    } else {
        const typeLabels = { insurance: 'insurance assistance', rideshare: 'a ride-share service' };
        handleSend(`I'd like to use ${typeLabels[type]}.`);
    }
  };

  const handleAddressConfirm = (isConfirmed: boolean) => {
    if (isConfirmed) {
        updatePatientState(patient.id, { 
          transportStatus: 'confirmed', 
          transportProvider: 'shuttle', 
          isConfirmed: true, 
          isCanceled: false, 
          assistanceRequested: { ...patient.assistanceRequested, transport: true } 
        });
        setMessages(prev => [...prev, 
          { role: MessageRole.USER, text: "Yes, that's correct." }, 
          { role: MessageRole.MODEL, text: `Shuttle booked. Driver arrives 1 hour early (08:30 AM).` }
        ]);
        setShowAddressVerify(false);
        setShowOtherIssues(true);
        if (enabledFeatures.healthLibrary || enabledFeatures.trivia) setShowEducationNudge(true);
    } else {
        setIsEditingAddress(true);
    }
  };

  const handleEducationChoice = (type: 'trivia' | 'video' | 'library') => {
    setShowEducationNudge(false);
    if (type === 'trivia') {
      setTriviaActive(true);
      setMessages(prev => [...prev, 
        { role: MessageRole.USER, text: "Health Trivia!" },
        { role: MessageRole.MODEL, text: "What is the 'Safety Window' (plus or minus) for rescheduling infusion therapy?" }
      ]);
    } else if (type === 'video') {
       handleSend("I'd like to watch the informative video.");
    } else {
       handleSend("I'd like to explore the Health Library.");
    }
  };

  const toggleFeature = (key: keyof EnabledFeatures) => {
    setEnabledFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setStrategy = (id: string, strategy: NudgeStrategy) => {
    updatePatientState(id, { activeStrategy: strategy });
  };

  const handleAIOutreach = (waitlistId: string, slotId: string) => {
     setWaitlist(prev => prev.map(w => w.id === waitlistId ? { ...w, outreachStatus: 'sent' } : w));
     
     // Simulate the patient "Accepting" after a short delay
     setTimeout(() => {
        const waitlistPatient = waitlist.find(w => w.id === waitlistId);
        const slot = openSlots.find(s => s.id === slotId);
        if (waitlistPatient && slot) {
           const newPatient: PatientState = {
             id: waitlistPatient.id,
             name: waitlistPatient.name,
             nextScheduledDate: slot.date,
             lastInfusionDate: '2025-08-15',
             transportStatus: 'unconfirmed',
             cycleWeeks: 6,
             isConfirmed: true,
             isCanceled: false,
             adherenceRate: 90,
             onTimeStreak: 1,
             totalInfusions: 5,
             nurseName: 'Nurse Sarah',
             nurseProfile: NURSE_DATA['Nurse Sarah'],
             activeStrategy: 'social_proof',
             notes: [{ id: '99', text: 'Onboarded via AI Waitlist Match from slot vacated by ' + slot.originalPatient, timestamp: new Date().toISOString().split('T')[0], author: 'AI Engine' }],
             linkEngagementCount: 0
           };
           setPatients(prev => [...prev, newPatient]);
           setWaitlist(prev => prev.filter(w => w.id !== waitlistId));
           setOpenSlots(prev => prev.filter(s => s.id !== slotId));
           setActivePatientId(newPatient.id);
           setViewMode('patient');
        }
     }, 1500);
  };

  const totalLinkClicks = patients.reduce((acc, p) => acc + (p.linkEngagementCount || 0), 0);

  return (
    <div className="flex flex-col h-screen bg-slate-50 lg:flex-row overflow-hidden">
      {/* Sidebar - Navigation & Context */}
      <aside className="w-full lg:w-96 bg-white border-b lg:border-r border-slate-200 p-6 flex flex-col gap-6 order-2 lg:order-1 overflow-y-auto">
        
        {/* Global View Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl shadow-inner">
          <button onClick={() => setViewMode('patient')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'patient' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
            <MessageSquareText className="w-4 h-4" /> Patient
          </button>
          <button onClick={() => setViewMode('clinic')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'clinic' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
            <Settings className="w-4 h-4" /> Lab
          </button>
          <button onClick={() => setViewMode('waitlist')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'waitlist' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
            <ListOrdered className="w-4 h-4" /> Waitlist
          </button>
        </div>

        {viewMode === 'patient' && (
          <>
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                 <UserCircle2 className="w-3.5 h-3.5" /> Clinical Persona
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {patients.map(p => (
                     <button 
                       key={p.id} 
                       onClick={() => setActivePatientId(p.id)}
                       className={`p-3 rounded-xl border text-left transition-all ${p.id === activePatientId ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
                     >
                        <div className="text-xs font-bold text-slate-800 truncate">{p.name.split(' ')[0]}</div>
                        <div className="text-[9px] text-slate-500 font-medium">{p.adherenceRate}% Adherence</div>
                     </button>
                  ))}
               </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 relative overflow-visible flex flex-col min-h-[140px]">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-12 h-12" />
               </div>
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-400" /> Behavioral Nudge
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-blue-100">
                  {STRATEGY_INFO[patient.activeStrategy]?.icon}
                  {STRATEGY_INFO[patient.activeStrategy]?.title}
               </div>
               <p className="text-[11px] text-slate-300 leading-relaxed font-medium block whitespace-normal">
                  {STRATEGY_INFO[patient.activeStrategy]?.desc}
               </p>
               {patient.activeStrategy === 'educational_focus' && (
                 <button 
                  onClick={handleTrackedLinkClick}
                  className="mt-2 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
                 >
                   <ExternalLink className="w-3 h-3" /> Explore Featured Content
                 </button>
               )}
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 shrink-0">
                 {patient.nurseName.split(' ')[1][0]}
              </div>
              <div>
                <div className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-0.5">Assigned Nurse</div>
                <div className="text-sm font-black text-slate-800">{patient.nurseName}</div>
                <div className="text-[11px] text-indigo-600/70 font-medium italic leading-tight">{patient.nurseProfile.specialty}</div>
              </div>
            </div>

            <AppointmentCard 
              patient={patient} 
              onAddToCalendar={() => setAddedToCalendar(true)} 
              addedToCalendar={addedToCalendar} 
              onCancelClick={() => handleSend("I'd like to cancel my appointment.")}
            />
          </>
        )}

        {viewMode !== 'patient' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Clinic Overview</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Waitlist Size</span>
                  <span className="text-sm font-black text-blue-600">{waitlist.length} Patients</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Avg Adherence</span>
                  <span className="text-sm font-black text-green-600">73%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">AI Outreach</span>
                  <span className="text-sm font-black text-purple-600">Active</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">
                <Activity className="w-3.5 h-3.5" /> Engine Status
              </div>
              <div className="text-xs font-bold text-slate-700 leading-relaxed">
                Matching algorithms are currently scanning schedule cancellations to bridge waitlist gaps.
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" /> Digital Engagement
                  </div>
                  <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[9px] font-black uppercase tracking-tight">Active Track</div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Tracked Resource Clicks</span>
                    <span className="text-lg font-black text-slate-900">{totalLinkClicks}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min((totalLinkClicks / 20) * 100, 100)}%` }}></div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium italic">Tracking: rb.gy/qcmpqc</div>
               </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col order-1 lg:order-2 bg-white relative overflow-hidden shadow-2xl">
        <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tighter" style={{ color: ACID_LIME }}>nudge.</h1>
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <h2 className="font-bold text-slate-700 text-sm tracking-tight capitalize">
              {viewMode === 'patient' ? "your smart assistant" : 
               viewMode === 'waitlist' ? "Waiting List Outreach" : "Operations Lab"}
            </h2>
          </div>
          {viewMode === 'waitlist' && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
               <Zap className="w-3.5 h-3.5" /> AI Matching Engine Active
            </div>
          )}
        </header>

        {viewMode === 'patient' && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-1 ${msg.role === MessageRole.USER ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                     <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                     
                     {msg.text.includes("informative video.") && idx === messages.length - 1 && (
                      <div className="mt-4 aspect-video bg-slate-900 rounded-xl flex items-center justify-center group cursor-pointer relative overflow-hidden">
                        <PlayCircle className="w-12 h-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10 text-[10px] font-bold text-white uppercase tracking-widest opacity-80">
                          <span>Infliximab Efficacy</span>
                          <span>2:14</span>
                        </div>
                      </div>
                     )}

                     {msg.text.includes("Health Library.") && idx === messages.length - 1 && enabledFeatures.healthLibrary && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2">
                           <button 
                            onClick={handleTrackedLinkClick}
                            className="col-span-full flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-500 transition-all group"
                           >
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-lg shadow-blue-200"><Sparkles className="w-5 h-5" /></div>
                              <div className="flex-1 text-left">
                                <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Featured Resource</div>
                                <div className="text-sm font-bold text-slate-800">New Clinical Guidelines for Biologics</div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                           </button>
                           {CROHNS_LIBRARY.map((item, i) => (
                               <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-300 transition-all cursor-pointer group">
                                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>{item.icon}</div>
                                   <div className="flex-1 text-[13px] font-bold text-slate-800 leading-tight">{item.title}</div>
                               </div>
                           ))}
                        </div>
                     )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex gap-1 items-center shadow-sm">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}

              {suggestedSlots && (
                <div className="flex flex-col gap-4 animate-in zoom-in-95 max-w-sm">
                   <div className="grid grid-cols-2 gap-2">
                    {suggestedSlots.map((slot, i) => (
                      <button key={i} onClick={() => handleSend(`BOOK SLOT: ${slot.date} at ${slot.time}`)} className="p-4 border-2 border-blue-100 bg-blue-50 hover:border-blue-500 rounded-xl text-left shadow-sm">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{slot.date}</span>
                        <div className="text-base font-bold text-slate-800">{slot.time}</div>
                      </button>
                    ))}
                   </div>
                   <button onClick={() => handleSend("I'd like to cancel my appointment instead.")} className="px-5 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2">
                     <XCircle className="w-3.5 h-3.5" /> Cancel Instead
                   </button>
                   <VisualCalendar patient={patient} />
                </div>
              )}

              {showCancelStaffNudge && !isTyping && (
                 <div className="p-5 bg-rose-50 border-l-4 border-rose-600 rounded-2xl max-w-sm shadow-sm animate-in slide-in-from-bottom-2 space-y-4">
                    <div className="flex items-center gap-2 text-rose-800 font-bold"><PhoneCall className="w-4 h-4" /> Clinical Follow-up</div>
                    <p className="text-sm text-slate-700 font-medium">Would you like a clinical coordinator to call you to discuss your treatment window?</p>
                    <div className="flex gap-2">
                        <button onClick={() => handleCancelStaffChoice(true)} className="flex-1 bg-rose-600 text-white rounded-xl py-2 font-bold text-xs flex items-center justify-center gap-1 shadow-lg shadow-rose-100">Yes, please</button>
                        <button onClick={() => handleCancelStaffChoice(false)} className="flex-1 bg-white border border-rose-200 text-rose-700 rounded-xl py-2 font-bold text-xs flex items-center justify-center gap-1">No, I'm okay</button>
                    </div>
                 </div>
              )}

              {showQuickActions && !isTyping && !isEscalated && !suggestedSlots && !showCancelStaffNudge && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <button onClick={() => handleSend("Yes, I'll be there.")} className="px-5 py-2.5 bg-white border-2 border-green-100 hover:border-green-500 text-green-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm">
                    <CheckCircle2 className="w-4 h-4" /> Confirm Visit
                  </button>
                  <button onClick={() => handleSend("Can I see other dates?")} className="px-5 py-2.5 bg-white border-2 border-blue-100 hover:border-blue-500 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm">
                    <CalendarDays className="w-4 h-4" /> Change Time
                  </button>
                  <button onClick={() => handleSend("I'd like to cancel my appointment.")} className="px-5 py-2.5 bg-white border border-rose-100 hover:border-rose-500 text-rose-600 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm">
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}

              {showAddressVerify && !isTyping && (
                 <div className="p-5 bg-indigo-50 border-l-4 border-indigo-600 rounded-2xl max-w-sm shadow-sm animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-indigo-800 font-bold mb-3"><Home className="w-4 h-4" /> Pickup Location</div>
                    <p className="text-sm text-slate-700 font-medium mb-4 italic">"{tempAddress}"</p>
                    <div className="flex gap-2">
                        <button onClick={() => handleAddressConfirm(true)} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 font-bold text-xs flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Correct</button>
                        <button onClick={() => handleAddressConfirm(false)} className="flex-1 bg-white border border-indigo-200 text-indigo-700 rounded-xl py-2 font-bold text-xs flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" /> No, edit</button>
                    </div>
                 </div>
              )}

              {transportContext && !isTyping && (
                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-slate-500">How would you like to arrive?</h4>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleTransportSelect('shuttle')} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"><Bus className="w-4 h-4" /> Clinic Shuttle</button>
                    <button onClick={() => handleTransportSelect('insurance')} className="px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Insurance Ride</button>
                    <button onClick={() => handleTransportSelect('rideshare')} className="px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2"><Smartphone className="w-4 h-4" /> Ride-share</button>
                  </div>
                </div>
              )}

              {showEducationNudge && !isTyping && (
                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-slate-500">Patient Experience</h4>
                  <div className="flex flex-wrap gap-2">
                    {enabledFeatures.healthLibrary && <button onClick={() => handleEducationChoice('library')} className="px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2"><Library className="w-4 h-4" /> Health Library</button>}
                    {enabledFeatures.trivia && <button onClick={() => handleEducationChoice('trivia')} className="px-4 py-2.5 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Health Trivia</button>}
                    <button onClick={() => handleEducationChoice('video')} className="px-4 py-2.5 bg-white border border-blue-200 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Informative Video</button>
                  </div>
                </div>
              )}

              {showOtherIssues && !isTyping && (
                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-slate-500">Other Assistance</h4>
                  <div className="flex flex-wrap gap-2">
                    {enabledFeatures.transportation && <button onClick={() => handleSend("I have an issue with transportation.")} className="px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2"><Car className="w-4 h-4" /> Transportation</button>}
                    {enabledFeatures.copayAssistance && <button onClick={() => handleSend("I have a co-pay question.")} className="px-4 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2"><CreditCard className="w-4 h-4" /> Co-pay Help</button>}
                    <button onClick={() => handleSend("Talk to staff.")} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2"><UserCircle2 className="w-4 h-4" /> Staff Connect</button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 lg:p-6 border-t border-slate-100 bg-white shrink-0">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input disabled={isEscalated} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={`Ask a question or confirm with ${patient.nurseName}...`} className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner" />
                <button disabled={isTyping || !input.trim() || isEscalated} onClick={() => handleSend()} className="bg-blue-600 text-white px-8 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </>
        )}

        {viewMode === 'waitlist' && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
             <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="flex items-end justify-between">
                  <div className="space-y-2">
                     <h2 className="text-4xl font-black text-slate-900 tracking-tight">Outreach & Matching</h2>
                     <p className="text-lg text-slate-500 font-medium max-w-xl">Reclaiming vacated time slots to bridge treatment gaps through automated AI outreach.</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
                        <div className="text-3xl font-black text-blue-600">{waitlist.length}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Waitlist Size</div>
                     </div>
                     <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
                        <div className="text-3xl font-black text-emerald-500">{openSlots.length}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Open Slots</div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                         <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                            <ListOrdered className="w-4 h-4 text-blue-600" /> Patient Priority Queue
                         </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100">
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Window</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Outreach</th>
                              <th className="px-8 py-5 text-right"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {waitlist.map(w => (
                              <tr key={w.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                  <div className="text-base font-black text-slate-900 mb-0.5">{w.name}</div>
                                  <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${w.priority === 'high' ? 'text-rose-600' : w.priority === 'medium' ? 'text-amber-600' : 'text-slate-400'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${w.priority === 'high' ? 'bg-rose-600' : w.priority === 'medium' ? 'bg-amber-600' : 'bg-slate-400'}`}></div>
                                    {w.priority} priority
                                  </div>
                                </td>
                                <td className="px-6 py-6">
                                  <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{new Date(w.requestedWindowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(w.requestedWindowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-6">
                                  {w.outreachStatus === 'sent' ? (
                                    <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                                      <Mail className="w-4 h-4" />
                                      <span className="text-[10px] font-black uppercase tracking-tight">Sending Outreach...</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Idle</span>
                                  )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                  {openSlots.length > 0 ? (
                                    <button 
                                      onClick={() => handleAIOutreach(w.id, openSlots[0].id)}
                                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto shadow-lg shadow-blue-100 active:scale-95 transition-all"
                                    >
                                      <Zap className="w-3.5 h-3.5" /> Match to Slot
                                    </button>
                                  ) : (
                                    <button disabled className="px-5 py-2.5 bg-slate-100 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto cursor-not-allowed">
                                      <Activity className="w-3.5 h-3.5" /> No Slot
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <BellRing className="w-4 h-4 text-emerald-500" /> Open Opportunities
                        </div>
                        {openSlots.length === 0 ? (
                           <div className="text-center py-8">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <Clock className="w-8 h-8 text-slate-200" />
                              </div>
                              <p className="text-xs font-bold text-slate-400 px-4">No open slots yet. Cancellations will appear here in real-time.</p>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              {openSlots.map(s => (
                                 <div key={s.id} className="p-5 rounded-3xl border-2 border-emerald-100 bg-emerald-50/30 space-y-3 animate-in slide-in-from-right-2">
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Vacated Slot</div>
                                          <div className="text-xl font-black text-slate-900">Oct {s.date.split('-')[2]}</div>
                                       </div>
                                       <div className="p-2 bg-emerald-100 rounded-xl">
                                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                       </div>
                                    </div>
                                    <div className="pt-2 border-t border-emerald-100/50 text-[10px] font-medium text-slate-500">
                                       Original: <span className="font-bold text-slate-700">{s.originalPatient}</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>

                     <div className="p-8 bg-blue-900 rounded-[2rem] text-white space-y-4 shadow-xl">
                        <div className="p-3 bg-white/10 rounded-2xl w-fit">
                           <Zap className="w-6 h-6 text-blue-200" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Outreach Automation</h3>
                        <p className="text-xs text-blue-100/70 font-medium leading-relaxed">The AI Matching Engine proactively notifies waitlist patients as soon as a rescheduling event occurs. Conversion rate is currently <span className="text-blue-200 font-bold">88%</span>.</p>
                     </div>
                  </div>
                </div>

             </div>
          </div>
        )}

        {viewMode === 'clinic' && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 text-black">
            <div className="max-w-7xl mx-auto space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Content Interaction</div>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-6xl font-black text-blue-600">{totalLinkClicks}</span>
                    <span className="text-sm font-bold text-slate-400 pb-2">Total Resource Clicks</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                    Tracking clicks for: <span className="font-bold text-blue-600 break-all">{TRACKED_URL}</span>
                  </p>
                </div>
                
                <div className="col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 flex items-center justify-between">
                   <div className="space-y-4">
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Optimization Status</div>
                      <h3 className="text-2xl font-black text-slate-800">Operational Precision Lab</h3>
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-600">Model: Gemini 3 Flash</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-xs font-bold text-slate-600">Active Nudges: 5 Modes</span>
                         </div>
                      </div>
                   </div>
                   <div className="hidden lg:block">
                      <BarChart3 className="w-24 h-24 text-slate-50 opacity-10" />
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
                  <FlaskConical className="w-5 h-5 text-purple-600" /> Modular Feature Lab
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   {(Object.keys(enabledFeatures) as Array<keyof EnabledFeatures>).map((key) => (
                     <button key={key} onClick={() => toggleFeature(key)} className={`p-4 rounded-2xl border-2 flex flex-col gap-2 transition-all text-left ${enabledFeatures[key] ? 'border-purple-600 bg-purple-50' : 'border-slate-100 bg-white opacity-60'}`}>
                        {enabledFeatures[key] ? <ToggleRight className="w-6 h-6 text-purple-600" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                        <div className="text-xs font-black uppercase tracking-tight text-slate-800">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{enabledFeatures[key] ? 'Enabled' : 'Disabled'}</div>
                     </button>
                   ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" /> Clinical Registry & Strategy Triage</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient & Schedule</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Staff</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active A/B Strategy</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Adherence</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Clicks</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-slate-800">{p.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(p.nextScheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">{p.nurseName[p.nurseName.length-1]}</div>
                             <span className="text-xs font-semibold text-slate-700">{p.nurseName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <select value={p.activeStrategy} onChange={(e) => setStrategy(p.id, e.target.value as NudgeStrategy)} className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700">
                            <option value="social_proof">Social Proof (Waitlist)</option>
                            <option value="loss_aversion">Loss Aversion (Risk)</option>
                            <option value="accountability_focus">Staff Accountability</option>
                            <option value="educational_focus">Educational Engagement</option>
                            <option value="positive_framing">Positive Framing (Streaks)</option>
                          </select>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${p.adherenceRate < 70 ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
                            {p.adherenceRate}%
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2">
                              <MousePointerClick className={`w-3.5 h-3.5 ${p.linkEngagementCount > 0 ? 'text-blue-500' : 'text-slate-300'}`} />
                              <span className={`text-xs font-bold ${p.linkEngagementCount > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{p.linkEngagementCount}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           {p.isConfirmed ? (
                             <span className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>
                           ) : p.isCanceled ? (
                             <span className="flex items-center gap-1 text-rose-600 font-bold text-[10px] uppercase"><XCircle className="w-3 h-3" /> Canceled</span>
                           ) : (
                             <span className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase"><Clock className="w-3 h-3" /> Pending</span>
                           )}
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><MoreVertical className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
