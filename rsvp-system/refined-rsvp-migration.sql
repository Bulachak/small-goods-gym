-- =============================================================================
-- SQL MIGRATION: REFINED RSVP & FIFO WAITLIST SYSTEM
-- SMALL GOODS GYM (PERTH, AUSTRALIA)
-- =============================================================================

-- 1. ADD ADDITIONAL COLUMNS FOR WAITLIST STATUS & BIO-GATEWAYS
-- Alters our Phase 1 event_rsvps table to support waitlist queues and medical warnings.
ALTER TABLE event_rsvps 
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'attending', -- 'attending', 'waitlisted', 'cancelled'
    ADD COLUMN IF NOT EXISTS queue_position INT DEFAULT NULL,        -- FIFO position if waitlisted
    ADD COLUMN IF NOT EXISTS rehab_warning_overridden BOOLEAN DEFAULT FALSE, -- Track if coach/athlete bypassed biometric warning
    ADD COLUMN IF NOT EXISTS warning_override_notes TEXT DEFAULT NULL;

-- 2. CREATE AUTOMATED FIFO WAITLIST PROMOTION TRIGGER
-- When an athlete cancels an active spot (status = 'cancelled' or row deleted),
-- this trigger automatically promotes the first athlete in the FIFO queue (lowest queue_position).
CREATE OR REPLACE FUNCTION promote_first_from_waitlist()
RETURNS TRIGGER AS $$
DECLARE
    next_athlete_id UUID;
    next_rsvp_id UUID;
BEGIN
    -- Check if the deleted/cancelled RSVP was an active attending slot
    IF (TG_OP = 'DELETE' AND OLD.status = 'attending') OR (TG_OP = 'UPDATE' AND OLD.status = 'attending' AND NEW.status = 'cancelled') THEN
        
        -- Identify the next athlete in line on the waitlist for this specific event
        SELECT id, user_id INTO next_rsvp_id, next_athlete_id
        FROM event_rsvps
        WHERE event_id = OLD.event_id AND status = 'waitlisted'
        ORDER BY queue_position ASC, logged_at ASC
        LIMIT 1;

        -- Promote that athlete to attending and clear their queue position
        IF next_rsvp_id IS NOT NULL THEN
            UPDATE event_rsvps
            SET status = 'attending',
                queue_position = NULL
            WHERE id = next_rsvp_id;
            
            -- Re-index the remaining waitlist queue positions for this event
            UPDATE event_rsvps
            SET queue_position = queue_position - 1
            WHERE event_id = OLD.event_id AND status = 'waitlisted' AND queue_position > 1;
            
            -- Note: Our FastAPI background worker will scan for status changes 
            -- and trigger the WebPush notification to the promoted athlete automatically.
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. BIND TRIGGER TO EVENT_RSVPS
DROP TRIGGER IF EXISTS trigger_auto_promote ON event_rsvps;
CREATE TRIGGER trigger_auto_promote
    AFTER DELETE OR UPDATE OF status ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION promote_first_from_waitlist();
