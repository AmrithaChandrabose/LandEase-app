import { useState } from 'react'

export default function ImageGallery({ images = [], title = '' }) {
  const [active, setActive] = useState(0)
  if (!images.length) {
    return <div className="grid h-72 place-items-center rounded-2xl bg-brand-50 text-brand-300">No images</div>
  }
  return (
    <div>
      <div className="overflow-hidden rounded-2xl">
        <img src={images[active]} alt={`${title} ${active + 1}`} className="h-72 w-full object-cover sm:h-96" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
