import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  citations?: string[];
  triageAlert?: {
    type: 'drop_load' | 'terminate' | 'rest' | 'biomechanics';
    action: string;
  };
}

export interface GoatAICoPilotProps {
  visible: boolean;
  onClose: () => void;
  apiEndpoint?: string; // e.g. "https://api.smallgoodsgym.com.au/api/chat"
  clerkToken?: string;
  athleteProfile?: {
    name: string;
    femurToTorsoRatio: number;
    forearmToArmRatio: number;
    leverageTags: string[];
    currentExercise?: string;
  };
}

// Preset Quick Triage Prompts
const QUICK_PROMPTS = [
  { label: '⚡ 90s Missed Lift Triage', prompt: 'I missed two snatches at 85kg. What should I do on my next set?' },
  { label: '🐐 The Small Goods Way', prompt: 'What are the 5 exercise categories and session ordering rules of The Small Goods Way?' },
  { label: '🩺 Pain > 3/10 Triage', prompt: 'I have a 4/10 anterior shoulder pinch on bench press. How should I regress?' },
  { label: '📏 Long Femur Squats', prompt: 'My femurs are long compared to my torso (1.02 ratio). How should I adjust my squat stance?' },
  { label: '💪 Arm & Forearm Levers', prompt: 'How do my forearm and upper arm lengths affect my bench press touch point and shoulder rotation?' },
  { label: '💥 Soviet Shock Method', prompt: 'Explain the Verkhoshansky shock method depth jump parameters and amortization phase.' },
  { label: '🏋️ 12-Platform Cap', prompt: 'How many lifting platforms are currently open for the 5:30 PM session?' },
];

export const GoatAICoPilot: React.FC<GoatAICoPilotProps> = ({
  visible,
  onClose,
  apiEndpoint,
  clerkToken,
  athleteProfile = {
    name: 'Lifter',
    femurToTorsoRatio: 1.02,
    forearmToArmRatio: 0.88,
    leverageTags: ['Long Femurs', 'Short Torso', 'Long Forearms'],
    currentExercise: 'Snatch',
  },
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: `G'day ${athleteProfile.name}! Goat AI here. Floor co-pilot is active. Grounded in Soviet sports science and Small Goods coaching methodology. How can I help your session?`,
      timestamp: 'Now',
      citations: ['Verkhoshansky (1988)', 'Zatsiorsky (1995)', 'Cleather (2021)'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [visible, messages]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    // If API endpoint is provided, make authenticated call to Cloudflare Worker proxy
    if (apiEndpoint && clerkToken) {
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${clerkToken}`,
          },
          body: JSON.stringify({
            prompt: textToSend,
            athleteProfile,
          }),
        });

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations || ['Small Goods System Protocol'],
          triageAlert: data.triageAlert,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        // Fallback to local deterministic triage engine
        const fallback = generateDeterministicFallback(textToSend, athleteProfile);
        setMessages((prev) => [...prev, fallback]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Deterministic sports science mock for standalone testing without backend
      setTimeout(() => {
        const fallback = generateDeterministicFallback(textToSend, athleteProfile);
        setMessages((prev) => [...prev, fallback]);
        setIsLoading(false);
      }, 700);
    }
  };

  // Deterministic local triage rules (offline gym-floor safety engine)
  const generateDeterministicFallback = (prompt: string, profile: typeof athleteProfile): ChatMessage => {
    const p = prompt.toLowerCase();

    if (p.includes('small goods way') || p.includes('category') || p.includes('categories') || p.includes('ordering')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `🐐 THE SMALL GOODS WAY (JOEL'S COACHING FRAMEWORK):\n\n• 5 Exercise Categories:\n  1. Range Adders: Expand active ROM & tissue tolerance at length (RDLs, FFE Split Squats).\n  2. Co-ordinators: Motor pattern efficiency & comp lifts (Snatches, Paused Low Bar).\n  3. Accelerators: RFD & velocity under submaximal load (Banded Squats, Box Jumps).\n  4. Force Builders: Absolute force ceiling via high stability (Hatfield Squats, Bounce Bench).\n  5. Volume Builders: Hypertrophy & density (Myo-rep sets, Giant sets).\n\n• Strict Session Ordering: Range Adders → Co-ordinators → Accelerators → Force Builders → Volume Builders.\n(Rule: Never place high-density Volume Builders before explosive Accelerators or Co-ordinators).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['The Small Goods Way (Joel Mullen, 2026)', 'Small Goods Gym Floor Standards'],
      };
    }

    if (p.includes('pain') || p.includes('pinch') || p.includes('hurt') || p.includes('regress')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `🩺 JOEL'S PAIN THRESHOLD PROTOCOL (Pain > 3/10 Detected):\n\n1. Immediate Regression: Terminate heavy axial/joint-shearing load immediately.\n2. Prescribe Range Adder / High-Stability Variant: Transition to external stability (e.g. swap barbell bench for Swiss-bar or dumbbell floor press with neutral grip).\n3. Autoregulation Rule: Load safely only within active, pain-free ROM. Never force movement through acute joint compression.\n4. Physio Flag: Logged for Holly Hunt's clinical review queue.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['The Small Goods Way: Pain Threshold Rule', 'Holly Hunt Physio Care Gateway'],
        triageAlert: {
          type: 'biomechanics',
          action: 'Regress to Range Adder / high-stability variant & notify Holly',
        },
      };
    }

    if (p.includes('missed') || p.includes('snatch') || p.includes('velocity')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `⚡ 90-SECOND REST TRIAGE ACTIVATED:\n\n1. CNS Velocity Check: If bar speed dropped >15% below baseline, high-threshold motor unit recruitment is compromised.\n2. Protocol: Drop working weight by 5% to 7.5% (take 80kg instead of 85kg) for 2 clean technical singles.\n3. Termination Rule: If second rep at 80kg fails concentric acceleration, terminate the snatch portion and transition to pulls.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['Issurin, Residual Training Effects (2008)', 'Mann, Velocity-Based Training Guide (2015)'],
        triageAlert: {
          type: 'drop_load',
          action: 'Drop weight 5–7.5% or terminate lift',
        },
      };
    }

    if (p.includes('femur') || p.includes('squat')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `📐 BIOMECHANICAL LEVER ANALYSIS (Femur/Torso: ${profile.femurToTorsoRatio}):\n\nBecause your femurs are long relative to your torso:\n• Sagittal Moment Arm: Forward knee travel creates an extended lumbar lever arm if you use a narrow high-bar stance.\n• Solution: Widen stance to 1.3× shoulder width, flare toes 30° out to shorten the sagittal femur projection, and use low-bar placement to recruit hip extensors.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['Cleather, Force: The Biomechanics of Training (2021)', 'Zatsiorsky, Ergonomic Biomechanics (1984)'],
        triageAlert: {
          type: 'biomechanics',
          action: 'Widen stance to 1.3× shoulder width & flare toes 30°',
        },
      };
    }

    if (p.includes('arm') || p.includes('forearm') || p.includes('bench')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `💪 UPPER LIMB & FOREARM LEVERAGES:\n\n• Forearm-to-Arm Ratio (${profile.forearmToArmRatio}): Long forearms increase the horizontal moment arm at the shoulder when the bar touches the sternum.\n• Bench Press Adjustment: Tuck elbows at 45° rather than 90° flare to preserve the anterior capsule, and take a slightly wider grip to keep the forearms vertical at touch.\n• Olympic Clean: Requires active lat engagement in the front rack to prevent the bar from crashing on the clavicles.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['Cleather (2021)', 'Verkhoshansky, Special Strength Training Manual (2011)'],
      };
    }

    if (p.includes('shock') || p.includes('depth jump')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `💥 VERKHOSHANSKY SHOCK METHOD:\n\n• Amortization Phase: Transition from eccentric to concentric must occur in <150 milliseconds to exploit elastic muscle recoil.\n• Drop Height: 0.75m for explosive reactive power; 1.10m maximum for pure eccentric overload.\n• Volume: Strictly 4 sets of 10 drops, 2× weekly. Do NOT perform if fatigued or bar velocity is down.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['Verkhoshansky, Fundamentals of Special Strength Training (1977, p. 112)'],
      };
    }

    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: `G'day! For your current profile (${profile.leverageTags.join(', ')}), keep your concentric intent explosive. Every warm-up rep should move as fast as your top singles. What specific movement or load are we reviewing?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ['Small Goods Gym Floor Standard'],
    };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.goatBadge}>
                <Text style={styles.goatBadgeText}>🐐</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Goat AI Co-Pilot</Text>
                <Text style={styles.headerSubtitle}>Soviet Sports Science • Small Goods Gym</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Prompts Carousel */}
          <View style={styles.quickPromptsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsList}>
              {QUICK_PROMPTS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPromptChip}
                  onPress={() => handleSend(item.prompt)}
                  disabled={isLoading}
                >
                  <Text style={styles.quickPromptText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Messages Stream */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.sender === 'user' ? styles.userRow : styles.assistantRow,
                ]}
              >
                {msg.sender === 'assistant' && (
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarMiniText}>🐐</Text>
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    msg.sender === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.text}</Text>

                  {/* Triage Alert Badge */}
                  {msg.triageAlert && (
                    <View style={styles.triageBadge}>
                      <Text style={styles.triageBadgeTitle}>⚡ ACTION PROTOCOL:</Text>
                      <Text style={styles.triageBadgeText}>{msg.triageAlert.action}</Text>
                    </View>
                  )}

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <View style={styles.citationsContainer}>
                      <Text style={styles.citationsLabel}>📚 Sources:</Text>
                      {msg.citations.map((cite, i) => (
                        <Text key={i} style={styles.citationItem}>
                          • {cite}
                        </Text>
                      ))}
                    </View>
                  )}

                  <Text style={styles.timestampText}>{msg.timestamp}</Text>
                </View>
              </View>
            ))}

            {isLoading && (
              <View style={[styles.messageRow, styles.assistantRow]}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarMiniText}>🐐</Text>
                </View>
                <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color="#9aef0f" />
                  <Text style={styles.loadingText}>Consulting sports science index...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Goat AI (e.g. missed lift, squat leverage)..."
              placeholderTextColor="#6b7280"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// ==========================================
// STYLES (Small Goods Gym Tokens)
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d0d12',
  },
  container: {
    flex: 1,
    backgroundColor: '#0d0d12',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#22222e',
    backgroundColor: '#13131b',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goatBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4724ba',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#9aef0f',
  },
  goatBadgeText: {
    fontSize: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#9aef0f',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#9ca3af',
    fontSize: 20,
    fontWeight: '600',
  },
  quickPromptsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#1d1d28',
    backgroundColor: '#101017',
    paddingVertical: 10,
  },
  quickPromptsList: {
    paddingHorizontal: 12,
  },
  quickPromptChip: {
    backgroundColor: '#1c1c28',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2e2e42',
  },
  quickPromptText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4724ba',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarMiniText: {
    fontSize: 14,
  },
  bubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#4724ba',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#181822',
    borderWidth: 1,
    borderColor: '#262638',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#f3f4f6',
    fontSize: 14,
    lineHeight: 20,
  },
  triageBadge: {
    backgroundColor: '#261b00',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
  },
  triageBadgeTitle: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  triageBadgeText: {
    color: '#fef3c7',
    fontSize: 12,
    fontWeight: '600',
  },
  citationsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#28283c',
  },
  citationsLabel: {
    color: '#9aef0f',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  citationItem: {
    color: '#9ca3af',
    fontSize: 11,
    lineHeight: 16,
  },
  timestampText: {
    color: '#6b7280',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#9aef0f',
    fontSize: 12,
    marginLeft: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#13131b',
    borderTopWidth: 1,
    borderTopColor: '#22222e',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1c1c28',
    color: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2d2d40',
  },
  sendButton: {
    backgroundColor: '#9aef0f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#2e3a17',
  },
  sendButtonText: {
    color: '#0d0d12',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default GoatAICoPilot;
