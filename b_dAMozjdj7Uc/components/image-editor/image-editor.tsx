"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Toolbar } from "./toolbar"
import { FilterPanel } from "./filter-panel"
import { BrushPanel } from "./brush-panel"
import { TransformPanel } from "./transform-panel"
import { HistoryPanel } from "./history-panel"
import {
  Upload,
  Download,
  Undo2,
  Redo2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export type Tool = "brush" | "eraser" | "smudge" | "blur" | "sharpen" | "dodge" | "burn" | "clone" | "hand"
export type BrushSettings = {
  size: number
  opacity: number
  hardness: number
  color: string
}

export type Filters = {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
  sharpen: number
  grayscale: number
  sepia: number
  invert: number
}

export type Transform = {
  rotation: number
  scaleX: number
  scaleY: number
  flipX: boolean
  flipY: boolean
}

export type HistoryEntry = {
  imageData: ImageData
  timestamp: number
  action: string
}

const defaultFilters: Filters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  sharpen: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
}

const defaultTransform: Transform = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  flipX: false,
  flipY: false,
}

const defaultBrushSettings: BrushSettings = {
  size: 20,
  opacity: 100,
  hardness: 80,
  color: "#3b82f6",
}

export function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>("brush")
  const [brushSettings, setBrushSettings] = useState<BrushSettings>(defaultBrushSettings)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [transform, setTransform] = useState<Transform>(defaultTransform)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [activePanel, setActivePanel] = useState<"filters" | "brush" | "transform" | "history" | null>(null)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)
  const [cloneSource, setCloneSource] = useState<{ x: number; y: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  
  const saveToHistory = useCallback((action: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newEntry: HistoryEntry = {
      imageData,
      timestamp: Date.now(),
      action,
    }
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      return [...newHistory, newEntry].slice(-50)
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])
  
  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const newIndex = historyIndex - 1
    const entry = history[newIndex]
    if (entry) {
      ctx.putImageData(entry.imageData, 0, 0)
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])
  
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const newIndex = historyIndex + 1
    const entry = history[newIndex]
    if (entry) {
      ctx.putImageData(entry.imageData, 0, 0)
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])
  
  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const filterString = [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `hue-rotate(${filters.hue}deg)`,
      `blur(${filters.blur}px)`,
      `grayscale(${filters.grayscale}%)`,
      `sepia(${filters.sepia}%)`,
      `invert(${filters.invert}%)`,
    ].join(" ")
    
    ctx.filter = filterString
    
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((transform.rotation * Math.PI) / 180)
    ctx.scale(
      transform.scaleX * (transform.flipX ? -1 : 1),
      transform.scaleY * (transform.flipY ? -1 : 1)
    )
    ctx.translate(-canvas.width / 2, -canvas.height / 2)
    
    const aspectRatio = image.width / image.height
    let drawWidth = canvas.width
    let drawHeight = canvas.height
    
    if (aspectRatio > canvas.width / canvas.height) {
      drawHeight = canvas.width / aspectRatio
    } else {
      drawWidth = canvas.height * aspectRatio
    }
    
    const x = (canvas.width - drawWidth) / 2
    const y = (canvas.height - drawHeight) / 2
    
    ctx.drawImage(image, x, y, drawWidth, drawHeight)
    ctx.restore()
  }, [image, filters, transform])
  
  const loadImage = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setImage(img)
        const canvas = canvasRef.current
        if (!canvas) return
        
        const container = containerRef.current
        if (container) {
          const maxWidth = container.clientWidth - 48
          const maxHeight = container.clientHeight - 48
          const aspectRatio = img.width / img.height
          
          if (aspectRatio > maxWidth / maxHeight) {
            canvas.width = Math.min(img.width, maxWidth)
            canvas.height = canvas.width / aspectRatio
          } else {
            canvas.height = Math.min(img.height, maxHeight)
            canvas.width = canvas.height * aspectRatio
          }
        }
        
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          saveToHistory("Load image")
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [saveToHistory])
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      loadImage(file)
    }
  }
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      loadImage(file)
    }
  }, [loadImage])
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  
  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }
  
  const drawBrush = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    prevX?: number,
    prevY?: number
  ) => {
    const { size, opacity, hardness, color } = brushSettings
    
    ctx.save()
    ctx.globalAlpha = opacity / 100
    
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0,0,0,1)"
      ctx.beginPath()
      ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (tool === "brush") {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2)
      gradient.addColorStop(0, color)
      gradient.addColorStop(hardness / 100, color)
      gradient.addColorStop(1, `${color}00`)
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      ctx.fill()
      
      if (prevX !== undefined && prevY !== undefined) {
        ctx.strokeStyle = color
        ctx.lineWidth = size * (hardness / 100)
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    } else if (tool === "smudge" && prevX !== undefined && prevY !== undefined) {
      const canvas = canvasRef.current!
      const srcData = ctx.getImageData(
        Math.max(0, prevX - size / 2),
        Math.max(0, prevY - size / 2),
        size,
        size
      )
      
      ctx.globalAlpha = 0.3 * (opacity / 100)
      ctx.putImageData(srcData, x - size / 2, y - size / 2)
    } else if (tool === "blur") {
      const canvas = canvasRef.current!
      const srcData = ctx.getImageData(
        Math.max(0, x - size / 2),
        Math.max(0, y - size / 2),
        Math.min(size, canvas.width - x + size / 2),
        Math.min(size, canvas.height - y + size / 2)
      )
      
      const blurredData = applyBoxBlur(srcData, 2)
      ctx.globalAlpha = 0.5 * (opacity / 100)
      ctx.putImageData(blurredData, Math.max(0, x - size / 2), Math.max(0, y - size / 2))
    } else if (tool === "sharpen") {
      const srcData = ctx.getImageData(
        Math.max(0, x - size / 2),
        Math.max(0, y - size / 2),
        size,
        size
      )
      
      const sharpenedData = applySharpen(srcData)
      ctx.globalAlpha = 0.5 * (opacity / 100)
      ctx.putImageData(sharpenedData, Math.max(0, x - size / 2), Math.max(0, y - size / 2))
    } else if (tool === "dodge") {
      const srcData = ctx.getImageData(
        Math.max(0, x - size / 2),
        Math.max(0, y - size / 2),
        size,
        size
      )
      
      for (let i = 0; i < srcData.data.length; i += 4) {
        srcData.data[i] = Math.min(255, srcData.data[i] + 10)
        srcData.data[i + 1] = Math.min(255, srcData.data[i + 1] + 10)
        srcData.data[i + 2] = Math.min(255, srcData.data[i + 2] + 10)
      }
      
      ctx.globalAlpha = 0.3 * (opacity / 100)
      ctx.putImageData(srcData, Math.max(0, x - size / 2), Math.max(0, y - size / 2))
    } else if (tool === "burn") {
      const srcData = ctx.getImageData(
        Math.max(0, x - size / 2),
        Math.max(0, y - size / 2),
        size,
        size
      )
      
      for (let i = 0; i < srcData.data.length; i += 4) {
        srcData.data[i] = Math.max(0, srcData.data[i] - 10)
        srcData.data[i + 1] = Math.max(0, srcData.data[i + 1] - 10)
        srcData.data[i + 2] = Math.max(0, srcData.data[i + 2] - 10)
      }
      
      ctx.globalAlpha = 0.3 * (opacity / 100)
      ctx.putImageData(srcData, Math.max(0, x - size / 2), Math.max(0, y - size / 2))
    } else if (tool === "clone" && cloneSource) {
      const offsetX = x - cloneSource.x
      const offsetY = y - cloneSource.y
      
      const srcData = ctx.getImageData(
        Math.max(0, x - offsetX - size / 2),
        Math.max(0, y - offsetY - size / 2),
        size,
        size
      )
      
      ctx.globalAlpha = opacity / 100
      ctx.putImageData(srcData, x - size / 2, y - size / 2)
    }
    
    ctx.restore()
  }, [brushSettings, tool, cloneSource])
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!image) return
    
    // Handle panning with hand tool or space+drag
    if (tool === "hand" || e.buttons === 4) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      return
    }
    
    const point = getCanvasPoint(e)
    if (!point) return
    
    if (tool === "clone" && e.altKey) {
      setCloneSource(point)
      return
    }
    
    setIsDrawing(true)
    setLastPoint(point)
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx) {
      drawBrush(ctx, point.x, point.y)
    }
  }, [image, tool, drawBrush, pan])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!image) return
    
    // Handle panning
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      return
    }
    
    if (!isDrawing) return
    
    const point = getCanvasPoint(e)
    if (!point) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx && lastPoint) {
      drawBrush(ctx, point.x, point.y, lastPoint.x, lastPoint.y)
    }
    
    setLastPoint(point)
  }, [isDrawing, isPanning, image, lastPoint, drawBrush, panStart])
  
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
      return
    }
    if (isDrawing) {
      saveToHistory(`${tool} stroke`)
    }
    setIsDrawing(false)
    setLastPoint(null)
  }, [isDrawing, isPanning, tool, saveToHistory])
  
  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement("a")
    link.download = "edited-image.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }
  
  const resetAll = () => {
    setFilters(defaultFilters)
    setTransform(defaultTransform)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    if (image) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        saveToHistory("Reset")
      }
    }
  }
  
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.25, 5))
  }, [])
  
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.25, 0.1))
  }, [])
  
  const handleFitToScreen = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)))
    } else if (image) {
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }))
    }
  }, [image])
  
  useEffect(() => {
    if (image && (filters !== defaultFilters || transform !== defaultTransform)) {
      applyFilters()
    }
  }, [filters, transform, image, applyFilters])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      const key = e.key.toLowerCase()
      
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (key === "=" || key === "+")) {
        e.preventDefault()
        handleZoomIn()
      } else if ((e.ctrlKey || e.metaKey) && key === "-") {
        e.preventDefault()
        handleZoomOut()
      } else if ((e.ctrlKey || e.metaKey) && key === "0") {
        e.preventDefault()
        handleFitToScreen()
      }
      // Tool shortcuts
      else if (key === "h") setTool("hand")
      else if (key === "b") setTool("brush")
      else if (key === "e") setTool("eraser")
      else if (key === "s") setTool("smudge")
      else if (key === "u") setTool("blur")
      else if (key === "p") setTool("sharpen")
      else if (key === "o") setTool("dodge")
      else if (key === "n") setTool("burn")
      else if (key === "c") setTool("clone")
      // Undo/Redo
      else if ((e.ctrlKey || e.metaKey) && key === "z" && e.shiftKey) {
        e.preventDefault()
        redo()
      } else if ((e.ctrlKey || e.metaKey) && key === "z") {
        e.preventDefault()
        undo()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleFitToScreen, undo, redo])
  
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">PE</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Photo Editor</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="text-muted-foreground hover:text-foreground"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="text-muted-foreground hover:text-foreground"
          >
            <Redo2 className="size-4" />
          </Button>
          <div className="mx-2 h-6 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-4" />
          </Button>
          <div className="mx-2 h-6 w-px bg-border" />
          <div className="flex items-center gap-1 rounded-md bg-secondary px-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={!image || zoom <= 0.1}
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="min-w-[52px] text-center text-sm font-medium text-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={!image || zoom >= 5}
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFitToScreen}
              disabled={!image}
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Maximize2 className="size-4" />
            </Button>
          </div>
          <div className="mx-2 h-6 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground"
          >
            <Upload className="size-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={downloadImage}
            disabled={!image}
            className="gap-2"
          >
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar
          tool={tool}
          setTool={setTool}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
        
        {/* Side Panels */}
        {activePanel === "filters" && (
          <FilterPanel filters={filters} setFilters={setFilters} />
        )}
        {activePanel === "brush" && (
          <BrushPanel
            brushSettings={brushSettings}
            setBrushSettings={setBrushSettings}
            tool={tool}
          />
        )}
        {activePanel === "transform" && (
          <TransformPanel transform={transform} setTransform={setTransform} />
        )}
        {activePanel === "history" && (
          <HistoryPanel
            history={history}
            historyIndex={historyIndex}
            setHistoryIndex={setHistoryIndex}
            canvasRef={canvasRef}
          />
        )}
        
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden bg-background"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onWheel={handleWheel}
        >
          {/* Checkered background pattern for transparency */}
          <div 
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #808080 25%, transparent 25%),
                linear-gradient(-45deg, #808080 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #808080 75%),
                linear-gradient(-45deg, transparent 75%, #808080 75%)
              `,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          />
          
          {!image ? (
            <div
              className="flex h-full w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 transition-colors hover:border-primary/50 hover:bg-card m-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mb-4 size-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium text-foreground">
                Drop an image here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, GIF, WebP
              </p>
            </div>
          ) : (
            <div 
              className="relative"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.1s ease-out",
              }}
            >
              <canvas
                ref={canvasRef}
                className="rounded-lg shadow-2xl ring-1 ring-border/50"
                style={{ 
                  cursor: getCursor(tool, isPanning),
                  imageRendering: zoom > 2 ? "pixelated" : "auto",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          )}
          
          {/* Zoom indicator in corner */}
          {image && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-md bg-card/90 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <span>{Math.round(zoom * 100)}%</span>
              {pan.x !== 0 || pan.y !== 0 ? (
                <span className="text-xs">
                  ({Math.round(pan.x)}, {Math.round(pan.y)})
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  )
}

function getCursor(tool: Tool, isPanning?: boolean): string {
  if (isPanning) return "grabbing"
  
  switch (tool) {
    case "hand":
      return "grab"
    case "brush":
    case "clone":
      return "crosshair"
    case "eraser":
      return "cell"
    case "smudge":
      return "grab"
    case "blur":
    case "sharpen":
      return "zoom-in"
    case "dodge":
    case "burn":
      return "pointer"
    default:
      return "default"
  }
}

function applyBoxBlur(imageData: ImageData, radius: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx
          const ny = y + dy
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4
            r += imageData.data[idx]
            g += imageData.data[idx + 1]
            b += imageData.data[idx + 2]
            count++
          }
        }
      }
      
      const idx = (y * width + x) * 4
      data[idx] = r / count
      data[idx + 1] = g / count
      data[idx + 2] = b / count
    }
  }
  
  return new ImageData(data, width, height)
}

function applySharpen(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height
  
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const k = kernel[(ky + 1) * 3 + (kx + 1)]
          r += imageData.data[idx] * k
          g += imageData.data[idx + 1] * k
          b += imageData.data[idx + 2] * k
        }
      }
      
      const idx = (y * width + x) * 4
      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
    }
  }
  
  return new ImageData(data, width, height)
}
