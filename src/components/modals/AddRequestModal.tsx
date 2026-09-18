import { useMemo, useState, type ReactNode } from 'react'
import { useAppState } from '../../state/AppStateContext'
import { SlideOverPanel } from '../common/Overlay'
import { SelectChip } from '../common/SelectChip'
import type { PromiseTier, RequestType } from '../../types'
import { formatClockTime } from '../../lib/format'

const REQUEST_TYPES: RequestType[] = ['Meal Request', 'Room Task', 'Supplies', 'Beverage', 'Pickup']

export function AddRequestModal() {
  const { closeModal, createRequest, servers } = useAppState()

  const [type, setType] = useState<RequestType>('Meal Request')
  const [room, setRoom] = useState('1205')
  const [floor, setFloor] = useState(12)
  const [itemsCount, setItemsCount] = useState(2)
  const [instructions, setInstructions] = useState('')
  const [tier, setTier] = useState<PromiseTier>('standard')
  const [customMinutes, setCustomMinutes] = useState(30)
  const [serverId, setServerId] = useState<string>('auto')

  const promiseMinutes = tier === 'standard' ? 20 : tier === 'priority' ? 10 : customMinutes
  const promiseBy = useMemo(() => formatClockTime(Date.now() + promiseMinutes * 60_000), [promiseMinutes])

  function handleSubmit() {
    createRequest({
      type,
      room,
      floor,
      itemsCount,
      specialInstructions: instructions || undefined,
      promiseTier: tier,
      promiseMinutes,
      assignedServerId: serverId === 'auto' ? undefined : serverId,
    })
  }

  return (
    <SlideOverPanel
      title="Add New Request"
      onClose={closeModal}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button onClick={closeModal} className="rounded-button border border-hairline px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="rounded-button bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast hover:bg-primary-alt">
            Create Request
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <section>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-label text-text-secondary">Request Details</h3>
          <div className="space-y-3">
            <Field label="Request Type" required>
              <SelectChip
                variant="field"
                value={type}
                onChange={(v) => setType(v as RequestType)}
                options={REQUEST_TYPES.map((t) => ({ value: t, label: t }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Room Number" required>
                <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 1205" className={inputClass} />
              </Field>
              <Field label="Floor">
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  placeholder="e.g. 12"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="No. of Items" required>
              <input
                type="number"
                min={1}
                value={itemsCount}
                onChange={(e) => setItemsCount(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Special Instructions (Optional)">
              <textarea
                value={instructions}
                maxLength={120}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. No onions, extra napkins…"
                rows={3}
                className={`${inputClass} resize-none`}
              />
              <div className="mt-1 text-right text-[11px] text-text-secondary">{instructions.length}/120</div>
            </Field>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-label text-text-secondary">Promise Time</h3>
          <div className="space-y-2">
            <PromiseOption
              active={tier === 'standard'}
              onSelect={() => setTier('standard')}
              title="Standard (20 min)"
              detail={`By ${formatClockTime(Date.now() + 20 * 60_000)}`}
            />
            <PromiseOption
              active={tier === 'priority'}
              onSelect={() => setTier('priority')}
              title="Priority (10 min)"
              detail={`By ${formatClockTime(Date.now() + 10 * 60_000)}`}
            />
            <PromiseOption active={tier === 'custom'} onSelect={() => setTier('custom')} title="Custom" detail={`By ${promiseBy}`}>
              {tier === 'custom' && (
                <input
                  type="number"
                  min={5}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className={`${inputClass} mt-2 w-28`}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </PromiseOption>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-label text-text-secondary">Assign Server (Optional)</h3>
          <SelectChip
            variant="field"
            value={serverId}
            onChange={setServerId}
            options={[
              { value: 'auto', label: 'Auto assign (AI will assign)' },
              ...servers.map((s) => ({ value: s.id, label: `${s.name} — ${s.status === 'free' ? 'Free' : s.statusLine}` })),
            ]}
          />
          <p className="mt-1.5 text-[11px] text-text-secondary">You can reassign later if needed.</p>
        </section>
      </div>
    </SlideOverPanel>
  )
}

const inputClass =
  'w-full rounded-button border border-hairline bg-canvas px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary'

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-text-secondary">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  )
}

function PromiseOption({
  active,
  onSelect,
  title,
  detail,
  children,
}: {
  active: boolean
  onSelect: () => void
  title: string
  detail: string
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-button border px-3 py-2.5 text-left transition ${
        active ? 'border-primary bg-primary-tint' : 'border-hairline hover:border-text-secondary/40'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${active ? 'border-primary' : 'border-hairline'}`}>
          {active && <span className="h-2 w-2 rounded-full bg-primary" />}
        </span>
        <span className="text-[13px] font-semibold text-text-primary">{title}</span>
        <span className="ml-auto text-[12px] text-text-secondary">{detail}</span>
      </div>
      {children}
    </button>
  )
}
