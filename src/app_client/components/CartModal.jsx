import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import './CartModal.css'

function CartModal({ isOpen, items, onIncrease, onDecrease, onRemove, onClose }) {
  const [activeOptionsKey, setActiveOptionsKey] = useState(null)
  const inactivityTimerRef = useRef(null)

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
  }, [])

  const scheduleAutoCloseOptions = useCallback(() => {
    clearInactivityTimer()
    inactivityTimerRef.current = setTimeout(() => {
      setActiveOptionsKey(null)
    }, 5000)
  }, [clearInactivityTimer])

  const bumpInactivity = useCallback(() => {
    if (activeOptionsKey) scheduleAutoCloseOptions()
  }, [activeOptionsKey, scheduleAutoCloseOptions])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setActiveOptionsKey(null)
      clearInactivityTimer()
    }
  }, [isOpen, clearInactivityTimer])

  useEffect(() => {
    if (!activeOptionsKey) {
      clearInactivityTimer()
      return
    }
    scheduleAutoCloseOptions()
    return clearInactivityTimer
  }, [activeOptionsKey, scheduleAutoCloseOptions, clearInactivityTimer])

  const totalItems = useMemo(
    () => (items || []).reduce((sum, it) => sum + (it.quantity || 0), 0),
    [items]
  )

  if (!isOpen) return null

  return (
    <div className="cart-modal-overlay" onMouseDown={() => onClose?.()} role="presentation">
      <div
        className="cart-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={bumpInactivity}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        <div className="cart-modal-header">
          <div className="cart-modal-title">
            Selected products
            <span className="cart-modal-subtitle">{totalItems} items</span>
          </div>
          <button className="cart-modal-close" type="button" onClick={() => onClose?.()} aria-label="Close cart">
            ×
          </button>
        </div>

        <div className="cart-modal-body">
          {(!items || items.length === 0) ? (
            <div className="cart-modal-empty">Your cart is empty.</div>
          ) : (
            <ul className="cart-modal-list">
              {items.map((it) => (
                <li key={it.key} className="cart-modal-item">
                  <div className="cart-modal-item-left">
                    {it.image ? (
                      <img className="cart-modal-item-image" src={it.image} alt={it.name} />
                    ) : (
                      <div className="cart-modal-item-image cart-modal-item-image--placeholder" />
                    )}
                    <div className="cart-modal-item-meta">
                      <div className="cart-modal-item-name">{it.name}</div>
                      {typeof it.price === 'number' && (
                        <div className="cart-modal-item-price">${it.price.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  <div className="cart-modal-item-right">
                    <div className="cart-modal-qty-pill" aria-label={`Quantity ${it.quantity}`}>
                      × {it.quantity}
                    </div>

                    <button
                      className="cart-modal-options-btn"
                      type="button"
                      onClick={() => {
                        setActiveOptionsKey((prev) => (prev === it.key ? null : it.key))
                      }}
                      aria-label={activeOptionsKey === it.key ? `Close options for ${it.name}` : `Open options for ${it.name}`}
                      title="Options"
                    >
                      <span aria-hidden="true">⋯</span>
                    </button>

                    <div
                      className={`cart-modal-actions ${activeOptionsKey === it.key ? 'open' : ''}`}
                      role="group"
                      aria-label={`Actions for ${it.name}`}
                      onPointerDown={bumpInactivity}
                    >
                      <div className="cart-modal-qty-controls" aria-label={`Quantity controls for ${it.name}`}>
                        <button
                          className="cart-modal-qty-btn"
                          type="button"
                          onClick={() => onDecrease?.(it.key)}
                          aria-label={`Decrease ${it.name}`}
                        >
                          –
                        </button>
                        <div className="cart-modal-qty-value" aria-label={`Quantity ${it.quantity}`}>
                          {it.quantity}
                        </div>
                        <button
                          className="cart-modal-qty-btn"
                          type="button"
                          onClick={() => onIncrease?.(it.key)}
                          aria-label={`Increase ${it.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-modal-remove-btn"
                        type="button"
                        onClick={() => onRemove?.(it.key)}
                        aria-label={`Remove ${it.name}`}
                        title="Remove"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M10 12V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 12V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartModal
