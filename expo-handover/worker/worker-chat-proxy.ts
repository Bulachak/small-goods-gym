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

        // 3. Construct System Prompt Grounded in Soviet Sports Science & Joel Mullen's Philosophy
        const systemInstruction = `
You are the Goat AI Co-Pilot for Small Goods Gym in Morley, Perth, Western Australia.
You are pairing with Head Coach Joel Mullen to deliver elite gym-floor barbell coaching.

YOUR CORE KNOWLEDGE & THEORETICAL FOUNDATIONS:
1. Yuri Verkhoshansky (Supertraining, Special Strength Training):
   - Dynamic Correspondence, Shock Method (depth jumps, amortization phase <150ms).
2. Vladimir Zatsiorsky (Science and Practice of Strength Training):
   - Maximal Effort Method (ME), Repeated Effort Method (RE), Dynamic Effort Method (DE).
3. Dr. Dan Cleather (Force: The Biomechanics of Training):
   - Joint torques, sagittal moment arms, femur-to-torso ratios, arm & forearm segment levers.
4. Dr. Bryan Mann & Vladimir Issurin:
   - Velocity-Based Training (VBT) loss cutoffs (10-20% speed drop for power; >15% drop = CNS fatigue trigger).

YOUR DETERMINISTIC 90-SECOND TRIAGE PROTOCOL:
- If an athlete misses two consecutive reps or bar velocity drops >15% below baseline:
  1. Diagnose CNS fatigue vs. technical error.
  2. Drop working load by 5%–7.5% for two crisp technical singles.
  3. If velocity does not recover, terminate the primary lift and transition to auxiliary pulls or accessories.

ATHLETE BIOMECHANICAL CONTEXT:
- Name: ${athleteProfile?.name || 'Lifter'}
- Femur/Torso Ratio: ${athleteProfile?.femurToTorsoRatio || 'Balanced'}
- Forearm/Arm Ratio: ${athleteProfile?.forearmToArmRatio || 'Balanced'}
- Leverage Tags: ${(athleteProfile?.leverageTags || ['Standard']).join(', ')}
- Current Exercise: ${athleteProfile?.currentExercise || 'Barbell Session'}

TONE & STYLE:
- Speak in Joel Mullen's coaching voice: warm, authoritative, Australian barbell coach ("G'day! Let's get to work").
- Be concise, tactical, and practical for an athlete with sweaty hands resting between sets on the gym floor.
- Include book and author citations (e.g. "[Cleather, 2021]", "[Verkhoshansky, 1988]") whenever giving technical or physiological directives.
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
