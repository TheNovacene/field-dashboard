import { useState } from 'react'
import { C, F, METRIC_DEFS } from '../theme.js'
import { analyse } from '../utils/analyse.js'
import TextInput from './TextInput.jsx'
import MetricCard from './MetricCard.jsx'
import { MiniBar } from './Primitives.jsx'

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', gap: 16,
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: C.textDim,
      }}>
        ⊙
      </div>
      <div style={{ fontFamily: F.label, fontSize: 16, color: C.textMuted, textAlign: 'center' }}>
        Enter text above to begin analysis
      </div>
      <div style={{ fontFamily: F.body, fontSize: 11, color: C.textDim, textAlign: 'center', maxWidth: 360 }}>
        Field will compute Energy, Symbolic Coherence, Connection², and Impact in real time.
      </div>
    </div>
  )
}

export default function AnalysisTab() {
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [fileName, setFileName] = useState(null)

  const handleAnalyse = (text, name) => {
    const r = analyse(text)
    if (!r) {
      setError('Text is too short to analyse — please provide at least a few sentences.')
      setResult(null)
    } else {
      setResult(r)
      setFileName(name || null)
      setError(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TextInput onAnalyse={handleAnalyse} label="Source Text" />

      {error && (
        <div style={{
          background: C.amberGlow, border: `1px solid ${C.amberDim}`,
          borderRadius: 8, padding: '12px 16px',
          fontFamily: F.body, fontSize: 11, color: C.amber,
        }}>
          ⚠ {error}
        </div>
      )}

      {result ? (
        <>
          {/* document strip */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '11px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 16 }}>📄</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.body, fontSize: 12, color: C.text }}>
                {fileName || 'Pasted text'}
              </div>
              <div style={{ fontFamily: F.body, fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                {result.meta.wordCount.toLocaleString()} words
                &nbsp;·&nbsp; {result.meta.turnCount} turns
                &nbsp;·&nbsp; {result.meta.speakers.length === 1 && result.meta.speakers[0] === 'Unknown'
                  ? 'single voice'
                  : result.meta.speakers.join(', ')}
              </div>
            </div>
            <div style={{
              fontFamily: F.body, fontSize: 10, color: C.amberDim,
              background: C.amberGlow, borderRadius: 4, padding: '3px 10px',
            }}>
              ANALYSED
            </div>
          </div>

          {/* metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {METRIC_DEFS.map((m, i) => (
              <MetricCard
                key={m.id}
                symbol={m.symbol}
                label={m.label}
                colour={m.colour}
                result={result[m.id]}
                index={i}
              />
            ))}
          </div>

          {/* summary bar */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '14px 18px',
            display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <div style={{ fontFamily: F.label, fontSize: 12, color: C.textMuted, minWidth: 60 }}>
              Summary
            </div>
            {METRIC_DEFS.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 100 }}>
                <span style={{ fontFamily: F.body, fontSize: 11, color: m.colour, minWidth: 22 }}>{m.symbol}</span>
                <MiniBar value={result[m.id].value} colour={m.colour} />
                <span style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, minWidth: 28, textAlign: 'right' }}>
                  {result[m.id].value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : !error ? (
        <EmptyState />
      ) : null}
    </div>
  )
}
