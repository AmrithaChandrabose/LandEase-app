export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="bg-blue-500 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brand-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
