import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { createInterface } from 'readline'
import { EventEmitter } from 'events'
import type { EngineRequest, EngineResponse } from '../../renderer/types/engine.types'

interface PendingRequest {
  resolve: (value: EngineResponse) => void
  reject: (reason: Error) => void
  timer: ReturnType<typeof setTimeout>
}

const REQUEST_TIMEOUT_MS = 10_000

export class EngineProcess extends EventEmitter {
  private process: ChildProcessWithoutNullStreams | null = null
  private pending = new Map<string, PendingRequest>()
  private started = false

  constructor(private readonly binaryPath: string) {
    super()
  }

  start(): void {
    if (this.started) return
    this.started = true

    console.log(`[Engine] Starting: ${this.binaryPath}`)

    this.process = spawn(this.binaryPath, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    const rl = createInterface({ input: this.process.stdout! })
    rl.on('line', (line) => this.handleLine(line.trim()))

    this.process.stderr?.on('data', (data: Buffer) => {
      console.error(`[Engine stderr] ${data.toString().trim()}`)
    })

    this.process.on('exit', (code, signal) => {
      console.warn(`[Engine] Process exited: code=${code} signal=${signal}`)
      this.started = false
      this.rejectAllPending(new Error(`Engine exited unexpectedly (code=${code})`))
    })

    this.process.on('error', (err) => {
      console.error('[Engine] Spawn error:', err)
      this.started = false
      this.process = null
      this.rejectAllPending(err)
    })
  }

  stop(): void {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
    this.started = false
    this.rejectAllPending(new Error('Engine stopped'))
  }

  isRunning(): boolean {
    return this.started && this.process !== null
  }

  calculate(request: EngineRequest): Promise<EngineResponse> {
    if (!this.isRunning()) {
      return Promise.resolve({
        id: request.id,
        type: 'error',
        payload: {
          code: 'ENGINE_NOT_RUNNING',
          message: 'C++ engine is not running. Build it with: npm run setup:engine'
        }
      })
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(request.id)
        reject(new Error(`Engine request timed out (id=${request.id})`))
      }, REQUEST_TIMEOUT_MS)

      this.pending.set(request.id, { resolve, reject, timer })

      const line = JSON.stringify(request) + '\n'
      this.process!.stdin.write(line, (err) => {
        if (err) {
          clearTimeout(timer)
          this.pending.delete(request.id)
          resolve({
            id: request.id,
            type: 'error',
            payload: { code: 'WRITE_ERROR', message: err.message }
          })
        }
      })
    })
  }

  private handleLine(line: string): void {
    if (!line) return

    let response: EngineResponse
    try {
      response = JSON.parse(line)
    } catch {
      console.error('[Engine] Failed to parse response:', line)
      return
    }

    const pending = this.pending.get(response.id)
    if (!pending) {
      console.warn('[Engine] Received response for unknown id:', response.id)
      return
    }

    clearTimeout(pending.timer)
    this.pending.delete(response.id)
    pending.resolve(response)
  }

  private rejectAllPending(error: Error): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(error)
      this.pending.delete(id)
    }
  }
}
