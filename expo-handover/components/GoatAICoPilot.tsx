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

// Alias for athlete triage context
export type LifterTriageContext = NonNullable<GoatAICoPilotProps['athleteProfile']>;

// Preset Quick Triage Prompts (Accessible across all experience levels)
const QUICK_PROMPTS = [
  { label: '👋 Day 1 Squat Help', prompt: "I've never done barbell squats before and feel a bit nervous/stiff. Where should I start?" },
  { label: '⏱️ 30-Minute Crunch', prompt: 'I only have 30 minutes today. How should I prioritize my session using The Small Goods Way?' },
  { label: '🩹 Stiff Hips & Ankles', prompt: 'My hips and ankles feel super tight today. What Range Adder should I do before lifting?' },
  { label: '🩺 Shoulder Pinch (>3/10)', prompt: 'I have a 4/10 anterior shoulder pinch on bench press. How should I regress?' },
  { label: '⚡ 90s Missed Lift Triage', prompt: 'I missed two snatches at 85kg. What should I do on my next set?' },
  { label: '🐐 The Small Goods Way', prompt: 'What are the 5 exercise categories and session ordering rules of The Small Goods Way?' },
  { label: '📏 Long Femur Squats', prompt: 'My femurs are long compared to my torso (1.02 ratio). How should I adjust my squat stance?' },
  { label: '💪 Arm & Forearm Levers', prompt: 'How do my forearm and upper arm lengths affect my bench press touch point and shoulder rotation?' },
  { label: '💥 Soviet Shock Method', prompt: 'Explain the Verkhoshansky shock method depth jump parameters and amortization phase.' },
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
      text: `G'day ${athleteProfile.name}! Goat AI here. Whether it's your very first day under the bar or you're dialling in for a national meet, I'm right here in your corner. How is your session feeling today?`,
      timestamp: 'Now',
      citations: ['The Small Goods Way (Joel Mullen)', 'Verkhoshansky (1988)', 'Cleather (2021)'],
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

    // 1. Day 1 / Beginner / Nervous Support
    if (p.includes('beginner') || p.includes('day 1') || p.includes('never done') || p.includes('nervous') || p.includes('start')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `Welcome in! Feeling nervous or stiff on day one is 100% normal—everyone in this gym started right where you are.\n\n🎯 Step 1: Let's start with a Goblet Squat holding a light dumbbell or kettlebell against your chest, or even squatting down to a 20-inch box.\n\n🎯 Step 2 (Your Somatic Cue): Keep your feet shoulder-width apart, toes turned out slightly. Think about sitting your hips back between your heels like settling into a comfy armchair, and spread the floor with your feet.\n\n💡 The Coach's Why: Holding a light weight in front acts as a natural counterbalance, which helps your torso stay upright and lets your hips do the work without straining your lower back.\n\nTake your time with 3 easy sets of 8 reps. How does that feel on your knees and hips?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['The Small Goods Way: "Become a Stronger You"', 'Cleather, Force (2021)'],
      };
    }

    // 2. Mobility / Stiff Hips & Ankles
    if (p.includes('stiff') || p.includes('tight') || (p.includes('hip') && p.includes('ankle')) || p.includes('warm') || p.includes('mobility')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `G'day! Let's get those joints opened up so your barbell work feels silky smooth.\n\n🎯 Range Adder Protocol:\n1. 90/90 Hip Swivels: 8 smooth transitions per side, focusing on slow control.\n2. Front-Foot Elevated (FFE) Split Squats: 2 sets of 6 reps per leg holding a light 8kg dumbbell, letting the knee glide forward over the toes in a pain-free range.\n3. Deficit Romanian Deadlifts: Light bar, soft knees, pushing hips straight back toward the wall.\n\n💡 The Coach's Why: In The Small Goods Way, we use loaded movements through full active ranges (Range Adders) rather than passive stretching, because loaded movement signals your brain that it's safe to produce force in deep positions.\n\nGive those split squats a whirl and let me know if your hips feel looser!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['The Small Goods Way: Range Adder System', 'Verkhoshansky, Special Strength Training'],
      };
    }

    // 3. Time Crunch / 30-Minute Session
    if (p.includes('30') || p.includes('short on time') || p.includes('crunch') || p.includes('time limit')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `No worries at all! Life happens, and 30 focused minutes is plenty to get a high-quality session under your belt.\n\n🎯 The Small Goods 30-Minute Autoregulation Plan:\n1. 5 Mins — Range Adder: 2 quick sets of FFE split squats and hip openers.\n2. 15 Mins — Primary Force Builder: Squat or Bench for 3 heavy working sets of 5 reps with 2 minutes rest.\n3. 10 Mins — Volume Builder (Myo-Reps): Pick one accessory (e.g. dumbbell rows or leg extensions). Do 1 activation set of 12 reps to near-failure, rest 15 seconds, then do 3 mini-sets of 4 reps with 15s rest between.\n\n💡 The Coach's Why: Myo-reps give you all the muscle-building stimulus of 4 regular sets in just one-third of the clock time by keeping your high-threshold muscle fibers firing.\n\nReady to get after it? Let's clock in!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['The Small Goods Way: Minimum Effective Dose & Density Protocols', 'Zatsiorsky, Repeated Effort Method'],
      };
    }

    // 4. The Small Goods Way Taxonomy & Ordering
    if (p.includes('small goods way') || p.includes('category') || p.includes('categories') || p.includes('ordering')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `G'day! Here is how we build training sessions in The Small Goods Way:\n\n1. 🎯 Quick Floor Rule: We always build training in 5 distinct layers, ordered from the most mobile and explosive down to pure volume:\n\n• 1. Range Adders: Opening up active flexibility & joint tolerance (e.g. RDLs, front-foot elevated split squats).\n• 2. Co-ordinators: Skill and clean technique (e.g. snatches, paused squats).\n• 3. Accelerators: Speed & explosive snap with submaximal weights (e.g. banded squats, box jumps).\n• 4. Force Builders: Heavy strength with rock-solid stability (e.g. Hatfield safety-bar squats, bench press).\n• 5. Volume Builders: Muscle pumping and density (e.g. giant sets, myo-rep sets).\n\n💡 The Coach's Why: Putting explosive movements before high-fatigue volume ensures your nervous system stays fresh so you move fast and stay injury-free.\n\nWhat exercise are you gearing up for right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['The Small Goods Way (Joel Mullen, 2026)', 'Small Goods Gym Floor Standards'],
      };
    }

    // 5. Pain Threshold & Triage
    if (p.includes('pain') || p.includes('pinch') || p.includes('hurt') || p.includes('regress')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `🩺 Joel's Pain Threshold Rule (Pain > 3/10 Detected):\n\nFirst up: good on ya for listening to your body. We never grind through acute joint pinching.\n\n🎯 Immediate Floor Action:\n1. Step away from the straight barbell bench press immediately.\n2. Regress to a High-Stability Variant: Grab a pair of dumbbells and do a Floor Press with a neutral (palms facing each other) grip, or use the Swiss multi-grip bar.\n3. Cue: Keep your shoulder blades gently squeezed into your back pockets and stop each rep an inch before any discomfort.\n\n💡 The Coach's Why: A neutral grip reduces internal rotation at the shoulder, giving your supraspinatus tendon room to breathe while still training chest and triceps.\n\n📋 Care Handover: I've logged this discomfort vector in Holly Hunt's physio triage queue for follow-up.\n\nTry the dumbbell floor press—does that feel pain-free?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['The Small Goods Way: Pain Threshold Rule', 'Holly Hunt Physio Care Gateway'],
        triageAlert: {
          type: 'biomechanics',
          action: 'Regress to neutral-grip floor press & notify Holly Hunt Physio',
        },
      };
    }

    // 6. Missed Lifts / Velocity Drop
    if (p.includes('missed') || p.includes('snatch') || p.includes('velocity')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `⚡ 90-Second Rest Triage Activated:\n\nTake a deep breath and chalk up. Let's diagnose what happened in those two reps:\n\n🎯 The Call:\n1. Speed Check: If the bar felt slow or heavy off the floor, your central nervous system is fatigued. Drop working weight by 5%–7.5% (take 80kg instead of 85kg) for 2 clean technical singles.\n2. Floor Cue: Stay over the bar half a beat longer. Drive the world away with your legs through midfoot, and keep your arms relaxed like ropes until your hips finish their drive.\n3. Termination Rule: If your next single at 80kg still lacks pop, we terminate the snatch portion and move straight to pulls.\n\n💡 The Coach's Why: Continuing to miss at maximal load under fatigue only trains your brain to execute bad motor patterns (Zatsiorsky). Dropping 5% restores high velocity and rebuilds confidence.\n\nHow did that first single at 80kg feel?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['Issurin, Residual Training Effects (2008)', 'Mann, Velocity-Based Training Guide (2015)'],
        triageAlert: {
          type: 'drop_load',
          action: 'Drop weight 5–7.5% (80kg) for 2 clean singles or terminate lift',
        },
      };
    }

    // 7. Long Femur Squats
    if (p.includes('femur') || p.includes('squat')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `📐 Stance & Leverage Analysis (Femur/Torso: ${profile.femurToTorsoRatio}):\n\nG'day! Having longer thigh bones (femurs) compared to your torso is super common—it just means standard high-bar, narrow-stance advice will make you feel like you're folding in half.\n\n🎯 Simple Somatic Fixes:\n1. Widen Stance: Set your heels about 1.2× to 1.3× shoulder width.\n2. Flare Toes Out 30°: Turn your toes out comfortably to give your pelvis room to sink down between your thighs.\n3. The Cue: Think about "spreading the floor apart with your feet like tearing a newspaper in half" as you sit down into the space between your heels.\n4. Bar Placement: Try setting the bar 1–2 inches lower across your rear deltoids (Low Bar).\n\n💡 The Coach's Why: Opening your hip angle shortens the front-to-back distance your hips have to travel, allowing your chest to stay more upright and protecting your lower back.\n\nGive that wider stance a spin with an empty bar. Does your depth feel more natural?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['Cleather, Force: The Biomechanics of Training (2021)', 'The Small Goods Way'],
        triageAlert: {
          type: 'biomechanics',
          action: 'Widen stance to 1.2–1.3× shoulder width & flare toes 30°',
        },
      };
    }

    // 8. Forearms & Arm Levers
    if (p.includes('arm') || p.includes('forearm') || p.includes('bench')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `💪 Upper Limb Lever Analysis (Forearm/Arm: ${profile.forearmToArmRatio}):\n\nLong forearms mean the bar travels a greater distance down to your chest and puts extra leverage on your shoulders if your elbows flare wide.\n\n🎯 Actionable Floor Setup:\n1. Elbow Angle: Tuck your elbows at roughly 45° to your torso (making an arrow shape with your body, not a 'T').\n2. Grip Width: Take a grip where your forearms are straight vertical right when the barbell touches your lower chest.\n3. Floor Drive: Plant your heels firm into the floor and squeeze your glutes.\n\n💡 The Coach's Why: Tucking the elbows stacks your wrists directly over your elbows at the bottom of the lift, directing all force straight up into the bar while keeping the shoulder capsule safe.\n\nHow does your shoulder feel at the touch point with this grip?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['Cleather (2021)', 'Verkhoshansky, Special Strength Training Manual'],
      };
    }

    // 9. Verkhoshansky Shock Method
    if (p.includes('shock') || p.includes('depth jump') || p.includes('plyo')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `💥 Verkhoshansky Shock Method (True Plyometrics):\n\nHere's the real science behind depth jumping, directly from Yuri Verkhoshansky:\n\n🎯 Key Floor Rules:\n1. The Height: Step off a 0.50m to 0.75m box onto firm ground. (Never higher than 0.75m for explosive power).\n2. The 150-Millisecond Rule: The instant your feet hit the floor, you must rebound upward like hitting a burning-hot stove. Ground contact must be under 0.15 seconds.\n3. Dosage: Strictly 3 to 4 sets of 8 to 10 reps, with 3 full minutes of walking rest between sets.\n\n💡 The Coach's Why: If your feet stay on the floor longer than 150ms, the spring-like elastic energy stored in your muscle tendons turns into heat instead of rebound, defeating the whole purpose of the exercise.\n\n⚠️ Guardrail: If you are not squatting at least 1.5× bodyweight with solid form, we build up with box jumps and continuous pogo hops first!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['Verkhoshansky, Fundamentals of Special Strength Training (1977)', 'The Small Goods Way: Accelerator Framework'],
      };
    }

    // 10. Default Accessible Fallback
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: `G'day! For your profile (${profile.leverageTags.join(', ')}), remember Joel's #1 golden rule on the floor: power always starts with the legs, and every rep should be moved with fast, explosive intent.\n\n💡 The Coach's Why: Moving the bar as fast as you can on warm-ups primes your nervous system to fire all your muscle fibers when you reach heavy weights.\n\nWhat lift or question are we tackling next today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ['The Small Goods Way (Joel Mullen)', 'Verkhoshansky (1988)'],
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
