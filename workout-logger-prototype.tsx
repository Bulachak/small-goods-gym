import React, { useState, useEffect } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface Exercise {
  id: string;
  name: string;
  videoUrl: string;
  category: string;
  mechanicalTags: string[];
  coachesTips: string;
}

interface SetLog {
  setNumber: number;
  prescribedReps: number;
  prescribedWeight: number;
  prescribedRpe: number;
  loggedReps: string;
  loggedWeight: string;
  loggedRpe: string;
  velocity: number | null; // Velocity in m/s
  isCompleted: boolean;
  statusMessage?: string; // e.g. "Fatigue Alert"
}

interface ActiveSession {
  id: string;
  exercise: Exercise;
  sets: SetLog[];
}

export default function GymFloorWorkoutLogger() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Athlete Anthropometric Profile (Leverages context)
  const athleteProfile = {
    name: "Alex",
    leverageTags: ["Long Femurs", "Short Torso"],
    setupTip: "Long Femurs & Short Torso detected: Elevate heels 1-2cm and adopt a wider squat stance to optimize hip mechanics."
  };

  // Current Exercise (SOLID Single Responsibility Principle: decoupled data model)
  const [currentExercise] = useState<Exercise>({
    id: "ex-01",
    name: "A1. High-Bar Back Squat",
    videoUrl: "https://player.vimeo.com/video/example",
    category: "Squat",
    mechanicalTags: ["Quad Dominant", "Hip Flexion", "Axial Loading"],
    coachesTips: "Focus on pushing the knees outward. Keep the chest high, and drive through the mid-foot."
  });

  // Logged sets state
  const [sets, setSets] = useState<SetLog[]>([
    { setNumber: 1, prescribedReps: 5, prescribedWeight: 100, prescribedRpe: 7, loggedReps: "5", loggedWeight: "100", loggedRpe: "7", velocity: 0.62, isCompleted: true },
    { setNumber: 2, prescribedReps: 5, prescribedWeight: 100, prescribedRpe: 7, loggedReps: "5", loggedWeight: "100", loggedRpe: "7.5", velocity: 0.58, isCompleted: true },
    { setNumber: 3, prescribedReps: 5, prescribedWeight: 100, prescribedRpe: 8, loggedReps: "5", loggedWeight: "100", loggedRpe: "8", velocity: 0.48, isCompleted: true },
    { setNumber: 4, prescribedReps: 5, prescribedWeight: 100, prescribedRpe: 8, loggedReps: "", loggedWeight: "", loggedRpe: "", velocity: null, isCompleted: false },
    { setNumber: 5, prescribedReps: 5, prescribedWeight: 100, prescribedRpe: 8, loggedReps: "", loggedWeight: "", loggedRpe: "", velocity: null, isCompleted: false },
  ]);

  // VBT Simulation State (Simulates real-time accelerometer stream)
  const [isSimulatingVbt, setIsSimulatingVbt] = useState<boolean>(false);
  const [currentSimulatedVelocity, setCurrentSimulatedVelocity] = useState<number | null>(null);
  const [vbtAlert, setVbtAlert] = useState<string | null>(null);

  // Active Set (Focus set for Hick's Law progressive disclosure)
  const [activeSetIndex, setActiveSetIndex] = useState<number>(3); // Set 4 is active index 3
  
  // Audio playback simulator
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);

  // ==========================================
  // CORE FUNCTIONS (HCI UX & POSTEL'S LAW)
  // ==========================================

  // Postel's Law: Be liberal in input validation, strip messy formatting
  const parseLoggedInput = (value: string): string => {
    // Strips out any accidental letters (e.g. "100kg" -> "100", "5reps" -> "5")
    return value.replace(/[^0-9.]/g, '');
  };

  const handleInputChange = (index: number, field: 'loggedReps' | 'loggedWeight' | 'loggedRpe', value: string) => {
    const updatedSets = [...sets];
    // Apply Postel's Law formatting
    const cleanedValue = parseLoggedInput(value);
    updatedSets[index][field] = cleanedValue;
    setSets(updatedSets);
  };

  // Doherty Threshold Helper: Instantly record log with haptic feedback simulator
  const completeSet = (index: number) => {
    const updatedSets = [...sets];
    const currentSet = updatedSets[index];

    // Fallback defaults if user clicked checkmark directly without typing (KISS)
    if (!currentSet.loggedReps) currentSet.loggedReps = currentSet.prescribedReps.toString();
    if (!currentSet.loggedWeight) currentSet.loggedWeight = currentSet.prescribedWeight.toString();
    if (!currentSet.loggedRpe) currentSet.loggedRpe = currentSet.prescribedRpe.toString();
    
    // Auto-generate VBT data if missing for the active set during demo
    if (!currentSet.velocity) {
      currentSet.velocity = Number((0.40 + Math.random() * 0.25).toFixed(2));
    }

    currentSet.isCompleted = true;
    setSets(updatedSets);

    // Provide haptic vibration feed (simulated via audio/web haptics if available)
    if (navigator.vibrate) {
      navigator.vibrate(40); // 40ms micro-pulse for high-quality confirmation
    }

    // Doherty Threshold: Optimistically shift focus immediately to next uncompleted set (0ms delay)
    const nextUncompletedIndex = updatedSets.findIndex(s => !s.isCompleted);
    if (nextUncompletedIndex !== -1) {
      setActiveSetIndex(nextUncompletedIndex);
    }
  };

  // VBT Accelerometer Simulator: Showcases Phase 2 smart capabilities
  const startVbtSimulation = () => {
    setIsSimulatingVbt(true);
    setCurrentSimulatedVelocity(0.70);
    setVbtAlert(null);

    let velocity = 0.70;
    const interval = setInterval(() => {
      velocity = Number((velocity - 0.08).toFixed(2));
      setCurrentSimulatedVelocity(velocity);

      // Biomechanical alert calculations based on velocity decay
      if (velocity < 0.48 && velocity >= 0.40) {
        setVbtAlert("⚠️ Velocity Loss Detected (25% fatigue). Push hard to complete the lift!");
      } else if (velocity < 0.40) {
        setVbtAlert("❌ CRITICAL FATIGUE (Over 35% Velocity Loss). Terminate set immediately to avoid form breakdown!");
        clearInterval(interval);
        setIsSimulatingVbt(false);
      }
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans border-x border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* STATUS BAR HEADER */}
      <header className="p-4 border-b border-slate-900 bg-slate-950 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white text-sm">
            SG
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide uppercase text-slate-200">Small Goods Gym</h1>
            <p className="text-xs text-slate-500 font-medium">Perth, Australia</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-300">Club Mode</span>
        </div>
      </header>

      {/* BODY CONTAINER */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-32">
        
        {/* ATHLETE ANTHROPOMETRIC LEVERAGE CALLOUT (Founder Philosophy Integration) */}
        <div className="bg-gradient-to-r from-orange-950/40 to-slate-900 p-4 rounded-xl border border-orange-500/20 shadow-md">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-extrabold uppercase bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded-full tracking-wider">
              Biomechanical Profile
            </span>
            <div className="flex space-x-1">
              {athleteProfile.leverageTags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
            &ldquo;{athleteProfile.setupTip}&rdquo; <span className="text-orange-500 font-bold">— Holly Hunt</span>
          </p>
        </div>

        {/* ACTIVE EXERCISE VIEW (Hick's Law focus) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-slate-100">{currentExercise.name}</h2>
            <div className="flex space-x-1.5">
              {currentExercise.mechanicalTags.map(tag => (
                <span key={tag} className="text-[10px] font-bold text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Master Video Demonstrator Panel */}
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex flex-col justify-center items-center shadow-lg group">
            {isPlayingVideo ? (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-400">📺 Streaming Video Demo (Private Library)</span>
                <button 
                  onClick={() => setIsPlayingVideo(false)}
                  className="absolute top-2 right-2 bg-slate-950/80 p-1 rounded-full text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60 z-10" />
                <div className="text-center z-20 space-y-2 p-4">
                  <p className="text-xs font-bold text-slate-400 mb-1">Coaches Tips:</p>
                  <p className="text-xs text-slate-200 px-4 leading-relaxed line-clamp-2 italic font-medium">
                    &ldquo;{currentExercise.coachesTips}&rdquo;
                  </p>
                  <button 
                    onClick={() => setIsPlayingVideo(true)}
                    className="mt-3 px-4 py-2 bg-slate-800/90 text-xs font-black tracking-wider uppercase rounded-lg border border-slate-700 shadow hover:bg-slate-700 transition"
                  >
                    ▶ WATCH MOVEMENT GUIDE
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* INTERACTIVE GYM-FLOOR SET WORKSPACE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-slate-400 uppercase">Set Progression Worklist</span>
            <span className="text-xs font-bold text-orange-500">Active: Set {activeSetIndex + 1}</span>
          </div>

          <div className="space-y-2.5">
            {sets.map((set, idx) => {
              const isActive = idx === activeSetIndex;
              return (
                <div 
                  key={set.setNumber}
                  onClick={() => setActiveSetIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border-orange-500 shadow-lg shadow-orange-500/5' 
                      : set.isCompleted 
                        ? 'bg-slate-950 border-emerald-500/20 hover:border-slate-800' 
                        : 'bg-slate-950 border-slate-900 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Set # Identifier */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                        set.isCompleted 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : isActive 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-slate-900 text-slate-500'
                      }`}>
                        {set.setNumber}
                      </div>
                      
                      {/* Prescribed Target Values */}
                      <div className="space-y-0.5">
                        <div className="text-xs text-slate-400 font-medium">Target:</div>
                        <div className="text-xs font-bold text-slate-200">
                          {set.prescribedReps} Reps @ {set.prescribedWeight}kg <span className="text-orange-500/80">(RPE {set.prescribedRpe})</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Input Block (Optimized Touch Targets for Sweat & CNS Fatigue) */}
                    {isActive ? (
                      <div className="flex items-center space-x-2">
                        {/* REPS INPUT */}
                        <div className="flex flex-col items-center">
                          <label className="text-[9px] font-black tracking-wider text-slate-500 uppercase mb-1">REPS</label>
                          <input 
                            type="text" 
                            pattern="[0-9]*"
                            value={set.loggedReps}
                            onChange={(e) => handleInputChange(idx, 'loggedReps', e.target.value)}
                            placeholder={set.prescribedReps.toString()}
                            className="w-12 h-10 bg-slate-950 text-center font-black text-sm text-white border border-slate-800 rounded-lg focus:border-orange-500 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* WEIGHT INPUT */}
                        <div className="flex flex-col items-center">
                          <label className="text-[9px] font-black tracking-wider text-slate-500 uppercase mb-1">WT (KG)</label>
                          <input 
                            type="text" 
                            pattern="[0-9]*"
                            value={set.loggedWeight}
                            onChange={(e) => handleInputChange(idx, 'loggedWeight', e.target.value)}
                            placeholder={set.prescribedWeight.toString()}
                            className="w-16 h-10 bg-slate-950 text-center font-black text-sm text-white border border-slate-800 rounded-lg focus:border-orange-500 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* RPE INPUT */}
                        <div className="flex flex-col items-center">
                          <label className="text-[9px] font-black tracking-wider text-slate-500 uppercase mb-1">RPE</label>
                          <input 
                            type="text" 
                            pattern="[0-9.]*"
                            value={set.loggedRpe}
                            onChange={(e) => handleInputChange(idx, 'loggedRpe', e.target.value)}
                            placeholder={set.prescribedRpe.toString()}
                            className="w-12 h-10 bg-slate-950 text-center font-black text-sm text-white border border-slate-800 rounded-lg focus:border-orange-500 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* FITTS'S LAW LOG BUTTON (Huge, tap-friendly complete target) */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            completeSet(idx);
                          }}
                          className="h-10 px-3.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-xs font-black rounded-lg text-white transition flex items-center"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      // Display logged static values if completed, else display pending state
                      <div className="text-right">
                        {set.isCompleted ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                              ✓ Saved
                            </span>
                            <div className="text-xs font-black text-emerald-400 mt-1">
                              {set.loggedReps} @ {set.loggedWeight}kg (RPE {set.loggedRpe})
                            </div>
                            {set.velocity && (
                              <div className="text-[10px] font-medium text-slate-400 italic">
                                Bar Speed: {set.velocity} m/s
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-600">Pending</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REAL-TIME VBT / ACCELEROMETER INTEGRATION (Phase 2 Scaffolding Showcase) */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-black tracking-wider text-slate-300 uppercase">Live VBT Engine Module</span>
            </div>
            {!isSimulatingVbt && (
              <button 
                onClick={startVbtSimulation}
                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-[10px] font-black uppercase rounded border border-red-500/20 transition"
              >
                Simulate Reps
              </button>
            )}
          </div>

          {isSimulatingVbt ? (
            <div className="space-y-2.5 bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Barometer Real-time Velocity Stream</span>
              <div className="text-3xl font-black text-slate-100 tracking-wider">
                {currentSimulatedVelocity !== null ? `${currentSimulatedVelocity} m/s` : '-- m/s'}
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                  style={{ width: `${(currentSimulatedVelocity || 0) * 120}%` }}
                />
              </div>
              {vbtAlert && (
                <div className="text-[11px] font-bold text-amber-400 bg-amber-950/20 border border-amber-500/10 p-2 rounded-md animate-pulse">
                  {vbtAlert}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 leading-relaxed py-1">
              Connect a Bluetooth 3-axis accelerometer (e.g. RepOne, GymAware) during block runs to automatically stream rep velocity logs, calculate fatigue drop-off, and automate load modifications.
            </div>
          )}
        </div>

      </main>

      {/* FIXED COHESIVE FOOTER NAVIGATION */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-slate-900 bg-slate-950/95 backdrop-blur px-6 py-3 flex items-center justify-between z-40">
        <button className="flex flex-col items-center space-y-1 text-orange-500">
          <span className="text-base">🏋️</span>
          <span className="text-[10px] font-black tracking-wider uppercase">Workout</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300">
          <span className="text-base">📅</span>
          <span className="text-[10px] font-bold tracking-wider uppercase">Events</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300">
          <span className="text-base">🏆</span>
          <span className="text-[10px] font-bold tracking-wider uppercase">PBs</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300">
          <span className="text-base">👤</span>
          <span className="text-[10px] font-bold tracking-wider uppercase">Profile</span>
        </button>
      </footer>

    </div>
  );
}
