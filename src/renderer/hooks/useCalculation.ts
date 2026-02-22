import { useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../store'
import { engine } from '../api/bridge'
import { isEngineResult, isEngineError } from '../types/engine.types'
import type { MortiseTenonJoint } from '../types/project.types'

const DEBOUNCE_MS = 300

export function useCalculation(joint: MortiseTenonJoint | null) {
  const { setCalcPending, setCalcResult, setCalcError } = useStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!joint) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      setCalcPending()

      const request = {
        id: uuidv4(),
        type: 'calculate' as const,
        payload: {
          joint: {
            type: 'MORTISE_TENON' as const,
            geometry: joint.geometry,
            material: joint.material
          },
          loads: joint.loads
        }
      }

      try {
        const response = await engine.calculate(request)

        if (isEngineResult(response)) {
          setCalcResult(response.payload)
        } else if (isEngineError(response)) {
          setCalcError(response.payload)
        }
      } catch (err) {
        setCalcError({
          code: 'IPC_ERROR',
          message: err instanceof Error ? err.message : String(err)
        })
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [joint, setCalcPending, setCalcResult, setCalcError])
}
