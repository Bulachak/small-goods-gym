# Small Goods Gym: Google Sheets Standardization & Template Guide

To migrate historical workout data from Google Sheets into the new **Small Goods Gym PWA App**, the coaches (Joel & Holly) must organize current active sheets to fit a standardized template structure. 

This guide outlines the exact column headers, formatting rules, and copy-pasteable layout needed to execute the migration seamlessly.

---

## 1. Athlete Roster Template (`athlete_roster.csv`)
This sheet establishes baseline accounts and links them to Javier's user accounts. It also captures the baseline anthropometric ratios necessary for Phase 2's leverage-based setup coaching.

### Columns Guide:
| Column Header | Data Type / Format | Example Value | Description / Constraint |
| :--- | :--- | :--- | :--- |
| `email` | String / Valid Email | `joel.mullen@smallgoodsgym.com.au` | **Must** match the user email registered in Javier’s auth backend. |
| `first_name` | String | `Joel` | Athlete's first name. |
| `last_name` | String | `Mullen` | Athlete's last name. |
| `height_cm` | Decimal (cm) | `180.5` | Standing barefoot height. |
| `femur_length_cm` | Decimal (cm) | `48.0` | Greater trochanter to lateral condyle measurement. |
| `torso_length_cm` | Decimal (cm) | `61.0` | Lateral condyle to C7 vertebra vertical measurement. |
| `arm_span_cm` | Decimal (cm) | `185.0` | Fingertip-to-fingertip arm span width. |

### Empty Row Template (Copy & Paste):
```csv
email,first_name,last_name,height_cm,femur_length_cm,torso_length_cm,arm_span_cm
```

---

## 2. Master Exercise Video Library Template (`exercise_library.csv`)
Ensures every movement programmed has an interactive instruction block on the athlete's screen.

### Columns Guide:
| Column Header | Data Type / Format | Example Value | Description / Constraint |
| :--- | :--- | :--- | :--- |
| `exercise_name` | String (Unique) | `Back Squat` | The standard name. Avoid acronyms (use "Back Squat" instead of "HBBS"). |
| `video_url` | String / URL | `https://vimeo.com/smallgoods/back-squat` | Link to Vimeo/YouTube demo. Avoid private-restricted settings (use "Unlisted" or "Password-protected"). |
| `category` | Option Value | `Squat` | Must be one of: `Squat`, `Bench`, `Deadlift`, `Weightlifting`, `Accessory`. |
| `mechanical_tags` | Semicolon-Separated | `quad_dominant;knee_flexion;axial_loading` | Physical characteristics used by the AI engine. |

### Empty Row Template (Copy & Paste):
```csv
exercise_name,video_url,category,mechanical_tags
```

---

## 3. Athlete Training Log Template (`athlete_training_logs.csv`)
This is the sheet where coaches log active athlete blocks. These rows will build the database logs and compute initial Personal Bests (PBs).

### Columns Guide:
| Column Header | Format | Example | Coaching Formatting Rules (Postel's Law Compliant) |
| :--- | :--- | :--- | :--- |
| `athlete_email` | Valid Email | `holly.hunt@smallgoodsgym.com.au` | Must match the email in the Athlete Roster sheet. |
| `scheduled_date` | YYYY-MM-DD | `2026-09-01` | Date the athlete was scheduled to complete the set. |
| `exercise_name` | String | `Bench Press (Competition)`| Must match one of the active names in the Master Exercise Library. |
| `set_number` | Integer | `1` | Increment sequentially starting at 1. |
| `prescribed_reps` | Integer | `5` | The target reps prescribed in the training block. |
| `prescribed_weight` | Decimal | `75` | Target load. Units are parsed automatically (e.g., `75`, `75kg`, `75.0` are all okay). |
| `prescribed_rpe` | Decimal / Range | `8.0` | Target RPE. Single numbers or ranges are allowed (e.g., `8`, `8.0`, `7-8`). |
| `logged_reps` | Integer | `5` | Reps actually completed. Leave blank if not performed. |
| `logged_weight` | Decimal | `75` | Weight actually completed. Leave blank if not performed. |
| `logged_rpe` | Decimal | `8.0` | Athlete's subjective effort RPE (1.0 to 10.0). |
| `velocity_m_s` | Decimal | `0.38` | Average concentric velocity metric from VBT tether (Optional). |

### Empty Row Template (Copy & Paste):
```csv
athlete_email,scheduled_date,exercise_name,set_number,prescribed_reps,prescribed_weight,prescribed_rpe,logged_reps,logged_weight,logged_rpe,velocity_m_s
```

---

## 4. Top 5 Best Practices for Coaches during Standardization

1. **Be Strict on Email Formats:** All athlete emails must match across all spreadsheets. If a coach writes `joel@sg.com` on one sheet and `joel.mullen@smallgoodsgym.com.au` on another, the app cannot link the data and will ignore the unmatched records.
2. **Standardize Name Variations:** Clean up naming quirks before CSV export. Eliminate terms like `"Bench Press - final set focus"` or `"Bench Press with chains"`. Program them as separate exercises or write those custom notes in the coaching notes column.
3. **Handle RPE Ranges Consistent with Constraints:** Standardize target RPEs. If you write `"RPE 7.5-8"`, the migration script will extract the upper-boundary (`8.0`) to define standard database queries.
4. **Export as Standard CSV (UTF-8):** Save the Google Sheets files directly as **Comma-Separated Values (.csv)** rather than Excel files (.xlsx) or open formats.
5. **Mark Unscheduled Workouts as 'Completed':** If an athlete completes a workout on an off-day, log the date they *actually* performed it so the progression engines can accurately measure true recovery timelines.
