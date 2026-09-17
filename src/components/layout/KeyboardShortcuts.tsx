import { useEffect } from 'react'
import { useAppState } from '../../state/AppStateContext'

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

/** Expert layer (spec §12 step 13 / §10.6): a handful of shortcuts for
 * frequent moves so a fast coordinator never has to reach for the mouse. */
export function KeyboardShortcuts() {
  const { modal, openModal, closeModal, setView, view, selectMode, setSelectMode, clearSelection, filters, setFilters } =
    useAppState()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (EDITABLE_TAGS.has(target.tagName) || target.isContentEditable)) return

      if (e.key === 'Escape') {
        if (modal.type !== 'none') closeModal()
        else if (selectMode) clearSelection()
        return
      }

      if (modal.type !== 'none') return // don't fire global shortcuts while a panel is open

      switch (e.key.toLowerCase()) {
        case 'n':
          openModal({ type: 'add-request' })
          break
        case 'f':
          setView(view === 'command' ? 'floor-cluster' : 'command')
          break
        case 's':
          setSelectMode(!selectMode)
          break
        case 'b':
          setFilters({ breachedOnly: !filters.breachedOnly })
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal, openModal, closeModal, setView, view, selectMode, setSelectMode, clearSelection, filters, setFilters])

  return null
}
