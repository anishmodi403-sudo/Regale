import { useEffect } from 'react'
import { useAppState } from '../../state/AppStateContext'
import { TopBar } from './TopBar'
import { Sidebar } from '../sidebar/Sidebar'
import { RightRail } from '../rail/RightRail'
import { CommandView } from '../board/CommandView'
import { FloorClusterView } from '../floorcluster/FloorClusterView'
import { ModalHost } from '../modals/ModalHost'
import { ToastHost } from '../common/Toast'

export function AppShell() {
  const { theme, view } = useAppState()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div
      className="grid h-screen w-full min-w-[1180px] bg-canvas text-text-primary"
      style={{ gridTemplateColumns: '255px 1fr 290px', gridTemplateRows: '64px 1fr' }}
    >
      <aside className="col-start-1 row-span-2 row-start-1 border-r border-hairline bg-panel panel-texture">
        <Sidebar />
      </aside>

      <TopBar />

      <main className="col-start-2 row-start-2 overflow-y-auto thin-scroll">
        {view === 'command' ? <CommandView /> : <FloorClusterView />}
      </main>

      <aside className="col-start-3 row-start-2 overflow-y-auto thin-scroll border-l border-hairline bg-panel panel-texture">
        <RightRail />
      </aside>

      <ModalHost />
      <ToastHost />
    </div>
  )
}
