# Small Goods Gym — Joel Mullen's Original Audio Brief
**Received:** September 6, 2026 via WhatsApp Voice Note  
**Sender:** Joel Mullen (Founder & Head Coach, Small Goods Gym — Morley, Perth)  
**Recipient:** Kamilla  
**Document Status:** Canonical Requirement Record  

---

## 1. Exact Word-for-Word Transcript

> "So the situation that currently stands is that Javier has made more or less a backend shell that's able to house whatever we need to house it now. 
> 
> So we've got users, we've got permissions, we are relatively secure, at least by his description, so we can kind of house more sensitive information if we'd like to and it should be safe. 
> 
> And what I basically said to him is we need to pull our finger out on actually making this usable app. We've got two goals and that need to be realized by February next year. 
> 
> Goal number one is that it needs to house some sort of events and community infrastructure, not dissimilar to kind of what we already do on WhatsApp, but we're trying to find a place where there's less noise so that the signal is clearer. We're looking at different ways to create push notifications either within the app or outside of the app, but just depends on how much we're willing to spend that way. But an events infrastructure that notifies people that they're coming up and allows them to click attending or not etc. is one thing. 
> 
> The second thing, which is a little bit more involved, is the programming side of things, so a shell to deliver programs, have video links that could be embedded and watched, and then track PBs over time, program to program, along with improvement. Those are the main things that I've tasked Javi with. 
> 
> The aim in the long term is to try and create an app that will essentially act as an assistant to both my coaches and my athletes."

---

## 2. Strategic Extraction & Deconstruction

| Parameter | Fact from Joel | Architectural Response |
| :--- | :--- | :--- |
| **Existing Backend** | Javier built user tables, authentication, and role permissions. | **Do NOT rewrite or replace.** We wrap his auth in a decoupled JWT Bearer token handshake (`javier-integration-guide.md`). |
| **Hard Deadline** | **February next year (2027)**. | Scope strict Phase 1 MVP: Gym-floor mobile logger + Event RSVP/Waitlist. |
| **Goal 1: Events/Community** | Replace noisy WhatsApp group chats with a dedicated event schedule and 1-tap RSVP/waitlist. | Built in `rsvp-system/` and `waitlist-ui/`: 12-platform capacity limit, auto-waitlist promotion, and offline queue. |
| **Goal 2: Program Delivery** | Clean mobile UI to deliver workouts, embed Vimeo/YouTube form videos, and track PB curves over time. | Built in `workout-logger-preview.html`: 64px Fitts tap targets, single-movement Hick's Law card, sub-400ms Doherty feedback. |
| **Long-Term Differentiator** | AI coaching assistant that acts as a co-pilot for coaches and lifters. | Built in `athlete-profile-preview.html` and `vbt-integration-blueprint.py`: Limb length leverage tagging (femur/torso ratios) and Enode velocity-based training (VBT) feedback. |
