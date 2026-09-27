# FunGerman — Project Context for Claude Code

## What this is

FunGerman is a German learning platform. Phase 1 (current): a searchable,
filterable vocabulary reference table built from textbook word lists
(A1, A2, B1 so far; B2/C1 planned). Future phases: flashcards, grammar exercises, quizzes.

## Tech stack

- Frontend: React + Vite
- Database: Supabase (Postgres)
- Hosting: Vercel (auto-deploys from `main` on push)
- No custom backend — React talks to Supabase directly via `src/supabase/supabaseClient.js`

## File structure

- `src/App.jsx` — owns filter/search/pagination state, fetches words from Supabase on mount
- `src/components/Header.jsx` — logo + word count
- `src/components/SearchBox.jsx` — search input (strips `·` before comparing)
- `src/components/Filters.jsx` — Level + POS filters, Reset Filters button
- `src/components/VocabularyTable.jsx` — table rendering, plural formatting, context
  highlighting, empty state, pagination
- `src/supabase/supabaseClient.js` — Supabase client using env vars
- `.env.local` — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (NOT committed to git)

## Data model (Supabase `words` table)

Columns are lowercase in Supabase (Postgres folds unquoted identifiers), mapped to
camelCase in the React app.

| DB column   | App field   | Type           | Notes                                                                             |
| ----------- | ----------- | -------------- | --------------------------------------------------------------------------------- |
| `id`        | `id`        | bigint PK      | auto-generated                                                                    |
| `word`      | `word`      | text NOT NULL  | may contain `·` for separable verbs (e.g. `an·sehen`)                             |
| `pos`       | `pos`       | text NOT NULL  | German: Nomen/Verb/Adjektiv/Adverb/Konjunktion/Präposition/Pronomen/Präfix/Phrase |
| `level`     | `level`     | text NOT NULL  | A1/A2/B1/B2/C1                                                                    |
| `article`   | `article`   | text, nullable | der/die/das, or null for non-nouns (never blank string)                           |
| `plural`    | `plural`    | text, nullable | full plural string, OR same as word if unchanged, OR null if no plural            |
| `synonymde` | `synonymDe` | text, nullable | German synonym only — never mix languages in this field                           |
| `en`        | `en`        | text NOT NULL  | practical English meaning (see Content Rules)                                     |
| `synonymen` | `synonymEn` | text, nullable | English synonym only                                                              |
| `ctxde`     | `ctxDe`     | text NOT NULL  | German example sentence from textbook                                             |
| `hl`        | `hl`        | text NOT NULL  | exact substring in ctxDe to highlight                                             |

**No `ctxEn` field** — German context only, no English translation stored or displayed.
This was a deliberate decision; do not add it back without being asked.

### Multiple meanings per word

When a word has distinct meanings, create **separate rows** (one meaning + one context
pair each). The UI groups rows by word name automatically.

## Content rules

- **English meanings**: practical, commonly-used equivalents, not literal/cognate
  translations. E.g. _bekommen_ → "to get" (not "to receive"), _benötigen_ → "need"
  (not "require"). Prefer plain words.
- **Synonyms**: German synonyms → `synonymDe` only. English synonyms → `synonymEn` only.
  Never mixed in the same field.
- **Plural notation**: store the full plural string, or same-as-word if unchanged, or
  `null` if no plural exists — never a blank string, never textbook shorthand (e.g. `-e`).
  Display format is `"der Umzug, -Umzüge"` (dash + full plural spelled out).
- **Context sentences**: German only, sourced from the textbook. Highlight the inflected
  word via the `hl` field, capturing both parts of a separable verb where relevant
  (e.g. `hl: "sehe ... an"` for `an·sehen` in "Ich sehe mir den Film an.").
- **Separable verbs**: keep `·` in the stored/displayed word (`an·sehen`); strip it before
  search comparison (`an·sehen` must match a search for `ansehen`).

## App logic (already implemented — don't reinvent)

1. Search strips `·` from both the query and stored words before comparing.
2. Level filter + POS filter + search combine with AND logic.
3. The word count shown in the header reflects the **filtered** result count, not the
   full table.
4. Responsive: pill-button filters at 768px+ width, dropdown filters below that.
5. Empty state message: `"Keine Treffer. / No vocabulary found."`
6. "Reset Filters" clears search + both filters at once (global state reset).
7. Pagination (25/50/75/100 per page) applies **after** search/filter, and resets to
   page 1 whenever the search query or either filter changes.

## Design language — do not deviate without being asked

**Palette**

- Light: bg `#EEF1F6`, surface `#FFFFFF`, text `#1D2B3A`, muted `#5B6B7F`,
  accent `#2B5876`, border `#D7DEE7`
- Dark: bg `#141A22`, surface `#1C2530`, text `#EEF2F7`, muted `#9AABBF`,
  accent `#7FB2D6`, border `#2E3947`

**Typography**

- Source Serif 4 — German words and headings (dictionary feel)
- Inter — UI chrome and English text

**Layout order**: Logo (top-left) → word count + search box → Level/POS filters →
Reset Filters → vocabulary table

**Principles**: clean, reference-like/dictionary aesthetic. Avoid generic AI-app
defaults (warm-cream+terracotta palettes, all-caps headers, unnecessary drop shadows).

## Environment / secrets

- Supabase URL + anon key live in `.env.local` — **never commit this file**, never
  hardcode credentials directly into source files.
- `node_modules/`, `dist/`, and any local data-extraction folders (e.g. raw textbook
  exports) should stay out of git — check `.gitignore` before adding new data folders.

## How to work with me

- Be direct and specific — flag problems plainly, don't soften feedback.
- When something's broken, say exactly what's wrong, why, and how to fix it.
- Prefer concrete, actionable steps over general advice.
- Don't silently change agreed decisions (data model, design tokens, column names) —
  if a change seems necessary, flag it and explain why before making it.

## Roadmap (not yet built — don't scaffold ahead of being asked)

- Phase 2: flashcard review mode (spaced repetition, flip cards, progress tracking)
- Phase 3: grammar exercises tied to vocabulary
- Phase 4: quizzes (multiple choice, fill-in-the-blank, matching)
- Later: B2/C1 vocab levels, custom word lists, user accounts
