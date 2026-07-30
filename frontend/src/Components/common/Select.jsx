export default function Select({ label, value, onChange, options, placeholder, name, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select className="input appearance-none" value={value} onChange={(e) => onChange(e.target.value)} name={name}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const val = typeof o === 'object' ? o.value : o
          const lab = typeof o === 'object' ? o.label : o
          return <option key={val} value={val}>{lab}</option>
        })}
      </select>
    </div>
  )
}
