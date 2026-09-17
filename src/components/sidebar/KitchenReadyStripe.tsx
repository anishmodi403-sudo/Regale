import { useAppState } from '../../state/AppStateContext'
import { KitchenRow } from './KitchenRow'

export function KitchenReadyStripe() {
  const { kitchenItems, openModal } = useAppState()
  const visible = kitchenItems.slice(0, 3)

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-label text-text-secondary">Kitchen Ready Stripe</h2>
        <span className="rounded-pill bg-panel px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
          {kitchenItems.length}
        </span>
      </div>
      <div className="space-y-2">
        {visible.map((item) => (
          <KitchenRow key={item.id} item={item} />
        ))}
      </div>
      <button
        onClick={() => openModal({ type: 'kitchen-all' })}
        className="mt-3 text-[11px] font-semibold text-primary hover:underline"
      >
        View All Kitchen Ready ({kitchenItems.length}) ›
      </button>
    </section>
  )
}
