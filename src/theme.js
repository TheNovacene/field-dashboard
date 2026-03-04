// ── Design tokens ────────────────────────────────────────────────────────────

export const C = {
  bg:           '#0a0c10',
  surface:      '#111418',
  surfaceHover: '#171b22',
  border:       '#1e2530',
  borderLight:  '#2a3444',

  amber:        '#d4963a',
  amberDim:     '#8c621f',
  amberGlow:    'rgba(212,150,58,0.12)',

  cyan:         '#4fb8c4',
  cyanDim:      '#2a7a84',

  purple:       '#9b6fc4',
  purpleDim:    '#5c3d7a',

  red:          '#c46f6f',
  blue:         '#5b8fd4',

  text:         '#c8d4e0',
  textMuted:    '#5a6a7e',
  textDim:      '#3a4a5e',
}

export const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Mono', 'Courier New', monospace",
  label:   "'Crimson Text', Georgia, serif",
}

export const METRIC_DEFS = [
  { id: 'energy',     symbol: 'E',  label: 'Energy',           colour: C.amber,  dimColour: C.amberDim  },
  { id: 'coherence',  symbol: 's',  label: 'Symbolic Coherence', colour: C.cyan,   dimColour: C.cyanDim   },
  { id: 'connection', symbol: 'c²', label: 'Connection²',       colour: C.purple, dimColour: C.purpleDim },
  { id: 'impact',     symbol: 'I',  label: 'Impact',            colour: C.amber,  dimColour: C.amberDim  },
]
