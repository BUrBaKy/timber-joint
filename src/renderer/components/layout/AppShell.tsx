import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Viewport3D } from '../visualization/Viewport3D'
import { ResultsPanel } from '../results/ResultsPanel'
import { CalculationReport } from '../results/CalculationReport'
import { useStore } from '../../store'

export function AppShell() {
  const sidebarWidth = useStore((s) => s.sidebarWidth)
  const mainView     = useStore((s) => s.mainView)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: input forms — always visible */}
        <div
          className="flex-none border-r border-border overflow-y-auto"
          style={{ width: sidebarWidth }}
        >
          <Sidebar />
        </div>

        {/* Main area: switches between 3D viewport and Calculation Report */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {mainView === '3d' ? (
            <>
              <div className="flex-1 relative">
                <Viewport3D />
              </div>
              <ResultsPanel />
            </>
          ) : (
            <CalculationReport />
          )}
        </div>
      </div>
    </div>
  )
}
