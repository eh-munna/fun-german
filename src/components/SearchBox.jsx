import { MagnifyingGlass, X } from '@phosphor-icons/react'

function SearchBox({ value, onChange }) {
  return (
    <label className="flex h-[42px] flex-[1_1_100%] items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 text-muted focus-within:border-accent md:flex-[0_1_420px]">
      <MagnifyingGlass className="text-[17px]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search German or English…"
        aria-label="Search"
        className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none focus-visible:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear"
          className="grid cursor-pointer place-items-center p-0.5 text-[15px] text-muted"
        >
          <X />
        </button>
      )}
    </label>
  )
}

export default SearchBox
