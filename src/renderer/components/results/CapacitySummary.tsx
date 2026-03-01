import { cn } from '../../lib/utils'
import { fmtPct, fromKN, fmtN } from '../../lib/units'
import { useStore } from '../../store'
import type { CheckResult, SummaryResult } from '../../types/engine.types'

interface Props {
  summary: SummaryResult
  checks: CheckResult[]
}

function UtilisationBar({ value }: { value: number }) {
  const pct = Math.min(value * 100, 100)
  const color = value >= 1.0 ? 'bg-destructive' : value >= 0.8 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="h-1.5 rounded-full bg-secondary overflow-hidden w-full">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function CapacitySummary({ summary, checks }: Props) {
  const { units } = useStore()
  const fu = units.forceUnit
  const d  = units.decimals

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Overall status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'px-2 py-0.5 rounded text-xs font-bold',
            summary.passed
              ? 'bg-green-900/60 text-green-400 border border-green-700'
              : 'bg-red-900/60 text-red-400 border border-red-700'
          )}
        >
          {summary.passed ? 'PASS' : 'FAIL'}
        </div>
        <span className="text-xs text-muted-foreground">
          Max utilisation: <span className="text-foreground font-medium">{fmtPct(summary.max_utilisation)}</span>
          {' '}— governing: <span className="text-foreground font-medium">{summary.governing_check}</span>
        </span>
      </div>

      {/* Individual checks */}
      <div className="flex flex-col gap-2">
        {checks.map((check) => (
          <div key={check.id} className="bg-secondary/40 rounded p-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">{check.label}</span>
              <span
                className={cn(
                  'text-xs font-medium',
                  check.passed ? 'text-green-400' : 'text-red-400'
                )}
              >
                {fmtPct(check.utilisation)}
              </span>
            </div>
            <UtilisationBar value={check.utilisation} />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Ed = {fmtN(fromKN(check.Ed, fu), d)} {fu}</span>
              <span>Rd = {fmtN(fromKN(check.Rd, fu), d)} {fu}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
