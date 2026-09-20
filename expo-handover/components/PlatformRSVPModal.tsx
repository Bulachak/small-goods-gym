import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';

// ==========================================
// TYPES & INTERFACES (Small Goods 12-Platform Model)
// ==========================================
export interface PlatformSlot {
  number: number;
  status: 'open' | 'booked' | 'mine';
  lifterName?: string;
  discipline?: 'Powerlifting' | 'Weightlifting' | 'NDIS';
}

export interface PlatformRSVPModalProps {
  visible: boolean;
  onClose: () => void;
  sessionTime?: string;
  isCommunityEvent?: boolean;
  eventName?: string;
  onConfirmRSVP?: (platformNumber: number | null, isWaitlist: boolean) => void;
}

// Alias for RSVP reservation state
export type RSVPReservation = PlatformSlot;

export const PlatformRSVPModal: React.FC<PlatformRSVPModalProps> = ({
  visible,
  onClose,
  sessionTime = '5:30 PM – 7:00 PM (Tonight)',
  isCommunityEvent = false,
  eventName = 'Sunday Community Breakfast Biscuits',
  onConfirmRSVP,
}) => {
  // 12 Dedicated Platforms
  const [platforms, setPlatforms] = useState<PlatformSlot[]>([
    { number: 1, status: 'booked', lifterName: 'Joel M. (Coach)', discipline: 'Weightlifting' },
    { number: 2, status: 'booked', lifterName: 'Holly H.', discipline: 'NDIS' },
    { number: 3, status: 'mine', lifterName: 'You (Alex)', discipline: 'Powerlifting' },
    { number: 4, status: 'booked', lifterName: 'Liam O.', discipline: 'Powerlifting' },
    { number: 5, status: 'booked', lifterName: 'Sarah K.', discipline: 'Weightlifting' },
    { number: 6, status: 'booked', lifterName: 'Marcus T.', discipline: 'Powerlifting' },
    { number: 7, status: 'booked', lifterName: 'Dave B.', discipline: 'Powerlifting' },
    { number: 8, status: 'booked', lifterName: 'Elena R.', discipline: 'Weightlifting' },
    { number: 9, status: 'booked', lifterName: 'Chloe M.', discipline: 'NDIS' },
    { number: 10, status: 'booked', lifterName: 'James P.', discipline: 'Powerlifting' },
    { number: 11, status: 'open' },
    { number: 12, status: 'open' },
  ]);

  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  // Count booked platforms
  const bookedCount = platforms.filter((p) => p.status !== 'open').length;
  const isFull = bookedCount >= 12;
  const myPlatform = platforms.find((p) => p.status === 'mine');

  // Book a platform
  const handleSelectPlatform = (slotNumber: number) => {
    const target = platforms.find((p) => p.number === slotNumber);
    if (!target) return;

    if (target.status === 'booked') {
      Alert.alert('Platform Reserved', `Platform ${slotNumber} is currently reserved by ${target.lifterName}.`);
      return;
    }

    if (target.status === 'mine') {
      // Release my platform
      Alert.alert(
        'Release Platform?',
        `Release Platform ${slotNumber} for other Small Goods lifters?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Release',
            style: 'destructive',
            onPress: () => {
              setPlatforms((prev) =>
                prev.map((p) => (p.number === slotNumber ? { ...p, status: 'open', lifterName: undefined } : p))
              );
              if (onConfirmRSVP) onConfirmRSVP(null, false);
            },
          },
        ]
      );
      return;
    }

    // Book platform
    setPlatforms((prev) =>
      prev.map((p) => {
        if (p.number === slotNumber) return { ...p, status: 'mine', lifterName: 'You (Alex)' };
        if (p.status === 'mine') return { ...p, status: 'open', lifterName: undefined }; // Release previous
        return p;
      })
    );

    if (onConfirmRSVP) onConfirmRSVP(slotNumber, false);
    Alert.alert('Spot Confirmed! 🐐', `Platform ${slotNumber} is locked in for ${sessionTime}.`);
  };

  // Join waitlist
  const handleJoinWaitlist = () => {
    setIsWaitlisted(true);
    setWaitlistCount((c) => c + 1);
    if (onConfirmRSVP) onConfirmRSVP(null, true);
    Alert.alert('Waitlist Joined', 'You are #1 in line. If a lifter drops their platform, you will get an instant push notification!');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isCommunityEvent ? eventName : '12-Platform Floor Capacity'}
              </Text>
              <Text style={styles.sessionTime}>{sessionTime}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Capacity Meter Banner */}
          <View style={[styles.capacityBanner, isFull && styles.capacityBannerFull]}>
            <View style={styles.capacityTextCol}>
              <Text style={styles.capacityTitle}>
                {isFull ? 'SESSION AT MAX CAPACITY (12/12)' : 'PLATFORMS AVAILABLE'}
              </Text>
              <Text style={styles.capacityRatio}>
                {bookedCount} / 12 Platforms Filled ({12 - bookedCount} Spots Left)
              </Text>
            </View>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityBadgeText}>{12 - bookedCount} OPEN</Text>
            </View>
          </View>

          {/* My Current Reservation Status */}
          {myPlatform ? (
            <View style={styles.myReservationCard}>
              <Text style={styles.myResTitle}>YOUR RESERVED SPOT</Text>
              <Text style={styles.myResPlatform}>Platform {myPlatform.number} • Locked In ✓</Text>
              <Text style={styles.myResNote}>Tap Platform {myPlatform.number} below if you need to release your spot.</Text>
            </View>
          ) : isWaitlisted ? (
            <View style={styles.waitlistCard}>
              <Text style={styles.waitlistTitle}>WAITLIST STATUS: ACTIVE</Text>
              <Text style={styles.waitlistDesc}>Position: #1 in queue. Automated SMS/push triggers upon cancellation.</Text>
            </View>
          ) : null}

          {/* 12-Platform Floor Grid */}
          <Text style={styles.sectionHeader}>GYM FLOOR PLATFORMS (TAP TO BOOK/RELEASE)</Text>
          <View style={styles.grid}>
            {platforms.map((p) => {
              const isMine = p.status === 'mine';
              const isBooked = p.status === 'booked';
              const isOpen = p.status === 'open';

              return (
                <TouchableOpacity
                  key={p.number}
                  style={[
                    styles.platformBox,
                    isMine && styles.platformMine,
                    isBooked && styles.platformBooked,
                    isOpen && styles.platformOpen,
                  ]}
                  onPress={() => handleSelectPlatform(p.number)}
                >
                  <View style={styles.platformHeader}>
                    <Text style={[styles.platformNumber, isMine && styles.platformNumberMine]}>
                      P{p.number}
                    </Text>
                    <View
                      style={[
                        styles.statusDot,
                        isMine && styles.dotMine,
                        isBooked && styles.dotBooked,
                        isOpen && styles.dotOpen,
                      ]}
                    />
                  </View>

                  <Text style={[styles.lifterName, isMine && styles.lifterNameMine]} numberOfLines={1}>
                    {isMine ? 'YOU' : isBooked ? p.lifterName : 'Available'}
                  </Text>

                  {p.discipline && (
                    <Text style={styles.disciplineTag}>{p.discipline}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Full Capacity Waitlist Action */}
          {isFull && !myPlatform && !isWaitlisted && (
            <TouchableOpacity style={styles.waitlistActionBtn} onPress={handleJoinWaitlist}>
              <Text style={styles.waitlistActionText}>Join Session Waitlist (Priority Queue)</Text>
            </TouchableOpacity>
          )}

          {/* Community Breakfast Note */}
          <View style={styles.communityNote}>
            <Text style={styles.communityNoteTitle}>🥐 Sunday Community Breakfast</Text>
            <Text style={styles.communityNoteText}>
              Following Sunday morning barbell sessions, Small Goods hosts our weekly breakfast biscuits. RSVPs automatically allocate breakfast quantities with local bakeries.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0e',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sessionTime: {
    color: '#9aef0f',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    color: '#9ca3af',
    fontSize: 20,
    fontWeight: '600',
  },
  capacityBanner: {
    backgroundColor: '#122612',
    borderWidth: 1,
    borderColor: '#9aef0f',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  capacityBannerFull: {
    backgroundColor: '#261b00',
    borderColor: '#f59e0b',
  },
  capacityTextCol: {
    flex: 1,
  },
  capacityTitle: {
    color: '#9aef0f',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  capacityRatio: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  capacityBadge: {
    backgroundColor: '#9aef0f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  capacityBadgeText: {
    color: '#0a0a0e',
    fontSize: 11,
    fontWeight: '900',
  },
  myReservationCard: {
    backgroundColor: '#1f1a3a',
    borderWidth: 1,
    borderColor: '#4724ba',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  myResTitle: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  myResPlatform: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  myResNote: {
    color: '#d1d5db',
    fontSize: 12,
    marginTop: 4,
  },
  waitlistCard: {
    backgroundColor: '#1c1c28',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  waitlistTitle: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '800',
  },
  waitlistDesc: {
    color: '#e5e7eb',
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Roboto Mono',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  platformBox: {
    width: '31%', // 3 columns on mobile
    height: 90,
    borderRadius: 6,
    padding: 10,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  platformOpen: {
    backgroundColor: '#0f172a',
  },
  platformBooked: {
    backgroundColor: '#1e293b',
    opacity: 0.75,
  },
  platformMine: {
    backgroundColor: '#4724ba',
    borderColor: '#9aef0f',
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformNumber: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'Roboto Mono',
  },
  platformNumberMine: {
    color: '#9aef0f',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOpen: {
    backgroundColor: '#9aef0f',
  },
  dotBooked: {
    backgroundColor: '#64748b',
  },
  dotMine: {
    backgroundColor: '#9aef0f',
  },
  lifterName: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
  },
  lifterNameMine: {
    color: '#ffffff',
    fontWeight: '900',
  },
  disciplineTag: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '600',
  },
  waitlistActionBtn: {
    backgroundColor: '#e95766',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  waitlistActionText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  communityNote: {
    backgroundColor: '#f8ef8d',
    borderRadius: 6,
    padding: 14,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  communityNoteTitle: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'Roboto Mono',
    marginBottom: 4,
  },
  communityNoteText: {
    color: '#1e293b',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});

export default PlatformRSVPModal;
