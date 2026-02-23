import { useStore } from '../../store'
import { Box, Eye, Grid3X3 } from 'lucide-react'

export function ViewModeControls() {
  const viewMode = useStore((state) => state.viewMode)
  const setViewMode = useStore((state) => state.setViewMode)
  const transparency = useStore((state) => state.transparency)
  const setTransparency = useStore((state) => state.setTransparency)

  const modes = [
    { value: 'rendered' as const, label: 'Rendered', icon: Eye },
    { value: 'transparent' as const, label: 'Transparent', icon: Box },
    { value: 'wireframe' as const, label: 'Wireframe', icon: Grid3X3 }
  ]

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      {/* View mode buttons */}
      <div className="flex gap-2">
        {modes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setViewMode(value)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              transition-all duration-200
              ${
                viewMode === value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground backdrop-blur-sm'
              }
            `}
            title={label}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Transparency slider - only shown when in transparent mode */}
      {viewMode === 'transparent' && (
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Opacity
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={transparency}
              onChange={(e) => setTransparency(Number(e.target.value))}
              className="w-32 h-2 bg-muted rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
            />
            <span className="text-xs font-medium text-foreground w-8 text-right">
              {transparency}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
