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

  // Weight adjustments
  const adjustWeight = (delta: number) => {
    setSets((prev) => {
      const updated = [...prev];
      updated[currentSetIdx] = {
        ...updated[currentSetIdx],
        loggedWeightKg: Math.max(0, updated[currentSetIdx].loggedWeightKg + delta),
      };
      return updated;
    });
  };

  // Rep adjustments
  const adjustReps = (delta: number) => {
    setSets((prev) => {
      const updated = [...prev];
      updated[currentSetIdx] = {
        ...updated[currentSetIdx],
        loggedReps: Math.max(0, updated[currentSetIdx].loggedReps + delta),
      };
      return updated;
    });
  };

  // Velocity input
  const handleVelocityChange = (valStr: string) => {
    const val = parseFloat(valStr);
    setSets((prev) => {
      const updated = [...prev];
      updated[currentSetIdx] = {
        ...updated[currentSetIdx],
        vbtVelocityMs: isNaN(val) ? undefined : val,
      };
      return updated;
    });
  };

  // Toggle complete
  const completeCurrentSet = () => {
    setSets((prev) => {
      const updated = [...prev];
      updated[currentSetIdx] = {
        ...updated[currentSetIdx],
        completed: true,
      };
      return updated;
    });
    // Start 90s rest timer
    setRestSeconds(90);
    setTimerRunning(true);
    // Advance to next set if available
    if (currentSetIdx < sets.length - 1) {
      setCurrentSetIdx(currentSetIdx + 1);
    }
  };

  // Check VBT Velocity Loss (>15% drop from baseline = CNS fatigue trigger)
  const velocityDropPct = currentSet.vbtVelocityMs
    ? Math.round(((baselineVelocityMs - currentSet.vbtVelocityMs) / baselineVelocityMs) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseTitle}>{exerciseName}</Text>
          <Text style={styles.exerciseMeta}>
            Baseline Velocity: {baselineVelocityMs} m/s • Target: {initialWeightKg}kg × {initialReps} reps
          </Text>
        </View>

        {/* Set Navigator Tabs */}
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

        {/* Tactile Big-Button Logging Controls (Fitts's Law) */}
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
              placeholderTextColor="#6b7280"
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
              {currentSet.completed ? 'SET COMPLETED ✓ (TAP TO RE-LOG)' : 'COMPLETE SET ✓'}
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
              onPress={() => setTimerRunning(!timerRunning)}
            >
              <Text style={styles.timerBtnText}>{timerRunning ? 'PAUSE' : 'START TIMER'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timerBtn, styles.timerResetBtn]}
              onPress={() => {
                setTimerRunning(false);
                setRestSeconds(90);
              }}
            >
              <Text style={styles.timerResetBtnText}>RESET 90S</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0e',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  exerciseHeader: {
    marginBottom: 16,
  },
  exerciseTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  exerciseMeta: {
    color: '#9aef0f',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  setTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  setTab: {
    flex: 1,
    backgroundColor: '#161622',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242436',
  },
  setTabActive: {
    borderColor: '#9aef0f',
    backgroundColor: '#202032',
  },
  setTabCompleted: {
    backgroundColor: '#122612',
    borderColor: '#9aef0f',
  },
  setTabText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
  },
  setTabTextActive: {
    color: '#ffffff',
  },
  setTabTextCompleted: {
    color: '#9aef0f',
  },
  alertBanner: {
    backgroundColor: '#261b00',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  alertText: {
    color: '#fef3c7',
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#13131c',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222230',
    marginBottom: 16,
  },
  cardHeader: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  controlGroup: {
    marginBottom: 18,
  },
  controlLabel: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  hugeValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  unitText: {
    fontSize: 18,
    color: '#9aef0f',
    fontWeight: '600',
  },
  touchButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  modifierButton: {
    flex: 1,
    height: 52, // Fitts's Law 52dp minimum touch target
    backgroundColor: '#1e1e2d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2c2c42',
  },
  modifierButtonText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '700',
  },
  plusButton: {
    backgroundColor: '#262040',
    borderColor: '#4724ba',
  },
  plusButtonText: {
    color: '#a78bfa',
  },
  velocityInput: {
    backgroundColor: '#1a1a27',
    color: '#9aef0f',
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c2c40',
  },
  completeButton: {
    height: 64, // Massive 64dp primary floor button
    backgroundColor: '#9aef0f',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  completedAlreadyButton: {
    backgroundColor: '#4724ba',
  },
  completeButtonText: {
    color: '#0a0a0e',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timerCard: {
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e1e2c',
    alignItems: 'center',
  },
  timerTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
  },
  timerCountdown: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '900',
    marginVertical: 8,
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
    borderRadius: 8,
  },
  timerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  timerResetBtn: {
    backgroundColor: '#222230',
  },
  timerResetBtnText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default TactileFloorLogger;
