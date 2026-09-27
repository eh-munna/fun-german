import { ArrowCounterClockwise, CaretDown } from '@phosphor-icons/react';
import {
  ALL_LEVELS,
  ALL_TOPICS,
  LEVELS,
  PARTS_OF_SPEECH,
} from '../lib/vocabulary';

const PILL_STYLES = {
  // Segmented control inside a surface tray.
  segment: {
    tray: 'gap-0.5 rounded-lg border border-line bg-surface p-[3px]',
    base: 'h-7 rounded-md',
    active: 'border-accent',
    idle: 'border-transparent hover:bg-hover hover:text-text',
  },
  // Standalone rounded chips.
  chip: {
    tray: 'flex-wrap gap-1.5',
    base: 'h-[30px] rounded-full',
    active: 'border-accent',
    idle: 'border-line hover:border-muted hover:text-text',
  },
};

// Pills from the md breakpoint (768px) up, a native <select> below it.
function FilterGroup({ label, options, value, onChange, variant }) {
  const s = PILL_STYLES[variant];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[5px] md:flex-none md:flex-row md:items-center md:gap-2.5">
      <span className="text-xs font-medium text-muted">{label}</span>

      <div
        className={`hidden md:flex ${s.tray}`}
        role="group"
        aria-label={label}
      >
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={active}
              className={`cursor-pointer border px-3 text-[13px] ${s.base} ${
                active
                  ? `bg-tint font-semibold text-accent ${s.active}`
                  : `font-medium text-muted ${s.idle}`
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="relative flex items-center md:hidden">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface pr-9 pl-3 text-base font-medium text-text"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <CaretDown className="pointer-events-none absolute right-3 text-sm text-muted" />
      </div>
    </div>
  );
}

// Standard <select> at all breakpoints — up to 42 topics don't scale as pills.
// Options are lektions.name (FunGerman names only), grouped by level via
// <optgroup> when Level = "All"; scoped to the selected level otherwise.
function TopicFilter({ level, topicId, lektions, onChange }) {
  const options =
    level === ALL_LEVELS
      ? LEVELS.filter((l) => l !== ALL_LEVELS).map((l) => ({
          level: l,
          items: lektions.filter((lektion) => lektion.level === l),
        }))
      : null;
  const flatItems =
    options === null ? lektions.filter((lektion) => lektion.level === level) : null;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[5px] md:flex-none md:flex-row md:items-center md:gap-2.5">
      <span className="text-xs font-medium text-muted">Topic</span>
      <div className="relative flex items-center">
        <select
          value={topicId === ALL_TOPICS ? ALL_TOPICS : String(topicId)}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Topic"
          className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface pr-9 pl-3 text-base font-medium text-text md:h-[30px] md:w-auto md:text-[13px]"
        >
          <option value={ALL_TOPICS}>All</option>
          {options
            ? options.map(({ level: groupLevel, items }) => (
                <optgroup key={groupLevel} label={groupLevel}>
                  {items.map((lektion) => (
                    <option key={lektion.id} value={lektion.id}>
                      {lektion.name}
                    </option>
                  ))}
                </optgroup>
              ))
            : flatItems.map((lektion) => (
                <option key={lektion.id} value={lektion.id}>
                  {lektion.name}
                </option>
              ))}
        </select>
        <CaretDown className="pointer-events-none absolute right-3 text-sm text-muted" />
      </div>
    </div>
  );
}

// `onReset` clears level, topic, part of speech and search together; disabled when nothing is active.
function Filters({
  level,
  onLevelChange,
  topicId,
  onTopicChange,
  lektions,
  pos,
  onPosChange,
  onReset,
  canReset,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-7">
      <FilterGroup
        label="Level"
        options={LEVELS}
        value={level}
        onChange={onLevelChange}
        variant="segment"
      />
      <TopicFilter
        level={level}
        topicId={topicId}
        lektions={lektions}
        onChange={onTopicChange}
      />
      <FilterGroup
        label="Part of speech"
        options={PARTS_OF_SPEECH}
        value={pos}
        onChange={onPosChange}
        variant="chip"
      />
      <button
        type="button"
        onClick={onReset}
        disabled={!canReset}
        className="flex h-11 basis-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-line px-3 text-[13px] font-medium text-muted hover:border-muted hover:text-text disabled:cursor-default disabled:opacity-45 disabled:hover:border-line disabled:hover:text-muted md:h-[30px] md:basis-auto"
      >
        <ArrowCounterClockwise className="text-sm" />
        Reset Filters
      </button>
    </div>
  );
}

export default Filters;
