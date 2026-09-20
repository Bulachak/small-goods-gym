import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

// ==========================================
// TYPES & INTERFACES (Joel Mullen Biomechanics Model)
// ==========================================
export interface AthleteAnthropometry {
  heightCm: number;
  femurCm: number;
  torsoCm: number;
  upperArmCm: number; // Humerus (Joel call requirement)
  forearmCm: number;  // Forelimb (Joel call requirement)
  armSpanCm: number;
}

export interface BiomechanicalDirectives {
  femurToTorsoRatio: number;
  forearmToArmRatio: number;
  apeIndex: number;
  leverageTags: string[];
  squatDirective: string;
  benchDirective: string;
  deadliftDirective: string;
  cleanDirective: string;
}

export interface BiomechanicalLeverHUDProps {
  initialMeasurements?: AthleteAnthropometry;
  onSave?: (measurements: AthleteAnthropometry, directives: BiomechanicalDirectives) => void;
}

// Aliases for developer ergonomics
export type AnthropometricInput = AthleteAnthropometry;
export type BiomechanicalProfile = BiomechanicalDirectives;

export const BiomechanicalLeverHUD: React.FC<BiomechanicalLeverHUDProps> = ({
  initialMeasurements = {
    heightCm: 180.0,
    femurCm: 52.0,
    torsoCm: 48.0,
    upperArmCm: 34.0,
    forearmCm: 29.0,
    armSpanCm: 186.0,
  },
  onSave,
}) => {
  const [measurements, setMeasurements] = useState<AthleteAnthropometry>(initialMeasurements);
  const [activeTab, setActiveTab] = useState<'overview' | 'squat' | 'bench' | 'deadlift' | 'clean'>('overview');

  // Compute Biomechanical Directives (Cleather, Zatsiorsky & Joel Mullen)
  const analysis: BiomechanicalDirectives = useMemo(() => {
    const { heightCm, femurCm, torsoCm, upperArmCm, forearmCm, armSpanCm } = measurements;
    const femurToTorso = Number((femurCm / Math.max(torsoCm, 1)).toFixed(2));
    const totalArm = upperArmCm + forearmCm;
    const forearmRatio = Number((forearmCm / Math.max(totalArm, 1)).toFixed(2));
    const ape = Number((armSpanCm / Math.max(heightCm, 1)).toFixed(2));

    const tags: string[] = [];

    // Femur / Torso Classification
    if (femurToTorso > 1.0) tags.push('Long Femurs');
    else if (femurToTorso < 0.9) tags.push('Short Femurs');
    else tags.push('Balanced Levers');

    if (torsoCm < heightCm * 0.28) tags.push('Short Torso');
    else tags.push('Long Torso');

    // Arm / Forearm Classification (Joel call requirement)
    if (forearmRatio > 0.47) tags.push('Long Forearms');
    else tags.push('Short Forearms');

    if (ape > 1.02) tags.push('Long Arms (+ Ape Index)');
    else if (ape < 0.98) tags.push('Short Arms (- Ape Index)');

    // Directives
    const squatDirective =
      femurToTorso > 1.0
        ? `Long Femurs (${femurToTorso}): High forward knee travel creates substantial sagittal moment arms. Widen stance to 1.3× shoulder width, flare toes 30° out, and cue low-bar placement to shift load to the posterior chain.`
        : `Balanced/Short Femurs (${femurToTorso}): Favorable for upright high-bar and front squats. Knees track naturally forward over toes without excessive spinal shear.`;

    const benchDirective =
      forearmRatio > 0.47
        ? `Long Forearms (${forearmRatio}) & Total Arm (${totalArm}cm): Increased range of motion and horizontal lever arm at bottom touch. Tuck elbows at 45° to protect anterior shoulder capsule and widen grip slightly so forearms remain vertical at the chest touch point.`
        : `Short Forearms (${forearmRatio}): Short stroke and mechanically advantageous touch point. Favorable for close-grip bench and rapid lockout without excessive shoulder shear.`;

    const deadliftDirective =
      ape > 1.02
        ? `High Ape Index (${ape}): Significant mechanical advantage in the deadlift. Higher starting hip position reduces lumbar moment arm. Conventional deadlift will feel natural and highly efficient.`
        : `Negative/Neutral Ape Index (${ape}): Starting hip height must be lower, or adopt a semi-sumo stance to shorten the torso distance to the barbell and eliminate spinal rounding.`;

    const cleanDirective =
      forearmRatio > 0.47
        ? `Long Forearms (${forearmRatio}): Front rack requires greater lat and thoracic extension mobility. Widen clean grip slightly to allow the barbell to rest firmly on anterior deltoids without wrist jamming.`
        : `Short Forearms (${forearmRatio}): Natural tight front rack. Fast turnover around the bar.`;

    return {
      femurToTorsoRatio: femurToTorso,
      forearmToArmRatio: forearmRatio,
      apeIndex: ape,
      leverageTags: tags,
      squatDirective,
      benchDirective,
      deadliftDirective,
      cleanDirective,
    };
  }, [measurements]);

  const updateMeasurement = (key: keyof AthleteAnthropometry, delta: number) => {
    setMeasurements((prev) => ({
      ...prev,
      [key]: Math.max(10, Number((prev[key] + delta).toFixed(1))),
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Biomechanical Leverage HUD</Text>
          <Text style={styles.subtitle}>Kinematic Ratios & Small Goods Coaching Directives</Text>
        </View>

        {/* Leverage Tags Banner */}
        <View style={styles.tagsRow}>
          {analysis.leverageTags.map((tag, idx) => (
            <View key={idx} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Segment Measurement Adjusters */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Limb Segment Calibration (cm)</Text>
          <Text style={styles.cardSubtitle}>
            Adjust measurements to simulate mechanical moment arms across squats, presses, and pulls.
          </Text>

          {/* Femur */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>Femur Length</Text>
              <Text style={styles.sliderVal}>{measurements.femurCm} cm</Text>
            </View>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('femurCm', -0.5)}>
                <Text style={styles.stepBtnText}>-0.5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('femurCm', +0.5)}>
                <Text style={styles.stepBtnText}>+0.5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Torso */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>Torso Length</Text>
              <Text style={styles.sliderVal}>{measurements.torsoCm} cm</Text>
            </View>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('torsoCm', -0.5)}>
                <Text style={styles.stepBtnText}>-0.5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('torsoCm', +0.5)}>
                <Text style={styles.stepBtnText}>+0.5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upper Arm (Humerus) */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>Upper Arm (Humerus)</Text>
              <Text style={styles.sliderVal}>{measurements.upperArmCm} cm</Text>
            </View>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('upperArmCm', -0.5)}>
                <Text style={styles.stepBtnText}>-0.5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('upperArmCm', +0.5)}>
                <Text style={styles.stepBtnText}>+0.5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forearm (Forelimb) */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>Forearm (Forelimb)</Text>
              <Text style={styles.sliderVal}>{measurements.forearmCm} cm</Text>
            </View>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('forearmCm', -0.5)}>
                <Text style={styles.stepBtnText}>-0.5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('forearmCm', +0.5)}>
                <Text style={styles.stepBtnText}>+0.5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Arm Span */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>Arm Span</Text>
              <Text style={styles.sliderVal}>{measurements.armSpanCm} cm</Text>
            </View>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('armSpanCm', -1.0)}>
                <Text style={styles.stepBtnText}>-1.0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('armSpanCm', +1.0)}>
                <Text style={styles.stepBtnText}>+1.0</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Kinematic Ratios Summary Cards */}
        <View style={styles.ratiosGrid}>
          <View style={styles.ratioCard}>
            <Text style={styles.ratioTitle}>Femur / Torso</Text>
            <Text style={[styles.ratioValue, analysis.femurToTorsoRatio > 1.0 ? styles.accentAlert : styles.accentGood]}>
              {analysis.femurToTorsoRatio}
            </Text>
            <Text style={styles.ratioDesc}>
              {analysis.femurToTorsoRatio > 1.0 ? 'Long Femur Lever' : 'Balanced Lever'}
            </Text>
          </View>

          <View style={styles.ratioCard}>
            <Text style={styles.ratioTitle}>Forearm Ratio</Text>
            <Text style={styles.ratioValue}>{analysis.forearmToArmRatio}</Text>
            <Text style={styles.ratioDesc}>
              {analysis.forearmToArmRatio > 0.47 ? 'Long Forearms' : 'Short Forearms'}
            </Text>
          </View>

          <View style={styles.ratioCard}>
            <Text style={styles.ratioTitle}>Ape Index</Text>
            <Text style={[styles.ratioValue, analysis.apeIndex > 1.02 ? styles.accentGood : styles.accentDesc]}>
              {analysis.apeIndex}
            </Text>
            <Text style={styles.ratioDesc}>
              {analysis.apeIndex > 1.02 ? '+ Arm Advantage' : 'Neutral/Short'}
            </Text>
          </View>
        </View>

        {/* Lift Specific Directives Navigation */}
        <View style={styles.tabsRow}>
          {(['overview', 'squat', 'bench', 'deadlift', 'clean'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Directive Output Card */}
        <View style={styles.directiveCard}>
          <Text style={styles.directiveTitle}>
            {activeTab === 'overview'
              ? '📋 Complete Mechanical Assessment'
              : `🎯 ${activeTab.toUpperCase()} Kinematic Blueprint`}
          </Text>

          {activeTab === 'overview' && (
            <View>
              <Text style={styles.directiveItem}>• Squat: {analysis.squatDirective}</Text>
              <Text style={styles.directiveItem}>• Bench Press: {analysis.benchDirective}</Text>
              <Text style={styles.directiveItem}>• Deadlift: {analysis.deadliftDirective}</Text>
              <Text style={styles.directiveItem}>• Olympic Clean: {analysis.cleanDirective}</Text>
            </View>
          )}

          {activeTab === 'squat' && <Text style={styles.directiveText}>{analysis.squatDirective}</Text>}
          {activeTab === 'bench' && <Text style={styles.directiveText}>{analysis.benchDirective}</Text>}
          {activeTab === 'deadlift' && <Text style={styles.directiveText}>{analysis.deadliftDirective}</Text>}
          {activeTab === 'clean' && <Text style={styles.directiveText}>{analysis.cleanDirective}</Text>}
        </View>

        {onSave && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => onSave(measurements, analysis)}
          >
            <Text style={styles.saveButtonText}>Save to Athlete Biometrics Profile</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#0c0c11',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#9aef0f',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#1b1b26',
    borderWidth: 1,
    borderColor: '#4724ba',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: '#9aef0f',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#13131d',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222232',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 18,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1d1d2b',
  },
  sliderLabelCol: {
    flex: 1,
  },
  sliderName: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  sliderVal: {
    color: '#9aef0f',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    backgroundColor: '#1f1f2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2e2e46',
  },
  stepBtnText: {
    color: '#f3f4f6',
    fontSize: 12,
    fontWeight: '700',
  },
  ratiosGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  ratioCard: {
    flex: 1,
    backgroundColor: '#14141f',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#232336',
    alignItems: 'center',
  },
  ratioTitle: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  ratioValue: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 4,
    color: '#ffffff',
  },
  ratioDesc: {
    color: '#6b7280',
    fontSize: 10,
    textAlign: 'center',
  },
  accentAlert: {
    color: '#f59e0b',
  },
  accentGood: {
    color: '#9aef0f',
  },
  accentDesc: {
    color: '#9ca3af',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#161622',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#232336',
  },
  tabBtnActive: {
    backgroundColor: '#4724ba',
    borderColor: '#9aef0f',
  },
  tabBtnText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },
  directiveCard: {
    backgroundColor: '#151522',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#25253a',
    marginBottom: 20,
  },
  directiveTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  directiveText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 20,
  },
  directiveItem: {
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#9aef0f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0c0c11',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default BiomechanicalLeverHUD;
