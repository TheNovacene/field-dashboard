import { useState } from 'react'
import { C, F } from '../theme.js'
import { Arc } from './Primitives.jsx'

export default function MetricCard({ symbol, label, colour, result, index = 0 }) {
  const [open, setOpen] = useState(false)
  const { value, breakdown } = result

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${open ? colour + '55' : C.border}`,
      borderRadius: 8,
      padding: '18px 20px',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      boxShadow: open ? `0 0 24px ${colour}14` : 'none',
      animation: `fadeUp 0.5s ease ${index * 0.07}s both`,
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Arc value={value} colour={colour} size={68} />
          <div>
            <div style={{
              fontFamily: F.display, fontSize: 26, color: colour, lineHeight: 1,
              textShadow: `0 0 14px ${colour}66`,
              transition: 'text-shadow 0.3s',
            }}>
              {value.toFixed(2)}
            </div>
            <div style={{ fontFamily: F.label, fontSize: 12, color: C.textMuted, marginTop: 3 }}>
              {symbol}  ·  {label}
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          title="Show calculation"
          style={{
            background: open ? colour + '22' : 'transparent',
            border: `1px solid ${open ? colour : C.borderLight}`,
            borderRadius: 6, width: 30, height: 30, cursor: 'pointer',
            color: open ? colour : C.textMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          ℹ
        </button>
      </div>

      {/* interpretation pill */}
      {breakdown.note && (
        <div style={{
          fontFamily: F.body, fontSize: 10, color: colour,
          background: colour + '14', borderRadius: 4,
          padding: '3px 9px', display: 'inline-block',
          marginBottom: open ? 14 : 0,
        }}>
          {breakdown.note}
        </div>
      )}

      {/* expandable breakdown */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? 500 : 0,
        transition: 'max-height 0.45s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: breakdown.note ? 0 : 14 }}>
          <div style={{ fontFamily: F.body, fontSize: 10, color: C.textMuted, marginBottom: 10 }}>
            {breakdown.summary}
          </div>

          {breakdown.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{
                color: colour, fontFamily: F.body, fontSize: 10,
                minWidth: 120, flexShrink: 0, lineHeight: 1.5,
              }}>
                {step.label}
              </span>
              <span style={{ color: C.text, fontFamily: F.body, fontSize: 10, lineHeight: 1.6 }}>
                {step.detail}
              </span>
            </div>
          ))}

          <div style={{
            background: C.bg, borderRadius: 6, padding: '10px 14px', marginTop: 10,
            borderLeft: `2px solid ${colour}`,
          }}>
            <div style={{ fontFamily: F.body, fontSize: 10, color: colour, marginBottom: 4, fontStyle: 'italic' }}>
              {breakdown.formula}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 10, color: C.text }}>
              {breakdown.calculation}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
