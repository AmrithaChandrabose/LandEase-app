export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-between gap-2 pt-4">
      <button
        className="btn-secondary px-3 py-1.5 text-xs"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
              p === page ? 'bg-brand-600 text-white' : 'text-brand-600 hover:bg-brand-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        className="btn-secondary px-3 py-1.5 text-xs"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  )
}
