"use client"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { HistoryEntry } from "./image-editor"
import type { RefObject } from "react"

interface HistoryPanelProps {
  history: HistoryEntry[]
  historyIndex: number
  setHistoryIndex: (index: number) => void
  canvasRef: RefObject<HTMLCanvasElement | null>
}

export function HistoryPanel({
  history,
  historyIndex,
  setHistoryIndex,
  canvasRef,
}: HistoryPanelProps) {
  const handleJumpToState = (index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const entry = history[index]
    if (entry) {
      ctx.putImageData(entry.imageData, 0, 0)
      setHistoryIndex(index)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="w-72 border-r border-border bg-card flex flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">History</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {history.length} state{history.length !== 1 ? "s" : ""} • Click to restore
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">No history yet</p>
              <p className="text-xs">Make some changes to see history</p>
            </div>
          ) : (
            history.map((entry, index) => (
              <button
                key={entry.timestamp}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                  "hover:bg-secondary",
                  index === historyIndex && "bg-primary/20 text-primary",
                  index > historyIndex && "opacity-50"
                )}
                onClick={() => handleJumpToState(index)}
              >
                <div className={cn(
                  "size-2 rounded-full",
                  index === historyIndex ? "bg-primary" : "bg-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(entry.timestamp)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  #{index + 1}
                </span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
