// ── Field Analysis Engine ────────────────────────────────────────────────────
// Computes E, s, c², I from raw text input.

const STOPWORDS = new Set([
  'the','and','for','are','but','not','you','all','can','her','was','one',
  'our','out','day','get','has','him','his','how','its','may','new','now',
  'old','see','two','way','who','boy','did','she','too','use','that','this',
  'with','have','from','they','will','been','each','more','also','into',
  'than','then','them','were','what','when','your','some','time','very',
  'after','about','which','there','their','other','these','would','could',
  'should','where','those','being','while','since','before','through','during',
  'just','like','over','such','both','much','many','most','even','back','only',
  'here','does','made','said','make','good','know','take','come','well',
  'because','however','although','therefore','whether','without','between',
])

const JARGON = [
  // technical / corporate overuse
  'synergy','leverage','paradigm','disruptive','scalable','ecosystem',
  'bandwidth','deep dive','circle back','move the needle','low-hanging fruit',
  'boil the ocean','thought leader','going forward','at the end of the day',
  'action items','deliverables','key takeaways','best practices','drill down',
  // academic overuse
  'hegemonic','problematize','reify','praxis','dialectical','ontological',
  'epistemological','hermeneutic','discourse','paradigmatic','normative',
]

const MISREAD_MARKERS = [
  'what do you mean','i don\'t understand','can you clarify','confused',
  'not sure what you','unclear','please explain','that doesn\'t make sense',
  'could you rephrase','lost me','what are you saying',
]

// ── tokenise ─────────────────────────────────────────────────────────────────
function tokenise(text) {
  return text.toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/).filter(Boolean)
}

// ── detect turns ─────────────────────────────────────────────────────────────
// Splits on blank lines, or on "Name:" / "Speaker N:" / "---" patterns
function detectTurns(text) {
  // Try speaker-labelled format first
  const speakerRe = /^[A-Z][A-Za-z\s]{0,20}:/m
  const lines = text.split('\n')

  const turns = []
  let current = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      if (current && current.text.trim()) {
        turns.push(current)
        current = null
      }
      continue
    }

    const speakerMatch = line.match(/^([A-Z][A-Za-z\s]{0,20}):\s*(.*)$/)
    if (speakerMatch) {
      if (current) turns.push(current)
      current = { speaker: speakerMatch[1].trim(), text: speakerMatch[2] }
    } else if (current) {
      current.text += ' ' + line
    } else {
      // No speaker format — treat each paragraph as a turn
      if (!current) current = { speaker: 'Unknown', text: '' }
      current.text += ' ' + line
    }
  }
  if (current && current.text.trim()) turns.push(current)

  // If we found no structure, fall back to paragraph splitting
  if (turns.length === 0) {
    return text.split(/\n{2,}/).filter(p => p.trim()).map(p => ({
      speaker: 'Unknown',
      text: p.trim(),
    }))
  }
  return turns
}

// ── Energy (E) ────────────────────────────────────────────────────────────────
function calcEnergy(words, turns) {
  // Volume: normalise against a 5,000-word baseline, cap at 1
  const volumeRaw = words.length / 5000
  const volume = Math.min(volumeRaw, 1)

  // Equity: distribution across speakers via Shannon entropy
  const counts = {}
  for (const t of turns) {
    counts[t.speaker] = (counts[t.speaker] || 0) + tokenise(t.text).length
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const probs = Object.values(counts).map(c => c / total)
  const entropy = -probs.reduce((sum, p) => p > 0 ? sum + p * Math.log2(p) : sum, 0)
  const maxEntropy = probs.length > 1 ? Math.log2(probs.length) : 0
  const equity = maxEntropy > 0 ? entropy / maxEntropy : 1.0

  const E = 0.5 * volume + 0.5 * equity

  return {
    value: Math.min(E, 1),
    breakdown: {
      summary: `${words.length.toLocaleString()} words across ${turns.length} turns`,
      steps: [
        {
          label: 'Speaker Distribution',
          detail: Object.entries(counts)
            .map(([k, v]) => `${k}: ${v.toLocaleString()} words (${((v/total)*100).toFixed(1)}%)`)
            .join('  ·  '),
        },
        {
          label: 'Equity Score',
          detail: `${equity.toFixed(2)}  →  Entropy: ${entropy.toFixed(2)} / Max: ${maxEntropy.toFixed(2)}`,
        },
        {
          label: 'Volume Score',
          detail: `${volume.toFixed(2)}  →  ${words.length.toLocaleString()} / 5,000 = ${volumeRaw.toFixed(2)}${volumeRaw > 1 ? ' → capped at 1.0' : ''}`,
        },
      ],
      formula: 'E = (0.5 × volume) + (0.5 × equity)',
      calculation: `E = (0.5 × ${volume.toFixed(2)}) + (0.5 × ${equity.toFixed(2)}) = ${E.toFixed(2)}`,
    },
  }
}

// ── Symbolic Coherence (s) ────────────────────────────────────────────────────
function calcCoherence(words, turns) {
  // Lexical diversity: unique meaningful words (4+ letters, not stopwords)
  const meaningful = words.filter(w => w.length >= 4 && !STOPWORDS.has(w))
  const unique = new Set(meaningful)
  const diversityRaw = unique.size / 200
  const diversity = Math.min(diversityRaw, 1)

  // Turn depth: average words per turn
  const avgWords = words.length / Math.max(turns.length, 1)
  const depth = Math.min(avgWords / 50, 1)

  // Jargon penalty
  const fullText = words.join(' ')
  const jargonFound = JARGON.filter(j => fullText.includes(j.toLowerCase()))
  const jargonPenalty = Math.max(1 - jargonFound.length * 0.05, 0.5)

  const s = (0.5 * diversity + 0.5 * depth) * jargonPenalty

  return {
    value: Math.min(s, 1),
    breakdown: {
      summary: `Vocabulary analysis across ${words.length.toLocaleString()} words`,
      steps: [
        {
          label: 'Lexical Diversity',
          detail: `${unique.size.toLocaleString()} unique meaningful words  →  ${unique.size} / 200 = ${diversityRaw.toFixed(2)}${diversityRaw > 1 ? ' → capped at 1.0' : ''}`,
        },
        {
          label: 'Turn Depth',
          detail: `Avg ${avgWords.toFixed(0)} words/turn  →  depth: ${avgWords.toFixed(0)} / 50 = ${depth.toFixed(2)}`,
        },
        {
          label: 'Jargon Penalty',
          detail: jargonFound.length > 0
            ? `${jargonFound.length} term${jargonFound.length > 1 ? 's' : ''} found: ${jargonFound.slice(0, 4).join(', ')}  →  penalty: ${jargonPenalty.toFixed(2)}`
            : 'No jargon detected  →  penalty: 1.00',
        },
      ],
      formula: 's = (0.5 × diversity + 0.5 × depth) × jargon_penalty',
      calculation: `s = (0.5 × ${diversity.toFixed(2)} + 0.5 × ${depth.toFixed(2)}) × ${jargonPenalty.toFixed(2)} = ${s.toFixed(2)}`,
    },
  }
}

// ── Connection² (c²) ─────────────────────────────────────────────────────────
function calcConnection(words, turns) {
  const fullText = words.join(' ')

  // Clarity: misread marker detection
  const misreadsFound = MISREAD_MARKERS.filter(m => fullText.includes(m))
  const misreadRate = (misreadsFound.length / Math.max(words.length, 1)) * 1000
  const clarity = Math.max(1 - misreadRate * 0.1, 0)

  // Velocity: question ratio (high question rate may signal friction)
  const questionCount = turns.filter(t => t.text.trim().endsWith('?')).length
  const questionRatio = questionCount / Math.max(turns.length, 1)
  const velocity = Math.max(1 - questionRatio, 0)

  const c = 0.5 * clarity + 0.5 * velocity

  return {
    value: Math.min(c, 1),
    breakdown: {
      summary: 'Clarity and velocity analysis',
      steps: [
        {
          label: 'Misread Rate',
          detail: misreadsFound.length > 0
            ? `${misreadsFound.length} marker${misreadsFound.length > 1 ? 's' : ''} found  →  rate: ${misreadRate.toFixed(2)} per 1,000 tokens  →  clarity: ${clarity.toFixed(2)}`
            : `0 misread markers found  →  clarity: 1.00`,
        },
        {
          label: 'Question Velocity',
          detail: `${questionCount} questions / ${turns.length} turns  →  ratio: ${questionRatio.toFixed(3)}  →  velocity: ${velocity.toFixed(3)}`,
        },
      ],
      formula: 'c = (0.5 × clarity) + (0.5 × velocity)',
      calculation: `c = (0.5 × ${clarity.toFixed(2)}) + (0.5 × ${velocity.toFixed(3)}) = ${c.toFixed(2)}`,
    },
  }
}

// ── Impact (I) ────────────────────────────────────────────────────────────────
function calcImpact(E, s, c) {
  const cSq = Math.max(c * c, 0.001)
  const I = (E * s) / cSq

  const interp = I >= 0.75
    ? 'High Impact — strong relational residue'
    : I >= 0.5
    ? 'Coherent Impact — meaningful residue with solid foundations'
    : I >= 0.3
    ? 'Moderate Impact — present but diffuse'
    : 'Low Impact — signal is weak or obscured'

  return {
    value: Math.min(I, 1),
    breakdown: {
      summary: 'Derived from E, s, and c²',
      steps: [
        { label: 'E (Energy)',      detail: E.toFixed(2) },
        { label: 's (Coherence)',   detail: s.toFixed(2) },
        { label: 'c² (Connection²)', detail: (c * c).toFixed(2) },
      ],
      formula: 'I = (E · s) / c²',
      calculation: `I = (${E.toFixed(2)} × ${s.toFixed(2)}) / ${cSq.toFixed(3)} = ${I.toFixed(2)}`,
      note: interp,
    },
  }
}

// ── Concept extraction (for comparison) ──────────────────────────────────────
export function extractConcepts(text, topN = 30) {
  const words = tokenise(text)
  const freq = {}
  for (const w of words) {
    if (w.length >= 4 && !STOPWORDS.has(w)) {
      freq[w] = (freq[w] || 0) + 1
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }))
}

// ── Main entry point ──────────────────────────────────────────────────────────
export function analyse(text) {
  if (!text || text.trim().length < 20) return null

  const turns = detectTurns(text)
  const words = tokenise(text)

  const energy    = calcEnergy(words, turns)
  const coherence = calcCoherence(words, turns)
  const connection = calcConnection(words, turns)
  const impact    = calcImpact(energy.value, coherence.value, connection.value)

  const speakers = [...new Set(turns.map(t => t.speaker))]

  return {
    meta: {
      wordCount:   words.length,
      turnCount:   turns.length,
      speakers,
    },
    energy,
    coherence,
    connection,
    impact,
  }
}

// ── Comparison helpers ────────────────────────────────────────────────────────
export function compareTexts(textA, textB) {
  const conceptsA = extractConcepts(textA, 50)
  const conceptsB = extractConcepts(textB, 50)

  const setA = new Map(conceptsA.map(c => [c.word, c.count]))
  const setB = new Map(conceptsB.map(c => [c.word, c.count]))

  const allWords = new Set([...setA.keys(), ...setB.keys()])

  const shared = []
  const onlyA  = []
  const onlyB  = []

  for (const w of allWords) {
    if (setA.has(w) && setB.has(w)) {
      shared.push({ word: w, countA: setA.get(w), countB: setB.get(w) })
    } else if (setA.has(w)) {
      onlyA.push({ word: w, count: setA.get(w) })
    } else {
      onlyB.push({ word: w, count: setB.get(w) })
    }
  }

  shared.sort((a, b) => (b.countA + b.countB) - (a.countA + a.countB))

  const overlapPercent = Math.round((shared.length / allWords.size) * 100)

  return {
    overlapPercent,
    totalConcepts: allWords.size,
    shared: shared.slice(0, 8),
    onlyA: onlyA.sort((a, b) => b.count - a.count).slice(0, 6),
    onlyB: onlyB.sort((a, b) => b.count - a.count).slice(0, 6),
  }
}
