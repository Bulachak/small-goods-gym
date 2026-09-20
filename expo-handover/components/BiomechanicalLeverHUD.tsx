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
  upperArmCm: number;    // Humerus (Joel call requirement)
  forearmCm: number;     // Forelimb (Joel call requirement)
  shoulderWidthCm: number; // Biacromial Breadth (Joel call requirement)
  armSpanCm: number;
}

export interface BiomechanicalDirectives {
  femurToTorsoRatio: number;
  forearmToArmRatio: number;
  biacromialRatio: number;
  apeIndex: number;
  recommendedBenchGripCm: number;
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
    shoulderWidthCm: 44.0, // Biacromial breadth
    armSpanCm: 186.0,
  },
  onSave,
}) => {
  const [measurements, setMeasurements] = useState<AthleteAnthropometry>(initialMeasurements);
  const [activeTab, setActiveTab] = useState<'overview' | 'squat' | 'bench' | 'deadlift' | 'clean'>('overview');

  // Compute Biomechanical Directives (Cleather, Zatsiorsky & Joel Mullen)
  const analysis: BiomechanicalDirectives = useMemo(() => {
    const { heightCm, femurCm, torsoCm, upperArmCm, forearmCm, shoulderWidthCm, armSpanCm } = measurements;
    const femurToTorso = Number((femurCm / Math.max(torsoCm, 1)).toFixed(2));
    const totalArm = upperArmCm + forearmCm;
    const forearmRatio = Number((forearmCm / Math.max(totalArm, 1)).toFixed(2));
    const biacromial = Number((shoulderWidthCm / Math.max(heightCm, 1)).toFixed(2));
    const ape = Number((armSpanCm / Math.max(heightCm, 1)).toFixed(2));
    const recBenchGrip = Math.round(shoulderWidthCm * 1.6); // Dan Cleather: 1.5 - 1.7x biacromial

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

    // Shoulder Width Classification (Joel call requirement)
    if (shoulderWidthCm > 46) tags.push('Broad Shoulders');
    else if (shoulderWidthCm < 40) tags.push('Narrow Shoulders');
    else tags.push('Balanced Girdle');

    if (ape > 1.02) tags.push('Long Wingspan (+ Ape)');
    else if (ape < 0.98) tags.push('Short Wingspan (- Ape)');

    // Directives
    const squatDirective =
      femurToTorso > 1.0
        ? `Long Femurs (${femurToTorso}): High forward knee travel creates substantial sagittal moment arms. Widen stance to 1.3× shoulder width (${Math.round(shoulderWidthCm * 1.3)} cm), flare toes 25°-30° out, and utilize low-bar placement on rear delts (${shoulderWidthCm} cm shelf) to shorten the effective lumbar lever arm.`
        : `Balanced/Short Femurs (${femurToTorso}): Upright high-bar or front squats viable with shoulder-width stance (${shoulderWidthCm} cm). Quadriceps-dominant leverage with minimal spinal forward lean.`;

    const benchDirective = `Prescribed Grip: ${recBenchGrip} cm (1.6× biacromial width of ${shoulderWidthCm} cm). ${
      forearmRatio > 0.47
        ? `Long Forearms (${forearmRatio}) & Total Arm (${totalArm} cm): Increased chest stroke length. Tuck elbows to 45° to protect anterior shoulder capsule and keep forearms vertically stacked at touch.`
        : `Short Forearms (${forearmRatio}): Short stroke and mechanical touch advantage. Allows strong triceps force transfer with lower anterior shoulder shear.`
    }`;

    const deadliftDirective =
      ape > 1.02
        ? `High Ape Index (${ape}): Significant mechanical advantage in conventional deadlift. ${
            shoulderWidthCm > 46
              ? `Broad shoulder girdle (${shoulderWidthCm} cm) requires hands slightly wider outside knees.`
              : `Narrow shoulder girdle (${shoulderWidthCm} cm) allows near-vertical arm hang, shortening total bar travel.`
          }`
        : `Negative/Neutral Ape Index (${ape}): Starting hip height must be lower, or adopt a semi-sumo stance to shorten the torso distance to the barbell and eliminate spinal rounding.`;

    const cleanDirective =
      forearmRatio > 0.47
        ? `Long Forearms (${forearmRatio}): Front rack requires greater lat and thoracic extension mobility. Set clean grip slightly outside shoulder width (${shoulderWidthCm} cm) to let the barbell rest on anterior deltoids without wrist jamming.`
        : `Short Forearms (${forearmRatio}): Natural tight front rack. Fast elbow turnover around the barbell.`;

    return {
      femurToTorsoRatio: femurToTorso,
      forearmToArmRatio: forearmRatio,
      biacromialRatio: biacromial,
      apeIndex: ape,
      recommendedBenchGripCm: recBenchGrip,
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
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>5-SEGMENT BIOMECHANICS</Text>
          </View>
          <Text style={styles.title}>Biomechanical Leverage HUD</Text>
          <Text style={styles.subtitle}>Small Goods Neo-Brutalist Kinematic Engine</Text>
        </View>

        {/* Coach Joel Mullen Directive Sticky Note (The Soul of Small Goods) */}
        <View style={styles.stickyNote}>
          <View style={styles.stickyBadge}>
            <Text style={styles.stickyBadgeText}>STICKER CUE</Text>
          </View>
          <Text style={styles.stickyHeader}>COACH JOEL MULLEN'S LIVE FLOOR DIRECTIVE:</Text>
          <Text style={styles.stickyQuote}>
            "Push knees out hard into the band on the ascent. Torso must not collapse forward past 45°!"
          </Text>
          <View style={styles.stickyFooter}>
            <Text style={styles.stickyMeta}>Target Stance: 1.3× Shoulders ({Math.round(measurements.shoulderWidthCm * 1.3)} cm)</Text>
            <Text style={styles.stickyMeta}>Bench Grip: {analysis.recommendedBenchGripCm} cm</Text>
          </View>
        </View>

        {/* Leverage Tags Bar */}
        <View style={styles.tagsContainer}>
          {analysis.leverageTags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* 5-Segment Anthropometry Inputs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Anatomical Segment Calibration</Text>
          <Text style={styles.cardSubtitle}>
            Calibrate femurs, torso, forearms, humerus, and shoulder width (biacromial breadth).
          </Text>

          {/* 1. Femur Length */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>1. Femur Length</Text>
              <Text style={styles.sliderVal}>{measurements.femurCm} cm (Ratio: {analysis.femurToTorsoRatio})</Text>
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

          {/* 2. Torso Length */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>2. Torso Length</Text>
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

          {/* 3. Forearm (Forelimb) */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>3. Forearm (Forelimb)</Text>
              <Text style={styles.sliderVal}>{measurements.forearmCm} cm (Ratio: {analysis.forearmToArmRatio})</Text>
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

          {/* 4. Upper Arm (Humerus) */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>4. Upper Arm (Humerus)</Text>
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

          {/* 5. Shoulder Width (Biacromial Breadth - Joel Request) */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>5. Shoulder Width (Biacromial)</Text>
              <Text style={styles.sliderVal}>{measurements.shoulderWidthCm} cm</Text>
            </View>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('shoulderWidthCm', -0.5)}>
                <Text style={styles.stepBtnText}>-0.5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateMeasurement('shoulderWidthCm', +0.5)}>
                <Text style={styles.stepBtnText}>+0.5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 6. Arm Span */}
          <View style={[styles.sliderRow, { borderBottomWidth: 0 }]}>
            <View style={styles.sliderLabelCol}>
              <Text style={styles.sliderName}>6. Arm Span (Wingspan)</Text>
              <Text style={styles.sliderVal}>{measurements.armSpanCm} cm (Ape: {analysis.apeIndex})</Text>
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
              {analysis.femurToTorsoRatio > 1.0 ? 'Long Femur' : 'Balanced'}
            </Text>
          </View>

          <View style={styles.ratioCard}>
            <Text style={styles.ratioTitle}>Forearm Ratio</Text>
            <Text style={styles.ratioValue}>{analysis.forearmToArmRatio}</Text>
            <Text style={styles.ratioDesc}>
              {analysis.forearmToArmRatio > 0.47 ? 'Long Forearms' : 'Short'}
            </Text>
          </View>

          <View style={styles.ratioCard}>
            <Text style={styles.ratioTitle}>Biacromial</Text>
            <Text style={[styles.ratioValue, { color: '#f8ef8d' }]}>{measurements.shoulderWidthCm} cm</Text>
            <Text style={styles.ratioDesc}>Grip: {analysis.recommendedBenchGripCm}cm</Text>
          </View>

          <View style={styles.ratioCard}>
            <Text style={styles.ratioTitle}>Ape Index</Text>
            <Text style={[styles.ratioValue, analysis.apeIndex > 1.02 ? styles.accentGood : styles.accentDesc]}>
              {analysis.apeIndex}
            </Text>
            <Text style={styles.ratioDesc}>
              {analysis.apeIndex > 1.02 ? 'Advantage' : 'Neutral'}
            </Text>
          </View>
        </View>

        {/* Lift Kinematics Tabs */}
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

        {/* Prescriptive Directive Card */}
        <View style={styles.directiveCard}>
          {activeTab === 'overview' && (
            <View>
              <Text style={styles.directiveTitle}>Complete Biomechanical Profile</Text>
              <Text style={styles.directiveItem}>🏋️ <Text style={styles.bold}>Squat:</Text> {analysis.squatDirective}</Text>
              <Text style={styles.directiveItem}>💪 <Text style={styles.bold}>Bench:</Text> {analysis.benchDirective}</Text>
              <Text style={styles.directiveItem}>⚡ <Text style={styles.bold}>Deadlift:</Text> {analysis.deadliftDirective}</Text>
              <Text style={styles.directiveItem}>🎯 <Text style={styles.bold}>Clean:</Text> {analysis.cleanDirective}</Text>
            </View>
          )}

          {activeTab === 'squat' && (
            <View>
              <Text style={styles.directiveTitle}>Squat Kinematics & Sagittal Moment Arms</Text>
              <Text style={styles.directiveText}>{analysis.squatDirective}</Text>
            </View>
          )}

          {activeTab === 'bench' && (
            <View>
              <Text style={styles.directiveTitle}>Bench Press & Biacromial Grip Width</Text>
              <Text style={styles.directiveText}>{analysis.benchDirective}</Text>
            </View>
          )}

          {activeTab === 'deadlift' && (
            <View>
              <Text style={styles.directiveTitle}>Deadlift Mechanics & Arm Hang</Text>
              <Text style={styles.directiveText}>{analysis.deadliftDirective}</Text>
            </View>
          )}

          {activeTab === 'clean' && (
            <View>
              <Text style={styles.directiveTitle}>Clean Turnover & Front Rack Clearance</Text>
              <Text style={styles.directiveText}>{analysis.cleanDirective}</Text>
            </View>
          )}
        </View>

        {/* Save / Handoff Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave?.(measurements, analysis)}
        >
          <Text style={styles.saveButtonText}>✓ LOCK BIOMECHANICAL PROFILE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ==========================================
// NEO-BRUTALIST STYLESHEET (Small Goods Brand Standard)
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
    backgroundColor: '#9aef0f',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    marginBottom: 6,
  },
  headerBadgeText: {
    color: '#000000',
    fontFamily: 'Roboto Mono',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#9ca3af',
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  tagText: {
    color: '#9aef0f',
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
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
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  sliderLabelCol: {
    flex: 1,
  },
  sliderName: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '700',
  },
  sliderVal: {
    color: '#9aef0f',
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    marginTop: 2,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  stepBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '900',
  },
  ratiosGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ratioCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 8,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    alignItems: 'center',
  },
  ratioTitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
  },
  ratioValue: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Roboto Mono',
    marginVertical: 2,
    color: '#ffffff',
  },
  ratioDesc: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    textAlign: 'center',
  },
  accentAlert: {
    color: '#e95766',
  },
  accentGood: {
    color: '#9aef0f',
  },
  accentDesc: {
    color: '#94a3b8',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  tabBtnActive: {
    backgroundColor: '#4724ba',
    borderColor: '#9aef0f',
  },
  tabBtnText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '800',
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },
  directiveCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 14,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 16,
  },
  directiveTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  directiveText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  directiveItem: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '800',
    color: '#9aef0f',
  },
  saveButton: {
    backgroundColor: '#9aef0f',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

export default BiomechanicalLeverHUD;
