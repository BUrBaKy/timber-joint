import { useStore } from '../../store'
import { CapacitySummary } from './CapacitySummary'
import { cn } from '../../lib/utils'

export function ResultsPanel() {
  const { calcStatus, calcResult, calcError } = useStore()

  return (
    <div className="flex-none border-t border-border bg-card">
      {/* Header */}
      <div className="flex items-center h-8 px-3 border-b border-border gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Calculation Results
        </span>

        {calcStatus === 'pending' && (
          <span className="text-xs text-blue-400 animate-pulse">calculating…</span>
        )}
        {calcStatus === 'success' && calcResult && (
          <span
            className={cn(
              'text-xs font-bold',
              calcResult.summary.passed ? 'text-green-400' : 'text-red-400'
            )}
          >
            {calcResult.summary.passed ? '✓ PASS' : '✗ FAIL'}
          </span>
        )}
        {calcStatus === 'error' && (
          <span className="text-xs text-red-400">Error</span>
        )}
      </div>

      {/* Body — always visible, sized to content */}
      <div className="px-3 py-2">
        {calcStatus === 'idle' && (
          <p className="text-xs text-muted-foreground">
            Edit parameters to trigger a calculation.
          </p>
        )}
        {calcStatus === 'pending' && (
          <p className="text-xs text-muted-foreground animate-pulse">Running calculation…</p>
        )}
        {calcStatus === 'success' && calcResult && (
          <CapacitySummary summary={calcResult.summary} checks={calcResult.checks} />
        )}
        {calcStatus === 'error' && calcError && (
          <div className="text-xs text-red-400">
            <span className="font-semibold">{calcError.code}</span>: {calcError.message}
            {calcError.field && (
              <span className="text-muted-foreground"> (field: {calcError.field})</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
