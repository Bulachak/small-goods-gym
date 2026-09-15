"""
Semantic Chunking and Full-Text Search (FTS5) Indexing Pipeline
Builds an optimized, sub-2ms sports science knowledge store for Small Goods Gym.
"""
import os
import re
import sys
import glob
import json
import sqlite3

sys.stdout.reconfigure(encoding='utf-8')

MD_BOOKS_DIR = os.path.abspath("c:/Users/kamil/PROJECTS/small-goods-gym/docs/markdown_books")
DOCS_DIR = os.path.abspath("c:/Users/kamil/PROJECTS/small-goods-gym/docs")
DATA_OUT_DIR = os.path.abspath("c:/Users/kamil/PROJECTS/concierge-bot-engine/data")
os.makedirs(DATA_OUT_DIR, exist_ok=True)

DB_PATH = os.path.join(DATA_OUT_DIR, "sports_science_knowledge.sqlite")
JSON_PATH = os.path.join(DATA_OUT_DIR, "sports_science_chunks.json")

TARGET_CHUNK_SIZE = 1800  # characters (~350 words)
CHUNK_OVERLAP = 250


def init_database(db_path: str):
    if os.path.exists(db_path):
        os.remove(db_path)
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    # Metadata table
    cur.execute("""
    CREATE TABLE documents (
        id TEXT PRIMARY KEY,
        book_id TEXT,
        title TEXT,
        author TEXT,
        year INTEGER,
        page_num INTEGER,
        tags TEXT,
        language TEXT,
        content TEXT
    )
    """)
    # FTS5 virtual table with BM25 ranking support
    cur.execute("""
    CREATE VIRTUAL TABLE sports_science_fts USING fts5(
        id UNINDEXED,
        title,
        author,
        tags,
        content,
        tokenize='unicode61 remove_diacritics 2'
    )
    """)
    con.commit()
    return con


def chunk_text(text: str, target_size: int = 1800, overlap: int = 250):
    """Split text into semantic paragraphs and combine into chunks with overlap."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current_chunk = []
    current_len = 0

    for p in paragraphs:
        if current_len + len(p) > target_size and current_chunk:
            combined = "\n\n".join(current_chunk)
            chunks.append(combined)
            # Retain tail paragraph for overlap if short enough
            if len(current_chunk[-1]) < overlap:
                current_chunk = [current_chunk[-1], p]
                current_len = len(current_chunk[0]) + len(p)
            else:
                current_chunk = [p]
                current_len = len(p)
        else:
            current_chunk.append(p)
            current_len += len(p)

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks


def process_and_index():
    print("=" * 60)
    print("🚀 Starting Semantic Chunking & FTS5 Indexing Pipeline")
    print(f"Destination SQLite: {DB_PATH}")
    print(f"Destination JSON:   {JSON_PATH}")
    print("=" * 60)

    con = init_database(DB_PATH)
    cur = con.cursor()

    all_chunks_record = []
    chunk_counter = 0

    # 1. Process 10 Soviet Sports Science Books
    md_files = glob.glob(os.path.join(MD_BOOKS_DIR, "*.md"))
    for md_file in sorted(md_files):
        filename = os.path.basename(md_file)
        book_id = os.path.splitext(filename)[0]

        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract metadata headers
        title_m = re.search(r"^# (.+)$", content, re.MULTILINE)
        title = title_m.group(1).strip() if title_m else book_id
        author_m = re.search(r"^\*\*Author:\*\* (.+)$", content, re.MULTILINE)
        author = author_m.group(1).strip() if author_m else "Unknown Author"
        year_m = re.search(r"^\*\*Year:\*\* (\d+)", content, re.MULTILINE)
        year = int(year_m.group(1)) if year_m else 1980
        tags_m = re.search(r"^\*\*Tags:\*\* (.+)$", content, re.MULTILINE)
        tags = tags_m.group(1).strip() if tags_m else ""
        lang_m = re.search(r"^\*\*Year:\*\* \d+ \| \*\*Language:\*\* (\w+)", content, re.MULTILINE)
        lang = lang_m.group(1).lower() if lang_m else "ru"

        print(f"\n📚 Chunking: {title} ({author})...")

        # Split by page headers: ## [PAGE X]
        page_sections = re.split(r"## \[PAGE (\d+)\]", content)
        # page_sections[0] is preamble before page 1
        book_chunk_count = 0

        for i in range(1, len(page_sections), 2):
            page_num = int(page_sections[i])
            page_text = page_sections[i + 1].strip()
            if len(page_text) < 40:
                continue

            page_chunks = chunk_text(page_text, TARGET_CHUNK_SIZE, CHUNK_OVERLAP)
            for c_idx, raw_chunk in enumerate(page_chunks):
                chunk_counter += 1
                book_chunk_count += 1
                chunk_id = f"{book_id}_p{page_num}_c{c_idx + 1}"

                breadcrumb = f"[SOURCE: {title} ({year})] [AUTHOR: {author}] [PAGE: {page_num}] [TAGS: {tags}]\n\n"
                full_chunk_text = breadcrumb + raw_chunk

                # Insert into documents table
                cur.execute(
                    "INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (chunk_id, book_id, title, author, year, page_num, tags, lang, full_chunk_text)
                )
                # Insert into FTS5 table
                cur.execute(
                    "INSERT INTO sports_science_fts VALUES (?, ?, ?, ?, ?)",
                    (chunk_id, title, author, tags, full_chunk_text)
                )

                all_chunks_record.append({
                    "id": chunk_id,
                    "book_id": book_id,
                    "title": title,
                    "author": author,
                    "year": year,
                    "page_num": page_num,
                    "tags": tags,
                    "language": lang,
                    "content": full_chunk_text
                })

        print(f"   ✅ Indexed {book_chunk_count} chunks across pages")

    # 2. Process Core Project Dossiers
    extra_dossiers = [
        ("07-advanced-sports-science-and-vbt-reference-dossier.md", "Advanced Sports Science & VBT Reference Dossier", "Kamilla Gafurzianova & Antigravity", 2026, "vbt, cleather, periodization, issurin, bondarchuk"),
        ("08-knowledge-base-architecture-and-vector-eval.md", "Knowledge Base Architecture & Vector Evaluation", "Antigravity Architecture Team", 2026, "architecture, vector_db, lancedb, firestore, latency"),
        ("Sports_Science_Knowledge_Base_and_VBT_Research.md", "Sports Science Knowledge Base & VBT Research", "Joel Mullen Coaching Intake", 2026, "vbt, wl_analysis, my_jump_2, kinematics, plate_calibration"),
        ("Joel_Mila_Meeting_Debrief_and_Intake_2026-09-14.md", "Joel & Mila Intake Debrief & Action Plan", "Joel Mullen & Kamilla Gafurzianova", 2026, "small_goods_gym, road_to_mvp, joel_voice, holly_hunt")
    ]

    for filename, title, author, year, tags in extra_dossiers:
        dossier_path = os.path.join(DOCS_DIR, filename)
        if not os.path.exists(dossier_path):
            continue
        with open(dossier_path, "r", encoding="utf-8") as f:
            text = f.read()

        dossier_id = os.path.splitext(filename)[0]
        chunks = chunk_text(text, TARGET_CHUNK_SIZE, CHUNK_OVERLAP)
        print(f"\n📑 Chunking Dossier: {title}...")

        for c_idx, raw_chunk in enumerate(chunks):
            chunk_counter += 1
            chunk_id = f"dossier_{dossier_id}_c{c_idx + 1}"
            breadcrumb = f"[SOURCE: {title} ({year})] [AUTHOR: {author}] [TAGS: {tags}]\n\n"
            full_chunk_text = breadcrumb + raw_chunk

            cur.execute(
                "INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (chunk_id, dossier_id, title, author, year, 1, tags, "en", full_chunk_text)
            )
            cur.execute(
                "INSERT INTO sports_science_fts VALUES (?, ?, ?, ?, ?)",
                (chunk_id, title, author, tags, full_chunk_text)
            )

            all_chunks_record.append({
                "id": chunk_id,
                "book_id": dossier_id,
                "title": title,
                "author": author,
                "year": year,
                "page_num": 1,
                "tags": tags,
                "language": "en",
                "content": full_chunk_text
            })
        print(f"   ✅ Indexed {len(chunks)} chunks")

    con.commit()
    con.close()

    # Save JSON archive of all chunks
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_chunks_record, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("🏆 INDEXING COMPLETE!")
    print(f"Total Chunks Generated & Indexed: {chunk_counter:,}")
    print(f"SQLite FTS5 DB Size: {os.path.getsize(DB_PATH) / 1024 / 1024:.2f} MB")
    print(f"JSON Archive Size:    {os.path.getsize(JSON_PATH) / 1024 / 1024:.2f} MB")
    print("=" * 60)


if __name__ == "__main__":
    process_and_index()
