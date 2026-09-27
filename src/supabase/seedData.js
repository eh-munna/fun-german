import { mockVocabulary } from '../mockData';
import { supabase } from './supabaseClient';

// Mock entries → table rows: lowercase column names, and no `id` so the
// database assigns its own.
const toRow = ({ id: _id, ...entry }) =>
  Object.fromEntries(Object.entries(entry).map(([key, value]) => [key.toLowerCase(), value]));

// One-time seed: inserts the mock vocabulary only if `words` is empty.
// Safe to call repeatedly. Temporary; remove once the table is populated.
//
// The table's RLS policy allows public reads only, so this insert is rejected
// with the browser's anon key (42501). Prefer running supabase/seed.sql in the
// SQL Editor. To use this instead, temporarily add an insert policy for `anon`,
// call seedData(), then drop the policy.
export async function seedData() {
  const { count, error: countError } = await supabase
    .from('words')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    console.error('Seed: could not check the words table:', countError);
    return;
  }
  if (count > 0) {
    console.info(`Seed: words table already has ${count} rows, skipping.`);
    return;
  }

  const { error } = await supabase.from('words').insert(mockVocabulary.map(toRow));
  if (error) console.error('Seed: insert failed:', error);
  else console.info(`Seed: inserted ${mockVocabulary.length} words.`);
}
