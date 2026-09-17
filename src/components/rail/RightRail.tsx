import { QuickAction } from './QuickAction'
import { LiveAlerts } from './LiveAlerts'
import { TripsList } from './TripsList'

export function RightRail() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <QuickAction />
      <div className="border-t border-hairline" />
      <LiveAlerts />
      <div className="border-t border-hairline" />
      <TripsList />
    </div>
  )
}
