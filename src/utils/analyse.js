// ── Field Analysis Engine ────────────────────────────────────────────────────
// Computes E, s, c², I from raw text input.
// Handles multiple transcript formats including timestamped (MM:SS Speaker:)

// ── Comprehensive stopword list ───────────────────────────────────────────────
const STOPWORDS = new Set([
  // pronouns
  'i','me','my','myself','we','our','ours','ourselves','you','your','yours',
  'yourself','yourselves','he','him','his','himself','she','her','hers',
  'herself','it','its','itself','they','them','their','theirs','themselves',
  'that','this','these','those','who','whom','which','what','one',

  // auxiliary & functional verbs
  'is','are','was','were','be','been','being','have','has','had','having',
  'do','does','did','doing','will','would','shall','should','may','might',
  'must','can','could','need','dare','ought','get','got','getting',
  'make','made','making','said','say','says','saying','go','goes','went',
  'going','come','came','coming','know','knew','known','think','thought',
  'take','took','taken','see','saw','seen','look','looked','looking',
  'want','wanted','wanting','give','gave','given','use','used','using',
  'find','found','finding','tell','told','telling','ask','asked','asking',
  'seem','seemed','seeming','feel','felt','feeling','try','tried','trying',
  'leave','left','leaving','call','called','calling','keep','kept','keeping',
  'let','lets','letting','begin','began','begun','show','showed','shown',
  'hear','heard','hearing','play','played','playing','run','ran','running',
  'move','moved','moving','live','lived','living','believe','believed',
  'hold','held','holding','bring','brought','bringing','happen','happened',
  'write','wrote','written','provide','provided','providing','sit','sat',
  'stand','stood','standing','lose','lost','losing','pay','paid','paying',
  'meet','met','meeting','include','included','including','continue',
  'set','sets','setting','learn','learned','learning','change','changed',
  'lead','led','leading','understand','understood','watch','watched',
  'follow','followed','following','stop','stopped','stopping','create',
  'created','creating','speak','spoke','spoken','read','reads','reading',
  'spend','spent','spending','grow','grew','grown','open','opened','opening',
  'walk','walked','walking','win','won','winning','offer','offered',
  'remember','remembered','love','loved','loving','consider','considered',
  'appear','appeared','appearing','buy','bought','buying','wait','waited',
  'serve','served','serving','send','sent','sending',
  'expect','expected','expecting','build','built','building','stay','stayed',
  'fall','fell','fallen','cut','cuts','cutting','reach','reached','reaching',
  'remain','remained','remaining','suggest','raise','raised','raising',
  'pass','passed','passing','sell','sold','require','required','requiring',
  'report','reported','reporting','mean','means','meant','work','works',
  'worked','working','help','helps','helped','helping','needs','needed',
  'want','wants','wanted','put','puts','putting','turn','turns','turned',
  'start','started','starting','done','take','taking','given','letting',
  'bring','click','clicks','clicked','open','opens','opening',

  // articles & determiners
  'the','a','an','some','any','each','every','all','both','few','more',
  'most','other','such','no','nor','not','only','own','same','so','than',
  'too','very','just','but','and','the',

  // prepositions
  'at','by','for','from','in','into','of','off','on','onto','out','over',
  'to','up','with','about','above','across','after','against','along',
  'among','around','as','before','behind','below','beneath','beside',
  'between','beyond','during','except','inside','near','outside','since',
  'through','throughout','under','until','upon','within','without','down',
  'per','via','versus','amid','amongst','concerning','despite','following',
  'past','plus','regarding','unlike','onto',

  // conjunctions & connectors
  'although','because','however','therefore','whether','while','whereas',
  'unless','until','even','though','since','if','when','where','whenever',
  'wherever','yet','nor','either','neither','also','thus','hence',
  'accordingly','consequently','furthermore','moreover','nevertheless',
  'otherwise','meanwhile','instead','still','already','again','else',
  'then','than',

  // generic nouns
  'thing','things','people','person','way','ways','time','times','year',
  'years','day','days','week','weeks','month','months','part','parts',
  'place','places','case','cases','point','points','fact','facts','idea',
  'ideas','problem','problems','result','results','example','examples',
  'kind','sorts','type','types','number','numbers','group','groups',
  'lot','lots','bit','bits','matter','matters','question','questions',
  'word','words','line','lines','hand','hands','side','sides','area',
  'areas','end','ends','home','homes','room','rooms','face','faces',
  'name','names','head','heads','body','bodies','mind','minds','life',
  'lives','world','worlds','state','states','man','men','woman','women',
  'child','children','family','families','back','talk','talks','stuff',
  'thing','things','something','anything','everything','nothing',
  'someone','anyone','everyone','nobody','somebody','anybody',

  // generic adjectives & adverbs
  'there','here','little','much','able','different','important','interesting',
  'real','next','last','first','second','third','early','late','long','high',
  'large','small','big','great','good','best','better','worse','worst',
  'true','false','free','full','hard','easy','clear','dark','light','old',
  'new','possible','available','various','specific','general','certain',
  'special','enough','often','always','never','sometimes','usually',
  'actually','really','quite','rather','pretty','very','even','almost',
  'many','much','more','most','less','least','only','also','both','each',
  'every','another','same','different','other','such','own','whole','several',
  'able','unable','ready','likely','unlikely','similar','interesting','simple',
  'complex','common','public','private','local','national','international',
  'current','previous','following','above','below','between','across',
  'share','sharing','shared','moment','moments','talking','telling',
  'saying','showing','using','making','getting','putting','taking',
  'coming','going','looking','thinking','feeling','trying','working',

  // conversational fillers
  'yeah','yep','yup','okay','ok','oh','ah','uh','um','hmm','hm','wow',
  'well','right','sure','fine','nice','cool','got','just',
  'really','actually','basically','literally','honestly','totally','pretty',
  'quite','rather','somewhat','anyway','anyways','though','still','already',
  'maybe','perhaps','probably','definitely','certainly','absolutely',
  'exactly','indeed','clearly','simply','course','thanks','thank',
  'please','sorry','yes','nope','like','know','mean','sort','kind',
  'mmm','mhm','gonna','gotta','wanna','kinda','sorta',

  // contractions stripped of apostrophe
  'dont','cant','wont','isnt','arent','wasnt','werent','havent','hasnt',
  'hadnt','wouldnt','couldnt','shouldnt','didnt','doesnt','thats',
  'theres','heres','lets','ive','ill','youd','youve','youll','theyd',
  'theyve','theyll','weve','well','hes','shes','itll','itd',
  'youre','theyre','were','whats','whos','hows','wheres','whens','whys',
  'thered','thatd','thatll',
])

const JARGON = [
  'synergy','leverage','paradigm','disruptive','scalable','ecosystem',
  'bandwidth','deep dive','circle back','move the needle','low-hanging fruit',
  'boil the ocean','thought leader','going forward','at the end of the day',
  'action items','deliverables','key takeaways','best practices','drill down',
  'hegemonic','problematize','reify','praxis','dialectical',
  'epistemological','hermeneutic','paradigmatic',
]

const MISREAD_MARKERS = [
  "what do you mean","i don't understand","can you clarify","confused",
  "not sure what you","unclear","please explain","that doesn't make sense",
  "could you rephrase","lost me","what are you saying",
]

// ── Tokenise ──────────────────────────────────────────────────────────────────
function tokenise(text) {
  return text.toLowerCase()
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/https?:\/\/\S+/g, ' ')        // strip URLs
    .replace(/\d{1,2}:\d{2}(:\d{2})?/g, ' ') // strip timestamps
    .replace(/[^a-z\s'-]/g, ' ')
    .replace(/'\s/g, ' ')
    .replace(/\s'/g, ' ')
    .replace(/^'+|'+$/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

// ── Detect transcript format & parse turns ────────────────────────────────────
// Handles:
//   "00:00 Gerry Docherty: Hello"       ← timestamped (Tactiq, Teams, Zoom)
//   "Gerry: Hello"                       ← simple label
//   "[00:00] Gerry: Hello"               ← bracketed timestamp
//   Plain paragraphs                     ← single voice fallback
function detectTurns(text) {
  const lines = text.split('\n')
  const turns = []
  let current = null

  // Patterns to try in order
  const PATTERNS = [
    // "00:00 Full Name Here: text" or "00:00:00 Full Name: text"
    /^\d{1,2}:\d{2}(?::\d{2})?\s+([A-Z][A-Za-z\s'-]{1,40}):\s*(.*)$/,
    // "[00:00] Name: text"
    /^\[\d{1,2}:\d{2}(?::\d{2})?\]\s*([A-Z][A-Za-z\s'-]{1,40}):\s*(.*)$/,
    // "Name: text" (simple)
    /^([A-Z][A-Za-z\s'-]{1,40}):\s*(.*)$/,
  ]

  for (const raw of lines) {
    const line = raw.trim()

    // Skip markdown headings, horizontal rules, blank lines, metadata
    if (!line || line.startsWith('#') || line.startsWith('---') ||
        line.startsWith('>') || line.startsWith('[View') ||
        /^(Meeting started|Duration|Participants):/i.test(line)) {
      if (current && current.text.trim()) {
        turns.push(current)
        current = null
      }
      continue
    }

    let matched = false
    for (const pattern of PATTERNS) {
      const m = line.match(pattern)
      if (m) {
        const speaker = m[1].trim()
        const text    = m[2].trim()
        // Validate: speaker name shouldn't be a timestamp or URL
        if (!/^\d/.test(speaker) && speaker.length > 1) {
          if (current) turns.push(current)
          current = { speaker, text }
          matched = true
          break
        }
      }
    }

    if (!matched) {
      if (current) {
        current.text += ' ' + line
      } else {
        current = { speaker: 'Unknown', text: line }
      }
    }
  }

  if (current && current.text.trim()) turns.push(current)

  // Fallback: paragraph splitting
  if (turns.length === 0 || (turns.length === 1 && turns[0].speaker === 'Unknown')) {
    const paras = text.split(/\n{2,}/).filter(p => p.trim())
    if (paras.length > 1) {
      return paras.map(p => ({ speaker: 'Unknown', text: p.trim() }))
    }
  }

  return turns.filter(t => t.text.trim().length > 0)
}

// ── Extract speaker names for dynamic filtering ───────────────────────────────
function extractSpeakerTokens(turns) {
  const tokens = new Set()
  const unknownLike = new Set(['Unknown', 'Speaker', 'Narrator', 'Host', 'Guest'])
  for (const t of turns) {
    if (unknownLike.has(t.speaker)) continue
    // Add each part of the name (first, last, etc.)
    for (const part of t.speaker.toLowerCase().split(/\s+/)) {
      if (part.length >= 2) tokens.add(part)
    }
  }
  return tokens
}

// ── Concrete nouns / proper nouns that aren't concepts ───────────────────────
const CONCRETE_FILTER = new Set([
  'australia','england','scotland','ireland','london','paris','africa',
  'europe','america','canada','india','china','japan','germany','france',
  'texas','california','florida','seattle','boston','chicago',
  'daughter','father','mother','sister','brother','husband','wife',
  'friend','friends','teacher','teachers','player','players',
  'members','neighbour','colleague','partner','partners',
  'phone','email','message','messages','letter','letters','photo','photos',
  'house','hospital','office','church','library','hotel',
  'morning','evening','tonight','today','yesterday','tomorrow','weekend',
  'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
  'january','february','march','april','june','july','august','september',
  'october','november','december',
  'happening','supposed','wanting','telling','showing',
  'likes','chat','chats',
  'anyone','someone','everyone','nobody',
  'something','anything','everything','nothing','somewhere','anywhere',
  'student','students','assignment','assignments','camera','relationship',
  'happened','getting','putting','clicking','opening','looking',
])

// ── Is a word meaningful? ─────────────────────────────────────────────────────
// strict=true for unigrams: requires 6+ chars (raises concept quality bar)
// strict=false for n-gram parts: 4+ chars (phrases earn quality by combination)
function isMeaningful(word, speakerTokens = new Set(), strict = false) {
  const minLen = strict ? 6 : 4
  return (
    word.length >= minLen &&
    !STOPWORDS.has(word) &&
    !CONCRETE_FILTER.has(word) &&
    !speakerTokens.has(word) &&
    !/^\d/.test(word) &&
    !word.startsWith("'") &&
    !word.endsWith("'s") &&
    !word.endsWith("'t") &&
    !word.endsWith("'re") &&
    !word.endsWith("'ve") &&
    !word.endsWith("'ll") &&
    !word.endsWith("'d")
  )
}

// ── Extract n-grams ───────────────────────────────────────────────────────────
function getNgrams(words, n, speakerTokens) {
  const result = []
  for (let i = 0; i <= words.length - n; i++) {
    const gram = words.slice(i, i + n)
    if (gram.every(w => isMeaningful(w, speakerTokens))) {
      result.push(gram.join(' '))
    }
  }
  return result
}

// ── Extract weighted concepts ─────────────────────────────────────────────────
export function extractConcepts(text, topN = 30, speakerTokens = new Set()) {
  const words = tokenise(text)
  const scores = {}

  // Unigrams — strict mode: 6+ chars, must appear 2+ times to qualify
  const unigramCounts = {}
  for (const w of words) {
    if (isMeaningful(w, speakerTokens, true)) {
      unigramCounts[w] = (unigramCounts[w] || 0) + 1
    }
  }
  for (const [w, count] of Object.entries(unigramCounts)) {
    if (count >= 2) scores[w] = count * 1.0
  }

  // Bigrams — weight 1.5×, appear once is enough (phrases earn quality)
  for (const phrase of getNgrams(words, 2, speakerTokens)) {
    scores[phrase] = (scores[phrase] || 0) + 1.5
  }

  // Trigrams — weight 2×, highest conceptual charge
  for (const phrase of getNgrams(words, 3, speakerTokens)) {
    scores[phrase] = (scores[phrase] || 0) + 2.0
  }

  // Always suppress unigrams that are part of any phrase
  const allPhrases = Object.keys(scores).filter(k => k.includes(' '))
  const suppressedUnigrams = new Set()
  for (const phrase of allPhrases) {
    for (const part of phrase.split(' ')) suppressedUnigrams.add(part)
  }

  return Object.entries(scores)
    .filter(([term]) => {
      if (!term.includes(' ') && suppressedUnigrams.has(term)) return false
      return true
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, score]) => ({
      word,
      count: Math.round(score),
      isPhrase: word.includes(' '),
    }))
}

// ── Energy (E) ────────────────────────────────────────────────────────────────
function calcEnergy(words, turns) {
  const volumeRaw = words.length / 5000
  const volume = Math.min(volumeRaw, 1)

  const counts = {}
  for (const t of turns) {
    counts[t.speaker] = (counts[t.speaker] || 0) + tokenise(t.text).length
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const probs  = Object.values(counts).map(c => c / total)
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
            .sort((a,b) => b[1]-a[1])
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
function calcCoherence(words, turns, speakerTokens) {
  const meaningful = words.filter(w => isMeaningful(w, speakerTokens))
  const unique = new Set(meaningful)
  const diversityRaw = unique.size / 200
  const diversity = Math.min(diversityRaw, 1)

  const avgWords = words.length / Math.max(turns.length, 1)
  const depth = Math.min(avgWords / 50, 1)

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
  const misreadsFound = MISREAD_MARKERS.filter(m => fullText.includes(m))
  const misreadRate = (misreadsFound.length / Math.max(words.length, 1)) * 1000
  const clarity = Math.max(1 - misreadRate * 0.1, 0)

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
        { label: 'E (Energy)',        detail: E.toFixed(2) },
        { label: 's (Coherence)',     detail: s.toFixed(2) },
        { label: 'c² (Connection²)', detail: (c * c).toFixed(2) },
      ],
      formula: 'I = (E · s) / c²',
      calculation: `I = (${E.toFixed(2)} × ${s.toFixed(2)}) / ${cSq.toFixed(3)} = ${I.toFixed(2)}`,
      note: interp,
    },
  }
}

// ── Main entry point ──────────────────────────────────────────────────────────
export function analyse(text) {
  if (!text || text.trim().length < 20) return null

  const turns       = detectTurns(text)
  const words       = tokenise(text)
  const speakerTokens = extractSpeakerTokens(turns)

  const energy     = calcEnergy(words, turns)
  const coherence  = calcCoherence(words, turns, speakerTokens)
  const connection = calcConnection(words, turns)
  const impact     = calcImpact(energy.value, coherence.value, connection.value)

  const speakers = [...new Set(turns.map(t => t.speaker))]

  return {
    meta: { wordCount: words.length, turnCount: turns.length, speakers },
    energy, coherence, connection, impact,
  }
}

// ── Comparison ────────────────────────────────────────────────────────────────
export function compareTexts(textA, textB) {
  const turnsA = detectTurns(textA)
  const turnsB = detectTurns(textB)
  const speakerTokensA = extractSpeakerTokens(turnsA)
  const speakerTokensB = extractSpeakerTokens(turnsB)

  // Merge both speaker token sets so shared names don't surface as concepts
  const allSpeakerTokens = new Set([...speakerTokensA, ...speakerTokensB])

  const conceptsA = extractConcepts(textA, 60, allSpeakerTokens)
  const conceptsB = extractConcepts(textB, 60, allSpeakerTokens)

  const setA = new Map(conceptsA.map(c => [c.word, c.count]))
  const setB = new Map(conceptsB.map(c => [c.word, c.count]))
  const allTerms = new Set([...setA.keys(), ...setB.keys()])

  const shared = [], onlyA = [], onlyB = []

  for (const w of allTerms) {
    if (setA.has(w) && setB.has(w)) {
      shared.push({ word: w, countA: setA.get(w), countB: setB.get(w) })
    } else if (setA.has(w)) {
      onlyA.push({ word: w, count: setA.get(w) })
    } else {
      onlyB.push({ word: w, count: setB.get(w) })
    }
  }

  shared.sort((a, b) => (b.countA + b.countB) - (a.countA + a.countB))
  const overlapPercent = Math.round((shared.length / Math.max(allTerms.size, 1)) * 100)

  return {
    overlapPercent,
    totalConcepts: allTerms.size,
    shared: shared.slice(0, 10),
    onlyA: onlyA.sort((a, b) => b.count - a.count).slice(0, 8),
    onlyB: onlyB.sort((a, b) => b.count - a.count).slice(0, 8),
  }
}
