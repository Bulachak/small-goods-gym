import React, { useState, useMemo } from 'react';

// --- Types & Interfaces ---
interface Athlete {
  id: string;
  name: string;
  email: string;
  heightCm: number;
  femurCm: number;
  torsoCm: number;
  armSpanCm: number;
  primarySport: 'Powerlifting' | 'Olympic Weightlifting' | 'Athletic Rehab';
  currentPhase: string;
}

interface BiomechanicalAnalysis {
  femurToTorsoRatio: number;
  femurToHeightRatio: number;
  torsoToHeightRatio: number;
  armSpanToHeightRatio: number;
  squatClassification: string;
  deadliftClassification: string;
  benchClassification: string;
  leverageTags: string[];
  coachingDirectives: {
    squat: string;
    bench: string;
    deadlift: string;
  };
}

// --- Hardcoded Initial Mock Data ---
const MOCK_ATHLETES: Athlete[] = [
  {
    id: "ath-001",
    name: "Joel Mullen (Founder/Coach)",
    email: "joel.mullen@smallgoodsgym.com.au",
    heightCm: 182.0,
    femurCm: 53.5,
    torsoCm: 48.0,
    armSpanCm: 188.5,
    primarySport: "Powerlifting",
    currentPhase: "Absolute Strength Block"
  },
  {
    id: "ath-002",
    name: "Holly Hunt (Physio/Coach)",
    email: "holly.hunt@smallgoodsgym.com.au",
    heightCm: 168.0,
    femurCm: 43.0,
    torsoCm: 45.0,
    armSpanCm: 164.0,
    primarySport: "Athletic Rehab",
    currentPhase: "Ankle Mobility & Quad Dominance"
  },
  {
    id: "ath-003",
    name: "Liam O'Connor",
    email: "liam.oc@gmail.com",
    heightCm: 175.0,
    femurCm: 51.0,
    torsoCm: 42.0,
    armSpanCm: 185.0,
    primarySport: "Olympic Weightlifting",
    currentPhase: "Snatch & Clean Pull Focus"
  }
];

export default function AthleteBiometricsDashboard() {
  const [athletes, setAthletes] = useState<Athlete[]>(MOCK_ATHLETES);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(MOCK_ATHLETES[0].id);

  // Form states for manual overrides & adjustments
  const [isEditing, setIsEditing] = useState(false);
  const [height, setHeight] = useState<number>(MOCK_ATHLETES[0].heightCm);
  const [femur, setFemur] = useState<number>(MOCK_ATHLETES[0].femurCm);
  const [torso, setTorso] = useState<number>(MOCK_ATHLETES[0].torsoCm);
  const [armSpan, setArmSpan] = useState<number>(MOCK_ATHLETES[0].armSpanCm);

  // Resolve currently active athlete
  const activeAthlete = useMemo(() => {
    return athletes.find(a => a.id === selectedAthleteId) || athletes[0];
  }, [athletes, selectedAthleteId]);

  // Sync edit form inputs when athlete selection changes
  const handleAthleteChange = (id: string) => {
    setSelectedAthleteId(id);
    const athlete = athletes.find(a => a.id === id) || athletes[0];
    setHeight(athlete.heightCm);
    setFemur(athlete.femurCm);
    setTorso(athlete.torsoCm);
    setArmSpan(athlete.armSpanCm);
    setIsEditing(false);
  };

  // Dynamic Leverages & Biomechanical Analysis Engine (GRASP Information Expert)
  const analysis = useMemo((): BiomechanicalAnalysis => {
    const h = height;
    const f = femur;
    const t = torso;
    const a = armSpan;

    const femurToTorsoRatio = t > 0 ? f / t : 1.1;
    const femurToHeightRatio = h > 0 ? f / h : 0.26;
    const torsoToHeightRatio = h > 0 ? t / h : 0.26;
    const armSpanToHeightRatio = h > 0 ? a / h : 1.0;

    const leverageTags: string[] = [];
    let squatClassification = "Moderate / Average Leverages";
    let deadliftClassification = "Neutral Leverages";
    let benchClassification = "Neutral Pressing Geometry";

    // Squat Leverage Rules based on Femur-to-Torso
    if (femurToTorsoRatio > 1.15) {
      leverageTags.push("Long Femurs");
      squatClassification = "Extreme Forward Lean / Hip-Dominant Squatter";
    } else if (femurToTorsoRatio < 0.95) {
      leverageTags.push("Short Femurs");
      squatClassification = "Upright Torso / Highly Quad-Dominant";
    } else {
      leverageTags.push("Proportional Femurs");
    }

    // Torso Height Rules
    if (torsoToHeightRatio < 0.25) {
      leverageTags.push("Short Torso");
    } else if (torsoToHeightRatio > 0.28) {
      leverageTags.push("Long Torso");
    }

    // Deadlift / Bench Leverage Rules based on Arm Span (Ape Index)
    if (armSpanToHeightRatio > 1.03) {
      leverageTags.push("Long Arms (Ape Index > 1.03)");
      deadliftClassification = "Highly Favored Deadlifter (Short Pulling Range)";
      benchClassification = "Extended Pressing Range (Requires High Lat Arch)";
    } else if (armSpanToHeightRatio < 0.97) {
      leverageTags.push("Short Arms (Ape Index < 0.97)");
      deadliftClassification = "Challenged Deadlift Setup (Requires Deep Hip Flexion)";
      benchClassification = "Short Pressing Range (Advantaged Bencher)";
    } else {
      leverageTags.push("Proportional Arms");
    }

    // Dynamic Coaching Directives Generation
    const squatDirective = femurToTorsoRatio > 1.15
      ? "Recommend wider stance, moderate out-toeing (15-30°), and low-bar barbell placement to reduce shearing forces on the lumbar spine. Focus on dynamic ankle mobility protocols to keep the knees tracking forward."
      : "Advantaged squat mechanics. High-bar back squats, front squats, and safety-bar squats are highly effective. Maintain structural upright posture; emphasize driving through mid-foot.";

    const benchDirective = armSpanToHeightRatio > 1.03
      ? "Extended stroke depth. Emphasize scapular retraction and lat packing to build a stable platform. Recommend building a robust arch within competitive parameters and focusing on dynamic overhead mobility."
      : "Excellent pressing advantages. Short range of motion. Focus on maximum tricep leg-drive coordination and close-grip bench variations to overload pressing capacity.";

    const deadliftDirective = armSpanToHeightRatio > 1.03
      ? "Outstanding biomechanical setup. Conventional deadlifts are highly natural. Keep hips relatively high during the setup, engage lats early, and emphasize explosive hamstring drive."
      : "Sub-optimal conventional geometry. To reduce spinal shear, consider a wide-stance Sumo deadlift to shorten the effective lever arms, or utilize elevated blocks/trap bars during high-fatigue training blocks.";

    return {
      femurToTorsoRatio,
      femurToHeightRatio,
      torsoToHeightRatio,
      armSpanToHeightRatio,
      squatClassification,
      deadliftClassification,
      benchClassification,
      leverageTags,
      coachingDirectives: {
        squat: squatDirective,
        bench: benchDirective,
        deadlift: deadliftDirective
      }
    };
  }, [height, femur, torso, armSpan]);

  // Handle saving biomechanical changes to current active state
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAthletes(prev => prev.map(ath => {
      if (ath.id === selectedAthleteId) {
        return {
          ...ath,
          heightCm: height,
          femurCm: femur,
          torsoCm: torso,
          armSpanCm: armSpan
        };
      }
      return ath;
    }));
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-6 font-sans">
      {/* Header Panel */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
              Coaching Co-Pilot Core
            </span>
            <span className="text-xs text-neutral-400 font-mono">v1.1 Stable</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">Small Goods Gym</h1>
          <p className="text-sm text-neutral-400 mt-1">Biomechanical Profiles & Anthropometric Leverages Dashboard</p>
        </div>

        {/* Athlete Selection Dropdown (HCI: Grouped Controls) */}
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-neutral-800/80 p-3 rounded-lg border border-neutral-700/60 shadow-lg">
          <label htmlFor="athlete-select" className="text-sm font-semibold text-neutral-300">Active Athlete:</label>
          <select
            id="athlete-select"
            value={selectedAthleteId}
            onChange={(e) => handleAthleteChange(e.target.value)}
            className="bg-neutral-950 text-white border border-neutral-700 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium cursor-pointer"
          >
            {athletes.map(ath => (
              <option key={ath.id} value={ath.id}>
                {ath.name} ({ath.primarySport})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Anthropometrics Form & Inputs */}
        <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold tracking-wide text-amber-400">Anthropometry Inputs</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-xs font-semibold uppercase bg-neutral-800 hover:bg-neutral-700 text-white rounded transition"
                >
                  Edit Proportions
                </button>
              ) : (
                <button
                  onClick={() => handleAthleteChange(selectedAthleteId)} // Cancels changes
                  className="px-3 py-1 text-xs font-semibold uppercase bg-red-950 hover:bg-red-900 text-red-200 rounded transition"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSave} className="space-y-5">
              {/* Total Height */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Height (cm)</label>
                  <span className="text-sm font-mono font-semibold text-white">{height} cm</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="210"
                  step="0.5"
                  value={height}
                  disabled={!isEditing}
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
                />
              </div>

              {/* Femur Length */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Femur Length (cm)</label>
                  <span className="text-sm font-mono font-semibold text-white">{femur} cm</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="65"
                  step="0.5"
                  value={femur}
                  disabled={!isEditing}
                  onChange={(e) => setFemur(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
                />
              </div>

              {/* Torso Length */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Torso Length (cm)</label>
                  <span className="text-sm font-mono font-semibold text-white">{torso} cm</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="65"
                  step="0.5"
                  value={torso}
                  disabled={!isEditing}
                  onChange={(e) => setTorso(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
                />
              </div>

              {/* Arm Span */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Arm Span (cm)</label>
                  <span className="text-sm font-mono font-semibold text-white">{armSpan} cm</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="220"
                  step="0.5"
                  value={armSpan}
                  disabled={!isEditing}
                  onChange={(e) => setArmSpan(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
                />
              </div>

              {isEditing && (
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold uppercase tracking-wider rounded-lg text-sm shadow-md hover:shadow-lg transition duration-250 mt-4 border border-amber-400"
                >
                  Apply & Recalculate
                </button>
              )}
            </form>
          </div>

          {/* Quick Details Card */}
          <div className="mt-8 pt-6 border-t border-neutral-800 text-xs text-neutral-400 space-y-2 font-mono">
            <div><span className="text-neutral-500">Athlete UUID:</span> {activeAthlete.id}</div>
            <div><span className="text-neutral-500">Email:</span> {activeAthlete.email}</div>
            <div><span className="text-neutral-500">Program Block:</span> {activeAthlete.currentPhase}</div>
          </div>
        </div>

        {/* Center Column: Biomechanical Analysis & Leverage Identifiers */}
        <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 shadow-xl lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-white mb-4">Leverage Analysis</h2>

            {/* Dynamic Leverage Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {analysis.leverageTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs font-bold font-mono tracking-wider bg-neutral-800 border border-neutral-700 text-amber-400 rounded"
                >
                  # {tag}
                </span>
              ))}
            </div>

            {/* Micro-bar charts representing ratios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Femur-to-Torso Ratio */}
              <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
                  <span>Femur-to-Torso Ratio (f/t)</span>
                  <span className="font-mono font-semibold text-white">{analysis.femurToTorsoRatio.toFixed(2)}</span>
                </div>
                <div className="w-full bg-neutral-850 h-3 rounded overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded transition-all duration-350"
                    style={{ width: `${Math.min(100, (analysis.femurToTorsoRatio / 1.5) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1.5 font-mono">
                  <span>&lt;0.95 (Short)</span>
                  <span>1.0 - 1.10 (Proportional)</span>
                  <span>&gt;1.15 (Long)</span>
                </div>
              </div>

              {/* Ape Index (Arm Span / Height) */}
              <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
                  <span>Ape Index (Arm Span / Height)</span>
                  <span className="font-mono font-semibold text-white">{analysis.armSpanToHeightRatio.toFixed(2)}</span>
                </div>
                <div className="w-full bg-neutral-850 h-3 rounded overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded transition-all duration-350"
                    style={{ width: `${Math.min(100, (analysis.armSpanToHeightRatio / 1.2) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1.5 font-mono">
                  <span>&lt;0.97 (Short)</span>
                  <span>1.00 (Perfect Match)</span>
                  <span>&gt;1.03 (Long)</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Coach Co-Pilot Section (Human-in-the-Loop Concept) */}
          <div className="pt-6 border-t border-neutral-800">
            <div className="flex items-center space-x-2 mb-4">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-md font-bold tracking-wide text-white uppercase font-mono">
                AI Coach Co-Pilot Suggestions
              </h3>
            </div>

            <div className="space-y-4">
              {/* Squat Mechanics */}
              <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-lg hover:border-neutral-700 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-neutral-200">SQUAT PATTERN</h4>
                  <span className="text-xs font-semibold text-amber-400 font-mono mt-1 md:mt-0">
                    {analysis.squatClassification}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {analysis.coachingDirectives.squat}
                </p>
              </div>

              {/* Bench Mechanics */}
              <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-lg hover:border-neutral-700 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-neutral-200">BENCH PRESS</h4>
                  <span className="text-xs font-semibold text-amber-400 font-mono mt-1 md:mt-0">
                    {analysis.benchClassification}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {analysis.coachingDirectives.bench}
                </p>
              </div>

              {/* Deadlift Mechanics */}
              <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-lg hover:border-neutral-700 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-neutral-200">DEADLIFT GEOMETRY</h4>
                  <span className="text-xs font-semibold text-amber-400 font-mono mt-1 md:mt-0">
                    {analysis.deadliftClassification}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {analysis.coachingDirectives.deadlift}
                </p>
              </div>
            </div>

            {/* Direct Physio Integration Flag (Holly's Input) */}
            <div className="mt-5 p-4 bg-rose-950/15 border border-rose-800/20 rounded-lg flex items-start space-x-3">
              <span className="text-lg mt-0.5">🩺</span>
              <div>
                <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                  Physiotherapist Review Gateway
                </h5>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                  "Getting strong and getting out of pain should never be two separate conversations." — Co-Pilot suggestions are running against active load boundaries. Joint shear indicators and range-of-motion limits are automatically sync'd to Holly Hunt’s active clinical treatment portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
