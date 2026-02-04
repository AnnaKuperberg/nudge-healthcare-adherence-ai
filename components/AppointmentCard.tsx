
import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, UserCircle, Bus, Smartphone, ShieldCheck, Plus, XCircle } from 'lucide-react';
import { PatientState } from '../types';

interface AppointmentCardProps {
  patient: PatientState;
  onAddToCalendar: () => void;
  addedToCalendar: boolean;
  onCancelClick?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ patient, onAddToCalendar, addedToCalendar, onCancelClick }) => {
  const getTransportIcon = () => {
    switch (patient.transportProvider) {
      case 'shuttle': return <Bus className="w-4 h-4" />;
      case 'rideshare': return <Smartphone className="w-4 h-4" />;
      case 'insurance': return <ShieldCheck className="w-4 h-4" />;
      default: return <Bus className="w-4 h-4" />;
    }
  };

  const getTransportLabel = () => {
    switch (patient.transportProvider) {
      case 'shuttle': return 'Clinic Shuttle';
      case 'rideshare': return 'Ride-share';
      case 'insurance': return 'Insurance Ride';
      default: return 'Transport';
    }
  };

  if (patient.isCanceled) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest">Appointment Canceled</h3>
          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Canceled
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Your appointment for {new Date(patient.nextScheduledDate).toLocaleDateString()} has been removed. Clinical staff have been notified for follow-up.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Next Infusion</h3>
        {patient.isConfirmed ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        ) : (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Action Required
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-slate-700">
          <Calendar className="w-5 h-5 mr-3 text-blue-500" />
          <span className="font-bold text-sm">{new Date(patient.nextScheduledDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'UTC'
          })}</span>
        </div>
        <div className="flex items-center text-slate-600">
          <Clock className="w-5 h-5 mr-3 text-blue-500" />
          <span className="text-sm font-medium">09:30 AM</span>
        </div>
        <div className="flex items-center text-slate-600">
          <UserCircle className="w-5 h-5 mr-3 text-blue-500" />
          <span className="text-sm font-bold text-slate-800">{patient.nurseName}</span>
        </div>
        
        {patient.transportStatus === 'confirmed' && (
          <div className="pt-3 mt-3 border-t border-slate-50 space-y-2 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-tight">
              {getTransportIcon()}
              <span>{getTransportLabel()} Scheduled</span>
            </div>
            <div className="flex items-center text-slate-500 text-xs gap-2">
              <Clock className="w-4 h-4 opacity-70" />
              <span>Driver Arrives: <span className="font-bold text-slate-700">08:30 AM</span></span>
            </div>
          </div>
        )}

        {(!patient.transportStatus || patient.transportStatus === 'unconfirmed') && (
          <div className="flex items-center text-slate-500">
            <MapPin className="w-5 h-5 mr-3 text-blue-500 opacity-50" />
            <span className="text-xs">Main Infusion Suite - Floor 4</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {patient.isConfirmed && !addedToCalendar && (
          <button 
            onClick={onAddToCalendar}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all border border-blue-100 shadow-sm animate-in zoom-in-95"
          >
            <Plus className="w-4 h-4" /> Add to Schedule
          </button>
        )}

        <button 
          onClick={onCancelClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-100 shadow-sm"
        >
          <XCircle className="w-4 h-4" /> Cancel Appointment
        </button>
      </div>

      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Window Status</span>
        <span className="text-[10px] font-bold text-green-600 uppercase">Optimal Window</span>
      </div>
    </div>
  );
};
