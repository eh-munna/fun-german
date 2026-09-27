import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// The `words` table stores column names in lowercase (synonymde, ctxde, …).
// Alias them back to the camelCase keys the app uses.
export const WORDS_SELECT =
  'id, pos, level, article, word, plural, synonymDe:synonymde, en, synonymEn:synonymen, ctxDe:ctxde, hl, lektionId:lektion_id, position';
