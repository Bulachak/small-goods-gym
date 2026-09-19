import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';

// --- Types & Interfaces ---
export interface Attempt {
  number: 1 | 2 | 3;
  weightKg: number;
  result: 'good' | 'no_lift' | 'pending';
  spreadKg?: number;
}

export interface LiftAttempts {
  attempts: Attempt[];
  bestKg: number;
}

export interface LifterPassportData {
  athleteId: string;
  name: string;
  division: string;
  weightClassKg: number;
  club: string;
  federation: string;
  ipfGlPoints: number;
  tierRank: 'Diamond' | 'Platinum' | 'Gold' | 'Silver 1' | 'Silver 2' | 'Silver 3' | 'Bronze';
  percentileRank: number; // e.g. 19 for Top 19%
  bestSquatKg: number;
  bestBenchKg: number;
  bestDeadliftKg: number;
  totalKg: number;
  trophies: {
    title: string;
    level: 'gold' | 'silver' | 'bronze';
    count: number;
  }[];
  recentMeet: {
    meetName: string;
    date: string;
    squat: LiftAttempts;
    bench: LiftAttempts;
    deadlift: LiftAttempts;
  };
  gymTelemetry: {
    meanVelocity30Day: number; // m/s on top sets
    cleatherFemurRatio: number; // femur/torso
    leverArchetype: string;
  };
}

// --- Default Props / Mock Data ---
export const MOCK_PASSPORT_DATA: LifterPassportData = {
  athleteId: 'ath-004',
  name: 'Amie Culverson',
  division: 'Masters 1 (40–49)',
  weightClassKg: 69,
  club: 'Small Goods Gym (Morley, WA)',
  federation: 'APLA / APU (IPF Affiliate)',
  ipfGlPoints: 76.93,
  tierRank: 'Silver 2',
  percentileRank: 19,
  bestSquatKg: 132.5,
  bestBenchKg: 67.5,
  bestDeadliftKg: 165.0,
  totalKg: 365.0,
  trophies: [
    { title: 'National Champion', level: 'gold', count: 3 },
    { title: 'State Champion', level: 'gold', count: 4 },
    { title: 'APU Open Podium', level: 'silver', count: 2 },
  ],
  recentMeet: {
    meetName: '2026 WA State Championships',
    date: 'August 2026',
    squat: {
      attempts: [
        { number: 1, weightKg: 122.5, result: 'good' },
        { number: 2, weightKg: 127.5, result: 'good', spreadKg: 5.0 },
        { number: 3, weightKg: 132.5, result: 'no_lift', spreadKg: 5.0 },
      ],
      bestKg: 127.5,
    },
    bench: {
      attempts: [
        { number: 1, weightKg: 62.5, result: 'good' },
        { number: 2, weightKg: 65.0, result: 'good', spreadKg: 2.5 },
        { number: 3, weightKg: 67.5, result: 'good', spreadKg: 2.5 },
      ],
      bestKg: 67.5,
    },
    deadlift: {
      attempts: [
        { number: 1, weightKg: 145.0, result: 'good' },
        { number: 2, weightKg: 155.0, result: 'good', spreadKg: 10.0 },
        { number: 3, weightKg: 165.0, result: 'good', spreadKg: 10.0 },
      ],
      bestKg: 165.0,
    },
  },
  gymTelemetry: {
    meanVelocity30Day: 0.54,
    cleatherFemurRatio: 1.18,
    leverArchetype: 'Long Femurs / Deadlift Dominant',
  },
};

export const LifterPassportCard: React.FC<{
  data?: LifterPassportData;
  onExportStory?: () => void;
}> = ({ data = MOCK_PASSPORT_DATA, onExportStory }) => {
  const [activeTab, setActiveTab] = useState<'meet' | 'training'>('meet');

  // Lift proportions
  const total = data.bestSquatKg + data.bestBenchKg + data.bestDeadliftKg;
  const sqPct = Math.round((data.bestSquatKg / total) * 100);
  const bpPct = Math.round((data.bestBenchKg / total) * 100);
  const dlPct = 100 - sqPct - bpPct;

  const handleShareStory = async () => {
    if (onExportStory) {
      onExportStory();
      return;
    }
    try {
      await Share.share({
        message: `🐐 Small Goods Gym Lifter Passport • ${data.name} (${data.tierRank})\nSBD: ${data.bestSquatKg} / ${data.bestBenchKg} / ${data.bestDeadliftKg} (Total: ${data.totalKg}kg)\nGL Points: ${data.ipfGlPoints} (Top ${data.percentileRank}% Global)`,
      });
    } catch {
      Alert.alert('Share Error', 'Unable to open share sheet.');
    }
  };

  const renderAttemptPill = (att: Attempt) => {
    const isGood = att.result === 'good';
    const isNoLift = att.result === 'no_lift';
    const bgColor = isGood ? '#1b4728' : isNoLift ? '#5a1d1d' : '#21262d';
    const borderColor = isGood ? '#2ea043' : isNoLift ? '#da3633' : '#30363d';
    const icon = isGood ? '✓' : isNoLift ? '✗' : '—';

    return (
      <View key={att.number} style={[styles.attemptPill, { backgroundColor: bgColor, borderColor }]}>
        <Text style={styles.attemptNumber}>Att {att.number}</Text>
        <Text style={styles.attemptWeight}>{att.weightKg} kg</Text>
        <Text style={[styles.attemptIcon, { color: isGood ? '#3fb950' : '#f85149' }]}>{icon}</Text>
        {att.spreadKg !== undefined && (
          <Text style={styles.attemptSpread}>+{att.spreadKg}kg</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header Card */}
      <View style={styles.heroCard}>
        <View style={styles.brandBadgeRow}>
          <View style={styles.goatBadge}>
            <Text style={styles.goatBadgeText}>🐐 SMALL GOODS GYM</Text>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>{data.tierRank.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.athleteName}>{data.name}</Text>
        <Text style={styles.athleteSubtitle}>
          {data.division} • {data.weightClassKg}kg Class • {data.federation}
        </Text>

        {/* Big Total & Points Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>BEST TOTAL</Text>
            <Text style={styles.statValueGreen}>{data.totalKg} kg</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>IPF GL POINTS</Text>
            <Text style={styles.statValueYellow}>{data.ipfGlPoints}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>GLOBAL RANK</Text>
            <Text style={styles.statValuePurple}>Top {data.percentileRank}%</Text>
          </View>
        </View>

        {/* SBD Breakdown Badges */}
        <View style={styles.sbdGrid}>
          <View style={styles.sbdItem}>
            <Text style={styles.sbdLabel}>SQUAT</Text>
            <Text style={styles.sbdValue}>{data.bestSquatKg} kg</Text>
            <Text style={styles.sbdRatio}>{sqPct}% of Total</Text>
          </View>
          <View style={styles.sbdItem}>
            <Text style={styles.sbdLabel}>BENCH</Text>
            <Text style={styles.sbdValue}>{data.bestBenchKg} kg</Text>
            <Text style={styles.sbdRatio}>{bpPct}% of Total</Text>
          </View>
          <View style={styles.sbdItem}>
            <Text style={styles.sbdLabel}>DEADLIFT</Text>
            <Text style={styles.sbdValue}>{data.bestDeadliftKg} kg</Text>
            <Text style={styles.sbdRatio}>{dlPct}% of Total</Text>
          </View>
        </View>

        {/* Visual Proportion Bar */}
        <View style={styles.proportionBarContainer}>
          <View style={[styles.proportionSegment, { flex: sqPct, backgroundColor: '#4724ba' }]} />
          <View style={[styles.proportionSegment, { flex: bpPct, backgroundColor: '#f8ef8d' }]} />
          <View style={[styles.proportionSegment, { flex: dlPct, backgroundColor: '#9aef0f' }]} />
        </View>
        <View style={styles.proportionLegend}>
          <Text style={[styles.legendText, { color: '#8c6bf7' }]}>SQ {sqPct}%</Text>
          <Text style={[styles.legendText, { color: '#f8ef8d' }]}>BP {bpPct}%</Text>
          <Text style={[styles.legendText, { color: '#9aef0f' }]}>DL {dlPct}%</Text>
        </View>
      </View>

      {/* Mode Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'meet' && styles.toggleButtonActive]}
          onPress={() => setActiveTab('meet')}
        >
          <Text style={[styles.toggleButtonText, activeTab === 'meet' && styles.toggleButtonTextActive]}>
            🏆 Meet Attempts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'training' && styles.toggleButtonActive]}
          onPress={() => setActiveTab('training')}
        >
          <Text style={[styles.toggleButtonText, activeTab === 'training' && styles.toggleButtonTextActive]}>
            ⚡ Gym Telemetry
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content: Meet 9-Attempt Accordion */}
      {activeTab === 'meet' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>
            {data.recentMeet.meetName} • {data.recentMeet.date}
          </Text>

          {/* Squat Accordion */}
          <View style={styles.liftAccordion}>
            <View style={styles.liftHeaderRow}>
              <Text style={styles.liftTitle}>Squat</Text>
              <Text style={styles.liftBest}>Best: {data.recentMeet.squat.bestKg} kg</Text>
            </View>
            <View style={styles.attemptsRow}>
              {data.recentMeet.squat.attempts.map(renderAttemptPill)}
            </View>
          </View>

          {/* Bench Accordion */}
          <View style={styles.liftAccordion}>
            <View style={styles.liftHeaderRow}>
              <Text style={styles.liftTitle}>Bench Press</Text>
              <Text style={styles.liftBest}>Best: {data.recentMeet.bench.bestKg} kg</Text>
            </View>
            <View style={styles.attemptsRow}>
              {data.recentMeet.bench.attempts.map(renderAttemptPill)}
            </View>
          </View>

          {/* Deadlift Accordion */}
          <View style={styles.liftAccordion}>
            <View style={styles.liftHeaderRow}>
              <Text style={styles.liftTitle}>Deadlift</Text>
              <Text style={styles.liftBest}>Best: {data.recentMeet.deadlift.bestKg} kg</Text>
            </View>
            <View style={styles.attemptsRow}>
              {data.recentMeet.deadlift.attempts.map(renderAttemptPill)}
            </View>
          </View>

          {/* Trophy Case */}
          <View style={styles.trophyContainer}>
            <Text style={styles.trophyHeader}>🏅 Career Trophy Case</Text>
            <View style={styles.trophyRow}>
              {data.trophies.map((t, idx) => (
                <View key={idx} style={styles.trophyBadge}>
                  <Text style={styles.trophyIcon}>
                    {t.level === 'gold' ? '🥇' : t.level === 'silver' ? '🥈' : '🥉'}
                  </Text>
                  <Text style={styles.trophyCount}>{t.count}x</Text>
                  <Text style={styles.trophyTitle}>{t.title}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Tab Content: Gym Floor Telemetry */}
      {activeTab === 'training' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Gym Floor Barbell VBT & Levers</Text>
          <View style={styles.telemetryCard}>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>Enode VBT 30-Day Mean Speed</Text>
              <Text style={styles.telemetryValue}>{data.gymTelemetry.meanVelocity30Day} m/s</Text>
              <Text style={styles.telemetrySub}>Optimal Velocity Range on Working Sets</Text>
            </View>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>Cleather Femur/Torso Leverage</Text>
              <Text style={styles.telemetryValue}>{data.gymTelemetry.cleatherFemurRatio}</Text>
              <Text style={styles.telemetrySub}>{data.gymTelemetry.leverArchetype}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 1-Tap Viral Instagram Story Export Button */}
      <TouchableOpacity style={styles.exportButton} onPress={handleShareStory}>
        <Text style={styles.exportButtonText}>📸 Export Branded Instagram Story Card</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 16,
  },
  brandBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goatBadge: {
    backgroundColor: '#9aef0f',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  goatBadgeText: {
    color: '#0d1117',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tierBadge: {
    backgroundColor: '#4724ba',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8c6bf7',
  },
  tierBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  athleteName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  athleteSubtitle: {
    color: '#8b949e',
    fontSize: 13,
    marginBottom: 16,
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#0d1117',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  statValueGreen: {
    color: '#9aef0f',
    fontSize: 18,
    fontWeight: '800',
  },
  statValueYellow: {
    color: '#f8ef8d',
    fontSize: 18,
    fontWeight: '800',
  },
  statValuePurple: {
    color: '#8c6bf7',
    fontSize: 18,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#30363d',
  },
  sbdGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sbdItem: {
    flex: 1,
    backgroundColor: '#0d1117',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#21262d',
    alignItems: 'center',
  },
  sbdLabel: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  sbdValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  sbdRatio: {
    color: '#58a6ff',
    fontSize: 10,
  },
  proportionBarContainer: {
    height: 6,
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  proportionSegment: {
    height: 6,
  },
  proportionLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#161b22',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    alignItems: 'center',
  },
  toggleButtonActive: {
    borderColor: '#9aef0f',
    backgroundColor: '#1c2419',
  },
  toggleButtonText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#9aef0f',
    fontWeight: '700',
  },
  sectionContainer: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  liftAccordion: {
    marginBottom: 14,
    backgroundColor: '#0d1117',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  liftHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liftTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  liftBest: {
    color: '#9aef0f',
    fontSize: 13,
    fontWeight: '700',
  },
  attemptsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  attemptPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  attemptNumber: {
    color: '#8b949e',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  attemptWeight: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  attemptIcon: {
    fontSize: 12,
    fontWeight: '800',
  },
  attemptSpread: {
    color: '#8b949e',
    fontSize: 9,
    marginTop: 2,
  },
  trophyContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  trophyHeader: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  trophyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trophyBadge: {
    flex: 1,
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21262d',
  },
  trophyIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  trophyCount: {
    color: '#f8ef8d',
    fontSize: 12,
    fontWeight: '800',
  },
  trophyTitle: {
    color: '#8b949e',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  telemetryCard: {
    gap: 12,
  },
  telemetryItem: {
    backgroundColor: '#0d1117',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  telemetryLabel: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  telemetryValue: {
    color: '#9aef0f',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  telemetrySub: {
    color: '#c9d1d9',
    fontSize: 12,
  },
  exportButton: {
    backgroundColor: '#9aef0f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#9aef0f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonText: {
    color: '#0d1117',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LifterPassportCard;
