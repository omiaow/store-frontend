import { useState, useRef, useEffect, useCallback } from 'react'
import './FloatingActionButton.css'

function FloatingActionButton({ count, isVisible, initialPosition, onClick }) {
  const isMobile = useCallback(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768
  }, [])
  
  const getDefaultPosition = useCallback(() => {
    if (typeof window === 'undefined') {
      return { x: 100, y: 100 }
    }
    
    const y = window.innerHeight - 150
    // Desktop: right side, Mobile: left side
    const x = isMobile() ? 50 : window.innerWidth - 100
    
    return { x, y }
  }, [isMobile])
  
  const [position, setPosition] = useState(initialPosition || getDefaultPosition())
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const fabRef = useRef(null)
  const pointerDownRef = useRef(false)
  const dragStartedRef = useRef(false)
  const startPointerRef = useRef({ x: 0, y: 0 })
  const startPositionRef = useRef({ x: 0, y: 0 })
  const DRAG_THRESHOLD_PX = 6

  // Update position when initialPosition changes (for animation from button)
  useEffect(() => {
    if (initialPosition && initialPosition.x !== 0 && initialPosition.y !== 0) {
      setPosition(initialPosition)
      
      // After appearing animation, smoothly move to default position
      const timer = setTimeout(() => {
        setPosition(getDefaultPosition())
      }, 600)
      return () => clearTimeout(timer)
    } else if (!initialPosition && isVisible) {
      // If FAB is visible but no initial position, use default
      setPosition(getDefaultPosition())
    }
  }, [initialPosition, isVisible, getDefaultPosition])

  // Prevent background scroll when dragging
  useEffect(() => {
    if (isDragging) {
      // Prevent body scroll
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isDragging])

  const clampToViewport = useCallback((next) => {
    if (typeof window === 'undefined') return next
    const rect = fabRef.current?.getBoundingClientRect()
    const halfW = rect ? rect.width / 2 : 30
    const halfH = rect ? rect.height / 2 : 30
    const padding = 10
    return {
      x: Math.min(Math.max(next.x, halfW + padding), window.innerWidth - halfW - padding),
      y: Math.min(Math.max(next.y, halfH + padding), window.innerHeight - halfH - padding),
    }
  }, [])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    pointerDownRef.current = true
    dragStartedRef.current = false
    startPointerRef.current = { x: e.clientX, y: e.clientY }
    startPositionRef.current = position

    if (fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect()
      dragOffsetRef.current = {
        x: e.clientX - (rect.left + rect.width / 2),
        y: e.clientY - (rect.top + rect.height / 2),
      }
      fabRef.current.setPointerCapture?.(e.pointerId)
    }
  }

  const handlePointerMove = (e) => {
    if (!pointerDownRef.current) return

    const dx = e.clientX - startPointerRef.current.x
    const dy = e.clientY - startPointerRef.current.y
    const dist = Math.hypot(dx, dy)

    if (!dragStartedRef.current && dist > DRAG_THRESHOLD_PX) {
      dragStartedRef.current = true
      setIsDragging(true)
    }

    if (!dragStartedRef.current) return

    e.preventDefault()
    const next = {
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    }
    setPosition(clampToViewport(next))
  }

  const handlePointerUp = (e) => {
    e.stopPropagation()
    pointerDownRef.current = false

    if (dragStartedRef.current) {
      dragStartedRef.current = false
      setIsDragging(false)
      return
    }

    // A "click" is a press without dragging.
    onClick?.(e)
  }

  if (!isVisible) return null

  return (
    <div
      ref={fabRef}
      className={`floating-action-button ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : undefined
      }}
      role="button"
      tabIndex={0}
      aria-label="Open cart"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(e)
      }}
    >
      <div className="fab-content">
        <span className="fab-count">{count}</span>
      </div>
    </div>
  )
}

export default FloatingActionButton