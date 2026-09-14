# Small Goods Gym: Developer Integration & Gateway Guide
*Boutique Strength, Powerlifting, and Athletic Rehabilitation Gym (Perth, Australia)*

This document serves as the official integration playbook to bridge Javier's foundational backend authentication/user management shell with the Next.js Progressive Web App (PWA) clients and the FastAPI athletic/VBT analytical microservices.

---

## 1. Core Integration Architecture

To maintain high internal quality, preserve loose coupling, and protect Javier's auth shell from breaking changes, we establish a **Decoupled Gateway Handshake** using JSON Web Tokens (JWT).

```
 ┌──────────────────────────────────────────────────────────────┐
 │                     Next.js PWA Client                       │
 │  (Handles Athtlete Logger & Coach Biomechanical Dashboard)   │
 └──────────────┬──────────────────────────────┬────────────────┘
                │                              │
   1. Login     │ JWT Credentials              │ 3. Forward JWT 
   (Auth Check) │ & Profile Payload            │ (Bearer Token)
                ▼                              ▼
 ┌──────────────────────────────┐   ┌───────────────────────────┐
 │   Javier's Auth Backend      │   │    FastAPI Microservice   │
 │ (User Management & Roles)    │   │ (Analytics & VBT Logging) │
 └──────────────────────────────┘   └──────────┬────────────────┘
                                               │
                                               │ 4. Read/Write
                                               ▼
                                    ┌───────────────────────────┐
                                    │    PostgreSQL Database    │
                                    │ (Athletic & Event Tables) │
                                    └───────────────────────────┘
```

### The Integration Handshake Workflow
1. **Authentication:** The Next.js PWA client sends credentials to Javier’s backend.
2. **Token Issuance:** Javier's backend validates credentials and returns a secure JWT containing the user's ID, email, and security role (e.g., `role: "coach"`, `role: "athlete"`).
3. **API Routing:** 
   * Auth-related requests (change password, update profile details) route directly to Javier's service.
   * Performance metrics, VBT telemetry, and RSVP/Events traffic route directly to the FastAPI microservice. The client includes the JWT in the standard headers: `Authorization: Bearer <token>`.
4. **Decoupled Verification:** The FastAPI microservice intercepts the request, decodes the JWT using the shared secret or public key, validates the signature, and extracts the payload without querying Javier’s active backend.

---

## 2. Setting Up FastAPI JWT Middleware

Javier must expose the public verification configuration (or symmetric secret) to the FastAPI microservice's environment. Below is the lightweight integration middleware that FastAPI uses to decode and verify Javier's JWTs on athletic data routes:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()

# Shared environment variables initialized in Docker / Server config
JWT_SECRET = os.getenv("JWT_SECRET", "javier_auth_shared_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

class UserContext:
    def __init__(self, user_id: str, email: str, role: str):
        self.user_id = user_id
        self.email = email
        self.role = role

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserContext:
    token = credentials.credentials
    try:
        # Decode and verify the signature against Javier's verification rules
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")
        
        if not user_id or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed: Missing sub or role claims."
            )
        return UserContext(user_id=user_id, email=email, role=role)
        
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )
```

---

## 3. Integrating the Client Dashboards

To connect the pre-built dashboards (`workout-logger-prototype.tsx` and `athlete-profile-view.tsx`) with the backend resources, update the React context providers to capture and utilize Javier's active user sessions.

### Step A: API Client Setup (Next.js)
Establish a centralized API client instance that automatically attaches the user’s auth token:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Javier's token into every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('javier_auth_token'); // Or secure cookie storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
```

### Step B: Wiring up the Athlete Logger (`workout-logger-prototype.tsx`)
Connect the interactive logging sets to the FastAPI `/api/v1/vbt/ingest-set` endpoint:

```typescript
// Replace the mock logSet function inside the prototype with real API integration
const logSetToDatabase = async (setData: any) => {
  try {
    const response = await api.post('/vbt/ingest-set', {
      session_id: activeSessionId,
      exercise_id: currentExerciseId,
      set_number: setData.setNumber,
      prescribed_reps: setData.targetReps,
      prescribed_weight: setData.targetWeight,
      logged_reps: setData.completedReps,
      logged_weight: setData.completedWeight,
      logged_rpe: setData.completedRPE,
      // Pass accelerometer/VBT data if connected
      reps_telemetry: setData.vbtTelemetry || []
    });
    
    // Provide visual feedback (Doherty Threshold compliant)
    return response.data;
  } catch (error) {
    console.error("Failed to commit workout log:", error);
    // Trigger offline fallbacks or notify the user
    throw error;
  }
};
```

---

## 4. Calendar RSVP Notification Engine (Goal 1)

To move away from noisy, chaotic WhatsApp group chats, we implement a highly focused Event RSVP system. 

### Database Schema for Events

```sql
-- EVENT SCHEDULE TABLE
CREATE TABLE gym_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'workshop', -- 'workshop', 'club_lifting', 'social'
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(100) DEFAULT 'Small Goods Gym Main Floor',
    max_capacity INT,
    created_by UUID NOT NULL, -- Links to Javier's User ID (Coaches/Admin)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RSVP TRACKING TABLE
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES gym_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Links to Javier's Auth Users table
    status VARCHAR(20) NOT NULL DEFAULT 'attending', -- 'attending', 'declined', 'tentative'
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_event_rsvp UNIQUE (event_id, user_id)
);
```

### In-App & Push Notification Handshake
When Joel or Holly schedules an upcoming Olympic weightlifting workshop or social club meet, a background worker triggers browser push notifications to all active athlete PWA clients.

```
┌─────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  Coach Creates  ├───────>│  FastAPI Worker  ├───────>│ Apple / Google   │
│   Gym Event     │        │  (Query Tokens)  │        │   Push Servers   │
└─────────────────┘        └────────┬─────────┘        └────────┬─────────┘
                                    │                           │ Dispatches
                                    │ WebPush Payload           │ Push Event
                                    ▼                           ▼
                           ┌──────────────────────────────────────────────┐
                           │              Athlete Phone                   │
                           │  (Service Worker wakes up & displays Banner) │
                           └──────────────────────────────────────────────┘
```

1. **Token Subscription:** When athletes install the PWA, the service worker requests push permission. On approval, it sends the browser's unique `Subscription Object` to our database via FastAPI `/api/v1/notifications/subscribe`.
2. **Dispatching Events:**
```python
# FastAPI endpoint triggered when a coach creates a new event
from pywebpush import webpush, WebPushException

def dispatch_event_notification(event_title: str, scheduled_time: str):
    # Fetch all active subscription objects from PostgreSQL
    subscriptions = db.query(PushSubscription).all()
    
    payload = {
        "title": "New Small Goods Event!",
        "body": f"Join us for '{event_title}' on {scheduled_time}. Tap to RSVP!",
        "url": "/events",
        "icon": "/assets/icons/icon-192x192.png"
    }
    
    for sub in subscriptions:
        try:
            webpush(
                subscription_info=sub.subscription_json,
                data=json.dumps(payload),
                vapid_private_key="./vapid_private.pem",
                vapid_claims={"sub": "mailto:support@smallgoodsgym.com.au"}
            )
        except WebPushException as ex:
            # Clean up dead tokens or expired registrations
            if ex.response and ex.response.status_code in [404, 410]:
                db.delete(sub)
```
3. **Instant RSVP Handling:** The notification launches the athlete's device straight to the `/events` PWA tab, allowing them to confirm attendance using a **1-tap** interaction loop.
