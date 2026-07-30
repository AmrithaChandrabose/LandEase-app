import { STATUS_STYLES } from '../../utils/constants.js'
import { titleCase } from '../../utils/helpers.js'

export default function Badge({ status, children, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-brand-100 text-brand-700'
  return <span className={`chip ${style} ${className}`}>{children || titleCase(status || '')}</span>
}
