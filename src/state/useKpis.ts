import { useMemo } from 'react'
import { useAppState } from './AppStateContext'
import { columnFor, timeStatus } from '../lib/urgency'

export function useLiveKpis() {
  const { requests, now } = useAppState()
  return useMemo(() => {
    const live = requests.filter((r) => !r.scheduled && r.progressState !== 'completed')
    const atRisk = live.filter((r) => timeStatus(r, now) === 'at_risk').length
    const breached = live.filter((r) => timeStatus(r, now) === 'breached').length
    const toDo = live.filter((r) => columnFor(r, now) === 'to_do').length
    return { total: live.length, atRisk, breached, toDo, live }
  }, [requests, now])
}
