import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { requests as seedRequests, servers as seedServers, kitchenItems as seedKitchen, trips as seedTrips, coordinator } from '../data/mockData'
import { generateFreshRequest } from '../data/autoRequests'
import { planBreachFirstTrip } from '../lib/aiTripPlanner'
import type { KitchenItem, ServiceRequest, Server, Trip, WastageEvent, PromiseTier } from '../types'
import { useLiveClock } from './useLiveClock'
import { floorLabel } from '../lib/format'
import { timeStatus } from '../lib/urgency'

// Auto Mode tuning (Iteration 2 §5): how often the background planner
// checks for free servers + outstanding work while Auto Mode is on.
const AUTO_MODE_INTERVAL_MS = 15_000

// Trickle-in tuning (Iteration 2 §1): without this, a long-running session
// only ages forward — nothing ever arrives to replenish To Do — and the
// board eventually decays to all-breached. A healthy live board stays
// under BOARD_CAP; a fresh request trickles in every TRICKLE_INTERVAL_MS
// while under that cap, and if the board ever fully decays (no live
// non-breached requests left), a batch is restored immediately.
const BOARD_CAP = 24
const TRICKLE_INTERVAL_MS = 40_000

export type CenterView = 'command' | 'floor-cluster'

export type ModalState =
  | { type: 'none' }
  | { type: 'add-request' }
  | { type: 'request-detail'; requestId: string }
  | { type: 'trip-detail'; tripId: string }
  | { type: 'select-server'; tripId: string }
  | { type: 'confirm'; message: string; onConfirm: () => void; confirmLabel?: string }
  | { type: 'kitchen-all' }
  | { type: 'alerts-all' }
  | { type: 'auto-mode-log' }

export interface Toast {
  id: string
  message: string
  undo?: () => void
}

/** One entry in the Auto Mode action feed (Iteration 2 §5) — every
 * autonomous action is logged and stays undoable, not just for the
 * duration of a toast. */
export interface AutoModeAction {
  id: string
  message: string
  at: number
  undone: boolean
  undo: () => void
}

export interface QuickFilters {
  breachedOnly: boolean
  floor: number | null
  serverId: string | null
}

interface AppState {
  now: number
  requests: ServiceRequest[]
  servers: Server[]
  kitchenItems: KitchenItem[]
  trips: Trip[]
  wastageLog: WastageEvent[]
  coordinatorInfo: typeof coordinator

  theme: 'light' | 'dark'
  toggleTheme: () => void

  afterRush: boolean
  toggleAfterRush: () => void

  autoMode: boolean
  toggleAutoMode: () => void
  autoModeLog: AutoModeAction[]
  undoAutoModeAction: (logId: string) => void

  view: CenterView
  setView: (v: CenterView) => void

  selection: Set<string>
  selectMode: boolean
  setSelectMode: (v: boolean) => void
  toggleSelected: (id: string) => void
  clearSelection: () => void

  modal: ModalState
  openModal: (m: ModalState) => void
  closeModal: () => void

  toast: Toast | null
  showToast: (message: string, undo?: () => void) => void
  dismissToast: () => void

  filters: QuickFilters
  setFilters: (f: Partial<QuickFilters>) => void

  // actions
  createRequest: (input: {
    type: ServiceRequest['type']
    room: string
    floor: number
    itemsCount: number
    specialInstructions?: string
    promiseTier: PromiseTier
    promiseMinutes: number
    assignedServerId?: string
  }) => void
  createTripFromSelection: () => void
  suggestTripWithAI: () => void
  assignServerToTrip: (tripId: string, serverId: string) => void
  startTrip: (tripId: string) => void
  removeStopFromTrip: (tripId: string, requestId: string) => void
  cancelRequest: (requestId: string) => void
  markStepDone: (requestId: string) => void
}

const AppStateCtx = createContext<AppState | null>(null)

let requestSeq = 4341
let tripSeq = 17

export function AppStateProvider({ children }: { children: ReactNode }) {
  const now = useLiveClock(1000)

  const [requests, setRequests] = useState<ServiceRequest[]>(seedRequests)
  const [servers, setServers] = useState<Server[]>(seedServers)
  const [kitchenItems] = useState<KitchenItem[]>(seedKitchen)
  const [trips, setTrips] = useState<Trip[]>(seedTrips)
  const [wastageLog, setWastageLog] = useState<WastageEvent[]>([])

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [afterRush, setAfterRush] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [autoModeLog, setAutoModeLog] = useState<AutoModeAction[]>([])
  const [view, setView] = useState<CenterView>('command')
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [toast, setToast] = useState<Toast | null>(null)
  const [filters, setFiltersState] = useState<QuickFilters>({ breachedOnly: false, floor: null, serverId: null })

  const toastTimer = useRef<number | null>(null)

  // Latest-value mirrors for the Auto Mode background tick (Iteration 2
  // §5), which runs on an interval and must never act on stale state.
  const requestsRef = useRef(requests)
  const serversRef = useRef(servers)
  useEffect(() => {
    requestsRef.current = requests
  }, [requests])
  useEffect(() => {
    serversRef.current = servers
  }, [servers])

  // Trickle-in: keeps the board a living morning rush no matter how long
  // the tab stays open, instead of every request marching to Breached with
  // nothing new ever arriving (Iteration 2 §1).
  useEffect(() => {
    const id = window.setInterval(() => {
      setRequests((prev) => {
        const nowMs = Date.now()
        const live = prev.filter((r) => !r.scheduled && r.progressState !== 'completed')
        const liveNonBreached = live.filter((r) => timeStatus(r, nowMs) !== 'breached')

        // Full decay safety net — restore a healthy mix immediately.
        if (live.length > 0 && liveNonBreached.length === 0) {
          const fresh = Array.from({ length: 4 }, () => generateFreshRequest(requestSeq++))
          return [...prev, ...fresh]
        }
        // Normal trickle — top up below the healthy cap.
        if (live.length < BOARD_CAP) {
          return [...prev, generateFreshRequest(requestSeq++)]
        }
        return prev
      })
    }, TRICKLE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  const showToast = useCallback((message: string, undo?: () => void) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    const id = Math.random().toString(36).slice(2)
    setToast({ id, message, undo })
    toastTimer.current = window.setTimeout(() => setToast(null), 6000)
  }, [])

  const dismissToast = useCallback(() => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast(null)
  }, [])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])
  const toggleAfterRush = useCallback(() => setAfterRush((v) => !v), [])

  const toggleSelected = useCallback((id: string) => {
    setSelection((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelection(new Set())
    setSelectMode(false)
  }, [])

  const openModal = useCallback((m: ModalState) => setModal(m), [])
  const closeModal = useCallback(() => setModal({ type: 'none' }), [])

  const setFilters = useCallback((f: Partial<QuickFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...f }))
  }, [])

  const createRequest = useCallback<AppState['createRequest']>((input) => {
    const id = String(requestSeq)
    const code = `RG-${requestSeq}`
    requestSeq += 1
    const requestedAt = Date.now()
    const newRequest: ServiceRequest = {
      id,
      floor: input.floor,
      room: input.room,
      code,
      type: input.type,
      item: input.specialInstructions ? input.specialInstructions.slice(0, 24) : 'New request',
      itemsCount: input.itemsCount,
      specialInstructions: input.specialInstructions,
      requestedAt,
      promiseMinutes: input.promiseMinutes,
      promiseTier: input.promiseTier,
      progressState: 'accepted',
      assignedServerId: input.assignedServerId,
      acceptedAt: requestedAt,
    }
    setRequests((prev) => [...prev, newRequest])
    closeModal()
    showToast(`Request ${code} created · Room ${input.room}`)
  }, [closeModal, showToast])

  const buildTripFromIds = useCallback(
    (ids: string[], createdBy: 'ai' | 'coordinator') => {
      const id = `trip-${tripSeq}`
      const label = `Trip #${tripSeq}`
      tripSeq += 1
      const floors = new Set(requests.filter((r) => ids.includes(r.id)).map((r) => r.floor))
      const trip: Trip = {
        id,
        label,
        stopRequestIds: ids,
        createdBy,
        distanceKm: Math.round((0.4 + floors.size * 0.35) * 10) / 10,
        estMinutes: 5 + ids.length * 3,
        priority: ids.length >= 3 ? 'High' : 'Medium',
        suggestedAt: Date.now(),
      }
      setTrips((prev) => [trip, ...prev])
      setRequests((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, tripId: id } : r)))
      return trip
    },
    [requests],
  )

  const createTripFromSelection = useCallback(() => {
    if (selection.size === 0) return
    const ids = Array.from(selection)
    const trip = buildTripFromIds(ids, 'coordinator')
    clearSelection()
    openModal({ type: 'trip-detail', tripId: trip.id })
    showToast(`${trip.label} created with ${ids.length} stops`)
  }, [selection, buildTripFromIds, clearSelection, openModal, showToast])

  const suggestTripWithAI = useCallback(() => {
    // Breach-first, cluster-to-fill (Iteration 2 §4): anchor on the worst
    // outstanding breach, then pull in nearby at-risk/on-time requests to
    // fill the trip. Manual mode builds one proposal — the coordinator
    // still assigns and decides.
    const candidates = requests.filter((r) => !r.tripId && !r.scheduled && r.progressState !== 'completed')
    const plan = planBreachFirstTrip(candidates, Date.now())
    if (!plan) {
      showToast('No ungrouped requests to suggest right now')
      return
    }
    const trip = buildTripFromIds(plan.requestIds, 'ai')
    const anchorWasBreached = timeStatus(requests.find((r) => r.id === plan.requestIds[0])!, Date.now()) === 'breached'
    showToast(
      `✦ ${trip.label} suggested by AI — ${plan.requestIds.length} stop${plan.requestIds.length === 1 ? '' : 's'}${anchorWasBreached ? ', breach-first' : ''}`,
    )
  }, [requests, buildTripFromIds, showToast])

  const assignServerToTrip = useCallback<AppState['assignServerToTrip']>(
    (tripId, serverId) => {
      const server = servers.find((s) => s.id === serverId)
      const trip = trips.find((t) => t.id === tripId)
      if (!server || !trip) return
      if (server.status !== 'free') {
        openModal({
          type: 'confirm',
          message: `Assign failed — ${server.name} is already on a trip. Choose another server?`,
          confirmLabel: 'Choose another',
          onConfirm: () => openModal({ type: 'select-server', tripId }),
        })
        return
      }
      const stops = requests.filter((r) => trip.stopRequestIds.includes(r.id))
      const floors = Array.from(new Set(stops.map((r) => r.floor))).sort((a, b) => a - b)

      // Assigning only queues the trip on the server — it does NOT put any
      // request "on the way" yet. That happens in startTrip below. Keeping
      // these two steps separate is what makes the trip's derived run state
      // (lib/tripStatus.ts) match reality instead of jumping straight to
      // "running" the instant a server is picked (Iteration §1).
      setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, assignedServerId: serverId } : t)))
      setRequests((prev) => prev.map((r) => (trip.stopRequestIds.includes(r.id) ? { ...r, assignedServerId: serverId } : r)))
      setServers((prev) =>
        prev.map((s) =>
          s.id === serverId
            ? {
                ...s,
                status: 'assigned',
                statusLine: `${trip.label} · ${stops.length} stop${stops.length === 1 ? '' : 's'} queued`,
                floorLine: `${floors.map(floorLabel).join(', ')} • not started`,
                currentTripId: tripId,
              }
            : s,
        ),
      )
      openModal({ type: 'trip-detail', tripId })
      showToast(`${trip.label} assigned to ${server.name} · Undo`, () => {
        setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, assignedServerId: undefined } : t)))
        setRequests((prev) => prev.map((r) => (trip.stopRequestIds.includes(r.id) ? { ...r, assignedServerId: undefined } : r)))
        setServers((prev) => prev.map((s) => (s.id === serverId ? { ...s, status: 'free', statusLine: 'Available', floorLine: undefined, currentTripId: undefined } : s)))
      })
    },
    [servers, trips, requests, openModal, showToast],
  )

  const startTrip = useCallback<AppState['startTrip']>(
    (tripId) => {
      const trip = trips.find((t) => t.id === tripId)
      if (!trip || !trip.assignedServerId) return
      const stops = requests.filter((r) => trip.stopRequestIds.includes(r.id))
      const floors = Array.from(new Set(stops.map((r) => r.floor))).sort((a, b) => a - b)
      const serverId = trip.assignedServerId

      // This is the actual dispatch moment: stops flip to in_progress (On
      // the Way), which is what makes the trip's derived state "running".
      const startedAt = Date.now()
      setRequests((prev) =>
        prev.map((r) =>
          trip.stopRequestIds.includes(r.id) && r.progressState === 'accepted'
            ? { ...r, progressState: 'in_progress', onTheWayAt: startedAt }
            : r,
        ),
      )
      setServers((prev) =>
        prev.map((s) =>
          s.id === serverId
            ? {
                ...s,
                status: 'on_trip',
                statusLine: `0 of ${stops.length} done`,
                floorLine: `${floors.map(floorLabel).join(', ')} • ${stops.length} stop${stops.length === 1 ? '' : 's'} left`,
              }
            : s,
        ),
      )
      closeModal()
      showToast(`${trip.label} started`)
    },
    [trips, requests, closeModal, showToast],
  )

  const removeStopFromTrip = useCallback<AppState['removeStopFromTrip']>((tripId, requestId) => {
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, stopRequestIds: t.stopRequestIds.filter((id) => id !== requestId) } : t)))
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId && r.progressState !== 'completed'
          ? { ...r, tripId: undefined, assignedServerId: undefined, progressState: 'accepted', onTheWayAt: undefined }
          : r,
      ),
    )
    showToast('Removed from trip')
  }, [showToast])

  const cancelRequest = useCallback<AppState['cancelRequest']>(
    (requestId) => {
      const doCancel = () => {
        setRequests((prev) => prev.filter((r) => r.id !== requestId))
        setWastageLog((prev) => [...prev, { id: `w${prev.length + 1}`, requestId, reason: 'Cancelled after ready', at: Date.now() }])
        closeModal()
        showToast('Request cancelled — logged as wastage')
      }
      const req = requests.find((r) => r.id === requestId)
      if (req && req.progressState !== 'accepted') {
        openModal({
          type: 'confirm',
          message: `Cancel request ${req.code}? It is already underway — this will be logged as a wastage event.`,
          confirmLabel: 'Cancel request',
          onConfirm: doCancel,
        })
      } else {
        doCancel()
      }
    },
    [requests, openModal, closeModal, showToast],
  )

  const markStepDone = useCallback<AppState['markStepDone']>(
    (requestId) => {
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, progressState: 'completed', completedAt: Date.now() } : r)))
      const req = requests.find((r) => r.id === requestId)
      if (req?.tripId) {
        const trip = trips.find((t) => t.id === req.tripId)
        if (trip && trip.assignedServerId) {
          const remaining = trip.stopRequestIds.filter((id) => id !== requestId && requests.find((r) => r.id === id)?.progressState !== 'completed')
          setServers((prev) =>
            prev.map((s) =>
              s.id === trip.assignedServerId
                ? remaining.length === 0
                  ? { ...s, status: 'free', statusLine: 'Available', floorLine: undefined, currentTripId: undefined }
                  : { ...s, statusLine: `${trip.stopRequestIds.length - remaining.length} of ${trip.stopRequestIds.length} done`, floorLine: `${remaining.length} stop${remaining.length === 1 ? '' : 's'} left` }
                : s,
            ),
          )
        }
      }
      showToast('Step marked done')
    },
    [requests, trips, showToast],
  )

  // Reverts one Auto Mode–created trip: un-claims its stops and frees its
  // server. Shared by both the toast's inline Undo and the persistent
  // action-feed Undo (Iteration 2 §5 — every AI action stays reversible).
  const undoAutoTrip = useCallback((tripId: string, requestIds: string[], serverId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId))
    setRequests((prev) =>
      prev.map((r) =>
        requestIds.includes(r.id)
          ? { ...r, tripId: undefined, assignedServerId: undefined, progressState: 'accepted', onTheWayAt: undefined }
          : r,
      ),
    )
    setServers((prev) =>
      prev.map((s) => (s.id === serverId ? { ...s, status: 'free', statusLine: 'Available', floorLine: undefined, currentTripId: undefined } : s)),
    )
  }, [])

  // The Auto Mode background tick (Iteration 2 §5): breach-first plans one
  // trip per currently-FREE server, in a single batch, assigns it, and
  // starts it immediately — nobody is there to click Start. Reads from
  // refs (not closed-over state) so it always acts on the latest board,
  // and applies each assignment to a local snapshot as it goes so two
  // servers in the same batch can never claim the same request.
  const runAutoModeTick = useCallback(() => {
    const nowMs = Date.now()
    let liveRequests = requestsRef.current
    let liveServers = serversRef.current
    const freeServers = liveServers.filter((s) => s.status === 'free')
    if (freeServers.length === 0) return

    const newTrips: Trip[] = []
    const logEntries: AutoModeAction[] = []

    for (const server of freeServers) {
      const candidates = liveRequests.filter((r) => !r.tripId && !r.scheduled && r.progressState !== 'completed')
      const plan = planBreachFirstTrip(candidates, nowMs)
      if (!plan) break // nothing left to build a trip from

      const id = `trip-${tripSeq}`
      const label = `Trip #${tripSeq}`
      tripSeq += 1

      const stops = liveRequests.filter((r) => plan.requestIds.includes(r.id))
      const stopFloors = Array.from(new Set(stops.map((r) => r.floor))).sort((a, b) => a - b)
      const anchorBreached = timeStatus(stops[0], nowMs) === 'breached'

      const trip: Trip = {
        id,
        label,
        stopRequestIds: plan.requestIds,
        createdBy: 'ai',
        assignedServerId: server.id,
        distanceKm: Math.round((0.4 + stopFloors.length * 0.35) * 10) / 10,
        estMinutes: 5 + plan.requestIds.length * 3,
        priority: plan.requestIds.length >= 3 ? 'High' : 'Medium',
        suggestedAt: nowMs,
      }
      newTrips.push(trip)

      // Fold into the local snapshot immediately — guardrail: only a
      // genuinely free server (per the fresh filter above) ever receives
      // a trip, and it's removed from contention for the rest of this
      // batch the moment it's assigned.
      liveRequests = liveRequests.map((r) =>
        plan.requestIds.includes(r.id) ? { ...r, tripId: id, assignedServerId: server.id, progressState: 'in_progress', onTheWayAt: nowMs } : r,
      )
      liveServers = liveServers.map((s) =>
        s.id === server.id
          ? {
              ...s,
              status: 'on_trip',
              statusLine: `0 of ${plan.requestIds.length} done`,
              floorLine: `${stopFloors.map(floorLabel).join(', ')} • ${plan.requestIds.length} stop${plan.requestIds.length === 1 ? '' : 's'} left`,
              currentTripId: id,
            }
          : s,
      )

      logEntries.push({
        id: `auto-${nowMs}-${server.id}`,
        message: `Auto Mode created ${label} (${plan.requestIds.length} stop${plan.requestIds.length === 1 ? '' : 's'}${anchorBreached ? ', breach-first' : ''}), assigned ${server.name}`,
        at: nowMs,
        undone: false,
        undo: () => undoAutoTrip(id, plan.requestIds, server.id),
      })
    }

    if (newTrips.length === 0) return

    setTrips((prev) => [...newTrips, ...prev])
    setRequests(liveRequests)
    setServers(liveServers)
    setAutoModeLog((prev) => [...logEntries, ...prev])
    showToast(`✦ Auto Mode built ${newTrips.length} trip${newTrips.length === 1 ? '' : 's'} and dispatched ${newTrips.length === 1 ? 'it' : 'them'}`)
  }, [showToast, undoAutoTrip])

  const toggleAutoMode = useCallback(() => {
    setAutoMode((prev) => {
      const next = !prev
      showToast(next ? '✦ Auto Mode ON — AI will build & assign trips automatically' : 'Auto Mode OFF')
      return next
    })
  }, [showToast])

  // While Auto Mode is on: run once immediately (don't make the
  // coordinator wait a full interval for the first pass), then keep
  // checking as servers free up.
  useEffect(() => {
    if (!autoMode) return
    runAutoModeTick()
    const id = window.setInterval(runAutoModeTick, AUTO_MODE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [autoMode, runAutoModeTick])

  const undoAutoModeAction = useCallback((logId: string) => {
    setAutoModeLog((prev) => {
      const entry = prev.find((e) => e.id === logId)
      if (!entry || entry.undone) return prev
      entry.undo()
      return prev.map((e) => (e.id === logId ? { ...e, undone: true } : e))
    })
  }, [])

  const value = useMemo<AppState>(
    () => ({
      now,
      requests,
      servers,
      kitchenItems,
      trips,
      wastageLog,
      coordinatorInfo: coordinator,
      theme,
      toggleTheme,
      afterRush,
      toggleAfterRush,
      autoMode,
      toggleAutoMode,
      autoModeLog,
      undoAutoModeAction,
      view,
      setView,
      selection,
      selectMode,
      setSelectMode,
      toggleSelected,
      clearSelection,
      modal,
      openModal,
      closeModal,
      toast,
      showToast,
      dismissToast,
      filters,
      setFilters,
      createRequest,
      createTripFromSelection,
      suggestTripWithAI,
      assignServerToTrip,
      startTrip,
      removeStopFromTrip,
      cancelRequest,
      markStepDone,
    }),
    [
      now,
      requests,
      servers,
      kitchenItems,
      trips,
      wastageLog,
      theme,
      toggleTheme,
      afterRush,
      toggleAfterRush,
      autoMode,
      toggleAutoMode,
      autoModeLog,
      undoAutoModeAction,
      view,
      selection,
      selectMode,
      clearSelection,
      modal,
      openModal,
      closeModal,
      toast,
      showToast,
      dismissToast,
      filters,
      setFilters,
      createRequest,
      createTripFromSelection,
      suggestTripWithAI,
      assignServerToTrip,
      startTrip,
      removeStopFromTrip,
      cancelRequest,
      markStepDone,
      toggleSelected,
    ],
  )

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateCtx)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
