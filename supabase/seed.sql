-- One-time seed: the A1 mock vocabulary from src/mockData.js.
-- Run in the Supabase SQL Editor. Does nothing if `words` already has rows.
insert into public.words (pos, level, article, word, plural, synonymde, en, synonymen, ctxde, hl)
select * from (values
  ('Verb', 'A1', null, 'an·sehen', null, null, 'to watch, look at', null, 'Ich sehe mir den Film an.', 'sehe ... an'),
  ('Verb', 'A1', null, 'ein·kaufen', null, null, 'to shop, go shopping', null, 'Am Samstag kaufe ich im Supermarkt ein.', 'kaufe ... ein'),
  ('Verb', 'A1', null, 'auf·stehen', null, null, 'to get up', null, 'Ich stehe jeden Tag um sieben Uhr auf.', 'stehe ... auf'),
  ('Verb', 'A1', null, 'bekommen', null, null, 'to get', 'to receive', 'Ich bekomme morgen ein Paket.', 'bekomme'),
  ('Nomen', 'A1', 'der', 'Umzug', 'Umzüge', null, 'move (to a new home)', null, 'Der Umzug war sehr anstrengend.', 'Umzug'),
  ('Nomen', 'A1', 'die', 'Wohnung', 'Wohnungen', null, 'apartment', 'flat', 'Unsere Wohnung hat drei Zimmer.', 'Wohnung'),
  ('Nomen', 'A1', 'das', 'Brötchen', 'Brötchen', 'Semmel', 'bread roll', null, 'Morgens esse ich ein Brötchen mit Käse.', 'Brötchen'),
  ('Nomen', 'A1', 'der', 'Schlüssel', 'Schlüssel', null, 'key', null, 'Ich finde meinen Schlüssel nicht.', 'Schlüssel'),
  ('Nomen', 'A1', 'das', 'Obst', null, null, 'fruit', null, 'Ich kaufe jeden Samstag frisches Obst.', 'Obst'),
  ('Adjektiv', 'A1', null, 'müde', null, null, 'tired', null, 'Nach der Arbeit bin ich immer müde.', 'müde'),
  ('Adverb', 'A1', null, 'gern', null, null, 'like to (do something)', 'gladly', 'Ich trinke gern Kaffee.', 'gern'),
  ('Konjunktion', 'A1', null, 'aber', null, null, 'but', null, 'Das Zimmer ist klein, aber gemütlich.', 'aber'),
  ('Präposition', 'A1', null, 'neben', null, null, 'next to', null, 'Die Bäckerei ist neben der Bank.', 'neben'),
  ('Phrase', 'A1', null, 'Wie geht''s?', null, 'Wie geht es dir?', 'How are you?', 'How''s it going?', 'Hallo Anna, wie geht''s?', 'wie geht''s')
) as v(pos, level, article, word, plural, synonymde, en, synonymen, ctxde, hl)
where not exists (select 1 from public.words);
