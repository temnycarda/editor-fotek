"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Paintbrush,
  Eraser,
  Droplets,
  CircleDot,
  Sparkles,
  Sun,
  Moon,
  Copy,
  Sliders,
  Palette,
  Move,
  History,
  Hand,
} from "lucide-react"
import type { Tool } from "./image-editor"

interface ToolbarProps {
  tool: Tool
  setTool: (tool: Tool) => void
  activePanel: "filters" | "brush" | "transform" | "history" | null
  setActivePanel: (panel: "filters" | "brush" | "transform" | "history" | null) => void
}

type ToolItem = { id: Tool; icon: typeof Paintbrush; label: string; shortcut: string }

const toolGroups: { label: string; tools: ToolItem[] }[] = [
  {
    label: "Navigation",
    tools: [
      { id: "hand", icon: Hand, label: "Pan / Move (scroll to pan)", shortcut: "H" },
    ],
  },
  {
    label: "Drawing",
    tools: [
      { id: "brush", icon: Paintbrush, label: "Brush", shortcut: "B" },
      { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
      { id: "clone", icon: Copy, label: "Clone Stamp (Alt+Click to set source)", shortcut: "C" },
    ],
  },
  {
    label: "Retouching",
    tools: [
      { id: "smudge", icon: Droplets, label: "Smudge", shortcut: "S" },
      { id: "blur", icon: CircleDot, label: "Blur", shortcut: "U" },
      { id: "sharpen", icon: Sparkles, label: "Sharpen", shortcut: "P" },
    ],
  },
  {
    label: "Lighting",
    tools: [
      { id: "dodge", icon: Sun, label: "Dodge (Lighten)", shortcut: "O" },
      { id: "burn", icon: Moon, label: "Burn (Darken)", shortcut: "N" },
    ],
  },
]

const panels: { id: "filters" | "brush" | "transform" | "history"; icon: typeof Sliders; label: string }[] = [
  { id: "brush", icon: Palette, label: "Brush Settings" },
  { id: "filters", icon: Sliders, label: "Filters & Adjustments" },
  { id: "transform", icon: Move, label: "Transform" },
  { id: "history", icon: History, label: "History" },
]

export function Toolbar({ tool, setTool, activePanel, setActivePanel }: ToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex w-14 flex-col items-center gap-1 border-r border-border bg-card py-3">
        {/* Drawing Tools */}
        <div className="flex flex-col gap-1 px-2">
          {tools.map((t) => (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-10 text-muted-foreground hover:bg-secondary hover:text-foreground",
                    tool === t.id && "bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary"
                  )}
                  onClick={() => setTool(t.id)}
                >
                  <t.icon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>{t.label}</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                  {t.shortcut}
                </kbd>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <div className="my-2 h-px w-8 bg-border" />
        
        {/* Panels */}
        <div className="flex flex-col gap-1 px-2">
          {panels.map((p) => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-10 text-muted-foreground hover:bg-secondary hover:text-foreground",
                    activePanel === p.id && "bg-accent/20 text-accent hover:bg-accent/30 hover:text-accent"
                  )}
                  onClick={() => setActivePanel(activePanel === p.id ? null : p.id)}
                >
                  <p.icon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {p.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
