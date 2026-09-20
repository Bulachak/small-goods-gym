import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface SetEntry {
  setNumber: number;
  prescribedWeightKg: number;
  prescribedReps: number;
  loggedWeightKg: number;
  loggedReps: number;
  vbtVelocityMs?: number; // Enode velocity tracking
  completed: boolean;
}

export interface TactileFloorLoggerProps {
  exerciseName?: string;
  targetSets?: number;
  initialWeightKg?: number;
  initialReps?: number;
  baselineVelocityMs?: number;
  onLogComplete?: (sets: SetEntry[]) => void;
}

// Aliases and supplementary interfaces
export type SetData = SetEntry;
export interface ActiveExercise {
  name: string;
  targetSets: number;
  prescribedWeightKg: number;
  prescribedReps: number;
}

export const TactileFloorLogger: React.FC<TactileFloorLoggerProps> = ({
  exerciseName = 'A1. Snatch (Platform 3)',
  targetSets = 4,
  initialWeightKg = 85.0,
  initialReps = 2,
  baselineVelocityMs = 1.45,
  onLogComplete,
}) => {
  const [sets, setSets] = useState<SetEntry[]>([
    { setNumber: 1, prescribedWeightKg: initialWeightKg, prescribedReps: initialReps, loggedWeightKg: initialWeightKg, loggedReps: initialReps, vbtVelocityMs: 1.44, completed: true },
    { setNumber: 2, prescribedWeightKg: initialWeightKg, prescribedReps: initialReps, loggedWeightKg: initialWeightKg, loggedReps: initialReps, vbtVelocityMs: 1.38, completed: true },
    { setNumber: 3, prescribedWeightKg: initialWeightKg, prescribedReps: initialReps, loggedWeightKg: initialWeightKg, loggedReps: initialReps, vbtVelocityMs: 1.18, completed: false }, // >15% drop!
    { setNumber: 4, prescribedWeightKg: initialWeightKg, prescribedReps: initialReps, loggedWeightKg: initialWeightKg, loggedReps: initialReps, completed: false },
  ]);

  const [currentSetIdx, setCurrentSetIdx] = useState(2); // Set 3 active
  const [restSeconds, setRestSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && restSeconds > 0) {
      interval = setInterval(() => setRestSeconds((s) => s - 1), 1000);
    } else if (restSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, restSeconds]);

  const currentSet = sets[currentSetIdx];

  const adjustWeight = (delta: number) => {
    setSets((prev) => {
      const copy = [...prev];
      const newWeight = Math.max(0, Number((copy[currentSetIdx].loggedWeightKg + delta).toFixed(1)));
      copy[currentSetIdx] = { ...copy[currentSetIdx], loggedWeightKg: newWeight };
      return copy;
    });
  };

  const adjustReps = (delta: number) => {
    setSets((prev) => {
      const copy = [...prev];
      const newReps = Math.max(1, copy[currentSetIdx].loggedReps + delta);
      copy[currentSetIdx] = { ...copy[currentSetIdx], loggedReps: newReps };
      return copy;
    });
  };

  const handleVelocityChange = (val: string) => {
    const num = parseFloat(val);
    setSets((prev) => {
      const copy = [...prev];
      copy[currentSetIdx] = { ...copy[currentSetIdx], vbtVelocityMs: isNaN(num) ? undefined : num };
      return copy;
    });
  };

  const completeCurrentSet = () => {
    setSets((prev) => {
      const copy = [...prev];
      copy[currentSetIdx] = { ...copy[currentSetIdx], completed: true };
      return copy;
    });

    // Start 90s rest timer
    setRestSeconds(90);
    setTimerRunning(true);

    // Auto advance to next set if available
    if (currentSetIdx < sets.length - 1) {
      setCurrentSetIdx((idx) => idx + 1);
    }

    onLogComplete?.(sets);
  };

  // Check for CNS fatigue (>15% velocity loss)
  const velocityDropPct =
    currentSet.vbtVelocityMs && baselineVelocityMs
      ? Math.round(((baselineVelocityMs - currentSet.vbtVelocityMs) / baselineVelocityMs) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>TACTILE FLOOR LOGGER</Text>
          </View>
          <Text style={styles.exerciseTitle}>{exerciseName}</Text>
          <Text style={styles.subtitle}>
            Prescribed: {targetSets} Sets × {initialReps} Reps @ {initialWeightKg}kg • Baseline: {baselineVelocityMs} m/s
          </Text>
        </View>

        {/* Coach Joel Mullen's Floor Directive (Signature Yellow Sticky Note) */}
        <View style={styles.stickyNote}>
          <View style={styles.stickyBadge}>
            <Text style={styles.stickyBadgeText}>STICKER CUE</Text>
          </View>
          <Text style={styles.stickyHeader}>COACH JOEL MULLEN'S LIVE FLOOR DIRECTIVE:</Text>
          <Text style={styles.stickyQuote}>
            "Push knees out hard into the band on the ascent. Torso must not collapse forward past 45°!"
          </Text>
          <View style={styles.stickyFooter}>
            <Text style={styles.stickyMeta}>Target Stance: Wide (Low Bar)</Text>
            <Text style={styles.stickyMeta}>Threshold: 20% Velocity Loss</Text>
          </View>
        </View>

        {/* Set Selector Tabs */}
        <View style={styles.setTabsRow}>
          {sets.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.setTab,
                idx === currentSetIdx && styles.setTabActive,
                s.completed && styles.setTabCompleted,
              ]}
              onPress={() => setCurrentSetIdx(idx)}
            >
              <Text
                style={[
                  styles.setTabText,
                  idx === currentSetIdx && styles.setTabTextActive,
                  s.completed && styles.setTabTextCompleted,
                ]}
              >
                Set {s.setNumber} {s.completed ? '✓' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CNS Fatigue Velocity Alert Banner */}
        {velocityDropPct > 15 && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertTitle}>⚠️ CNS FATIGUE DETECTED ({velocityDropPct}% SPEED DROP)</Text>
            <Text style={styles.alertText}>
              Bar velocity fell from {baselineVelocityMs} m/s to {currentSet.vbtVelocityMs} m/s.
              Small Goods triage: Drop load 5% (to {(currentSet.loggedWeightKg * 0.95).toFixed(1)}kg) or terminate lift to prevent neurological burnout.
            </Text>
          </View>
        )}

        {/* Tactile Big-Button Logging Controls (Fitts's Law 64dp) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SET {currentSet.setNumber} LOGGING CONTROLS</Text>

          {/* Weight Controls */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Working Load</Text>
            <Text style={styles.hugeValue}>{currentSet.loggedWeightKg} <Text style={styles.unitText}>kg</Text></Text>
            <View style={styles.touchButtonsRow}>
              <TouchableOpacity style={styles.modifierButton} onPress={() => adjustWeight(-5.0)}>
                <Text style={styles.modifierButtonText}>-5kg</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modifierButton} onPress={() => adjustWeight(-2.5)}>
                <Text style={styles.modifierButtonText}>-2.5kg</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modifierButton, styles.plusButton]} onPress={() => adjustWeight(+2.5)}>
                <Text style={[styles.modifierButtonText, styles.plusButtonText]}>+2.5kg</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modifierButton, styles.plusButton]} onPress={() => adjustWeight(+5.0)}>
                <Text style={[styles.modifierButtonText, styles.plusButtonText]}>+5kg</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reps Controls */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Completed Reps</Text>
            <Text style={styles.hugeValue}>{currentSet.loggedReps} <Text style={styles.unitText}>reps</Text></Text>
            <View style={styles.touchButtonsRow}>
              <TouchableOpacity style={styles.modifierButton} onPress={() => adjustReps(-1)}>
                <Text style={styles.modifierButtonText}>-1 Rep</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modifierButton, styles.plusButton]} onPress={() => adjustReps(+1)}>
                <Text style={[styles.modifierButtonText, styles.plusButtonText]}>+1 Rep</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enode VBT Velocity Input */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Enode Bar Velocity (m/s)</Text>
            <TextInput
              style={styles.velocityInput}
              keyboardType="numeric"
              placeholder="e.g. 1.25"
              placeholderTextColor="#64748b"
              value={currentSet.vbtVelocityMs ? String(currentSet.vbtVelocityMs) : ''}
              onChangeText={handleVelocityChange}
            />
          </View>

          {/* Large Tactile Complete Button (Doherty Threshold: Instant Confirmation) */}
          <TouchableOpacity
            style={[styles.completeButton, currentSet.completed && styles.completedAlreadyButton]}
            onPress={completeCurrentSet}
          >
            <Text style={styles.completeButtonText}>
              {currentSet.completed ? 'SET COMPLETED ✓ (TAP TO RE-LOG)' : '✓ LOG SET'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 90-Second Floor Rest Timer */}
        <View style={styles.timerCard}>
          <Text style={styles.timerTitle}>Floor Rest Timer (90s Protocol)</Text>
          <Text style={styles.timerCountdown}>
            {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}
          </Text>
          <View style={styles.timerButtonsRow}>
            <TouchableOpacity
              style={styles.timerBtn}
              onPress={() => setTimerRunning((r) => !r)}
            >
              <Text style={styles.timerBtnText}>{timerRunning ? 'PAUSE' : 'START 90s'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timerBtn, styles.timerResetBtn]}
              onPress={() => {
                setTimerRunning(false);
                setRestSeconds(90);
              }}
            >
              <Text style={styles.timerResetBtnText}>RESET</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ==========================================
// NEO-BRUTALIST STYLESHEET (Small Goods Standard)
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerBadge: {
    backgroundColor: '#4724ba',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    marginBottom: 6,
  },
  headerBadgeText: {
    color: '#ffffff',
    fontFamily: 'Roboto Mono',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  exerciseTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Roboto Mono',
  },
  stickyNote: {
    backgroundColor: '#f8ef8d',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  stickyBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  stickyBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '900',
  },
  stickyHeader: {
    color: '#1e293b',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'Roboto Mono',
    letterSpacing: 0.5,
  },
  stickyQuote: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 22,
    marginVertical: 6,
  },
  stickyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.15)',
    paddingTop: 6,
    marginTop: 4,
  },
  stickyMeta: {
    color: '#1e293b',
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
  },
  setTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  setTab: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  setTabActive: {
    backgroundColor: '#4724ba',
    borderColor: '#000000',
  },
  setTabCompleted: {
    backgroundColor: '#1a331a',
    borderColor: '#9aef0f',
  },
  setTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '800',
  },
  setTabTextActive: {
    color: '#ffffff',
  },
  setTabTextCompleted: {
    color: '#9aef0f',
  },
  alertBanner: {
    backgroundColor: '#e95766',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  alertTitle: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'Roboto Mono',
    marginBottom: 4,
  },
  alertText: {
    color: '#000000',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  controlGroup: {
    marginBottom: 18,
  },
  controlLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Roboto Mono',
    marginBottom: 4,
  },
  hugeValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'Roboto Mono',
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 16,
    color: '#9aef0f',
    fontWeight: '700',
  },
  touchButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modifierButton: {
    flex: 1,
    height: 52, // Fitts's Law touch target
    backgroundColor: '#1e293b',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  modifierButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Roboto Mono',
    fontWeight: '800',
  },
  plusButton: {
    backgroundColor: '#f8ef8d',
  },
  plusButtonText: {
    color: '#000000',
  },
  velocityInput: {
    backgroundColor: '#1e293b',
    color: '#9aef0f',
    fontSize: 18,
    fontFamily: 'Roboto Mono',
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    marginTop: 4,
  },
  completeButton: {
    height: 60,
    backgroundColor: '#9aef0f',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginTop: 8,
  },
  completedAlreadyButton: {
    backgroundColor: '#4724ba',
  },
  completeButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    alignItems: 'center',
  },
  timerTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '800',
  },
  timerCountdown: {
    color: '#ffffff',
    fontSize: 40,
    fontFamily: 'Roboto Mono',
    fontWeight: '900',
    marginVertical: 6,
    letterSpacing: -1,
  },
  timerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timerBtn: {
    backgroundColor: '#4724ba',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  timerBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '900',
  },
  timerResetBtn: {
    backgroundColor: '#1e293b',
  },
  timerResetBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '800',
  },
});

export default TactileFloorLogger;
