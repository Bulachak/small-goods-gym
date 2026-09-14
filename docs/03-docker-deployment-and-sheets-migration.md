I have generated and published two production infrastructure files to your Studio panel:
1. docker-compose.yml: A configuration that orchestrates a local PostgreSQL 15 container with a persistent data volume and the FastAPI service. It automatically configures the database credentials, sets up a secure network bridge between services, and ensures the API waits for the database to be completely healthy before starting.
2. Dockerfile: A lightweight Python 3.12 environment setup that installs the system dependencies required for PostgreSQL connectivity (libpq-dev, build-essential) and packages the FastAPI, SQLAlchemy, and Pydantic libraries.
You can place these files next to your vbt-integration-blueprint.py (renaming it to main.py) to spin up your entire local testing sandbox instantly using a single command:
docker compose up --build
Strategy & Roadmap: Migrating Historical Data from Google Sheets
Moving Small Goods Gym's historical records from scattered Google Sheets to our highly structured PostgreSQL database is a classic data integration challenge. Applying Postel’s Law (be liberal in what you accept) and the Single Responsibility Principle (SRP), we can execute this migration in three systematic phases to ensure zero data loss or corruption.
Phase A: Spreadsheet Standardization (The Pre-Migration Cleanup)
Before writing any code, Joel and Holly's active Google Sheets must be standardized to prevent the parser from failing on erratic data entries:
* Exercise Naming Alignment: Inconsistent names (e.g., "Back Squat", "Squat", "HBBS - High Bar Back Squat") must be mapped to a clean, canonical name from your new exercises table registry.
* Structuring the Block Templates: Create a dedicated "Template Sheet" in their Google Drive using a strict column layout:
* Week | Day | Exercise Name | Prescribed Sets | Prescribed Reps | Target RPE | Video URL
* Athlete Roster Sheet: Ensure all ~75 active members have a unique row with their email address (matching the user_id Javier's auth shell uses) along with their initial anthropometric measurements.
                  [ COOPERATIVE SPREADSHEET ETL FLOW ]


┌────────────────────────┐      CSV       ┌────────────────────────┐
│  Standardized Sheets   ├───────────────>│  Python Migration ETL  │
│  (Cleaned by Coaches)  │     Export     │ (Pandas & Alembic Seed)│
└────────────────────────┘                └───────────┬────────────┘
                                                      │
                                                      │ Validates & Resolves
                                                      ▼
┌────────────────────────┐  JWT Validation ┌────────────────────────┐
│ Javier's User Database ├───────────────>│  PostgreSQL Database   │
│  (Auth Schema Sync)    │                │ (Target Schema Loaded) │
└────────────────────────┘                └────────────────────────┘
Phase B: The Scripted ETL (Extract, Transform, Load)
We will build a localized Python script inside /workspace/scratch/ (utilized during Sprint 3) to process the CSV exports of those standardized sheets.
* Extraction: The script reads the CSV exports using Python’s pandas library.
* Transformation & Mapping:
* The User Resolver (Information Expert): The script queries Javier's authentication table by email to fetch the assigned UUIDs, mapping them directly to our athlete_profiles rows.
* The Exercise Matcher: It extracts unique names from the templates to seed the exercises table and handles missing videos by assigning a generic placeholder URL.
* Target Parsing: It transforms range values (e.g., "3-5 reps" or "7-8 RPE") into discrete, upper-boundary database records (logged_reps = 5) or saves them in text fields to preserve the coaches' intent without throwing DB constraint errors.
* Loading: Database writes are wrapped inside robust SQL transactions. If any row fails validation (e.g., a missing exercise), the entire block rolls back to prevent half-migrated "ghost data."
Phase C: Validation & Go-Live
1. Parallel Verification Period: For the first training block in February, Joel and Holly will run the app alongside their legacy Google Sheets for one week. This live verification tests our logging latency and database write integrity.
2. Read-Only Lock: Once verified, the legacy Google Sheets are marked "Read-Only" with a link redirecting athletes and coaches to download the new Small Goods Gym PWA.
📅 What is your preferred timeline for starting this Google Sheets cleanup with Joel and Holly, or would you like to design a Python migration script to simulate parsing a test CSV export?