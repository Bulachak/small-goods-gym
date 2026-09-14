import React, { useState, useEffect } from 'react';

// --- TYPE DEFINITIONS & SCHEMAS ---
interface Athlete {
  id: string;
  name: string;
  email: string;
  isInjured: boolean;
  rehabNotes?: string;
}

interface EventSession {
  id: string;
  title: string;
  coach: string;
  time: string;
  maxCapacity: number;
  attendees: Athlete[];
  waitlist: Athlete[];
}

// --- INITIAL MOCK DATA ---
const CURRENT_ATHLETE: Athlete = {
  id: 'user-current-99',
  name: 'Marcus Vance',
  email: 'marcus.vance@gmail.com',
  isInjured: true,
  rehabNotes: 'Slight lumbar spine overload - avoid extreme deadlift flexion / modify setup height.',
};

const INITIAL_EVENT: EventSession = {
  id: 'evt-olympic-lifting',
  title: 'Olympic Weightlifting: Squat Clean Jerk Drive',
  coach: 'Joel Mullen',
  time: 'Today, 5:30 PM - 6:45 PM',
  maxCapacity: 12,
  attendees: [
    { id: '1', name: 'Alex Carter', email: 'alex@gmail.com', isInjured: false },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah@gmail.com', isInjured: false },
    { id: '3', name: 'Liam Davies', email: 'liam@gmail.com', isInjured: false },
    { id: '4', name: 'Zoe Brooks', email: 'zoe@gmail.com', isInjured: false },
    { id: '5', name: 'Daniel Kim', email: 'daniel@gmail.com', isInjured: false },
    { id: '6', name: 'Chloe Taylor', email: 'chloe@gmail.com', isInjured: false },
    { id: '7', name: 'Ryan Patel', email: 'ryan@gmail.com', isInjured: false },
    { id: '8', name: 'Emma Watson', email: 'emma@gmail.com', isInjured: false },
    { id: '9', name: 'David Miller', email: 'david@gmail.com', isInjured: false },
    { id: '10', name: 'Sophia Martinez', email: 'sophia@gmail.com', isInjured: false },
    { id: '11', name: 'Oliver Smith', email: 'oliver@gmail.com', isInjured: false },
    { id: '12', name: 'Isabella Johnson', email: 'isabella@gmail.com', isInjured: false },
  ],
  waitlist: [
    { id: 'w1', name: 'Thomas Wright', email: 'thomas@gmail.com', isInjured: false },
    { id: 'w2', name: 'Jessica Taylor', email: 'jess@gmail.com', isInjured: false },
    { id: 'w3', name: 'Luke Harrison', email: 'luke@gmail.com', isInjured: false },
  ],
};

export default function WaitlistProgressBarUI() {
  const [event, setEvent] = useState<EventSession>(INITIAL_EVENT);
  const [userStatus, setUserStatus] = useState<'idle' | 'attending' | 'waitlisted' | 'blocked_by_injury'>('idle');
  const [overrideInjury, setOverrideInjury] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<{ action: string; timestamp: Date }[]>([]);

  // Calculate capacities
  const activeCount = event.attendees.length;
  const waitlistCount = event.waitlist.length;
  const isFull = activeCount >= event.maxCapacity;
  const percentFull = Math.min((activeCount / event.maxCapacity) * 100, 100);

  // User's index on waitlist (+1 for 1-based display position)
  const waitlistIndex = event.waitlist.findIndex((ath) => ath.id === CURRENT_ATHLETE.id);
  const waitlistPosition = waitlistIndex !== -1 ? waitlistIndex + 1 : null;

  // Trigger brief visual pulse to simulate native mobile haptics (Doherty Threshold helper)
  const triggerHapticVibe = () => {
    setHapticFeedback(true);
    setTimeout(() => setHapticFeedback(false), 200);
    if ('navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate(40);
    }
  };

  // --- INTERACTION LOGIC (SRP Compliant) ---
  const handleRSVPAction = () => {
    triggerHapticVibe();

    // 1. Injury Warning Gateway Checks (Holly's Physio Protocol)
    if (CURRENT_ATHLETE.isInjured && !overrideInjury && userStatus === 'idle') {
      setUserStatus('blocked_by_injury');
      return;
    }

    // 2. Offline Queue Execution (Postel's Law)
    if (isOffline) {
      setOfflineQueue((prev) => [...prev, { action: 'SUBMIT_RSVP', timestamp: new Date() }]);
      // Optimistic UI updates
      if (isFull) {
        setUserStatus('waitlisted');
        setEvent((prev) => ({
          ...prev,
          waitlist: [...prev.waitlist, CURRENT_ATHLETE],
        }));
      } else {
        setUserStatus('attending');
        setEvent((prev) => ({
          ...prev,
          attendees: [...prev.attendees, CURRENT_ATHLETE],
        }));
      }
      return;
    }

    // 3. Online Processing Flow
    if (isFull) {
      // Join waitlist
      setUserStatus('waitlisted');
      setEvent((prev) => ({
        ...prev,
        waitlist: [...prev.waitlist, CURRENT_ATHLETE],
      }));
    } else {
      // Secure active slot
      setUserStatus('attending');
      setEvent((prev) => ({
        ...prev,
        attendees: [...prev.attendees, CURRENT_ATHLETE],
      }));
    }
  };

  const handleCancelAction = () => {
    triggerHapticVibe();

    if (isOffline) {
      setOfflineQueue((prev) => [...prev, { action: 'CANCEL_RSVP', timestamp: new Date() }]);
      // Optimistic cancellation update
      if (userStatus === 'waitlisted') {
        setEvent((prev) => ({
          ...prev,
          waitlist: prev.waitlist.filter((ath) => ath.id !== CURRENT_ATHLETE.id),
        }));
      } else if (userStatus === 'attending') {
        setEvent((prev) => {
          const nextAttendees = prev.attendees.filter((ath) => ath.id !== CURRENT_ATHLETE.id);
          // If offline, we won't auto-promote immediately to avoid transaction mismatches, we wait for sync
          return { ...prev, attendees: nextAttendees };
        });
      }
      setUserStatus('idle');
      return;
    }

    // Online Cancellation and Database-Trigger simulation (FIFO Promotion)
    if (userStatus === 'waitlisted') {
      setEvent((prev) => ({
        ...prev,
        waitlist: prev.waitlist.filter((ath) => ath.id !== CURRENT_ATHLETE.id),
      }));
      setUserStatus('idle');
    } else if (userStatus === 'attending') {
      setEvent((prev) => {
        const nextAttendees = prev.attendees.filter((ath) => ath.id !== CURRENT_ATHLETE.id);
        const nextWaitlist = [...prev.waitlist];

        let promoted: Athlete | null = null;
        if (nextWaitlist.length > 0) {
          promoted = nextWaitlist.shift() || null; // FIFO Pop
        }

        return {
          ...prev,
          attendees: promoted ? [...nextAttendees, promoted] : nextAttendees,
          waitlist: nextWaitlist,
        };
      });
      setUserStatus('idle');
    }
  };

  // --- SIMULATION HELPERS ---
  const simulateAttendeeCancellation = () => {
    triggerHapticVibe();
    if (event.attendees.length === 0) return;

    setEvent((prev) => {
      const nextAttendees = [...prev.attendees];
      // Remove first active spot to simulate random drop-out
      nextAttendees.shift();
      const nextWaitlist = [...prev.waitlist];

      let promoted: Athlete | null = null;
      if (nextWaitlist.length > 0) {
        promoted = nextWaitlist.shift() || null; // FIFO Pop
      }

      const updatedAttendees = promoted ? [...nextAttendees, promoted] : nextAttendees;

      // Maintain active state indicator if the current user got promoted
      if (promoted && promoted.id === CURRENT_ATHLETE.id) {
        setUserStatus('attending');
      }

      return {
        ...prev,
        attendees: updatedAttendees,
        waitlist: nextWaitlist,
      };
    });
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl font-sans text-slate-100">
      
      {/* 1. Header with Offline Mode Toggle */}
      <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">SMALL GOODS PLATFORMS</span>
          </div>
          <button 
            onClick={() => { setIsOffline(!isOffline); triggerHapticVibe(); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isOffline 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-slate-800 text-slate-300 border border-transparent'
            }`}
          >
            {isOffline ? (
              <>
                <svg className="w-3.5 h-3.5 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 4.978 4.978 0 011.414-3.536M4.243 19.757a9.977 9.977 0 01-2.829-7.071c0-2.761 1.119-5.261 2.929-7.072M9 9h.01M12 12h.01M12 15h.01M12 18h.01" />
                </svg>
                Gym Dead-Zone
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Online
              </>
            )}
          </button>
        </div>
        <h1 className="text-xl font-bold leading-tight">{event.title}</h1>
        <p className="text-sm text-slate-400 mt-1">{event.time} • Coach {event.coach}</p>
      </div>

      <div className="p-6 space-y-6">

        {/* 2. Platform Capacity Visual Progress Bar & Metrics */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-2xl font-black text-white">{activeCount}</span>
              <span className="text-slate-500 font-medium"> / {event.maxCapacity} Spots Filled</span>
            </div>
            {isFull ? (
              <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Platform Full
              </span>
            ) : (
              <span className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {event.maxCapacity - activeCount} Left
              </span>
            )}
          </div>

          {/* Dual-State Progress Bar (Doherty Threshold visual reactivity) */}
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div 
              style={{ width: `${percentFull}%` }}
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isFull 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
            />
          </div>
        </div>

        {/* 3. Waitlist Tracker UI */}
        {waitlistCount > 0 && (
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <svg className="w-4.5 h-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-semibold text-slate-300">Waitlist Queue</span>
              </div>
              <span className="text-xs bg-slate-700/60 text-slate-400 font-semibold px-2 py-0.5 rounded-md">
                {waitlistCount} In Queue
              </span>
            </div>

            {/* Visual list of waitlisted athletes, highlighting current athlete position */}
            <div className="space-y-2">
              {event.waitlist.map((athlete, index) => {
                const isMe = athlete.id === CURRENT_ATHLETE.id;
                return (
                  <div 
                    key={athlete.id}
                    className={`flex justify-between items-center px-3.5 py-2 rounded-xl transition-all ${
                      isMe 
                        ? 'bg-amber-500/10 border border-amber-500/30' 
                        : 'bg-slate-950/40 border border-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isMe ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`text-sm ${isMe ? 'font-bold text-amber-300' : 'text-slate-300'}`}>
                        {athlete.name} {isMe && '(You)'}
                      </span>
                    </div>
                    {isMe ? (
                      <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">Next up</span>
                    ) : (
                      <span className="text-xs text-slate-500">Waitlisted</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Holly Hunt's Biomechanical Care Gateway (Injury Interceptor View) */}
        {userStatus === 'blocked_by_injury' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4.5 space-y-3.5 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-amber-300">Physiotherapist Restriction Warning</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Holly Hunt flagged your profile with active shoulder restrictions. Intensive overhead metrics on this lift present joint-shearing risks.
                </p>
                <p className="text-xs italic text-slate-400 mt-1">"{CURRENT_ATHLETE.rehabNotes}"</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1.5">
              <button 
                onClick={() => { setOverrideInjury(true); triggerHapticVibe(); handleRSVPAction(); }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
              >
                Accept and Override
              </button>
              <button 
                onClick={() => { setUserStatus('idle'); triggerHapticVibe(); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* 5. Main Action Logging Target (Fitts's Law Optimized full-width lower panel) */}
        {userStatus !== 'blocked_by_injury' && (
          <div className="pt-2">
            {userStatus === 'idle' ? (
              <button
                onClick={handleRSVPAction}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98] ${
                  hapticFeedback ? 'ring-4 ring-offset-2 ring-offset-slate-900 ring-indigo-500 scale-[0.98]' : ''
                } ${
                  isFull 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:shadow-amber-500/10' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:shadow-emerald-500/10'
                }`}
              >
                {isFull ? 'Join Waitlist (1-Tap RSVP)' : 'Secure Platform Spot (1-Tap RSVP)'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  userStatus === 'attending' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-bold">
                      {userStatus === 'attending' 
                        ? 'Spot Secured! You are Attending' 
                        : `Waitlist Active: You are Position #${waitlistPosition}`}
                    </span>
                  </div>
                  {isOffline && (
                    <span className="text-[10px] uppercase font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                      Pending Sync
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCancelAction}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-[0.98]"
                >
                  Cancel RSVP / Retract Position
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Offline Action Synchronization Queue */}
        {offlineQueue.length > 0 && (
          <div className="mt-4 p-3 bg-slate-950/40 border border-slate-800 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                Offline Action Queue
              </span>
              <button 
                onClick={() => { setOfflineQueue([]); triggerHapticVibe(); }}
                className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider font-extrabold"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1.5">
              {offlineQueue.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs text-slate-400 px-2.5 py-1.5 bg-slate-900 rounded-lg">
                  <span>{item.action === 'SUBMIT_RSVP' ? '✓ Queued: Add RSVP' : '✗ Queued: Cancel RSVP'}</span>
                  <span className="text-[10px] text-slate-600">Pending connection</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Simulation Sandbox Controls (For Joel and Holly review sessions) */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Coach Demo Controller</p>
          <button 
            onClick={simulateAttendeeCancellation}
            disabled={event.attendees.length === 0}
            className="w-full py-2.5 px-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 disabled:opacity-45 hover:disabled:bg-indigo-600/10 hover:disabled:text-indigo-400 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Trigger Attendee Cancellation (Simulate Waitlist FIFO Bump)
          </button>
        </div>

      </div>
    </div>
  );
}
