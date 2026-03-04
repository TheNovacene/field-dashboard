# Field · Relational Intelligence Dashboard

> Most tools measure *what* was said. Field measures *how it landed*.

Field is an open-source analysis tool that takes any text — a conversation transcript, a meeting record, a policy document, an interview, a journal entry — and analyses it across four relational dimensions.

---

## What It Measures

| Symbol | Metric | Question |
|--------|--------|----------|
| **E** | Energy | Who is speaking, and how much? |
| **s** | Symbolic Coherence | Is the language doing real work? |
| **c²** | Connection² | Is the signal landing clearly? |
| **I** | Impact | What will remain after the conversation ends? |

**Impact** is derived: `I = (E × s) / c²`

Connection is squared because poor connection degrades everything else exponentially — even brilliant, coherent content loses its effect if it doesn't land.

---

## Features

- **Live text analysis** — paste any text and get scored results instantly
- **File upload** — drag and drop or upload `.txt` / `.md` files
- **Calculation transparency** — every score is fully auditable via the ℹ️ panel
- **Document comparison** — analyse two texts side by side with metrics, network graph, and conceptual overlap
- **Speaker equity detection** — use `Speaker: text` format to unlock distribution analysis

---

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

---

## Input Format

Field accepts plain text. For richer equity analysis, use speaker labels:

```
Alice: I've been thinking about how we handle feedback cycles.
Bob: Right, there's definitely a gap between what gets written up and what actually changes.
Alice: Exactly. The documentation exists but it doesn't have weight.
```

Without speaker labels, the text is treated as a single voice.

---

## Technical Notes

All analysis runs **entirely in the browser** — no data is sent to any server.

The scoring heuristics are intentionally transparent and adjustable. The calculation logic lives in `src/utils/analyse.js`.

---

## Background

Field is part of the **Verse-ality** relational intelligence framework — a framework for designing and evaluating systems that remain humane under scale.

Scores are heuristics, not verdicts.

---

## Licence

MIT
