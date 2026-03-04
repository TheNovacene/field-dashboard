import { useState } from 'react'
import { C, F } from '../theme.js'

const METRICS_EXPLAINED = [
  {
    symbol: 'E',
    name: 'Energy',
    colour: C.amber,
    tagline: 'Who is speaking, and how much?',
    desc: 'Measures conversational volume and how equitably distributed the voice is across speakers. High energy with one speaker may indicate monologue; balanced energy suggests genuine exchange.',
  },
  {
    symbol: 's',
    name: 'Symbolic Coherence',
    colour: C.cyan,
    tagline: 'Is the language doing real work?',
    desc: 'Analyses lexical richness, depth of expression, and penalises hollow jargon. High coherence means the words carry genuine meaning rather than performing it.',
  },
  {
    symbol: 'c²',
    name: 'Connection²',
    colour: C.purple,
    tagline: 'Is the signal landing clearly?',
    desc: 'Detects friction — misread markers, clarification requests, excessive questioning — and measures how smoothly meaning is passing between speakers. Squared because poor connection degrades everything else exponentially.',
  },
  {
    symbol: 'I',
    name: 'Impact',
    colour: C.amber,
    tagline: 'What will remain after the conversation ends?',
    desc: 'The derived score. High-energy, coherent exchanges that connect well leave meaningful residue. Calculated as (E × s) / c² — connection quality acts as the denominator because even brilliant content loses its effect if it doesn\'t land.',
  },
]

export default function IntroPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.borderLight}`,
      borderRadius: 10,
      marginBottom: 24,
      overflow: 'hidden',
    }}>
      {/* always-visible summary */}
      <div style={{ padding: '20px 26px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{
          width: 4, flexShrink: 0, alignSelf: 'stretch',
          background: `linear-gradient(to bottom, ${C.amber}, ${C.purple})`,
          borderRadius: 2,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.display, fontSize: 16, color: C.text, marginBottom: 8, lineHeight: 1.5 }}>
            Most tools measure <em>what</em> was said. Field measures <em>how it landed</em>.
          </div>
          <div style={{ fontFamily: F.label, fontSize: 14, color: C.textMuted, lineHeight: 1.7 }}>
            Paste any text — a conversation, a document, an interview transcript, a policy draft — and Field
            analyses it across four relational dimensions: the energy it carries, the coherence of its language,
            the quality of its connection, and the impact it is likely to leave behind.
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              marginTop: 12, background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 5, padding: '5px 14px', cursor: 'pointer',
              fontFamily: F.body, fontSize: 11, color: C.textMuted,
              transition: 'all 0.2s',
            }}
          >
            {open ? '↑ Less' : '↓ How are the metrics calculated?'}
          </button>
        </div>
      </div>

      {/* expandable metric explainers */}
      <div style={{
        maxHeight: open ? 600 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 1, borderTop: `1px solid ${C.border}`,
        }}>
          {METRICS_EXPLAINED.map((m, i) => (
            <div key={m.symbol} style={{
              padding: '16px 22px',
              borderRight: i % 2 === 0 ? `1px solid ${C.border}` : 'none',
              borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: F.display, fontSize: 20, color: m.colour }}>{m.symbol}</span>
                <span style={{ fontFamily: F.label, fontSize: 13, color: m.colour }}>{m.name}</span>
              </div>
              <div style={{ fontFamily: F.label, fontSize: 12, color: C.text, fontStyle: 'italic', marginBottom: 6 }}>
                {m.tagline}
              </div>
              <div style={{ fontFamily: F.label, fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>
                {m.desc}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          padding: '12px 26px', borderTop: `1px solid ${C.border}`,
          fontFamily: F.body, fontSize: 10, color: C.textDim, lineHeight: 1.7,
        }}>
          Field is part of the Verse-ality relational intelligence framework. It does not measure consciousness,
          emotion, or intent — only the observable structural properties of language in context.
          Scores are heuristics, not verdicts.
        </div>
      </div>
    </div>
  )
}
