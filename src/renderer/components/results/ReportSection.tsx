import { useEffect, useRef } from 'react'
import katex from 'katex'

interface KatexBlockProps {
  latex: string
}

function KatexBlock({ latex }: KatexBlockProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    try {
      katex.render(latex, ref.current, {
        displayMode: true,
        throwOnError: false,
        trust: false,
        strict: false,
      })
    } catch {
      if (ref.current) ref.current.textContent = latex
    }
  }, [latex])

  return <div ref={ref} className="overflow-x-auto py-1 text-sm" />
}

interface ReportSectionProps {
  title:            string
  latex:            string   // symbolic equation (all symbols)
  latexNumerical:   string   // equation with values substituted
  passed:           boolean
  utilisation:      number
}

function passColor(passed: boolean) {
  return passed
    ? 'bg-green-900/50 text-green-400 border-green-700'
    : 'bg-red-900/50 text-red-400 border-red-700'
}

export function ReportSection({
  title,
  latex,
  latexNumerical,
  passed,
  utilisation,
}: ReportSectionProps) {
  return (
    <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
      {/* Title + verdict badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold border ${passColor(passed)}`}
        >
          {passed ? 'PASS' : 'FAIL'} — {(utilisation * 100).toFixed(1)} %
        </span>
      </div>

      {/* Symbolic equation */}
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">Equation</div>
        <KatexBlock latex={latex} />
      </div>

      {/* Numerical substitution */}
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">Numerical substitution</div>
        <KatexBlock latex={latexNumerical} />
      </div>
    </div>
  )
}
