import { useEffect, useId, useRef, useState } from 'react'

function AccessibilityIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="4.5" r="2.25" fill="currentColor" />
      <path
        fill="currentColor"
        d="M12 8.25c-3.45 0-6.4 1.55-7.75 2.35-.4.24-.5.75-.25 1.12.24.38.74.5 1.12.27C6.4 11.2 8.95 10 12 10s5.6 1.2 6.88 1.99c.38.23.88.11 1.12-.27.25-.37.15-.88-.25-1.12C18.4 9.8 15.45 8.25 12 8.25zm-3.5 4.5v7.5c0 .55.45 1 1 1s1-.45 1-1V15h1v5.25c0 .55.45 1 1 1s1-.45 1-1V15h1v5.25c0 .55.45 1 1 1s1-.45 1-1v-7.5H8.5z"
      />
    </svg>
  )
}

function SettingToggle({ label, pressed, onClick }) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={pressed}
      onClick={onClick}
      className={`display-toggle flex w-full min-h-12 items-center justify-between gap-3 rounded-lg border-2 px-3 text-left text-sm font-medium ${
        pressed
          ? 'border-ink bg-ink text-white'
          : 'border-line bg-panel text-ink hover:bg-surface'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {pressed ? (
          <span className="text-base leading-none" aria-hidden="true">
            ✓
          </span>
        ) : null}
        <span>{label}</span>
      </span>
      {pressed ? (
        <span
          className="rounded bg-white/20 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide"
          aria-hidden="true"
        >
          On
        </span>
      ) : (
        <span className="text-xs font-semibold text-muted" aria-hidden="true">
          Off
        </span>
      )}
      <span className="sr-only">{pressed ? ', on' : ', off'}</span>
    </button>
  )
}

/** Single accessibility icon that reveals Large text / High contrast. */
export default function AccessibilityMenu({
  largeText,
  highContrast,
  onToggleLargeText,
  onToggleHighContrast,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()
  const anyOn = largeText || highContrast

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label={`Accessibility settings${anyOn ? ', some options on' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`display-toggle relative inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border-2 ${
          open || anyOn
            ? 'border-ink bg-ink text-white'
            : 'border-line bg-panel text-ink hover:bg-surface'
        }`}
      >
        <AccessibilityIcon />
        {anyOn ? (
          <span
            className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-engineer ring-2 ring-panel"
            aria-hidden="true"
          />
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Accessibility"
          className="absolute right-0 z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border-2 border-line bg-panel p-2 shadow-lg"
        >
          <div className="space-y-2">
            <SettingToggle
              label="Large text"
              pressed={largeText}
              onClick={onToggleLargeText}
            />
            <SettingToggle
              label="High contrast"
              pressed={highContrast}
              onClick={onToggleHighContrast}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
