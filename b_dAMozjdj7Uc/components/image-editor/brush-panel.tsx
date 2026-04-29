"use client"

import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { BrushSettings, Tool } from "./image-editor"

interface BrushPanelProps {
  brushSettings: BrushSettings
  setBrushSettings: (settings: BrushSettings) => void
  tool: Tool
}

const presetColors = [
  "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
]

const presetSizes = [5, 10, 20, 40, 60, 100]

export function BrushPanel({ brushSettings, setBrushSettings, tool }: BrushPanelProps) {
  const showColor = tool === "brush"
  
  return (
    <div className="w-72 border-r border-border bg-card overflow-y-auto">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Brush Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Active: <span className="capitalize text-primary">{tool}</span>
        </p>
      </div>
      
      <div className="flex flex-col gap-5 p-4">
        {/* Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Size</label>
            <span className="text-xs font-mono text-foreground">{brushSettings.size}px</span>
          </div>
          <Slider
            value={[brushSettings.size]}
            min={1}
            max={200}
            step={1}
            onValueChange={([value]) => {
              setBrushSettings({ ...brushSettings, size: value })
            }}
          />
          <div className="flex flex-wrap gap-1.5">
            {presetSizes.map((size) => (
              <button
                key={size}
                className={cn(
                  "rounded border border-border px-2 py-1 text-xs transition-colors hover:bg-secondary",
                  brushSettings.size === size && "border-primary bg-primary/20 text-primary"
                )}
                onClick={() => setBrushSettings({ ...brushSettings, size })}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        {/* Opacity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Opacity</label>
            <span className="text-xs font-mono text-foreground">{brushSettings.opacity}%</span>
          </div>
          <Slider
            value={[brushSettings.opacity]}
            min={1}
            max={100}
            step={1}
            onValueChange={([value]) => {
              setBrushSettings({ ...brushSettings, opacity: value })
            }}
          />
        </div>
        
        {/* Hardness */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Hardness</label>
            <span className="text-xs font-mono text-foreground">{brushSettings.hardness}%</span>
          </div>
          <Slider
            value={[brushSettings.hardness]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => {
              setBrushSettings({ ...brushSettings, hardness: value })
            }}
          />
        </div>
        
        {/* Color - Only for brush tool */}
        {showColor && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="size-6 rounded border border-border"
                  style={{ backgroundColor: brushSettings.color }}
                />
                <Input
                  type="text"
                  value={brushSettings.color}
                  onChange={(e) => setBrushSettings({ ...brushSettings, color: e.target.value })}
                  className="h-7 w-20 font-mono text-xs"
                />
              </div>
            </div>
            <input
              type="color"
              value={brushSettings.color}
              onChange={(e) => setBrushSettings({ ...brushSettings, color: e.target.value })}
              className="h-10 w-full cursor-pointer rounded border border-border bg-transparent"
            />
            <div className="flex flex-wrap gap-1.5">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "size-7 rounded border-2 transition-transform hover:scale-110",
                    brushSettings.color === color ? "border-primary" : "border-border"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setBrushSettings({ ...brushSettings, color })}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Brush Preview */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Preview</label>
          <div className="flex h-20 items-center justify-center rounded-lg border border-border bg-background">
            <div
              className="rounded-full"
              style={{
                width: Math.min(brushSettings.size, 80),
                height: Math.min(brushSettings.size, 80),
                backgroundColor: showColor ? brushSettings.color : "#888",
                opacity: brushSettings.opacity / 100,
                boxShadow: `0 0 ${(100 - brushSettings.hardness) / 10}px ${showColor ? brushSettings.color : "#888"}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
