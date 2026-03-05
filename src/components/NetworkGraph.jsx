import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { C, F } from '../theme.js'

const W = 720
const H = 440
const PADDING = 60

const TYPE_COLOURS = {
  shared: C.purple,
  a:      C.blue,
  b:      C.red,
}

// ── Co-occurrence: which concepts appear near each other in the text? ─────────
// Scans a sliding window over the token stream; concepts within the window
// get an edge whose weight increases with proximity.
function buildCoOccurrence(text, concepts) {
  const tokens   = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean)
  const WINDOW   = 30   // tokens either side counts as co-occurring
  const weights  = {}   // "A|||B" -> strength

  const key = (a, b) => [a, b].sort().join('|||')

  // For each token position, find which concepts are present in the window
  const conceptWords = concepts.map(c => ({
    word:   c.word,
    tokens: c.word.split(' '),
  }))

  // Build a presence map: position -> Set of concept indices present
  const presence = new Array(tokens.length).fill(null).map(() => new Set())

  for (let ci = 0; ci < conceptWords.length; ci++) {
    const { tokens: ct } = conceptWords[ci]
    const n = ct.length
    for (let i = 0; i <= tokens.length - n; i++) {
      let match = true
      for (let j = 0; j < n; j++) {
        if (tokens[i + j] !== ct[j]) { match = false; break }
      }
      if (match) {
        for (let k = Math.max(0, i - WINDOW); k < Math.min(tokens.length, i + n + WINDOW); k++) {
          presence[k].add(ci)
        }
      }
    }
  }

  // Count co-occurrences
  for (let i = 0; i < tokens.length; i++) {
    const active = [...presence[i]]
    for (let a = 0; a < active.length; a++) {
      for (let b = a + 1; b < active.length; b++) {
        const k = key(String(active[a]), String(active[b]))
        weights[k] = (weights[k] || 0) + 1
      }
    }
  }

  return weights
}

// ── Force-directed layout ─────────────────────────────────────────────────────
// Runs synchronously for N iterations so the graph is stable on first render.
function runForce(nodes, edges, maxScore, iterations = 250) {
  const REPULSION   = 2800
  const ATTRACTION  = 0.008  // gentle — ideal-distance spring, not a magnet
  const CENTRE_PULL = 0.06   // strong centre gravity
  const DAMPING     = 0.72
  const MIN_DIST    = 20

  const cx = W / 2
  const cy = H / 2

  let vx = nodes.map(() => 0)
  let vy = nodes.map(() => 0)

  for (let iter = 0; iter < iterations; iter++) {
    const fx = new Array(nodes.length).fill(0)
    const fy = new Array(nodes.length).fill(0)

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST)
        const force = REPULSION / (dist * dist)
        const nx = (dx / dist) * force
        const ny = (dy / dist) * force
        fx[i] += nx; fy[i] += ny
        fx[j] -= nx; fy[j] -= ny
      }
    }

    // Attraction along edges — capped so distant nodes aren't flung apart
    const IDEAL_DIST = 120  // edges pull toward this distance, not further
    for (const { a, b, weight } of edges) {
      const dx = nodes[b].x - nodes[a].x
      const dy = nodes[b].y - nodes[a].y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
      // Only attract if further than ideal; repel slightly if too close
      const delta = dist - IDEAL_DIST
      const strength = ATTRACTION * weight * delta / dist
      fx[a] += dx * strength; fy[a] += dy * strength
      fx[b] -= dx * strength; fy[b] -= dy * strength
    }

    // Centre pull — heavier nodes pulled more strongly to prevent corner drift
    for (let i = 0; i < nodes.length; i++) {
      const weight = 1 + (nodes[i].score / maxScore) * 4
      fx[i] += (cx - nodes[i].x) * CENTRE_PULL * weight
      fy[i] += (cy - nodes[i].y) * CENTRE_PULL * weight
    }

    // Integrate with damping
    for (let i = 0; i < nodes.length; i++) {
      vx[i] = (vx[i] + fx[i]) * DAMPING
      vy[i] = (vy[i] + fy[i]) * DAMPING
      const nr = 5 + (nodes[i].score / maxScore) * 20 + 8  // node radius + margin
      nodes[i].x = Math.max(nr, Math.min(W - nr, nodes[i].x + vx[i]))
      nodes[i].y = Math.max(nr, Math.min(H - nr, nodes[i].y + vy[i]))
    }
  }

  return nodes
}

// ── Glow filter defs ──────────────────────────────────────────────────────────
const Defs = () => (
  <defs>
    {[['purple-glow', C.purple], ['blue-glow', C.blue], ['red-glow', C.red], ['amber-glow', C.amber]].map(([id, col]) => (
      <filter key={id} id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    ))}
    <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
)

// ── Main component ────────────────────────────────────────────────────────────
export default function NetworkGraph({ comparison, textA = '', textB = '', labelA = 'A', labelB = 'B' }) {
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const { nodes, edges, maxScore } = useMemo(() => {
    // Build node list
    const allConcepts = [
      ...comparison.shared.map(c => ({ word: c.word, score: c.countA + c.countB, type: 'shared' })),
      ...comparison.onlyA.map(c  => ({ word: c.word, score: c.count,              type: 'a'      })),
      ...comparison.onlyB.map(c  => ({ word: c.word, score: c.count,              type: 'b'      })),
    ]

    const maxScore = Math.max(...allConcepts.map(c => c.score), 1)

    // Seed positions: shared cluster centre, a left, b right
    const seeded = allConcepts.map((c, i) => {
      let baseX, baseY
      if (c.type === 'shared') {
        // Shared nodes seed tightly around centre
        const angle = Math.random() * 2 * Math.PI
        const r = 40 + Math.random() * 40
        baseX = W / 2 + r * Math.cos(angle)
        baseY = H / 2 + r * Math.sin(angle)
      } else if (c.type === 'a') {
        baseX = W * 0.28 + (Math.random() - 0.5) * 100
        baseY = H / 2    + (Math.random() - 0.5) * 120
      } else {
        baseX = W * 0.72 + (Math.random() - 0.5) * 100
        baseY = H / 2    + (Math.random() - 0.5) * 120
      }
      return { ...c, id: i, x: baseX, y: baseY }
    })

    // Build co-occurrence edges
    const combinedText = textA + ' ' + textB
    const coOcc = buildCoOccurrence(combinedText, allConcepts)
    const wordToId = new Map(seeded.map(n => [n.word, n.id]))

    const edges = []
    for (const [k, weight] of Object.entries(coOcc)) {
      const [aWord, bWord] = k.split('|||')
      const aId = wordToId.get(allConcepts[parseInt(aWord)]?.word)
      const bId = wordToId.get(allConcepts[parseInt(bWord)]?.word)
      if (aId !== undefined && bId !== undefined && aId !== bId && weight >= 1) {
        edges.push({ a: aId, b: bId, weight: Math.min(weight, 10) })
      }
    }

    // Deduplicate edges, keep highest weight
    const edgeMap = new Map()
    for (const e of edges) {
      const k = [e.a, e.b].sort().join('-')
      if (!edgeMap.has(k) || edgeMap.get(k).weight < e.weight) edgeMap.set(k, e)
    }
    const dedupedEdges = [...edgeMap.values()].sort((a, b) => b.weight - a.weight).slice(0, 40)

    // Run force layout
    const finalNodes = runForce(seeded, dedupedEdges, maxScore)

    return { nodes: finalNodes, edges: dedupedEdges, maxScore }
  }, [comparison, textA, textB])

  const nodeRadius = (score) => {
    const norm = score / maxScore
    return 5 + norm * 20   // 5px → 25px based on symbolic weight
  }

  const edgeOpacity = (weight) => Math.min(0.1 + (weight / 10) * 0.5, 0.6)
  const edgeWidth   = (weight) => 0.5 + (weight / 10) * 2

  return (
    <div style={{
      background: C.bg, borderRadius: 8, overflow: 'hidden',
      border: `1px solid ${C.border}`, position: 'relative',
    }}>
      {/* legend */}
      <div style={{
        position: 'absolute', top: 12, right: 14,
        display: 'flex', gap: 14, zIndex: 10,
      }}>
        <div style={{ fontFamily: F.body, fontSize: 9, color: C.textDim }}>
          Node size = symbolic weight
        </div>
        {[[`${labelA} only`, C.blue], [`${labelB} only`, C.red], ['Both', C.purple]].map(([lbl, col]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, boxShadow: `0 0 5px ${col}` }} />
            <span style={{ fontFamily: F.body, fontSize: 9, color: C.textMuted }}>{lbl}</span>
          </div>
        ))}
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block' }}
      >
        <Defs />

        {/* subtle grid */}
        {[...Array(8)].map((_, i) => (
          <line key={`v${i}`} x1={i * 103} y1={0} x2={i * 103} y2={H}
            stroke={C.border} strokeWidth={0.3} />
        ))}
        {[...Array(5)].map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 110} x2={W} y2={i * 110}
            stroke={C.border} strokeWidth={0.3} />
        ))}

        {/* edges */}
        {edges.map((e, idx) => {
          const na = nodes[e.a], nb = nodes[e.b]
          if (!na || !nb) return null
          const isHov = hovered === e.a || hovered === e.b
          const col = isHov ? C.amber : C.textDim
          return (
            <line key={idx}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={col}
              strokeWidth={isHov ? edgeWidth(e.weight) * 2 : edgeWidth(e.weight)}
              opacity={isHov ? 0.8 : edgeOpacity(e.weight)}
              filter={isHov ? 'url(#edge-glow)' : undefined}
              style={{ transition: 'stroke 0.2s, opacity 0.2s' }}
            />
          )
        })}

        {/* nodes */}
        {nodes.map(n => {
          const col  = TYPE_COLOURS[n.type]
          const r    = nodeRadius(n.score)
          const isHov = hovered === n.id
          const filterId = n.type === 'shared' ? 'purple-glow' : n.type === 'a' ? 'blue-glow' : 'red-glow'

          return (
            <g key={n.id}
              onMouseEnter={(e) => {
                setHovered(n.id)
                setTooltip({ x: n.x, y: n.y - r - 8, node: n })
              }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              style={{ cursor: 'pointer' }}
            >
              {/* outer pulse ring for shared nodes */}
              {n.type === 'shared' && (
                <circle cx={n.x} cy={n.y} r={r + 5}
                  fill="none" stroke={col} strokeWidth={0.8}
                  opacity={0.25} />
              )}

              {/* main circle */}
              <circle cx={n.x} cy={n.y} r={isHov ? r + 3 : r}
                fill={col + (isHov ? '44' : '22')}
                stroke={col}
                strokeWidth={isHov ? 2 : n.type === 'shared' ? 1.5 : 1}
                filter={isHov || n.type === 'shared' ? `url(#${filterId})` : undefined}
                style={{ transition: 'r 0.2s, fill 0.2s, stroke-width 0.2s' }}
              />

              {/* label */}
              <text
                x={n.x} y={n.y - r - 5}
                textAnchor="middle"
                fill={isHov ? col : hovered !== null ? C.textDim : C.textMuted}
                fontSize={isHov ? 10 : n.type === 'shared' ? 9.5 : 8.5}
                fontFamily={F.body}
                fontWeight={n.type === 'shared' ? 'bold' : 'normal'}
                style={{ transition: 'fill 0.2s', pointerEvents: 'none' }}
              >
                {n.word}
              </text>
            </g>
          )
        })}

        {/* hover tooltip */}
        {tooltip && (() => {
          const { x, y, node } = tooltip
          const scoreLabel = node.type === 'shared'
            ? `${labelA}: ${comparison.shared.find(s => s.word === node.word)?.countA ?? '?'}  ·  ${labelB}: ${comparison.shared.find(s => s.word === node.word)?.countB ?? '?'}`
            : `appears ${node.score} times`
          const col = TYPE_COLOURS[node.type]
          const boxW = 160, boxH = 36
          const bx = Math.max(4, Math.min(W - boxW - 4, x - boxW / 2))
          const by = Math.max(4, y - boxH - 4)
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={bx} y={by} width={boxW} height={boxH}
                rx={4} fill={C.surface} stroke={col} strokeWidth={0.8} opacity={0.95} />
              <text x={bx + 10} y={by + 13} fontSize={9} fontFamily={F.body} fill={col}>
                {node.word}
              </text>
              <text x={bx + 10} y={by + 26} fontSize={8} fontFamily={F.body} fill={C.textMuted}>
                {scoreLabel}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* cluster labels */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between',
        padding: '6px 16px',
        background: 'linear-gradient(to top, ' + C.bg + ', transparent)',
        pointerEvents: 'none',
      }}>
        <span style={{ fontFamily: F.body, fontSize: 9, color: C.blue + '88' }}>← {labelA}</span>
        <span style={{ fontFamily: F.body, fontSize: 9, color: C.purple + '88' }}>shared space</span>
        <span style={{ fontFamily: F.body, fontSize: 9, color: C.red + '88' }}>{labelB} →</span>
      </div>
    </div>
  )
}
