import { useEffect, useMemo, useState } from 'react';
import Filters from './components/Filters';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import VocabularyTable from './components/VocabularyTable';
import { useTheme } from './hooks/useTheme';
import { ALL_LEVELS, ALL_POS, filterVocabulary } from './lib/vocabulary';
import { supabase, WORDS_SELECT } from './supabase/supabaseClient';

function App({ appName = 'FunGerman', density = 'comfortable' }) {
  const { theme, toggleTheme } = useTheme();

  // Single data source: the Supabase `words` table.
  const [vocabulary, setVocabulary] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    const fetchVocabulary = async () => {
      const { data, error } = await supabase
        .from('words')
        .select(WORDS_SELECT)
        .order('id');
      if (error) {
        console.error('Error fetching vocabulary:', error);
        setStatus('error');
      } else {
        setVocabulary(data || []);
        setStatus('ready');
      }
    };
    fetchVocabulary();
  }, []);

  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(ALL_LEVELS);
  const [pos, setPos] = useState(ALL_POS);

  const entries = useMemo(
    () => filterVocabulary(vocabulary, { level, pos, query }),
    [vocabulary, level, pos, query],
  );

  const resetAll = () => {
    setQuery('');
    setLevel(ALL_LEVELS);
    setPos(ALL_POS);
  };

  return (
    <main className="mx-auto flex max-w-[1180px] flex-col gap-[18px] px-[18px] pt-5 pb-7 md:gap-[22px] md:px-10 md:pt-7 md:pb-10">
      <Header
        appName={appName}
        theme={theme}
        onToggleTheme={toggleTheme}
        count={entries.length}
        total={vocabulary.length}
      >
        <SearchBox value={query} onChange={setQuery} />
      </Header>

      <Filters
        level={level}
        onLevelChange={setLevel}
        pos={pos}
        onPosChange={setPos}
        onReset={resetAll}
        canReset={query !== '' || level !== ALL_LEVELS || pos !== ALL_POS}
      />

      <VocabularyTable
        entries={entries}
        compact={density === 'compact'}
        status={status}
      />
    </main>
  );
}

export default App;
