import { useEffect, useMemo, useRef, useState } from 'react';
import Filters from './components/Filters';
import Header from './components/Header';
import Pagination from './components/Pagination';
import SearchBox from './components/SearchBox';
import VocabularyTable from './components/VocabularyTable';
import { useTheme } from './hooks/useTheme';
import {
  ALL_LEVELS,
  ALL_POS,
  filterVocabulary,
  PAGE_SIZES,
  sortVocabulary,
} from './lib/vocabulary';
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
        // Sort once here so display order never depends on insertion order.
        setVocabulary(sortVocabulary(data || []));
        setStatus('ready');
      }
    };
    fetchVocabulary();
  }, []);

  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(ALL_LEVELS);
  const [pos, setPos] = useState(ALL_POS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const tableRef = useRef(null);

  // Search + filters first; pagination only slices the filtered list.
  const entries = useMemo(
    () => filterVocabulary(vocabulary, { level, pos, query }),
    [vocabulary, level, pos, query],
  );

  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  // Clamp as a safety net (e.g. data reloads); filter changes already reset to 1.
  const currentPage = Math.min(page, pageCount);
  const pageEntries = useMemo(
    () =>
      entries.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [entries, currentPage, pageSize],
  );

  // Any change to search or filters starts over on page 1.
  const changeQuery = (value) => {
    setQuery(value);
    setPage(1);
  };
  const changeLevel = (value) => {
    setLevel(value);
    setPage(1);
  };
  const changePos = (value) => {
    setPos(value);
    setPage(1);
  };
  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  // Bring the top of the table back into view when paging from the footer.
  const changePage = (next) => {
    setPage(next);
    const top = tableRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) tableRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const resetAll = () => {
    setQuery('');
    setLevel(ALL_LEVELS);
    setPos(ALL_POS);
    setPage(1);
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
        <SearchBox value={query} onChange={changeQuery} />
      </Header>

      <Filters
        level={level}
        onLevelChange={changeLevel}
        pos={pos}
        onPosChange={changePos}
        onReset={resetAll}
        canReset={query !== '' || level !== ALL_LEVELS || pos !== ALL_POS}
      />

      <VocabularyTable
        ref={tableRef}
        entries={pageEntries}
        compact={density === 'compact'}
        status={status}
        footer={
          entries.length > pageSize && (
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={entries.length}
              onPageChange={changePage}
              onPageSizeChange={changePageSize}
            />
          )
        }
      />
    </main>
  );
}

export default App;
