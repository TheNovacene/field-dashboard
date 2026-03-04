import { useState, useMemo } from 'react'
import { C, F } from '../theme.js'

// Build a simple force-ish layout from concept data
function layoutNodes(concepts, width = 660, height = 340) {
  const nodes = concepts.map((c, i) => {
    const angle = (i / concepts.length) * 2 * Math.PI
    const r = 120 + Math.random() * 60
    return {
      ...c,
      id: i,
      x: width / 2 + r * Math.cos(angle),
      y: height / 2 + r * Math.sin(angle),
    }
  })
  return nodes
}

const TYPE_COLOURS = {
  shared: C.purple,
  a:      C.blue,
  b:      C.red,
}

export default function NetworkGraph({ comparison, labelA = 'A', labelB = 'B' }) {
  const [hovered, setHovered] = useState(null)
  const W = 660, H = 340

  const { nodes, edges } = useMemo(() => {
    const allConcepts = [
      ...comparison.shared.map(c => ({ word: c.word, type: 'shared' })),
      ...comparison.onlyA.map(c  => ({ word: c.word, type: 'a' })),
      ...comparison.onlyB.map(c  => ({ word: c.word, type: 'b' })),
    ]
    const nodes = layoutNodes(allConcepts, W, H)

    // Connect shared nodes to nearby nodes of same document
    const edges = []
    const sharedNodes = nodes.filter(n => n.type === 'shared')
    const aNodes = nodes.filter(n => n.type === 'a')
    const bNodes = nodes.filter(n => n.type === 'b')

    // Shared ↔ shared
    for (let i = 0; i < sharedNodes.length - 1; i++) {
      edges.push([sharedNodes[i].id, sharedNodes[i + 1].id])
    }
    // a ↔ nearest shared
    for (const an of aNodes) {
      const nearest = sharedNodes.reduce((best, sn) => {
        const d = Math.hypot(an.x - sn.x, an.y - sn.y)
        return d < best.d ? { sn, d } : best
      }, { sn: null, d: Infinity })
      if (nearest.sn) edges.push([an.id, nearest.sn.id])
    }
    // b ↔ nearest shared
    for (const bn of bNodes) {
      const nearest = sharedNodes.reduce((best, sn) => {
        const d = Math.hypot(bn.x - sn.x, bn.y - sn.y)
        return d < best.d ? { sn, d } : best
      }, { sn: null, d: Infinity })
      if (nearest.sn) edges.push([bn.id, nearest.sn.id])
    }

    return { nodes, edges }
  }, [comparison])

  return (
    <div style={{
      background: C.bg, borderRadius: 8, overflow: 'hidden',
      border: `1px solid ${C.border}`, position: 'relative',
    }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* subtle grid */}
        {[...Array(7)].map((_, i) => (
          <line key={`v${i}`} x1={i * 110} y1={0} x2={i * 110} y2={H}
            stroke={C.border} strokeWidth={0.4} />
        ))}
        {[...Array(4)].map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 110} x2={W} y2={i * 110}
            stroke={C.border} strokeWidth={0.4} />
        ))}

        {/* edges */}
        {edges.map(([ai, bi], idx) => {
          const na = nodes[ai], nb = nodes[bi]
          if (!na || !nb) return null
          const isHov = hovered === ai || hovered === bi
          return (
            <line key={idx}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={isHov ? C.amberDim : C.textDim}
              strokeWidth={isHov ? 1.5 : 0.7}
              opacity={isHov ? 0.8 : 0.35}
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
            />
          )
        })}

        {/* nodes */}
        {nodes.map(n => {
          const col = TYPE_COLOURS[n.type]
          const isHov = hovered === n.id
          const r = isHov ? 9 : 6
          return (
            <g key={n.id}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={n.x} cy={n.y} r={r + 6} fill="transparent" />
              <circle cx={n.x} cy={n.y} r={r}
                fill={col + '28'} stroke={col} strokeWidth={isHov ? 2 : 1.2}
                style={{
                  filter: isHov ? `drop-shadow(0 0 8px ${col})` : 'none',
                  transition: 'all 0.2s',
                }}
              />
              <text
                x={n.x} y={n.y - (r + 5)}
                textAnchor="middle"
                fill={isHov ? col : C.textMuted}
                fontSize={isHov ? 10 : 8.5}
                fontFamily={F.body}
                style={{ transition: 'fill 0.2s, font-size 0.2s', pointerEvents: 'none' }}
              >
                {n.word}
              </text>
            </g>
          )
        })}
      </svg>

      {/* legend */}
      <div style={{
        position: 'absolute', bottom: 10, right: 14,
        display: 'flex', gap: 14,
      }}>
        {[[`${labelA} only`, C.blue], [`${labelB} only`, C.red], ['Both', C.purple]].map(([lbl, col]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, boxShadow: `0 0 5px ${col}` }} />
            <span style={{ fontFamily: F.body, fontSize: 9, color: C.textMuted }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
