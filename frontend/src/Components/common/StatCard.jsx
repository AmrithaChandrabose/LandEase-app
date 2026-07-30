export default function StatCard({ label, value, sublabel, icon, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    clay: 'bg-clay-50 text-clay-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-sky-50 text-sky-600',
  }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-brand-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-brand-400">{sublabel}</p>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${accents[accent]}`}>{icon}</div>
      </div>
    </div>
  )
}
