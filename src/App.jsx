import { useState, useEffect } from 'react'
import { C, F } from './theme.js'
import IntroPanel from './components/IntroPanel.jsx'
import AnalysisTab from './components/AnalysisTab.jsx'
import ComparisonTab from './components/ComparisonTab.jsx'

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'DM Mono', 'Courier New', monospace;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.borderLight}; border-radius: 3px; }
  textarea::placeholder { color: ${C.textDim}; font-style: italic; }
  textarea { caret-color: ${C.amber}; }
  button:focus-visible { outline: 2px solid ${C.amber}; outline-offset: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

export default function App() {
  const [tab, setTab]       = useState('analysis')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* ── Header ── */}
      <header style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: '20px 32px 16px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(6px)',
          transition: 'opacity 0.6s, transform 0.6s',
        }}>
          <div style={{
            fontFamily: F.display, fontSize: 22, color: C.amber,
            textShadow: `0 0 28px ${C.amber}44`, letterSpacing: 0.5,
          }}>
            Field
          </div>
          <div style={{
            fontFamily: F.body, fontSize: 10, color: C.textMuted,
            marginTop: 2, letterSpacing: 2.5, textTransform: 'uppercase',
          }}>
            Relational Intelligence Dashboard  ·  v0.2
          </div>
        </div>

        {/* tab bar */}
        <nav style={{
          display: 'flex', background: C.bg, borderRadius: 6,
          padding: 3, border: `1px solid ${C.border}`,
        }}>
          {[['analysis', 'Analysis'], ['compare', 'Compare']].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              fontFamily: F.body, fontSize: 11, padding: '7px 20px',
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: tab === id ? C.amber : 'transparent',
              color: tab === id ? C.bg : C.textMuted,
              fontWeight: tab === id ? 'bold' : 'normal',
              letterSpacing: 0.5,
              transition: 'all 0.2s',
            }}>
              {lbl}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Body ── */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 80px' }}>
        <IntroPanel />

        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
          {tab === 'analysis' && <AnalysisTab />}
          {tab === 'compare'  && <ComparisonTab />}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`, padding: '14px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: F.body, fontSize: 10, color: C.textDim }}>
          Field · part of the Verse-ality relational intelligence framework
        </span>
        <span style={{ fontFamily: F.body, fontSize: 10, color: C.textDim }}>
          Scores are heuristics, not verdicts
        </span>
      </footer>
    </>
  )
}
