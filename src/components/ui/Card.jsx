import clsx from 'clsx'

export function Card({ title, children, className, action, noPad = false }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-gray-700/60 bg-gray-800/60 backdrop-blur-sm',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700/60">
          <h3 className="text-sm font-semibold text-gray-200 tracking-wide">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={clsx(!noPad && 'p-5')}>{children}</div>
    </div>
  )
}

export default Card
