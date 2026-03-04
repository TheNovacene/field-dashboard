import { useRef, useState } from 'react'
import { C, F } from '../theme.js'

const PLACEHOLDER = `Paste any text here to analyse it — a conversation transcript, a meeting record, a policy document, an interview, a journal entry…

You can also use speaker labels to unlock equity analysis:

Alice: I've been thinking about how we handle feedback cycles.
Bob: Right, there's definitely a gap between what gets written up and what actually changes.
Alice: Exactly. The documentation exists but it doesn't have weight.

Alternatively, upload a .txt or .md file using the button above.`

export default function TextInput({ onAnalyse, label = 'Document', compact = false }) {
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState(null)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setText(e.target.result)
      setFileName(file.name)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = () => {
    if (text.trim().length >= 20) onAnalyse(text, fileName)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${dragging ? C.amber : C.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
      boxShadow: dragging ? `0 0 20px ${C.amberGlow}` : 'none',
    }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {/* toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
        background: C.bg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.label, fontSize: 13, color: C.textMuted }}>{label}</span>
          {fileName && (
            <span style={{
              fontFamily: F.body, fontSize: 10, color: C.cyan,
              background: C.cyanDim + '22', borderRadius: 4, padding: '2px 8px',
            }}>
              📄 {fileName}
            </span>
          )}
          {wordCount > 0 && (
            <span style={{ fontFamily: F.body, fontSize: 10, color: C.textDim }}>
              {wordCount.toLocaleString()} words
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => fileRef.current.click()}
            style={{
              fontFamily: F.body, fontSize: 10, color: C.textMuted,
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ↑ Upload file
          </button>
          {text && (
            <button
              onClick={() => { setText(''); setFileName(null) }}
              style={{
                fontFamily: F.body, fontSize: 10, color: C.textDim,
                background: 'transparent', border: 'none',
                cursor: 'pointer', padding: '4px 8px',
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileRef} type="file" accept=".txt,.md,.csv"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={compact ? 'Paste text or upload a file…' : PLACEHOLDER}
        style={{
          width: '100%', display: 'block', resize: 'vertical',
          minHeight: compact ? 120 : 220,
          background: 'transparent', border: 'none', outline: 'none',
          fontFamily: F.body, fontSize: 12, color: C.text, lineHeight: 1.7,
          padding: '16px 18px',
        }}
      />

      {/* footer / submit */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderTop: `1px solid ${C.border}`,
        background: C.bg,
      }}>
        <span style={{ fontFamily: F.body, fontSize: 10, color: C.textDim }}>
          {dragging ? '↓ Drop to load' : 'Drag & drop a .txt or .md file'}
        </span>
        <button
          onClick={handleSubmit}
          disabled={wordCount < 5}
          style={{
            fontFamily: F.body, fontSize: 11,
            background: wordCount >= 5 ? C.amber : C.border,
            color: wordCount >= 5 ? C.bg : C.textDim,
            border: 'none', borderRadius: 5, padding: '7px 20px',
            cursor: wordCount >= 5 ? 'pointer' : 'not-allowed',
            fontWeight: 'bold', letterSpacing: 0.5,
            transition: 'all 0.2s',
            boxShadow: wordCount >= 5 ? `0 0 12px ${C.amberGlow}` : 'none',
          }}
        >
          Analyse →
        </button>
      </div>
    </div>
  )
}
