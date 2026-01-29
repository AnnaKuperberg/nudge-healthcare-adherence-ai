
import React, { useState, useRef, useEffect } from 'react';
import { MessageRole, ChatMessage, PatientState, WaitingListPatient, OpenSlot, ClinicalNote, EnabledFeatures, NudgeStrategy } from './types';
import { getChatResponse } from './geminiService';
import { fetchSandboxPatients, syncPatientToSandbox } from './sandboxService';
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
  Car, HelpCircle, ChevronRight, Zap, RefreshCw, Database,
  Activity, Globe, Lock
} from 'lucide-react';

interface Slot {
  date: string;
  time: string;
}

const STRATEGY_INFO: Record<string, { title: string, desc: string, icon: any }> = {
  'social_proof': { title: 'Social Proof', desc: 'Focuses on clinic waitlist impact and how early confirmation helps other patients access care.', icon: <Users className="w-3 h-3" /> },
  'loss_aversion': { title: 'Loss Aversion', desc: 'Highlights clinical risks and the specific biological window needed for treatment efficacy.', icon: <TrendingDown className="w-3 h-3" /> },
  'accountability_focus': { title: 'Staff Connection', desc: 'Leverages the professional commitment between the patient and their assigned nurse.', icon: <Heart className="w-3 h-3" /> },
  'educational_focus': { title: 'Educational', desc: 'Builds adherence through health literacy, trivia, and engaging informational resources.', icon: <BookOpen className="w-3 h-3" /> },
  'positive_framing': { title: 'Positive Reinforcement', desc: 'Acknowledges and celebrates positive behavior, specifically on-time streaks and lab results.', icon: <Zap className="w-3 h-3" /> }
};

const ACID_LIME = "#C1FF00";

const App: React.FC = () => {
  const [isLoadingSandbox, setIsLoadingSandbox] = useState(true);
  const [sandboxStatus, setSandboxStatus] = useState<'connected' | 'syncing' | 'idle'>('connected');
  const [viewMode, setViewMode] = useState<'patient' | 'clinic'>('patient');
  const [patients, setPatients] = useState<PatientState[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>('');
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
  const [tempAddress, setTempAddress] = useState("1500 Louisiana St, Houston, TX 77002");
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [triviaActive, setTriviaActive] = useState(false);
  
  const [enabledFeatures, setEnabledFeatures] = useState<EnabledFeatures>({
    transportation: true,
    healthLibrary: true,
    trivia: true,
    copayAssistance: true
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialization from Sandbox
  useEffect(() => {
    const initApp = async () => {
      try {
        const sandboxPatients = await fetchSandboxPatients();
        setPatients(sandboxPatients);
        setActivePatientId(sandboxPatients[0].id);
      } catch (e) {
        console.error("Sandbox connection failed", e);
      } finally {
        setIsLoadingSandbox(false);
      }
    };
    initApp();
  }, []);

  const patient = patients.find(p => p.id === activePatientId);

  useEffect(() => {
    if (patient) {
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
  }, [activePatientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, suggestedSlots, showCalendarNudge, showOtherIssues, showEducationNudge, transportContext, showAddressVerify, isEditingAddress, addedToCalendar, triviaActive]);

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
  };

  const updatePatientState = async (id: string, updates: Partial<PatientState>) => {
    const updatedPatients = patients.map(p => p.id === id ? { ...p, ...updates } : p);
    setPatients(updatedPatients);
    
    // Simulate Sync to Sandbox
    const targetPatient = updatedPatients.find(p => p.id === id);
    if (targetPatient) {
      setSandboxStatus('syncing');
      await syncPatientToSandbox(targetPatient);
      setSandboxStatus('connected');
    }
  };

  const processAIResponse = async (currentMessages: ChatMessage[]) => {
    if (!patient) return;
    setIsTyping(true);
    setSuggestedSlots(null);
    setShowQuickActions(false);

    try {
      const lastUserMsg = currentMessages[currentMessages.length - 1].text.toLowerCase();
      const userIsConfirming = lastUserMsg.includes("be there") || lastUserMsg.includes("yes") || (lastUserMsg.length < 5 && lastUserMsg.includes("confirm"));
      const userWantsTransport = lastUserMsg.includes("transportation") || lastUserMsg.includes("shuttle") || lastUserMsg.includes("ride");

      const response = await getChatResponse(currentMessages, patient, enabledFeatures);
      
      if (userIsConfirming) {
        updatePatientState(patient.id, { isConfirmed: true, isCanceled: false });
        setShowCalendarNudge(true);
        if (enabledFeatures.healthLibrary || enabledFeatures.trivia) setShowEducationNudge(true);
        setShowOtherIssues(true);
        setMessages(prev => [...prev, { role: MessageRole.MODEL, text: response.text || `Confirmed. ${patient.nurseName} is prepared for your visit.` }]);
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
             updatePatientState(patient.id, { nextScheduledDate: date, isConfirmed: true, isCanceled: false });
             setMessages(prev => [...prev, { role: MessageRole.MODEL, text: `Confirmed for ${date}. ${patient.nurseName} is notified.` }]);
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

  const handleManualSync = async () => {
    setSandboxStatus('syncing');
    const sandboxPatients = await fetchSandboxPatients();
    setPatients(sandboxPatients);
    setSandboxStatus('connected');
  };

  if (isLoadingSandbox) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white p-10 text-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
          <Database className="w-16 h-16 text-blue-400 relative animate-pulse" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-4" style={{ color: ACID_LIME }}>Connecting to Clinical Sandbox...</h1>
        <p className="text-slate-400 max-w-md font-medium text-sm mb-8">Initiating FHIR Protocol handshake and retrieving patient cohort data for Houston Infusion Center.</p>
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 lg:flex-row overflow-hidden">
      {/* Sidebar */}
      {(viewMode as any) === 'patient' && (
        <aside className="w-full lg:w-96 bg-white border-b lg:border-r border-slate-200 p-6 flex flex-col gap-6 order-2 lg:order-1 overflow-y-auto">
          
          <div className="flex p-1 bg-slate-100 rounded-xl shadow-inner">
            <button onClick={() => setViewMode('patient')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${(viewMode as any) === 'patient' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
              <Users className="w-4 h-4" /> Patient View
            </button>
            <button onClick={() => setViewMode('clinic')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${(viewMode as any) === 'clinic' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
              <Settings className="w-4 h-4" /> Clinic Lab
            </button>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
               <Globe className="w-3.5 h-3.5" /> Sandbox Registry
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

          {/* Strategy Highlight */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 relative overflow-visible flex flex-col min-h-[140px]">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-12 h-12" />
             </div>
             <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-400" /> Behavioral Nudge
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-blue-100">
                {STRATEGY_INFO[patient!.activeStrategy]?.icon}
                {STRATEGY_INFO[patient!.activeStrategy]?.title}
             </div>
             <p className="text-[11px] text-slate-300 leading-relaxed font-medium block whitespace-normal">
                {STRATEGY_INFO[patient!.activeStrategy]?.desc}
             </p>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 shrink-0">
               {patient?.nurseName.split(' ')[1][0]}
            </div>
            <div>
              <div className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-0.5">Assigned Nurse</div>
              <div className="text-sm font-black text-slate-800">{patient?.nurseName}</div>
              <div className="text-[11px] text-indigo-600/70 font-medium italic leading-tight">{patient?.nurseProfile.specialty}</div>
            </div>
          </div>

          <div className="space-y-4">
            {patient && (
              <AppointmentCard 
                patient={patient} 
                onAddToCalendar={() => setAddedToCalendar(true)} 
                addedToCalendar={addedToCalendar} 
              />
            )}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col order-1 lg:order-2 bg-white relative overflow-hidden shadow-2xl">
        <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tighter" style={{ color: ACID_LIME }}>nudge.</h1>
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <h2 className="font-bold text-slate-700 text-sm tracking-tight">
              {viewMode === 'patient' ? "your smart appointment assistant" : "Clinical Operations Lab"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${sandboxStatus === 'syncing' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
               <div className={`w-2 h-2 rounded-full ${sandboxStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Sandbox: {sandboxStatus === 'syncing' ? 'Syncing...' : 'Connected'}</span>
            </div>
          </div>
        </header>

        {viewMode === 'patient' ? (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-1 ${msg.role === MessageRole.USER ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                     <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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
                   {patient && <VisualCalendar patient={patient} />}
                </div>
              )}

              {showQuickActions && !isTyping && !isEscalated && !suggestedSlots && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <button onClick={() => handleSend("Yes, I'll be there.")} className="px-5 py-2.5 bg-white border-2 border-green-100 hover:border-green-500 text-green-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm">
                    <CheckCircle2 className="w-4 h-4" /> Confirm Visit
                  </button>
                  <button onClick={() => handleSend("Can I see other dates?")} className="px-5 py-2.5 bg-white border-2 border-blue-100 hover:border-blue-500 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm">
                    <CalendarDays className="w-4 h-4" /> Change Time
                  </button>
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

            <div className="p-4 lg:p-6 border-t border-slate-100 bg-white">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input disabled={isEscalated} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={`Ask a question or confirm with ${patient?.nurseName}...`} className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner" />
                <button disabled={isTyping || !input.trim() || isEscalated} onClick={() => handleSend()} className="bg-blue-600 text-white px-8 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </>
        ) : (
          /* CLINIC DASHBOARD */
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 text-black">
            <div className="max-w-7xl mx-auto space-y-8">
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest">
                        <Activity className="w-5 h-5 text-blue-600" /> Clinical Sandbox Status
                      </div>
                      <button onClick={handleManualSync} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${sandboxStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      </button>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="text-[10px] font-black text-slate-400 uppercase mb-1">EHR Heartbeat</div>
                         <div className="text-sm font-bold text-green-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Stable</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="text-[10px] font-black text-slate-400 uppercase mb-1">API Latency</div>
                         <div className="text-sm font-bold text-slate-700">12ms</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Data Integrity</div>
                         <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Verified</div>
                      </div>
                   </div>
                </div>

                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                   <div className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
                    <FlaskConical className="w-5 h-5 text-purple-600" /> Modular Feature Lab
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(Object.keys(enabledFeatures) as Array<keyof EnabledFeatures>).map((key) => (
                      <button key={key} onClick={() => setEnabledFeatures(prev => ({...prev, [key]: !prev[key]}))} className={`p-3 rounded-2xl border-2 flex flex-col gap-1 transition-all text-left ${enabledFeatures[key] ? 'border-purple-600 bg-purple-50' : 'border-slate-100 bg-white opacity-60'}`}>
                          {enabledFeatures[key] ? <ToggleRight className="w-5 h-5 text-purple-600" /> : <ToggleLeft className="w-5 h-5 text-slate-300" />}
                          <div className="text-[9px] font-black uppercase tracking-tight text-slate-800 truncate">{key}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" /> Patient Registry (EHR Stream)</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient & Schedule</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Staff</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Adherence</th>
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
                        <td className="px-6 py-5 text-center">
                          <div className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${p.adherenceRate < 70 ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
                            {p.adherenceRate}%
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
