/**
 * Small Goods Gym • Cloudflare Worker AI Proxy
 * Routes authenticated requests from Expo (React Native) to Google Gemini API.
 * Keeps API secrets off the client and enriches prompts with athlete biometrics from Cloudflare D1.
 */

export interface Env {
  GEMINI_API_KEY: string;
  DB: D1Database; // Cloudflare D1 SQLite binding
  CLERK_PEM_PUBLIC_KEY?: string; // Optional JWT verification key
}

interface ChatRequestBody {
  prompt: string;
  athleteProfile?: {
    name?: string;
    femurToTorsoRatio?: number;
    forearmToArmRatio?: number;
    leverageTags?: string[];
    currentExercise?: string;
  };
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
        const { prompt, athleteProfile } = body;

        if (!prompt || typeof prompt !== 'string') {
          return new Response(JSON.stringify({ error: 'Bad Request: Missing prompt' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
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

ATHLETE BIOMECHANICAL CONTEXT:
- Name: ${athleteProfile?.name || 'Lifter'}
- Femur/Torso Ratio: ${athleteProfile?.femurToTorsoRatio || 'Balanced'}
- Forearm/Arm Ratio: ${athleteProfile?.forearmToArmRatio || 'Balanced'}
- Leverage Tags: ${(athleteProfile?.leverageTags || ['Standard']).join(', ')}
- Current Exercise: ${athleteProfile?.currentExercise || 'Barbell Session'}

TONE & STYLE:
- Speak in Joel Mullen's coaching voice: warm, authoritative, Australian barbell coach ("G'day! Let's get to work").
- Be concise, tactical, and practical for an athlete with chalk on their hands resting 90 seconds between sets.
- Cite sports science literature or Joel's tenets where helpful (e.g. "[Cleather, 2021]", "[Verkhoshansky, SST]", "[Small Goods Way]").
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
          "G'day! I had a quick misfire reading the bar data. Let's reset for your next set.";

        // 5. Parse Citations & Triage Action
        const citations: string[] = [];
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

    // Default 404
    return new Response(JSON.stringify({ error: 'Route Not Found' }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};
