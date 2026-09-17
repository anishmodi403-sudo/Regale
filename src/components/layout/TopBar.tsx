import { useAppState } from '../../state/AppStateContext'
import { formatWeekdayAndTime } from '../../lib/format'
import { Avatar } from '../common/Avatar'
import { MoonIcon, SunIcon } from '../common/Icons'

export function TopBar() {
  const { now, theme, toggleTheme, coordinatorInfo, autoMode, openModal } = useAppState()

  return (
    <header className="col-start-2 col-span-2 row-start-1 flex items-center justify-between border-b border-hairline bg-canvas px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="font-medium text-text-primary">Live service</span>
          <span className="text-hairline">|</span>
          <span>{formatWeekdayAndTime(new Date(now))}</span>
        </div>

        {/* Persistent Auto Mode indicator (Iteration 2 §5) — stays visible
            regardless of scroll position or which view is open, so the
            coordinator always knows AI is driving. */}
        {autoMode && (
          <button
            onClick={() => openModal({ type: 'auto-mode-log' })}
            title="Auto Mode — AI builds & assigns trips"
            className="flex items-center gap-1.5 rounded-pill border border-warning bg-warning-tint px-2.5 py-1 text-xs font-bold text-warning transition hover:brightness-95"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
            </span>
            ✦ Auto Mode ON
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-text-secondary transition hover:text-text-primary"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <div className="flex items-center gap-2 rounded-pill border border-hairline py-1 pl-1 pr-3">
          <Avatar name={coordinatorInfo.name} initials={coordinatorInfo.initials} size={28} presence="active" />
          <div className="leading-tight">
            <div className="text-xs font-semibold text-text-primary">{coordinatorInfo.name}</div>
            <div className="text-[11px] text-text-secondary">{coordinatorInfo.role}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
