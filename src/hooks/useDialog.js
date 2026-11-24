import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function isVisible(el) {
  return el.getClientRects().length > 0
}

/** Focus trap, Escape, and restore focus for modal panels. */
export function useDialog({ open, onClose, initialFocusRef, restoreFocusRef }) {
  const containerRef = useRef(null)
  const previousFocus = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    previousFocus.current = document.activeElement

    const node = containerRef.current
    const root = document.getElementById('root')
    const portaled = Boolean(node && root && !root.contains(node))
    if (portaled) root.inert = true

    const focusTarget =
      initialFocusRef?.current || node?.querySelector(FOCUSABLE)
    focusTarget?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab' || !node) return
      const focusable = [...node.querySelectorAll(FOCUSABLE)].filter(isVisible)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const inside = node.contains(active)
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (portaled) root.inert = false
      const shouldRestore = restoreFocusRef ? restoreFocusRef.current !== false : true
      const previous = previousFocus.current
      if (
        shouldRestore &&
        previous?.isConnected &&
        typeof previous.focus === 'function'
      ) {
        previous.focus()
      }
    }
  }, [open, initialFocusRef, restoreFocusRef])

  return containerRef
}
