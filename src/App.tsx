import { AppStateProvider } from './state/AppStateContext'
import { AppShell } from './components/layout/AppShell'
import { KeyboardShortcuts } from './components/layout/KeyboardShortcuts'

function App() {
  return (
    <AppStateProvider>
      <KeyboardShortcuts />
      <AppShell />
    </AppStateProvider>
  )
}

export default App
