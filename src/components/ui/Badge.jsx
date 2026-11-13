import clsx from 'clsx'

const variants = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-sm shadow-yellow-500/20',
  info: 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm shadow-sky-500/20',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
  default: 'bg-gray-700/50 text-gray-300 border border-gray-600/40',
}

export function Badge({ variant = 'default', children, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge
