import { C, F } from '../theme.js'

export const Arc = ({ value, colour, size = 80 }) => {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(value, 1)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colour} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 5px ${colour})`,
          transition: 'stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)',
        }}
      />
    </svg>
  )
}

export const MiniBar = ({ value, colour }) => (
  <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden', flex: 1 }}>
    <div style={{
      width: `${Math.min(value, 1) * 100}%`, height: '100%', background: colour,
      borderRadius: 2, boxShadow: `0 0 6px ${colour}`,
      transition: 'width 0.9s cubic-bezier(.4,0,.2,1)',
    }} />
  </div>
)

export const Tag = ({ children, colour }) => (
  <span style={{
    fontFamily: F.body, fontSize: 10, color: colour,
    background: colour + '18', borderRadius: 4, padding: '2px 8px',
    display: 'inline-block', letterSpacing: 0.5,
  }}>
    {children}
  </span>
)

export const SectionHead = ({ children }) => (
  <div style={{
    fontFamily: F.label, fontSize: 13, color: C.textMuted,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14,
  }}>
    {children}
  </div>
)
