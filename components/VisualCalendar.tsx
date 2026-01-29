
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PatientState } from '../types';

interface VisualCalendarProps {
  patient: PatientState;
}

export const VisualCalendar: React.FC<VisualCalendarProps> = ({ patient }) => {
  const scheduledDate = new Date(patient.nextScheduledDate);
  const month = scheduledDate.getMonth();
  const year = scheduledDate.getFullYear();

  // Get days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isScheduled = (day: number) => {
    return (
      day === scheduledDate.getDate() &&
      month === scheduledDate.getMonth() &&
      year === scheduledDate.getFullYear()
    );
  };

  const isInWindow = (day: number) => {
    const currentDay = new Date(year, month, day);
    const diffTime = Math.abs(currentDay.getTime() - scheduledDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(scheduledDate);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{monthName} {year}</h3>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30" disabled><ChevronLeft className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30" disabled><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <div key={d} className="text-[10px] font-bold text-slate-400 pb-2">{d}</div>
        ))}
        
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="h-8 w-8" />
        ))}

        {days.map((day) => {
          const scheduled = isScheduled(day);
          const inWindow = isInWindow(day);
          
          return (
            <div key={day} className="relative h-8 w-8 flex items-center justify-center">
              {inWindow && !scheduled && (
                <div className="absolute inset-0 bg-blue-50 rounded-lg" />
              )}
              <span className={`relative text-xs font-medium ${
                scheduled 
                  ? 'bg-blue-600 text-white h-7 w-7 rounded-full flex items-center justify-center shadow-md shadow-blue-200' 
                  : inWindow 
                    ? 'text-blue-700 font-bold' 
                    : 'text-slate-500'
              }`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-wide">
          <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></div>
          <span>Scheduled Appointment</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-wide">
          <div className="w-3 h-3 bg-blue-50 rounded shadow-sm border border-blue-100"></div>
          <span>Clinical Safety Window (+/- 3 days)</span>
        </div>
      </div>
    </div>
  );
};
