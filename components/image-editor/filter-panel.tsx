"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import type { Filters } from "./image-editor"

interface FilterPanelProps {
  filters: Filters
  setFilters: (filters: Filters) => void
}

const filterControls: {
  key: keyof Filters
  label: string
  min: number
  max: number
  default: number
  unit: string
}[] = [
  { key: "brightness", label: "Brightness", min: 0, max: 200, default: 100, unit: "%" },
  { key: "contrast", label: "Contrast", min: 0, max: 200, default: 100, unit: "%" },
  { key: "saturation", label: "Saturation", min: 0, max: 200, default: 100, unit: "%" },
  { key: "hue", label: "Hue Rotate", min: -180, max: 180, default: 0, unit: "°" },
  { key: "blur", label: "Blur", min: 0, max: 20, default: 0, unit: "px" },
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, default: 0, unit: "%" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, default: 0, unit: "%" },
  { key: "invert", label: "Invert", min: 0, max: 100, default: 0, unit: "%" },
]

export function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  const handleReset = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sharpen: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    })
  }

  return (
    <div className="w-72 border-r border-border bg-card overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Filters & Adjustments</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 p-4">
        {filterControls.map((control) => (
          <div key={control.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">{control.label}</label>
              <span className="text-xs font-mono text-foreground">
                {filters[control.key]}{control.unit}
              </span>
            </div>
            <Slider
              value={[filters[control.key]]}
              min={control.min}
              max={control.max}
              step={1}
              onValueChange={([value]) => {
                setFilters({ ...filters, [control.key]: value })
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Presets */}
      <div className="border-t border-border px-4 py-3">
        <h3 className="mb-3 text-sm font-medium text-foreground">Quick Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setFilters({ ...filters, grayscale: 100 })}
          >
            B&W
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setFilters({ ...filters, sepia: 80, contrast: 110 })}
          >
            Vintage
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setFilters({ ...filters, saturation: 140, contrast: 115 })}
          >
            Vivid
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setFilters({ ...filters, brightness: 110, contrast: 90, saturation: 85 })}
          >
            Soft
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setFilters({ ...filters, contrast: 130, brightness: 95 })}
          >
            Drama
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setFilters({ ...filters, hue: 180 })}
          >
            Cool
          </Button>
        </div>
      </div>
    </div>
  )
}
