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
  ALL_TOPICS,
  filterVocabulary,
  PAGE_SIZES,
  sortLektions,
  sortVocabulary,
} from './lib/vocabulary';
import {
  LEKTIONS_SELECT,
  supabase,
  WORDS_SELECT,
} from './supabase/supabaseClient';

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

  // `lektions` is small and mostly-static — fetched once for the Topic filter.
  const [lektions, setLektions] = useState([]);

  useEffect(() => {
    const fetchLektions = async () => {
      const { data, error } = await supabase
        .from('lektions')
        .select(LEKTIONS_SELECT);
      if (error) {
        console.error('Error fetching lektions:', error);
      } else {
        setLektions(sortLektions(data || []));
      }
    };
    fetchLektions();
  }, []);

  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(ALL_LEVELS);
  const [topicId, setTopicId] = useState(ALL_TOPICS);
  const [pos, setPos] = useState(ALL_POS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const tableRef = useRef(null);

  const lektionsById = useMemo(
    () => new Map(lektions.map((lektion) => [lektion.id, lektion])),
    [lektions],
  );

  // Search + filters first; pagination only slices the filtered list.
  const entries = useMemo(
    () => filterVocabulary(vocabulary, { level, topicId, pos, query }),
    [vocabulary, level, topicId, pos, query],
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
    // Topic implies exactly one level — an invalid combination is reset rather
    // than left stale (Level → Topic cascade is one-way; see CLAUDE.md).
    if (topicId !== ALL_TOPICS) {
      const selectedTopic = lektionsById.get(topicId);
      if (!selectedTopic || selectedTopic.level !== value) {
        setTopicId(ALL_TOPICS);
      }
    }
    setPage(1);
  };
  const changeTopic = (value) => {
    setTopicId(value === ALL_TOPICS ? ALL_TOPICS : Number(value));
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
    setTopicId(ALL_TOPICS);
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
        topicId={topicId}
        onTopicChange={changeTopic}
        lektions={lektions}
        pos={pos}
        onPosChange={changePos}
        onReset={resetAll}
        canReset={
          query !== '' ||
          level !== ALL_LEVELS ||
          topicId !== ALL_TOPICS ||
          pos !== ALL_POS
        }
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
