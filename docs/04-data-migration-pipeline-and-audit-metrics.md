I have designed and published two essential migration components directly to your Studio panel:
1. simulate-sheets-migration.py: A robust Python ETL (Extract, Transform, Load) script that simulates parsing a messy CSV export of Small Goods Gym's training programs.
2. migration-audit-report.json: An audit file demonstrating the automatic categorizations, data cleaning steps, warnings, and error-handling routines from a test pipeline run.
Deep-Dive: How the Python Migration Script Works
This ETL pipeline demonstrates how we can systematically apply Postel’s Law of Robustness (be liberal in what you accept, conservative in what you send) and GRASP Information Expert patterns when cleaning historical data.
1. Robust Input Sanitization (Postel's Law)
Coaches naturally use flexible, messy notation in Google Sheets. The parser automatically cleans and standardizes these inputs on the fly to prevent database insert errors:
* Weight Filtering: Cleans strings like "140 kg", "75kg", or "220KG", stripping letters and units to yield clean floating-point weights (140.0, 75.0, 220.0).
* RPE Range Resolution: Standardizes compound entries like "7-8" or "9-9.5" by extracting the upper-boundary RPE.
* Canonical Exercises: Utilizes a standard dictionary mapping to resolve messy names (e.g., "High Bar Back Squat" and "HBBS" both map cleanly to the registry's UUID for "Back Squat").
2. Graceful Error & Integrity Resolution
To ensure a high level of internal software quality, the script cross-references every data row against Javier's authentication user base and your standardized exercises.
* Mismatched Users: If an email is malformed or missing (such as "invalid-email-format"), the script flags it as a failure in the audit trail without crashing the migration.
* Mismatched Exercises: If an exercise doesn't exist in the video library (such as "Unknown Movement X"), the row is logged and skipped, prompting the coaching team to assign a standard video guide first.
3. Structured Output Generation
The successful records are formatted into structured, transactional JSON payloads ready to be ingested directly by our FastAPI microservice. The structure bundles workout sessions with their granular set-by-set VBT velocities, preserving the exact data-model linkages required for the Phase 2 AI Assistant Engine.
Migration Summary Metrics (From the Test Run)
Here are the audit results from executing the pipeline against the simulated Google Sheet export:
Metric,Count,Pipeline Action / Outcome
Total Records Read,6,Read directly from the raw spreadsheet export.
Successfully Migrated,4,"Clean relational schemas generated, linked, and ready for insert."
Failed / Ignored Rows,2,"Blocked safely (1 invalid user email, 1 unresolvable movement)."
Warnings Handled,4,"Units stripped (e.g., 75kg \\(\rightarrow\\) 75.0) and RPE ranges resolved."
The generated data outputs are fully synchronized in your Studio panel. You can inspect migration-audit-report.json to view the comprehensive warning and error schema, and execute simulate-sheets-migration.py inside your local testing environment to begin migrating the coaches' real datasets.
📋 Would you like me to write a corresponding PostgreSQL migration script to seed the database with the structural tables we designed, or should we prepare the markdown template layout for the coaches to start standardizing their active Google Sheets?