import { initials } from '../../utils/helpers.js'

export default function Avatar({ name = '', size = 'md', src }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
  return (
    <div className={`${sizes[size]} grid place-items-center rounded-full bg-brand-100 font-semibold text-brand-700`}>
      {initials(name)}
    </div>
  )
}
