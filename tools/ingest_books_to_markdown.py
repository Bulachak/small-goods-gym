"""
Soviet Sports Science PDF to Clean Markdown Ingestion Pipeline
Converts 10 foundational volumes into structured Markdown with breadcrumbs.
"""
import os
import re
import sys
import glob
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

BOOKS_DIR = os.path.abspath("c:/Users/kamil/PROJECTS/small-goods-gym/docs/books")
OUTPUT_DIR = os.path.abspath("c:/Users/kamil/PROJECTS/small-goods-gym/docs/markdown_books")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BOOK_METADATA = {
    "Bondarchuk_Osnovy_Silovoy_Podgotovki.pdf": {
        "title": "Основы силовой подготовки в спорте",
        "title_en": "Foundations of Strength Training in Sports",
        "author": "Анатолий Павлович Бондарчук",
        "author_en": "Anatoliy Bondarchuk",
        "year": 1986,
        "language": "ru",
        "tags": ["transfer_of_training", "exercise_classification", "adaptation_rhythms"]
    },
    "Chernyak_Metodika_Planirovaniya_Trenirovki_Tyazheloatleta.pdf": {
        "title": "Методика планирования тренировки тяжелоатлета",
        "title_en": "Methods of Planning Weightlifting Training",
        "author": "А. В. Черняк",
        "author_en": "A. V. Chernyak",
        "year": 1978,
        "language": "ru",
        "tags": ["weightlifting_volume", "loading_zones", "kpsh", "snatch_clean_programming"]
    },
    "THE_END_OF_PERIODIZATION_VERKHOSHANSKY.pdf": {
        "title": "The End of 'Periodization' in the Training of High Performance Sport",
        "title_en": "The End of Periodization",
        "author": "Юрий Витальевич Верхошанский",
        "author_en": "Yuri Verkhoshansky",
        "year": 1999,
        "language": "en",
        "tags": ["block_periodization", "conjugate_sequence", "matveyev_critique", "ldte"]
    },
    "Verkhoshansky_Osnovy_Spetsialnoy_Silovoy_Podgotovki.pdf": {
        "title": "Основы специальной силовой подготовки в спорте",
        "title_en": "Fundamentals of Special Strength Training in Sport",
        "author": "Юрий Витальевич Верхошанский",
        "author_en": "Yuri Verkhoshansky",
        "year": 1977,
        "language": "ru",
        "tags": ["special_strength_training", "dynamic_correspondence", "shock_method"]
    },
    "Verkhoshansky_Programmirovanie_i_Organizatsiya.pdf": {
        "title": "Программирование и организация тренировочного процесса",
        "title_en": "Programming and Organization of Training",
        "author": "Юрий Витальевич Верхошанский",
        "author_en": "Yuri Verkhoshansky",
        "year": 1985,
        "language": "ru",
        "tags": ["concentrated_loading", "ldte", "conjugate_sequence_system"]
    },
    "Verkhoshansky_Yessis_Special_Strength_Training_Manual.pdf": {
        "title": "Special Strength Training: A Practical Manual for Coaches",
        "title_en": "Special Strength Training Manual",
        "author": "Yuri Verkhoshansky & Michael Yessis",
        "author_en": "Yuri Verkhoshansky & Michael Yessis",
        "year": 2006,
        "language": "en",
        "tags": ["depth_jumps", "shock_method", "practical_plyometrics", "rfd"]
    },
    "Zatsiorsky_Ergonomicheskaya_Biomekhanika.pdf": {
        "title": "Эргономическая биомеханика",
        "title_en": "Ergonomic Biomechanics",
        "author": "А. С. Аруин, В. М. Зациорский",
        "author_en": "A. S. Aruin, V. M. Zatsiorsky",
        "year": 1989,
        "language": "ru",
        "tags": ["biomechanics", "joint_torques", "spinal_loading", "moment_arms"]
    },
    "Zatsiorsky_Fizicheskie_Kachestva_Sportsmena.pdf": {
        "title": "Физические качества спортсмена: основы теории и методики воспитания",
        "title_en": "Physical Qualities of an Athlete",
        "author": "Владимир Михайлович Зациорский",
        "author_en": "Vladimir Zatsiorsky",
        "year": 1966,
        "language": "ru",
        "tags": ["me_re_de_methods", "strength_speed_endurance", "explosive_strength_deficit"]
    },
    "Zatsiorsky_Nauka_i_Praktika_Silovogo_Treninga.pdf": {
        "title": "Наука и практика силового тренинга",
        "title_en": "Science and Practice of Strength Training (Russian Translation)",
        "author": "Владимир Михайлович Зациорский",
        "author_en": "Vladimir Zatsiorsky",
        "year": 1995,
        "language": "ru",
        "tags": ["three_strength_methods", "periodization", "injury_prevention"]
    },
    "Zatsiorsky_Osnovy_Sportivnoy_Metrologii_1979.pdf": {
        "title": "Основы спортивной метрологии",
        "title_en": "Fundamentals of Sports Metrology",
        "author": "Владимир Михайлович Зациорский",
        "author_en": "Vladimir Zatsiorsky",
        "year": 1979,
        "language": "ru",
        "tags": ["metrology", "measurement_validity", "reliability", "dynamometry_kinematics"]
    }
}


def clean_page_text(text: str) -> str:
    """Clean OCR artifacts, word-split hyphens, and repetitive whitespace."""
    if not text:
        return ""
    # Remove hyphenated linebreaks: e.g. "трениро-\nвочного" -> "тренировочного"
    text = re.sub(r'(\w+)-\n\s*(\w+)', r'\1\2', text)
    # Replace non-breaking spaces with standard spaces
    text = text.replace('\xa0', ' ')
    # Normalize multiple line breaks to max 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove stand-alone single characters per line (common OCR noise)
    lines = [line.strip() for line in text.split('\n')]
    clean_lines = []
    for line in lines:
        if len(line) == 1 and not line.isdigit() and line not in ["I", "V", "X"]:
            continue
        clean_lines.append(line)
    return '\n'.join(clean_lines)


def process_all_books():
    print(f"Starting Soviet Sports Science Ingestion Pipeline...")
    print(f"Source: {BOOKS_DIR}")
    print(f"Output: {OUTPUT_DIR}")

    total_books = 0
    total_pages_ingested = 0
    total_chars_written = 0

    for pdf_filename, meta in BOOK_METADATA.items():
        pdf_path = os.path.join(BOOKS_DIR, pdf_filename)
        if not os.path.exists(pdf_path):
            print(f"⚠️ Warning: File {pdf_filename} not found, skipping.")
            continue

        base_name = os.path.splitext(pdf_filename)[0]
        md_filename = f"{base_name}.md"
        md_path = os.path.join(OUTPUT_DIR, md_filename)

        print(f"\n📖 Processing: {meta['title']} ({meta['author']})...")
        reader = PdfReader(pdf_path)
        num_pages = len(reader.pages)

        with open(md_path, "w", encoding="utf-8") as f:
            # Frontmatter header
            f.write(f"# {meta['title']}\n")
            f.write(f"**English Title:** {meta['title_en']}  \n")
            f.write(f"**Author:** {meta['author']} ({meta['author_en']})  \n")
            f.write(f"**Year:** {meta['year']} | **Language:** {meta['language'].upper()}  \n")
            f.write(f"**Tags:** {', '.join(meta['tags'])}  \n")
            f.write(f"**Source Document:** `{pdf_filename}` ({num_pages} pages)  \n\n")
            f.write("---\n\n")

            book_chars = 0
            pages_written = 0

            for p_idx, page in enumerate(reader.pages):
                raw_text = page.extract_text() or ""
                clean_text = clean_page_text(raw_text)

                # Skip pages with near zero text (blank pages, pure bitmap scans)
                if len(clean_text.strip()) < 40:
                    continue

                f.write(f"## [PAGE {p_idx + 1}]\n\n")
                f.write(clean_text)
                f.write("\n\n")

                book_chars += len(clean_text)
                pages_written += 1

        print(f"   ✅ Saved to: {md_filename} ({pages_written}/{num_pages} pages, {book_chars:,} chars)")
        total_books += 1
        total_pages_ingested += pages_written
        total_chars_written += book_chars

    print(f"\n==========================================")
    print(f"🎉 INGESTION PIPELINE COMPLETE!")
    print(f"Total Books Processed: {total_books}")
    print(f"Total Pages Written:   {total_pages_ingested}")
    print(f"Total Chars Extracted: {total_chars_written:,}")
    print(f"==========================================")


if __name__ == "__main__":
    process_all_books()
