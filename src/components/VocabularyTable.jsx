import { formatPlural, splitHighlight } from '../lib/vocabulary';

// Shown in place of rows when there are none to show.
const EMPTY_MESSAGES = {
  loading: { de: 'Wird geladen…', en: 'Loading vocabulary.' },
  error: {
    de: 'Fehler beim Laden.',
    en: 'Could not load vocabulary. Please try again later.',
  },
  ready: { de: 'Keine Treffer.', en: 'No vocabulary found.' },
};

const GRID = 'lg:grid-cols-[130px_230px_220px_minmax(0,1fr)] lg:gap-6';

function Meta({ label, children, className = '' }) {
  return (
    <div
      className={`flex items-baseline gap-1.5 leading-[1.3] text-muted ${className}`}
    >
      <span className="text-[10px] font-semibold tracking-[0.06em] uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function Sentence({ text, hl }) {
  return splitHighlight(text, hl).map((segment, i) =>
    segment.highlight ? (
      <mark
        key={i}
        className="border-b-[1.5px] border-tint-strong bg-transparent font-semibold text-accent"
      >
        {segment.text}
      </mark>
    ) : (
      segment.text
    ),
  );
}

// Every optional field (article, plural, synonyms) renders nothing when null.
function VocabularyRow({ entry, compact }) {
  const plural = formatPlural(entry);
  const wordOnly = entry.word.replace(/^(der|die|das)\s+/, '');

  return (
    <div
      className={`grid grid-cols-1 gap-1.5 border-b border-line-soft px-4 hover:bg-hover lg:items-baseline lg:px-[22px] ${GRID} ${
        compact ? 'py-[9px]' : 'py-4'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="rounded bg-tint px-2 py-0.5 text-xs font-medium text-accent">
          {entry.pos}
        </span>
        <span className="text-[11px] font-semibold text-muted tabular-nums">
          {entry.level}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-[3px]">
        <div className="font-serif text-[21px] leading-[1.25]">
          {entry.article && (
            <span className="mr-1.5 text-[15px] text-muted italic">
              {entry.article}
            </span>
          )}
          <span className="font-medium tracking-[-0.005em]">
            {wordOnly}
            {plural && ','}
          </span>
          {plural && (
            <span className="block text-[15px] font-normal text-muted">
              {plural}
            </span>
          )}
        </div>
        {entry.synonymDe && (
          <Meta label="Syn." className="text-sm">
            <span className="font-serif text-[15px]">{entry.synonymDe}</span>
          </Meta>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-[3px]">
        <div className="text-sm leading-[1.45]">{entry.en}</div>
        {entry.synonymEn && (
          <Meta label="Syn." className="text-[13px]">
            <span>{entry.synonymEn}</span>
          </Meta>
        )}
      </div>

      <div className="min-w-0 font-serif text-base leading-[1.45] text-pretty">
        {entry.ctxDe && <Sentence text={entry.ctxDe} hl={entry.hl} />}
      </div>
    </div>
  );
}

// `footer` (the pagination controls) renders inside the card, below the rows.
function VocabularyTable({ entries, compact, status = 'ready', footer, ref }) {
  return (
    <div
      ref={ref}
      className="scroll-mt-4 overflow-hidden rounded-[10px] border border-line bg-surface"
    >
      <div
        className={`hidden border-b border-line px-[22px] py-3 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase lg:grid ${GRID}`}
      >
        <div>Part of speech</div>
        <div>German word</div>
        <div>English meaning</div>
        <div>Context sentence</div>
      </div>

      {entries.map((entry) => (
        <VocabularyRow key={entry.id} entry={entry} compact={compact} />
      ))}

      {entries.length === 0 && (
        <div
          role="status"
          className="flex flex-col items-center gap-1.5 px-4 py-14 text-center md:py-16"
        >
          <div className="font-serif text-[22px] leading-[1.25]">
            {EMPTY_MESSAGES[status].de}
          </div>
          <div className="text-sm text-muted">{EMPTY_MESSAGES[status].en}</div>
        </div>
      )}

      {footer}
    </div>
  );
}

export default VocabularyTable;
