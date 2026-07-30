export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-400">
        {icon || (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7L9 4H5a2 2 0 0 0-2 2Z" /></svg>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-brand-900">{title}</h3>
      {message && <p className="max-w-sm text-sm text-brand-500">{message}</p>}
      {action}
    </div>
  )
}
