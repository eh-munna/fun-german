import { Moon, Sun } from '@phosphor-icons/react';

function Header({ appName, theme, onToggleTheme, count, total, children }) {
  const filtered = count !== total;

  // Select logo based on theme
  const logoSrc =
    theme === 'light'
      ? '/fungerman-logo-light.svg'
      : '/fungerman-logo-dark.svg';

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Same logo for both mobile and desktop, just different sizes */}
          <img
            src={logoSrc}
            alt={appName}
            className="h-10 w-auto md:h-12 w-auto"
          />
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="grid size-9 cursor-pointer place-items-center rounded-lg border border-line text-[17px] text-text hover:border-accent hover:text-accent"
        >
          {theme === 'light' ? <Moon /> : <Sun />}
        </button>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-6 pt-1.5">
        <div className="flex flex-col gap-0.5">
          <div className="text-xs font-medium tracking-[0.08em] text-muted uppercase">
            Your vocabulary
          </div>
          <div className="flex items-baseline gap-2">
            <span
              data-testid="word-count"
              className="font-serif text-[44px] leading-[1.05] font-medium tracking-[-0.02em] tabular-nums"
            >
              {count}
            </span>
            <span className="text-[15px] text-muted">
              {filtered ? `of ${total} words` : count === 1 ? 'word' : 'words'}
            </span>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}

export default Header;
