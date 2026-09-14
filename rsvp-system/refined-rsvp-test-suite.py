import sys
import os
import uuid
import unittest
from datetime import datetime
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Ensure the module can be loaded from the directory where this test script lives
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import our router and MockDB from refined-rsvp-backend-v2.py
import importlib
try:
    backend_module = importlib.import_module("refined-rsvp-backend-v2")
except ModuleNotFoundError:
    # Fallback for alternative project paths or testing configurations
    sys.path.insert(0, '/workspace/artifacts')
    sys.path.insert(0, '/workspace/scratch')
    backend_module = importlib.import_module("refined-rsvp-backend-v2")

router = backend_module.router
MockDB = backend_module.MockDB

class TestRefinedRSVP(unittest.TestCase):
    def setUp(self):
        """
        Set up a clean mock database state before each test run.
        This ensures test isolation and predictability.
        """
        # Define static UUIDs for predictability in tests
        self.event_id = uuid.UUID("38210111-1111-1111-1111-111111111111")
        self.injured_athlete_id = uuid.UUID("99120111-1111-1111-1111-111111111111")
        self.healthy_athlete_id_1 = uuid.UUID("00000000-0000-0000-0000-000000000001")
        self.healthy_athlete_id_2 = uuid.UUID("00000000-0000-0000-0000-000000000002")
        self.healthy_athlete_id_3 = uuid.UUID("00000000-0000-0000-0000-000000000003")
        
        # Reset MockDB events to a predictable, test-isolated baseline
        MockDB.gym_events = {
            self.event_id: {
                "title": "Olympic Weightlifting: Clean & Jerk Overhead Mechanics",
                "max_capacity": 3,  # Set a low capacity for easy waitlist testing
                "attendees": [self.healthy_athlete_id_1, self.healthy_athlete_id_2],  # 2 active attendees (1 spot left)
                "waitlist": []  # Empty waitlist
            }
        }
        
        # Reset MockDB athlete profiles
        MockDB.athlete_profiles = {
            self.injured_athlete_id: {
                "name": "Alex Carter",
                "email": "alex.carter@gmail.com",
                "active_rehab_flag": True,
                "rehab_notes": "Active shoulder rehabilitation - restricted from full overhead snatches / heavy jerks without coach modification."
            },
            self.healthy_athlete_id_1: {
                "name": "Healthy Athlete One",
                "email": "healthy.one@gmail.com",
                "active_rehab_flag": False,
                "rehab_notes": ""
            },
            self.healthy_athlete_id_2: {
                "name": "Healthy Athlete Two",
                "email": "healthy.two@gmail.com",
                "active_rehab_flag": False,
                "rehab_notes": ""
            },
            self.healthy_athlete_id_3: {
                "name": "Healthy Athlete Three",
                "email": "healthy.three@gmail.com",
                "active_rehab_flag": False,
                "rehab_notes": ""
            }
        }
        
        # Set up a temporary FastAPI app and TestClient
        self.app = FastAPI()
        self.app.include_router(router)
        self.client = TestClient(self.app)

    def test_injury_warning_blocks_rsvp(self):
        """
        TEST 1: Biomechanical Care Gateway (Physio Care Warning Block)
        Asserts that an athlete with an active injury/rehab flag is blocked from RSVPing
        if they do not explicitly override the warning flag.
        """
        payload = {
            "user_id": str(self.injured_athlete_id),
            "override_rehab_warning": False
        }
        response = self.client.post(f"/api/v1/events/{self.event_id}/rsvp", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "blocked_by_warning")
        self.assertTrue(data["warning_flagged"])
        self.assertIn("PHYSIO CARE WARNING", data["warning_message"])
        self.assertIn("Alex Carter", data["warning_message"])

    def test_injury_warning_overridden_rsvp(self):
        """
        TEST 2: Biomechanical Care Gateway Override
        Asserts that an athlete with an active rehab flag can bypass the warning and
        secure an active spot if 'override_rehab_warning' is set to True.
        """
        payload = {
            "user_id": str(self.injured_athlete_id),
            "override_rehab_warning": True
        }
        response = self.client.post(f"/api/v1/events/{self.event_id}/rsvp", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "attending")
        self.assertTrue(data["warning_flagged"]) # Warning should still be recorded in the log
        self.assertIsNotNone(data["warning_message"])
        
        # Verify they are now in the active attendees list
        self.assertIn(self.injured_athlete_id, MockDB.gym_events[self.event_id]["attendees"])

    def test_healthy_athlete_rsvp_success(self):
        """
        TEST 3: Standard Successful RSVP
        Asserts that a healthy athlete can successfully secure an active spot without
        any injury flags or warnings being triggered.
        """
        payload = {
            "user_id": str(self.healthy_athlete_id_3),
            "override_rehab_warning": False
        }
        response = self.client.post(f"/api/v1/events/{self.event_id}/rsvp", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "attending")
        self.assertFalse(data["warning_flagged"])
        self.assertIsNone(data["warning_message"])
        
        self.assertIn(self.healthy_athlete_id_3, MockDB.gym_events[self.event_id]["attendees"])

    def test_waitlist_queuing_when_full(self):
        """
        TEST 4: Automated FIFO Waitlist Queuing
        Asserts that when an event reaches maximum capacity (e.g. 3/3 spots filled),
        additional athletes are gracefully queued into the waitlist in order.
        """
        # Fill the last remaining active spot (spot 3/3)
        MockDB.gym_events[self.event_id]["attendees"].append(self.healthy_athlete_id_3)
        
        # Now event is full. Create another healthy athlete (Athlete 4)
        athlete_4_id = uuid.uuid4()
        payload = {
            "user_id": str(athlete_4_id),
            "override_rehab_warning": False
        }
        
        # RSVP should succeed but place the user in 'waitlisted' status
        response = self.client.post(f"/api/v1/events/{self.event_id}/rsvp", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "waitlisted")
        self.assertEqual(data["queue_position"], 1)
        
        # Verify they are in the waitlist table, not the attendees
        waitlist_user_ids = [item["user_id"] for item in MockDB.gym_events[self.event_id]["waitlist"]]
        self.assertIn(athlete_4_id, waitlist_user_ids)
        self.assertNotIn(athlete_4_id, MockDB.gym_events[self.event_id]["attendees"])

    def test_prevent_double_waitlist(self):
        """
        TEST 5: Waitlist Integrity Protection
        Asserts that an athlete cannot register for the waitlist twice.
        """
        # Fill event & add athlete to waitlist
        MockDB.gym_events[self.event_id]["attendees"].append(self.healthy_athlete_id_3)
        athlete_4_id = uuid.uuid4()
        MockDB.gym_events[self.event_id]["waitlist"].append({"user_id": athlete_4_id, "created_at": datetime.now()})
        
        payload = {
            "user_id": str(athlete_4_id),
            "override_rehab_warning": False
        }
        
        # Re-submitting RSVP should trigger a 400 bad request error
        response = self.client.post(f"/api/v1/events/{self.event_id}/rsvp", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("already on the waitlist", response.json()["detail"])

    def test_waitlist_fifo_promotion_on_cancel(self):
        """
        TEST 6: Decoupled FIFO Auto-Promotion Workflow
        Asserts that when an active attendee cancels, the first athlete on the
        waitlist is automatically promoted to an 'attending' spot in a single transaction.
        """
        # Set up a fully filled event with 3 active attendees and 2 waitlisted athletes
        athlete_4_id = uuid.UUID("00000000-0000-0000-0000-000000000004")
        athlete_5_id = uuid.UUID("00000000-0000-0000-0000-000000000005")
        
        MockDB.gym_events[self.event_id] = {
            "title": "Olympic Weightlifting: Clean & Jerk Overhead Mechanics",
            "max_capacity": 3,
            "attendees": [self.healthy_athlete_id_1, self.healthy_athlete_id_2, self.healthy_athlete_id_3],
            "waitlist": [
                {"user_id": athlete_4_id, "created_at": datetime.now()}, # First in waitlist (FIFO Front)
                {"user_id": athlete_5_id, "created_at": datetime.now()}  # Second in waitlist
            ]
        }
        
        # Healthy Athlete 1 cancels their RSVP (releasing an active spot)
        response = self.client.delete(f"/api/v1/events/{self.event_id}/rsvp?user_id={self.healthy_athlete_id_1}")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("Active RSVP cancelled successfully", data["message"])
        
        # Verify FIFO auto-promotion has occurred:
        # 1. Athlete 4 should be promoted from the waitlist to the attendees array
        # 2. Athlete 1 should be completely removed
        # 3. Athlete 5 should remain on the waitlist (and move to the front)
        event = MockDB.gym_events[self.event_id]
        self.assertNotIn(self.healthy_athlete_id_1, event["attendees"])
        self.assertIn(athlete_4_id, event["attendees"])
        self.assertNotIn(athlete_4_id, [item["user_id"] for item in event["waitlist"]])
        
        # Confirm details of the promoted user returned to caller for notification routing
        self.assertEqual(data["promoted_user_id"], str(athlete_4_id))
        self.assertEqual(data["promoted_user_email"], "promoted.athlete@smallgoodsgym.com.au")
        
        # Verify Athlete 5 is now at the front of the queue
        self.assertEqual(len(event["waitlist"]), 1)
        self.assertEqual(event["waitlist"][0]["user_id"], athlete_5_id)

    def test_direct_waitlist_retraction(self):
        """
        TEST 7: Direct Waitlist Cancellation
        Asserts that if a waitlisted athlete cancels, they are simply removed from
        the waitlist queue and no active attendee is affected or promoted.
        """
        athlete_4_id = uuid.uuid4()
        MockDB.gym_events[self.event_id]["waitlist"].append({"user_id": athlete_4_id, "created_at": datetime.now()})
        
        # Waitlisted athlete cancels their RSVP
        response = self.client.delete(f"/api/v1/events/{self.event_id}/rsvp?user_id={athlete_4_id}")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["message"], "Waitlist queue position retracted successfully.")
        self.assertIsNone(data["promoted_user_id"])
        
        # Verify they are no longer in the waitlist
        waitlist_ids = [item["user_id"] for item in MockDB.gym_events[self.event_id]["waitlist"]]
        self.assertNotIn(athlete_4_id, waitlist_ids)

if __name__ == "__main__":
    unittest.main()
