import { useState } from 'react'
import { C, F, METRIC_DEFS } from '../theme.js'
import { analyse, compareTexts } from '../utils/analyse.js'
import TextInput from './TextInput.jsx'
import NetworkGraph from './NetworkGraph.jsx'
import { MiniBar } from './Primitives.jsx'

function MetricRow({ metric, valueA, valueB, labelA, labelB }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '14px 18px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: F.label, fontSize: 14, color: metric.colour }}>
          {metric.symbol}  {metric.label}
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[[labelA, valueA, C.blue], [labelB, valueB, C.red]].map(([lbl, v, col]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: F.display, fontSize: 22, color: col,
                textShadow: `0 0 12px ${col}55`,
              }}>
                {v.toFixed(2)}
              </div>
              <div style={{ fontFamily: F.body, fontSize: 10, color: C.textMuted }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{
          flex: valueA, height: 4, background: C.blue, borderRadius: 2,
          boxShadow: `0 0 5px ${C.blue}55`, transition: 'flex 0.8s',
        }} />
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.borderLight, flexShrink: 0 }} />
        <div style={{
          flex: valueB, height: 4, background: C.red, borderRadius: 2,
          boxShadow: `0 0 5px ${C.red}55`, transition: 'flex 0.8s',
        }} />
      </div>
    </div>
  )
}

export default function ComparisonTab() {
  const [textA, setTextA]         = useState(null)
  const [textB, setTextB]         = useState(null)
  const [nameA, setNameA]         = useState('Document A')
  const [nameB, setNameB]         = useState('Document B')
  const [resultsA, setResultsA]   = useState(null)
  const [resultsB, setResultsB]   = useState(null)
  const [comparison, setComparison] = useState(null)
  const [subTab, setSubTab]       = useState('metrics')

  const handleA = (text, name) => {
    setTextA(text)
    setNameA(name || 'Document A')
    setResultsA(analyse(text))
    if (textB) setComparison(compareTexts(text, textB))
  }

  const handleB = (text, name) => {
    setTextB(text)
    setNameB(name || 'Document B')
    setResultsB(analyse(text))
    if (textA) setComparison(compareTexts(textA, text))
  }

  const ready = resultsA && resultsB && comparison

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* two inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <TextInput onAnalyse={handleA} label={nameA} compact />
        <TextInput onAnalyse={handleB} label={nameB} compact />
      </div>

      {!ready && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '50px 24px', gap: 12,
        }}>
          <div style={{ fontFamily: F.label, fontSize: 15, color: C.textMuted }}>
            {!resultsA && !resultsB
              ? 'Enter two texts to compare'
              : !resultsA
              ? 'Waiting for Document A…'
              : 'Waiting for Document B…'}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[resultsA, resultsB].map((r, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: r ? C.amber : C.border,
                boxShadow: r ? `0 0 8px ${C.amber}` : 'none',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      )}

      {ready && (
        <>
          {/* sub-tab bar */}
          <div style={{
            display: 'flex', gap: 0, background: C.bg, borderRadius: 6,
            padding: 3, border: `1px solid ${C.border}`, alignSelf: 'flex-start',
          }}>
            {[['metrics', 'Metrics'], ['network', 'Network'], ['overlap', 'Overlap']].map(([id, lbl]) => (
              <button key={id} onClick={() => setSubTab(id)} style={{
                fontFamily: F.body, fontSize: 11, padding: '6px 16px', borderRadius: 4,
                border: 'none', cursor: 'pointer',
                background: subTab === id ? C.amberDim : 'transparent',
                color: subTab === id ? C.amber : C.textMuted,
                transition: 'all 0.2s',
              }}>
                {lbl}
              </button>
            ))}
          </div>

          {/* document labels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[[nameA, C.blue], [nameB, C.red]].map(([name, col]) => (
              <div key={name} style={{
                background: C.surface, border: `1px solid ${col}33`,
                borderRadius: 6, padding: '9px 14px',
                fontFamily: F.body, fontSize: 11, color: col,
              }}>
                📄 {name}
              </div>
            ))}
          </div>

          {/* metrics sub-tab */}
          {subTab === 'metrics' && (
            <div>
              {METRIC_DEFS.map(m => (
                <MetricRow
                  key={m.id} metric={m}
                  valueA={resultsA[m.id].value}
                  valueB={resultsB[m.id].value}
                  labelA={nameA} labelB={nameB}
                />
              ))}
            </div>
          )}

          {/* network sub-tab */}
          {subTab === 'network' && (
            <NetworkGraph
              comparison={comparison}
              textA={textA} textB={textB}
              labelA={nameA} labelB={nameB}
            />
          )}

          {/* overlap sub-tab */}
          {subTab === 'overlap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* headline */}
              <div style={{
                background: C.surface, border: `1px solid ${C.borderLight}`,
                borderRadius: 8, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 20,
              }}>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{
                    fontFamily: F.display, fontSize: 44, color: C.purple,
                    textShadow: `0 0 24px ${C.purple}88`,
                  }}>
                    {comparison.overlapPercent}%
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: 10, color: C.textMuted }}>conceptual overlap</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F.body, fontSize: 11, color: C.text, marginBottom: 8 }}>
                    {comparison.shared.length} shared concepts out of {comparison.totalConcepts} total
                  </div>
                  <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${comparison.overlapPercent}%`, height: '100%',
                      background: `linear-gradient(90deg, ${C.blue}, ${C.purple}, ${C.red})`,
                      borderRadius: 4, transition: 'width 0.8s',
                    }} />
                  </div>
                </div>
              </div>

              {/* shared concepts */}
              {comparison.shared.length > 0 && (
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '14px 18px',
                }}>
                  <div style={{ fontFamily: F.label, fontSize: 13, color: C.purple, marginBottom: 12 }}>
                    🟣 Shared Concepts
                  </div>
                  {comparison.shared.map(item => (
                    <div key={item.word} style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                      paddingBottom: 8, borderBottom: `1px solid ${C.border}`,
                    }}>
                      <span style={{ flex: 1, fontFamily: F.body, fontSize: 11, color: C.text }}>
                        {item.word}
                      </span>
                      <span style={{ fontFamily: F.body, fontSize: 10, color: C.blue }}>
                        {nameA}: {item.countA}
                      </span>
                      <span style={{ fontFamily: F.body, fontSize: 10, color: C.red }}>
                        {nameB}: {item.countB}
                      </span>
                      <MiniBar value={(item.countA + item.countB) / 40} colour={C.purple} />
                    </div>
                  ))}
                </div>
              )}

              {/* only-in-each */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  [`🔵 ${nameA} Only`, comparison.onlyA, C.blue],
                  [`🔴 ${nameB} Only`, comparison.onlyB, C.red],
                ].map(([title, items, col]) => (
                  <div key={title} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: '14px 16px',
                  }}>
                    <div style={{ fontFamily: F.label, fontSize: 13, color: col, marginBottom: 10 }}>
                      {title}
                    </div>
                    {items.length === 0 ? (
                      <div style={{ fontFamily: F.body, fontSize: 11, color: C.textDim }}>
                        No unique concepts found
                      </div>
                    ) : items.map(i => (
                      <div key={i.word} style={{
                        fontFamily: F.body, fontSize: 11, color: C.textMuted,
                        marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <span style={{ color: col }}>·</span>
                        {i.word}
                        <span style={{ color: C.textDim, fontSize: 10 }}>×{i.count}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
