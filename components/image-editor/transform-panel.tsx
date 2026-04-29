"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { RotateCcw, FlipHorizontal2, FlipVertical2, RotateCw } from "lucide-react"
import type { Transform } from "./image-editor"

interface TransformPanelProps {
  transform: Transform
  setTransform: (transform: Transform) => void
}

export function TransformPanel({ transform, setTransform }: TransformPanelProps) {
  const handleReset = () => {
    setTransform({
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      flipX: false,
      flipY: false,
    })
  }

  return (
    <div className="w-72 border-r border-border bg-card overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Transform</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      
      <div className="flex flex-col gap-5 p-4">
        {/* Rotation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Rotation</label>
            <span className="text-xs font-mono text-foreground">{transform.rotation}°</span>
          </div>
          <Slider
            value={[transform.rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={([value]) => {
              setTransform({ ...transform, rotation: value })
            }}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => setTransform({ ...transform, rotation: transform.rotation - 90 })}
            >
              <RotateCcw className="size-4" />
              -90°
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => setTransform({ ...transform, rotation: transform.rotation + 90 })}
            >
              <RotateCw className="size-4" />
              +90°
            </Button>
          </div>
        </div>
        
        {/* Scale X */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Scale Width</label>
            <span className="text-xs font-mono text-foreground">{(transform.scaleX * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[transform.scaleX * 100]}
            min={10}
            max={200}
            step={1}
            onValueChange={([value]) => {
              setTransform({ ...transform, scaleX: value / 100 })
            }}
          />
        </div>
        
        {/* Scale Y */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Scale Height</label>
            <span className="text-xs font-mono text-foreground">{(transform.scaleY * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[transform.scaleY * 100]}
            min={10}
            max={200}
            step={1}
            onValueChange={([value]) => {
              setTransform({ ...transform, scaleY: value / 100 })
            }}
          />
        </div>
        
        {/* Flip */}
        <div className="space-y-3">
          <label className="text-sm text-muted-foreground">Flip</label>
          <div className="flex gap-2">
            <Button
              variant={transform.flipX ? "default" : "secondary"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setTransform({ ...transform, flipX: !transform.flipX })}
            >
              <FlipHorizontal2 className="size-4" />
              Horizontal
            </Button>
            <Button
              variant={transform.flipY ? "default" : "secondary"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setTransform({ ...transform, flipY: !transform.flipY })}
            >
              <FlipVertical2 className="size-4" />
              Vertical
            </Button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-3">
          <label className="text-sm text-muted-foreground">Quick Actions</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTransform({ ...transform, scaleX: 1, scaleY: 1 })}
            >
              Reset Scale
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTransform({ ...transform, rotation: 0 })}
            >
              Reset Rotation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
