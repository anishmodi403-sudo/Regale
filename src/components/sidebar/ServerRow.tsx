import type { Server } from '../../types'
import { Avatar } from '../common/Avatar'
import { Pill } from '../common/Pill'

const STATUS_META: Record<Server['status'], { label: string; tone: 'primary' | 'warning' | 'info' | 'success'; bar: string }> = {
  assigned: { label: 'ASSIGNED', tone: 'primary', bar: 'bg-primary' },
  on_trip: { label: 'ON TRIP', tone: 'warning', bar: 'bg-warning' },
  room_task: { label: 'ROOM TASK', tone: 'info', bar: 'bg-info' },
  free: { label: 'FREE', tone: 'success', bar: 'bg-success' },
}

export function ServerRow({ server }: { server: Server }) {
  const meta = STATUS_META[server.status]

  return (
    <div className="flex items-center gap-2 rounded-card border border-hairline bg-card py-2.5 pl-0 pr-2.5 shadow-card">
      <span className={`h-10 w-1 shrink-0 self-stretch rounded-full ${meta.bar}`} />
      <Avatar name={server.name} initials={server.initials} size={28} presence={server.status !== 'free' ? 'active' : undefined} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold leading-tight text-text-primary">{server.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="truncate text-[10.5px] text-text-secondary">
            {server.statusLine}
            {server.floorLine ? ` · ${server.floorLine}` : ''}
          </span>
          <Pill tone={meta.tone} className="ml-auto shrink-0 !px-1.5 !py-0.5 !text-[9.5px]">
            {meta.label}
          </Pill>
        </div>
      </div>
    </div>
  )
}
