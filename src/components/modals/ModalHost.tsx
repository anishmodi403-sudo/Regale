import { useAppState } from '../../state/AppStateContext'
import { AddRequestModal } from './AddRequestModal'
import { RequestDetailPanel } from './RequestDetailPanel'
import { TripDetailPanel } from './TripDetailPanel'
import { SelectServerPopover } from './SelectServerPopover'
import { ConfirmDialog } from './ConfirmDialog'
import { KitchenAllPanel } from './KitchenAllPanel'
import { AlertsAllPanel } from './AlertsAllPanel'
import { AutoModeLogPanel } from './AutoModeLogPanel'

export function ModalHost() {
  const { modal } = useAppState()

  switch (modal.type) {
    case 'add-request':
      return <AddRequestModal />
    case 'request-detail':
      return <RequestDetailPanel requestId={modal.requestId} />
    case 'trip-detail':
      return <TripDetailPanel tripId={modal.tripId} />
    case 'select-server':
      return <SelectServerPopover tripId={modal.tripId} />
    case 'confirm':
      return <ConfirmDialog message={modal.message} confirmLabel={modal.confirmLabel} onConfirm={modal.onConfirm} />
    case 'kitchen-all':
      return <KitchenAllPanel />
    case 'alerts-all':
      return <AlertsAllPanel />
    case 'auto-mode-log':
      return <AutoModeLogPanel />
    default:
      return null
  }
}
