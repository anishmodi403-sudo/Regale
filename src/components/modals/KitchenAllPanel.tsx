import { useAppState } from '../../state/AppStateContext'
import { SlideOverPanel } from '../common/Overlay'
import { KitchenRow } from '../sidebar/KitchenRow'

export function KitchenAllPanel() {
  const { kitchenItems, closeModal } = useAppState()

  return (
    <SlideOverPanel title={`Kitchen Ready (${kitchenItems.length})`} onClose={closeModal}>
      <div className="space-y-2">
        {kitchenItems.length === 0 ? (
          <p className="text-sm text-text-secondary">Nothing ready in the kitchen right now.</p>
        ) : (
          kitchenItems.map((item) => <KitchenRow key={item.id} item={item} />)
        )}
      </div>
    </SlideOverPanel>
  )
}
