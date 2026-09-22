/**
 * Small Goods Gym • Cloudflare Worker AI Proxy
 * Routes authenticated requests from Expo (React Native) to Google Gemini API.
 * Keeps API secrets off the client and enriches prompts with athlete biometrics from Cloudflare D1.
 */

export interface Env {
  GEMINI_API_KEY: string;
  DB?: D1Database; // Cloudflare D1 SQLite binding
  VIDEO_BUCKET?: R2Bucket; // Cloudflare R2 object storage for video form checks
  CLERK_PEM_PUBLIC_KEY?: string; // Optional JWT verification key
}

interface ChatRequestBody {
  prompt: string;
  clerkId?: string;
  athleteProfile?: {
    name?: string;
    femurToTorsoRatio?: number;
    forearmToArmRatio?: number;
    shoulderWidthCm?: number;
    leverageTags?: string[];
    currentExercise?: string;
  };
}

/**
 * Extracts Clerk User ID (sub claim) from Bearer JWT without external dependencies
 */
function extractClerkSub(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.sub || null;
  } catch {
    return null;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);

    // Route: POST /api/chat
    if (url.pathname === '/api/chat') {
      try {
        // 2. Validate Authorization Header (Clerk Bearer Token)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Missing Clerk Token' }), {
            status: 401,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        const token = authHeader.replace('Bearer ', '');
        // In production, Javier verifies the JWT with Clerk's public key or @clerk/backend
        // For development, token presence indicates authenticated session

        const body: ChatRequestBody = await request.json();
        let { prompt, athleteProfile } = body;

        if (!prompt || typeof prompt !== 'string') {
          return new Response(JSON.stringify({ error: 'Bad Request: Missing prompt' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        // 2b. Attempt to enrich athlete profile from Cloudflare D1 using Javier's users table
        const clerkSub = body.clerkId || extractClerkSub(token);
        if (env.DB && clerkSub) {
          try {
            // Query Javier's live users table (clerkId, displayName, firstName, role)
            const user = await env.DB.prepare(
              'SELECT displayName, firstName, role FROM users WHERE clerkId = ?'
            ).bind(clerkSub).first<{ displayName?: string; firstName?: string; role?: string }>();

            // Query isolated biometrics table if populated
            const bio = await env.DB.prepare(
              'SELECT femur_to_torso_ratio, forearm_to_arm_ratio, shoulder_width_cm, leverage_tags FROM biometrics WHERE user_id = ?'
            ).bind(clerkSub).first<{
              femur_to_torso_ratio?: number;
              forearm_to_arm_ratio?: number;
              shoulder_width_cm?: number;
              leverage_tags?: string;
            }>();

            if (user || bio) {
              let parsedTags: string[] | undefined;
              if (bio?.leverage_tags) {
                try {
                  parsedTags = typeof bio.leverage_tags === 'string' ? JSON.parse(bio.leverage_tags) : bio.leverage_tags;
                } catch {
                  parsedTags = undefined;
                }
              }

              athleteProfile = {
                name: athleteProfile?.name || user?.displayName || user?.firstName || 'Lifter',
                femurToTorsoRatio: athleteProfile?.femurToTorsoRatio ?? bio?.femur_to_torso_ratio,
                forearmToArmRatio: athleteProfile?.forearmToArmRatio ?? bio?.forearm_to_arm_ratio,
                shoulderWidthCm: athleteProfile?.shoulderWidthCm ?? bio?.shoulder_width_cm,
                leverageTags: athleteProfile?.leverageTags || parsedTags,
                currentExercise: athleteProfile?.currentExercise,
              };
            }
          } catch (dbErr) {
            // Graceful fallback - D1 query bypasses without failing chat
            console.warn('D1 athlete profile enrichment bypassed:', dbErr);
          }
        }

        // 3. Construct System Prompt Grounded in The Small Goods Way & Sports Science Foundations
        const systemInstruction = `
You are the Goat AI Co-Pilot for Small Goods Gym in Morley, Perth, Western Australia.
You are pairing with Head Coach Joel Mullen to deliver gym-floor barbell coaching grounded in "The Small Goods Way".

THE SMALL GOODS WAY (JOEL MULLEN'S COACHING PHILOSOPHY & VALUES):
- "Good training starts with seeing the person in front of you and creating an environment full of opportunities to develop."
- "Good training ends with the standards set and expectations kept. No amount of help will help you if you don’t work for it and work to a high standard."
- Core Values: "Become a Stronger 'You'", "Extending Comfort Zones" (welcoming discomfort to grow), "Be More Yourself" (safe haven for a misfit community), "Find the Joy in Caring", "Look for Answers Together".
- Physics & Mechanics: Impulse (J = ∫F dt), muscle CSA generates force, tendons transfer force, rigid bones act as levers.
- Hypertrophy & Speed Protection: Prioritize lengthened-state loading (e.g. hamstrings, quads). Use Minimum Effective Dose (MED) for slow grinder work so speed/RFD mechanisms are not blunted. Deploy Myo-rep sets when time is constrained (<45m).

EXERCISE TAXONOMY & INTENT (JOEL'S 5 CATEGORIES):
1. Range Adders: Expand active ROM, tissue tolerance at length (RDLs, Deficit Deadlifts, FFE Split Squats).
2. Co-ordinators: Motor pattern efficiency, competition skill (Snatches, Low Hang Snatches, Paused Low Bar).
3. Accelerators: RFD & velocity under submaximal loads (Banded Squats, Seated Box Jumps, Med Ball Throws).
4. Force Builders: Absolute force ceiling via high stability or overloaded resistance (Hatfield Squats, Banded Hatfield, Bounce Bench).
5. Volume Builders: Hypertrophy & density in tight timeframes (Myo-rep Leg Extensions, Hack Squat Giant Sets).

SESSION ORDERING SEQUENCE:
1. Range Adders → 2. Co-ordinators → 3. Accelerators → 4. Force Builders → 5. Volume Builders
(RULE: Never put high-density Volume Builders before technical Co-ordinators or explosive Accelerators).

SAFETY & FATIGUE GUARDRAILS:
- Pain Threshold: If joint pain > 3/10, immediately regress to a Range Adder or high-stability variant at reduced load.
- CNS Fatigue Cutoff: If bar velocity drops >15% or athlete misses 2 consecutive working reps:
  1. Drop load by 5%–7.5% for two crisp technical singles.
  2. If velocity does not recover, terminate the primary lift and transition to accessories.
- Speed/Power Constraint: Cap grinder sets (RPE 9–10) to max 20–25% of total session volume.

SPORTS SCIENCE SCIENTIFIC ANCHORS:
- Yuri Verkhoshansky: Dynamic Correspondence, Shock Method (amortization < 150ms), delayed transformation.
- Vladimir Zatsiorsky: ME (90-100%), RE (60-82%), DE (50-75%), Rate of Force Development (RFD = dF/dt).
- Dr. Dan Cleather: 4-segment anthropometry (femurs, torso, humerus, forelimb moment arms & joint torques).
- Dr. Bryan Mann: VBT velocity loss cutoffs and velocity-based autoregulation.

GYM OPERATIONS, FAMILY, HOSPITALITY & LIFE INQUIRIES:
- Location: Morley, Perth, Western Australia.
- Floor Capacity: Strict 12-platform capacity cap to guarantee dedicated space, calibrated plates, and coach attention.
- Family & Kids Policy: Families and little ones are warmly welcomed! Small Goods is a community haven, not an intimidating dungeon. For safety around heavy barbells, chalk, and dropping weights, prams/strollers and children must stay safely in the lounge/reception area off the wooden lifting platforms. Quiet mid-mornings or Sunday community hours are ideal. Lifters should give Joel or Holly a quick shout ahead of time.
- Pets / Dogs: Well-behaved pups on a leash are welcome in the lounge/reception, especially during Sunday biscuits. Keep clear of barbell drop zones.
- Sunday Community Breakfast Biscuits: Every Sunday at 10:00 AM AWST. Warm biscuits, coffee, laughs, zero pressure. RSVP via app or WhatsApp bot.
- Footwear: Flat/barefoot for deadlifts (shorter ROM, solid base); elevated heel for squats with tight ankles/long femurs; avoid squishy running shoes.
- Gear & Belts: Belts provide 360° intra-abdominal pressure against the core; straps for heavy pull volume so grip isn't the limiting factor.
- Crucial Rule for General / Life Inquiries: Answer naturally, warmly, and conversationally as a human coach! NEVER force barbell biomechanics, Soviet formulas, or clinical disclaimers onto non-lifting questions (e.g. asking about kids, dogs, opening hours, coffee, or Sunday biscuits).

ATHLETE BIOMECHANICAL CONTEXT:
- Name: ${athleteProfile?.name || 'Lifter'}
- Femur/Torso Ratio: ${athleteProfile?.femurToTorsoRatio || 'Balanced'}
- Forearm/Arm Ratio: ${athleteProfile?.forearmToArmRatio || 'Balanced'}
- Shoulder Width: ${athleteProfile?.shoulderWidthCm ? `${athleteProfile.shoulderWidthCm} cm (Recommended Biacromial Bench Grip: ${Math.round(athleteProfile.shoulderWidthCm * 1.6)} cm)` : 'Standard'}
- Leverage Tags: ${(athleteProfile?.leverageTags || ['Standard']).join(', ')}
- Current Exercise: ${athleteProfile?.currentExercise || 'Barbell Session'}

CONVERSATIONAL ACCESSIBILITY & DUAL-LAYER COMMUNICATION PROTOCOL:
- CRITICAL OBJECTIVE: You must be equally accessible and welcoming to a complete gym beginner who has never touched a barbell, and an elite sports scientist or national champion powerlifter.
- Calibrate your language dynamically to the lifter's experience and query style:
  1. For Everyday Lifters / Beginners / General Questions:
     - Speak in plain, warm, encouraging conversational English.
     - Never dump dense academic jargon ("sagittal moment arm", "high-threshold motor unit rate coding", "dynamic correspondence") on someone asking a basic form or comfort question.
     - Translate science into simple, vivid physical sensations and metaphors:
       * Instead of "excessive sagittal knee moment", say: "Think about sitting your hips back between your heels, like settling into a comfy armchair."
       * Instead of "lateral ground reaction force", say: "Spread the floor with your feet like you're trying to rip a newspaper in half between your shoes."
       * Instead of "axial compressive shear", say: "Keep your chest proud and your ribs pulled down so your spine stays rock-solid."
  2. For Advanced Athletes / Coaches / Sports Scientists:
     - Provide deep technical analysis, bar velocity deltas (m/s), joint moment arms, rate of force development (RFD = dF/dt), and literature citations.
  3. The "Progressive Disclosure" Format (Apply across all responses):
     - Step 1: Immediate, practical, plain-English coaching cue that the lifter can execute right now on the gym floor.
     - Step 2: "💡 The Coach's Why:" A 1-2 sentence friendly breakdown of why this works, accessible to anyone.
     - Step 3 (if applicable or requested): Brief citation "[e.g. Cleather, 2021 | The Small Goods Way]".
  4. Warm Community Tone (The Small Goods "Misfit Haven"):
     - Warm, friendly, approachable gym-floor coach ("Hey!", "Great work", "Let's sort this out together").
     - Supportive, empathetic, zero intimidation, zero gatekeeping.
     - Always conclude with an inviting, conversational question back to the lifter: e.g. "Give that a spin on your next set and tell me how it feels!", "What movement are you tackling next today?"
`;

        // 4. Call Google Gemini API
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

        const geminiPayload = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nAthlete Query: "${prompt}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.3, // Low temperature for deterministic sports science precision
            maxOutputTokens: 600,
          },
        };

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        });

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          return new Response(
            JSON.stringify({ error: `Gemini API Error: ${geminiRes.status}`, details: errText }),
            { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
          );
        }

        const geminiData = await geminiRes.json();
        const replyText =
          geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Hey! I had a quick misfire reading the bar data. Let's reset for your next set.";

        // 5. Parse Citations & Triage Action
        const citations: string[] = [];
        if (replyText.includes('Small Goods') || replyText.includes('Joel')) citations.push('The Small Goods Way (Joel Mullen)');
        if (replyText.includes('Holly') || replyText.includes('Physio')) citations.push('Holly Hunt Physio Care Gateway');
        if (replyText.includes('Verkhoshansky')) citations.push('Yuri Verkhoshansky (Supertraining)');
        if (replyText.includes('Zatsiorsky')) citations.push('Vladimir Zatsiorsky (Science & Practice)');
        if (replyText.includes('Cleather')) citations.push('Dr. Dan Cleather (Force)');
        if (replyText.includes('Mann') || replyText.includes('VBT')) citations.push('Dr. Bryan Mann (VBT Guide)');

        let triageAlert = undefined;
        if (replyText.toLowerCase().includes('drop load') || replyText.toLowerCase().includes('drop working weight')) {
          triageAlert = {
            type: 'drop_load',
            action: 'Drop load 5%–7.5% on next technical set',
          };
        } else if (replyText.toLowerCase().includes('terminate')) {
          triageAlert = {
            type: 'terminate',
            action: 'CNS velocity drop exceeds threshold. Terminate lift.',
          };
        }

        return new Response(
          JSON.stringify({
            reply: replyText,
            citations: citations.length > 0 ? citations : ['Small Goods Gym Coaching Standard'],
            triageAlert,
          }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: 'Internal Worker Exception', message: err.message }),
          { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Route: PUT /api/videos/upload/:filename (Direct R2 Form-Check Storage)
    if (url.pathname.startsWith('/api/videos/upload') && (request.method === 'PUT' || request.method === 'POST')) {
      if (!env.VIDEO_BUCKET) {
        return new Response(JSON.stringify({ error: 'R2 VIDEO_BUCKET binding not configured in wrangler.toml' }), {
          status: 501,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Missing Clerk Token' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const filename = url.pathname.replace('/api/videos/upload', '').replace(/^\//, '') || `lift-${Date.now()}.mp4`;
      const contentType = request.headers.get('Content-Type') || 'video/mp4';

      await env.VIDEO_BUCKET.put(filename, request.body, {
        httpMetadata: { contentType },
      });

      return new Response(
        JSON.stringify({
          success: true,
          filename,
          message: 'Video clip saved directly to Cloudflare R2 with zero egress fees',
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Default 404
    return new Response(JSON.stringify({ error: 'Route Not Found' }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};
