/** Large text / High contrast control with clear On/Off visuals. */
export default function DisplayToggle({ label, pressed, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`display-toggle inline-flex min-h-12 items-center gap-1.5 rounded-lg border-2 px-3 text-sm font-medium ${
        pressed
          ? 'border-ink bg-ink text-white'
          : 'border-line bg-panel text-ink hover:bg-surface'
      }`}
    >
      {pressed ? (
        <span className="text-base leading-none" aria-hidden="true">
          ✓
        </span>
      ) : null}
      <span>{label}</span>
      {pressed ? (
        <span
          className="rounded bg-white/20 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide"
          aria-hidden="true"
        >
          On
        </span>
      ) : null}
      <span className="sr-only">{pressed ? ', on' : ', off'}</span>
    </button>
  )
}
