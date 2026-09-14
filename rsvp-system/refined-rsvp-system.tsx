import React, { useState, useEffect } from 'react';

// Define structural interfaces for our refined RSVP system
interface GymEvent {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'club_lifting' | 'social';
  scheduledAt: string;
  location: string;
  coaches: string[];
  maxCapacity: number;
  currentAttendeesCount: number;
  waitlistCount: number;
}

interface AthleteSession {
  id: string;
  name: string;
  email: string;
  role: 'athlete' | 'coach' | 'physio';
  activeRehabFlag: boolean;
  rehabNotes: string;
}

export default function RefinedRSVPDashboard() {
  // Mocking standard athlete state (User context resolved from Javier's Auth token)
  const [athlete, setAthlete] = useState<AthleteSession>({
    id: "ath_99120",
    name: "Alex Carter",
    email: "alex.carter@gmail.com",
    role: "athlete",
    activeRehabFlag: true,
    rehabNotes: "Active shoulder rehabilitation - restricted from full overhead snatches / heavy jerks without coach modification."
  });

  // Mocking active event with limited capacity to demonstrate waitlist logic
  const [event, setEvent] = useState<GymEvent>({
    id: "evt_38210",
    title: "Olympic Weightlifting: Clean & Jerk Overhead Mechanics",
    description: "Deep dive into the receiving position, elbow turnover, and stable overhead lockouts. Crucial for both weightlifters and powerlifters looking to improve structural shoulder stability.",
    type: "workshop",
    scheduledAt: "Saturday, Sep 12 at 10:00 AM AWST",
    location: "Small Goods Gym - Main Lifting Platforms",
    coaches: ["Joel Mullen", "Holly Hunt"],
    maxCapacity: 12,
    currentAttendeesCount: 11,
    waitlistCount: 2
  });

  // State machine for RSVP interactions
  // Values: 'none' | 'attending' | 'waitlist' | 'syncing'
  const [userRsvpStatus, setUserRsvpStatus] = useState<'none' | 'attending' | 'waitlist' | 'syncing'>('none');
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Doherty Threshold Simulator: Track request latency
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Toggle local network status to demonstrate Postel's Law / Offline support
  const toggleNetworkMode = () => {
    setIsOffline(prev => {
      const nextMode = !prev;
      if (nextMode) {
        triggerStatusNotification("Network connection lost. Offline logging mode active.");
      } else {
        triggerStatusNotification("Network connection restored. Syncing pending requests...");
        processOfflineQueue();
      }
      return nextMode;
    });
  };

  const triggerStatusNotification = (msg: string) => {
    setSyncFeedback(msg);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Process cached offline inputs when back online
  const processOfflineQueue = () => {
    if (offlineQueue.length > 0) {
      setUserRsvpStatus('syncing');
      setTimeout(() => {
        const lastAction = offlineQueue[offlineQueue.length - 1];
        if (lastAction === 'JOIN_RSVP') {
          setEvent(prev => ({
            ...prev,
            currentAttendeesCount: Math.min(prev.maxCapacity, prev.currentAttendeesCount + 1),
            waitlistCount: prev.currentAttendeesCount >= prev.maxCapacity ? prev.waitlistCount + 1 : prev.waitlistCount
          }));
          setUserRsvpStatus(event.currentAttendeesCount >= event.maxCapacity ? 'waitlist' : 'attending');
        } else if (lastAction === 'LEAVE_RSVP') {
          setEvent(prev => ({
            ...prev,
            currentAttendeesCount: Math.max(0, prev.currentAttendeesCount - 1),
          }));
          setUserRsvpStatus('none');
        }
        setOfflineQueue([]);
        triggerStatusNotification("✓ Synced offline requests successfully with FastAPI.");
      }, 800); // Decent simulation speed
    }
  };

  // Robust RSVP click handler adhering to the Doherty Threshold & Postel's Law
  const handleRsvpToggle = (actionType: 'join' | 'leave') => {
    const startTime = performance.now();

    if (isOffline) {
      // Postel's Law: Gracefully accept interactions when offline instead of crashing or locking
      if (actionType === 'join') {
        setOfflineQueue(['JOIN_RSVP']);
        setUserRsvpStatus(event.currentAttendeesCount >= event.maxCapacity ? 'waitlist' : 'attending');
        triggerStatusNotification("RSVP queued locally. Will auto-sync when online.");
      } else {
        setOfflineQueue(['LEAVE_RSVP']);
        setUserRsvpStatus('none');
        triggerStatusNotification("Cancellation queued locally.");
      }
      return;
    }

    // ONLINE MODE: Doherty Threshold compliant (sub-400ms feedback loop)
    setUserRsvpStatus('syncing');

    // Simulate database write with typical network overhead
    setTimeout(() => {
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      setLatencyMs(elapsed);

      if (actionType === 'join') {
        const isFull = event.currentAttendeesCount >= event.maxCapacity;
        if (isFull) {
          setEvent(prev => ({ ...prev, waitlistCount: prev.waitlistCount + 1 }));
          setUserRsvpStatus('waitlist');
          triggerStatusNotification("✓ Added to the waitlist. We'll notify you if a spot opens!");
        } else {
          setEvent(prev => ({ ...prev, currentAttendeesCount: prev.currentAttendeesCount + 1 }));
          setUserRsvpStatus('attending');
          triggerStatusNotification("✓ You are booked in! Get ready to lift.");
        }
      } else {
        // If they were attending, reduce attendance. If waitlisted, reduce waitlist.
        const wasWaitlisted = userRsvpStatus === 'waitlist';
        setEvent(prev => ({
          ...prev,
          currentAttendeesCount: wasWaitlisted ? prev.currentAttendeesCount : Math.max(0, prev.currentAttendeesCount - 1),
          waitlistCount: wasWaitlisted ? Math.max(0, prev.waitlistCount - 1) : prev.waitlistCount
        }));
        setUserRsvpStatus('none');
        triggerStatusNotification("RSVP cancelled successfully.");
      }

      // Vibrate if browser supports it for haptic reinforcement
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    }, 250); // Intentionally kept below the 400ms Doherty threshold
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col justify-start items-center font-sans">
      
      {/* Network Status Toggle Controls */}
      <div className="w-full max-w-2xl flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-sm font-semibold tracking-wide">
            {isOffline ? 'OFFLINE GYM MODE (Local Cache)' : 'ONLINE'}
          </span>
        </div>
        <button 
          onClick={toggleNetworkMode}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            isOffline 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          {isOffline ? 'Reconnect Network' : 'Simulate Gym Dead-Zone'}
        </button>
      </div>

      {/* Sync Notifications Block */}
      {syncFeedback && (
        <div className="w-full max-w-2xl bg-indigo-950 border border-indigo-700 text-indigo-200 p-3 rounded-lg mb-4 text-center text-sm font-medium animate-bounce shadow-xl">
          {syncFeedback}
        </div>
      )}

      {/* Main Refined RSVP Card */}
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Event Header Banner */}
        <div className="bg-gradient-to-r from-red-900 to-amber-900 p-6 relative">
          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/50">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              {event.type}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-2 leading-tight">
            {event.title}
          </h2>
          <p className="text-slate-300 text-sm font-medium mt-1">
            Led by {event.coaches.join(' & ')}
          </p>
        </div>

        {/* Dynamic Warning: Holly's Biomechanical & Physio Integration */}
        {athlete.activeRehabFlag && (
          <div className="bg-amber-950/80 border-y border-amber-700/40 px-6 py-4 flex items-start space-x-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Physiotherapist Biomechanical Warning (Holly Hunt Core)
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed mt-1">
                {athlete.rehabNotes}
              </p>
              <div className="mt-2 flex space-x-2">
                <span className="bg-amber-900/60 border border-amber-700/50 px-2 py-0.5 rounded text-[10px] text-amber-300 font-bold uppercase">
                  #ShoulderRehab
                </span>
                <span className="bg-amber-900/60 border border-amber-700/50 px-2 py-0.5 rounded text-[10px] text-amber-300 font-bold uppercase">
                  #OverheadRestriction
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Content */}
        <div className="p-6 space-y-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            {event.description}
          </p>

          {/* Time and Location Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Schedule</span>
              <p className="text-xs font-bold text-slate-200 mt-1">{event.scheduledAt}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Location</span>
              <p className="text-xs font-bold text-slate-200 mt-1">{event.location}</p>
            </div>
          </div>

          {/* Dynamic Capacity Indicators */}
          <div className="space-y-3">
            <div className="flex justify-between items-end text-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Attendance Capacity</span>
                <span className="text-lg font-black text-white">
                  {event.currentAttendeesCount} <span className="text-xs font-medium text-slate-500">/ {event.maxCapacity} spots filled</span>
                </span>
              </div>
              {event.currentAttendeesCount >= event.maxCapacity && (
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">Waitlist Active</span>
                  <span className="text-sm font-black text-amber-300">
                    {event.waitlistCount} athletes queued
                  </span>
                </div>
              )}
            </div>

            {/* Dynamic visual bar indicator */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  event.currentAttendeesCount >= event.maxCapacity 
                    ? 'bg-gradient-to-r from-red-600 to-amber-500' 
                    : 'bg-gradient-to-r from-red-600 to-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (event.currentAttendeesCount / event.maxCapacity) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* User RSVP Action Panel */}
          <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Left side: current status feedback */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400">Your Status:</span>
              {userRsvpStatus === 'none' && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 uppercase">
                  Not Booked
                </span>
              )}
              {userRsvpStatus === 'attending' && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 border border-emerald-700 text-emerald-300 uppercase animate-pulse">
                  Attending Spot
                </span>
              )}
              {userRsvpStatus === 'waitlist' && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950 border border-amber-700 text-amber-300 uppercase animate-pulse">
                  Waitlisted #{event.waitlistCount}
                </span>
              )}
              {userRsvpStatus === 'syncing' && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 uppercase animate-pulse">
                  Syncing...
                </span>
              )}
            </div>

            {/* Right side: Touch Target optimized click targets (Fitts's Law) */}
            <div className="flex-1 sm:flex-none">
              {userRsvpStatus === 'none' ? (
                <button
                  onClick={() => handleRsvpToggle('join')}
                  className={`w-full sm:px-8 py-4 sm:py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:shadow-indigo-950/50 hover:scale-[1.01] active:scale-[0.98] transition-all duration-150 ${
                    event.currentAttendeesCount >= event.maxCapacity
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {event.currentAttendeesCount >= event.maxCapacity ? 'Join Waitlist' : '1-Tap RSVP (Book In)'}
                </button>
              ) : (
                <button
                  onClick={() => handleRsvpToggle('leave')}
                  disabled={userRsvpStatus === 'syncing'}
                  className="w-full sm:px-8 py-4 sm:py-3 bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 rounded-xl font-bold text-sm tracking-wide transition-all duration-150 active:scale-[0.98]"
                >
                  Cancel RSVP
                </button>
              )}
            </div>

          </div>

          {/* Latency Audits - Doherty Threshold Proof */}
          {latencyMs !== null && (
            <div className="text-[10px] text-slate-600 text-center font-mono">
              Server roundtrip: {latencyMs}ms (Under 400ms Doherty Threshold limit)
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
