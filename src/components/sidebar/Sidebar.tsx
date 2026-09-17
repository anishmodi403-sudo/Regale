import { ServerPanel } from './ServerPanel'
import { KitchenReadyStripe } from './KitchenReadyStripe'

export function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-hairline px-5 py-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gold/60 bg-gold/10 font-serif text-lg font-bold text-gold">
          R
        </span>
        <div className="leading-tight">
          <div className="text-base font-extrabold tracking-tight text-text-primary">REGALE</div>
          <div className="text-[10px] font-semibold uppercase tracking-label text-text-secondary">Room Service. Elevated.</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll px-4 py-5">
        <ServerPanel />
        <div className="my-6 border-t border-hairline" />
        <KitchenReadyStripe />
      </div>
    </div>
  )
}
