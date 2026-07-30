const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  clay: 'btn-clay',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

export default function Button({ variant = 'primary', as: As = 'button', className = '', children, ...props }) {
  return (
    <As className={`${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </As>
  )
}
