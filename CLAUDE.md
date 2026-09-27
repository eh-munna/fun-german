# FunGerman — German Learning Platform

## What it is

FunGerman is a **German learning platform** built around vocabulary structured by chapter (Lektion) and level. A1, A2, and B1 currently; B2/C1 planned for later.

**Phase 1 (Current):** Searchable, filterable vocabulary reference table — browsable by level, chapter, and part of speech.

**Future phases:** Flashcard review, grammar exercises, quizzes, level-specific practice, admin panel.

---

## Tech stack

- Frontend: React + Vite
- Database: Supabase (Postgres)
- Hosting: Vercel (auto-deploy from GitHub `main`)
- No custom backend — React talks to Supabase directly
- Domain: fungerman.de (Squarespace registrar, DNS → Vercel)

---

## Secrets & Security

- `.env.local` holds all secrets — never commit it to git
- `.gitignore` must include `.env.local`
- Never hardcode Supabase URL or keys in source files
- Raw data-export files (CSV dumps, seed scripts with textbook content) must never be committed — keep them in ephemeral exports or separate private backups
- Deployment secrets go in Vercel dashboard under project settings only

**Environment variables used:**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Current feature scope (Phase 1)

- Browse/search/filter vocabulary — no add/delete from the UI
- Search: strips `·` before comparing (an·sehen matches "ansehen")
- Filters: Level (All/A1/A2/B1/B2/C1) + Part of Speech (All/Nomen/Verb/Adjektiv/Adverb/Konjunktion/Präposition/Phrase) — both default options are the English word "All" (`ALL_LEVELS` and `ALL_POS` constants in code); individual POS options use German labels
- Filters + search combine with AND logic
- Word count: shows filtered results only, not total
- Pagination: 25/50/75/100 per page; applies after filters; resets to page 1 on any filter change
- Responsive: pill-buttons at 768px+, dropdowns below 768px
- Empty state: "Keine Treffer. / No vocabulary found."
- Reset Filters: clears all filters and the search box at once
- Sort order: level → `lektion_id` → position (textbook chapter order, NOT alphabetical)

---

## Database schema

### Table: `words`

| DB column    | App field   | Type          | Notes                                                                                                 |
| ------------ | ----------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| `id`         | `id`        | BIGINT PK     | auto-generated                                                                                        |
| `word`       | `word`      | TEXT NOT NULL | may contain `·` for separable verbs (e.g. an·sehen)                                                   |
| `pos`        | `pos`       | TEXT NOT NULL | Nomen/Verb/Adjektiv/Adverb/Konjunktion/Präposition/Pronomen/Präfix/Phrase                             |
| `level`      | `level`     | TEXT NOT NULL | A1/A2/B1/B2/C1                                                                                        |
| `article`    | `article`   | TEXT nullable | der/die/das — null for non-nouns, never blank string                                                  |
| `plural`     | `plural`    | TEXT nullable | full plural string, OR same as word if unchanged, OR null if no plural — never blank, never shorthand |
| `synonymde`  | `synonymDe` | TEXT nullable | German synonym only                                                                                   |
| `en`         | `en`        | TEXT NOT NULL | practical English meaning                                                                             |
| `synonymen`  | `synonymEn` | TEXT nullable | English synonym only                                                                                  |
| `ctxde`      | `ctxDe`     | TEXT NOT NULL | German example sentence (original, not from textbook)                                                 |
| `hl`         | `hl`        | TEXT NOT NULL | exact substring in ctxDe to highlight                                                                 |
| `lektion_id` | `lektionId` | BIGINT FK     | references `lektions.id` — nullable (null for standalone phrases)                                     |
| `position`   | `position`  | INTEGER       | word order within lektion, spaced by 10 (e.g. 10, 20, 30...)                                          |
| `created_at` | —           | TIMESTAMPTZ   | auto; NOT selected by the React app — not available in components                                     |

**`ctxEn` does not exist and must never be added.** German context sentences only — no English translations stored or displayed anywhere in the app.

DB columns are lowercase (Postgres default). Mapped to camelCase in the React app.

---

### Table: `lektions`

| Column       | Type             | Notes                                                     |
| ------------ | ---------------- | --------------------------------------------------------- |
| `id`         | BIGINT PK        | auto-generated                                            |
| `number`     | INTEGER NOT NULL | global sequential lektion number (1–42 across all levels) |
| `name`       | TEXT NOT NULL    | FunGerman original name — never the textbook title        |
| `level`      | TEXT NOT NULL    | A1/A2/B1/B2/C1                                            |
| `created_at` | TIMESTAMPTZ      | auto                                                      |

**Relationship:** `words.lektion_id → lektions.id`

**Sort note:** The app sorts by `lektion_id` (the FK integer), not by `lektions.number`. Currently all 42 rows have `id === number`, so the sort is correct. If a lektion is ever deleted and re-created, or inserted out of order, the two can diverge and the sort breaks silently. Always ensure `id === number` on insert, or fetch `number` through the join and sort on that instead.

---

## Word insertion order rules

**Sort order in app:** level → `lektion_id` → position (textbook chapter order)

**Never sort alphabetically within a lektion** — this is a chapter-based learning app, not a dictionary.

### Position field rules

- Positions are spaced by 10 (10, 20, 30, 40...)
- To insert a word between position 30 and 40, use position 35
- This allows unlimited future insertions between any two words without renumbering
- When inserting a new word in the middle of a lektion, assign a position between its neighbours

### Batch insertion rules

- Every word in a batch must have `lektion_id` and `position` pre-filled before inserting
- Words must be inserted in textbook chapter order within each batch
- `id` order alone is NOT reliable for sort order — always use `lektion_id + position`
- Single words added later: manually set `lektion_id` and `position` to slot them correctly

### Adding a word mid-lektion example

Word `die Nachbarin` should appear after `der Nachbar` (position 30):

```sql
UPDATE words SET lektion_id = X, position = 35 WHERE word = 'die Nachbarin';
```

---

## Content rules

### English meanings

- Practical, commonly-used equivalents — not literal or cognate translations
- _bekommen_ → "get" (not "receive"), _benötigen_ → "need" (not "require")
- Prefer plain words over complex synonyms

### Synonyms

- German synonyms → `synonymDe` only
- English synonyms → `synonymEn` only
- Never mix languages in the same field

### Plural notation

- Store full plural string, same-as-word if unchanged, or null if no plural
- Never store blank, never store textbook shorthand (e.g. `-e`)
- Display format: `"der Umzug, -Umzüge"` (dash + full plural spelled out)

### Context sentences (`ctxDe`)

- Must be **original sentences** — not copied or paraphrased from the textbook
- German only — no English translation stored or displayed
- Use FunGerman character names (see Legal section below)
- Highlight the inflected word using the `hl` field
- For separable verbs: capture both parts in hl (e.g. `"sehe ... an"`)

### Separable verbs

- Store and display with `·` (an·sehen)
- Strip `·` before search comparison
- Highlight both separated parts in the context sentence

### Multiple meanings per word

When a word has distinct meanings, create separate rows — one per meaning, each with its own context sentence. Rows are grouped by word name in the table display.

---

## Legal protection rules

### Character name replacements

Apply ALL replacements before generating any SQL insert. Original textbook names must never appear in the database or UI.

| Textbook name                      | FunGerman name            |
| ---------------------------------- | ------------------------- |
| Tim / Tim Wilson                   | Müller / Müller Kleinmann |
| Lara / Lara Nowak                  | Annet / Annet Merz        |
| Walter Baumann                     | John Rüdiger              |
| Sofia Baumann                      | Alina Rüdiger             |
| Herr Diaz                          | Herr Tom                  |
| Lili                               | Magdalena                 |
| Familie Baumann                    | Familie Rüdiger           |
| Jan                                | Daniel                    |
| Stefan (Anna's Onkel)              | Klaus                     |
| Anna                               | Petra                     |
| Daniela (Tante)                    | Sabine                    |
| Maria (Cousine)                    | Julia                     |
| Luca (Neffe)                       | Felix                     |
| Esther (Nichte)                    | Lena                      |
| Hristo Radev                       | Marko Ivanov              |
| Luisa, Teresa, Patricia (WG-mates) | Nora, Carla, Bettina      |
| Frau Wasilewski                    | Frau Berger               |
| Frau Sicinski                      | Frau Hoffmann             |
| Ella                               | Mia                       |
| Erik                               | Jonas                     |
| Joachim Vogt                       | Bernd Lorenz              |
| Dimi                               | Timo                      |
| Mayla                              | Sara                      |

More names will be added. Always check this table is up to date before processing any new data batch.

**New names/places not in this table:** Replace with a common German name/place clearly not tied to this textbook. Pick consistently for that character/place throughout the extraction.

### What is and isn't protected

- Individual German words + their meanings = facts, not protected, safe to use
- Textbook example sentences = protected, must be fully rewritten (not paraphrased)
- Lektion titles = protected, replaced with FunGerman originals (see chapter list below)
- Character names = protected, replaced per table above

---

## Design language

### Palette

- Light: bg `#EEF1F6`, surface `#FFFFFF`, text `#1D2B3A`, muted `#5B6B7F`, accent `#2B5876`, border `#D7DEE7`
- Dark: bg `#141A22`, surface `#1C2530`, text `#EEF2F7`, muted `#9AABBF`, accent `#7FB2D6`, border `#2E3947`

### Typography

- Source Serif 4 — German words and headings (dictionary feel)
- Inter — UI chrome and English text

### Layout order

Logo (top-left) → word count + search box → Level/POS filters → Reset Filters → vocabulary table → pagination

### Principles

- Clean, reference-like aesthetic — dictionary feel
- No generic AI-app defaults (warm-cream+terracotta palettes, all-caps headers, unnecessary shadows)
- Responsive: desktop-first, mobile optimized

---

## Lektion chapter names (all 42)

**CRITICAL:** Only FunGerman names go into the database and UI. Textbook titles are reference only — never stored, never displayed.

### A1 (Lektions 1–14)

| #   | FunGerman name             |
| --- | -------------------------- |
| 1   | Begrüßung und Vorstellung  |
| 2   | Familie und Befinden       |
| 3   | Einkaufen und Lebensmittel |
| 4   | Wohnen und Einrichten      |
| 5   | Tagesablauf und Uhrzeit    |
| 6   | Freizeit und Wetter        |
| 7   | Schule und Fähigkeiten     |
| 8   | Beruf und Erfahrung        |
| 9   | Behörden und Alltag        |
| 10  | Gesundheit und Körper      |
| 11  | Unterwegs in der Stadt     |
| 12  | Termine und Service        |
| 13  | Kleidung und Vorlieben     |
| 14  | Feste und Termine          |

### A2 (Lektions 15–28)

| #   | FunGerman name                |
| --- | ----------------------------- |
| 15  | Ankommen und Einleben         |
| 16  | Zuhause und Nachbarschaft     |
| 17  | Essen und Tischkultur         |
| 18  | Arbeit und Berufsleben        |
| 19  | Sport und Wohlbefinden        |
| 20  | Ausbildung und Bildung        |
| 21  | Feste und Schenken            |
| 22  | Freizeit und Wochenende       |
| 23  | Dinge und Besitz              |
| 24  | Kommunikation und Medien      |
| 25  | Unterwegs und Orientierung    |
| 26  | Reisen und Urlaub             |
| 27  | Finanzen und Dienstleistungen |
| 28  | Lebenswege und Erinnerungen   |

### B1 (Lektions 29–42)

| #   | FunGerman name                |
| --- | ----------------------------- |
| 29  | Glück und Alltag              |
| 30  | Unterhaltung und Medien       |
| 31  | Gesundheit und Wohlbefinden   |
| 32  | Sprachen und Kommunikation    |
| 33  | Jobsuche und Bewerbung        |
| 34  | Dienstleistungen im Alltag    |
| 35  | Wohnen und Nachbarschaft      |
| 36  | Kollegen und Arbeitsalltag    |
| 37  | Digitale Welt und Technik     |
| 38  | Konsum und Werbung            |
| 39  | Miteinander und Umgangsformen |
| 40  | Engagement und Gesellschaft   |
| 41  | Politik und Geschichte        |
| 42  | Heimat und Identität          |

---

## Future features (planned, not yet built — do not scaffold ahead of being asked)

### Phase 2: Flashcard mode

- Spaced repetition review
- Flip cards (German → English)
- Mark as known/review
- Progress tracking per level and lektion

### Phase 3: Grammar exercises

- Exercises tied to vocabulary (conjugation, case agreement)
- Level-specific grammar rules
- Interactive practice

### Phase 4: Quizzes

- Multiple choice, fill-in-the-blank, matching
- Performance tracking
- Difficulty levels within each level

### Phase 5: Admin panel

- Protected `/admin` route (Supabase Auth, email/password)
- Add/edit words with full form (all columns including lektion picker and position)
- Manage lektions table
- Second RLS policy: authenticated users can INSERT/UPDATE/DELETE

### Expansion

- B2, C1 vocabulary levels
- Custom word lists
- User accounts and progress tracking

---

## How to work with me

- Be direct and specific — flag problems plainly, don't soften feedback
- When something's wrong, say exactly what's broken, why, and how to fix it
- Prefer concrete, actionable steps over general advice
- Never silently change agreed decisions (data model, design tokens, column names, sort rules, lektion names) — flag it and explain why before making any change
- Don't scaffold future phases unless explicitly asked
