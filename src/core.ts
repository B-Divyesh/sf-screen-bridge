export type Target = {
  id: number
  label: string
  confidence: number
  kind: 'text' | 'visual'
  x: number
  y: number
  width: number
  height: number
}

export type WordLike = { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }

/** Join words that share an OCR line before assigning a keyboard target. */
export function phrasesFromWords(words: WordLike[]): WordLike[] {
  const clean = words
    .filter(word => word.text.trim().length > 0 && word.bbox.x1 > word.bbox.x0 && word.bbox.y1 > word.bbox.y0)
    .sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0)
  const lines: WordLike[][] = []
  for (const word of clean) {
    const centre = (word.bbox.y0 + word.bbox.y1) / 2
    const line = lines.find(candidate => {
      const top = Math.min(...candidate.map(item => item.bbox.y0))
      const bottom = Math.max(...candidate.map(item => item.bbox.y1))
      const right = Math.max(...candidate.map(item => item.bbox.x1))
      return centre >= top - 9 && centre <= bottom + 9 && word.bbox.x0 - right <= 48
    })
    ;(line || lines[lines.push([]) - 1]).push(word)
  }
  return lines.map(line => {
    const ordered = [...line].sort((a, b) => a.bbox.x0 - b.bbox.x0)
    return {
      text: ordered.map(item => item.text.trim()).join(' '),
      confidence: ordered.reduce((sum, item) => sum + item.confidence, 0) / ordered.length,
      bbox: {
        x0: Math.min(...ordered.map(item => item.bbox.x0)), y0: Math.min(...ordered.map(item => item.bbox.y0)),
        x1: Math.max(...ordered.map(item => item.bbox.x1)), y1: Math.max(...ordered.map(item => item.bbox.y1)),
      },
    }
  })
}

export function targetsFromWords(words: WordLike[], max = 12): Target[] {
  const unique = new Set<string>()
  return phrasesFromWords(words)
    .filter(word => {
      const key = `${word.text.toLocaleLowerCase()}-${Math.round(word.bbox.y0 / 12)}`
      if (unique.has(key)) return false
      unique.add(key)
      return true
    })
    .sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0)
    .slice(0, max)
    .map((word, index) => ({
      id: index + 1,
      label: word.text.trim(),
      confidence: Math.round(word.confidence),
      kind: 'text' as const,
      x: word.bbox.x0,
      y: word.bbox.y0,
      width: word.bbox.x1 - word.bbox.x0,
      height: word.bbox.y1 - word.bbox.y0,
    }))
}

/** A compact local visual-boundary pass for controls whose labels OCR cannot read. */
export function visualCandidates(data: ImageData, limit = 5): Omit<Target, 'id'>[] {
  const { width, height } = data
  const pixel = (x: number, y: number) => {
    const i = (y * width + x) * 4
    return data.data[i] * .2126 + data.data[i + 1] * .7152 + data.data[i + 2] * .0722
  }
  const candidates: Omit<Target, 'id'>[] = []
  const stride = Math.max(4, Math.round(Math.min(width, height) / 150))
  for (let y = stride; y < height - 42; y += stride) {
    for (let x = stride; x < width - 64; x += stride) {
      const change = Math.abs(pixel(x, y) - pixel(x, y - stride))
      if (change < 72) continue
      let run = 0
      for (let right = x; right < Math.min(width - stride, x + width / 2); right += stride) {
        if (Math.abs(pixel(right, y) - pixel(right, y - stride)) < 45) break
        run += stride
      }
      if (run < 64) continue
      const candidate = { label: 'Visual control — label uncertain', confidence: 35, kind: 'visual' as const, x, y, width: run, height: Math.max(44, Math.min(72, height - y - stride)) }
      const overlaps = candidates.some(other => Math.abs(other.x - candidate.x) < 42 && Math.abs(other.y - candidate.y) < 32)
      if (!overlaps) candidates.push(candidate)
      if (candidates.length === limit) return candidates
    }
  }
  return candidates
}

export function mergeTargets(words: WordLike[], image: ImageData): Target[] {
  const text = targetsFromWords(words)
  const visual = visualCandidates(image).filter(candidate => !text.some(target => candidate.x < target.x + target.width + 32 && candidate.x + candidate.width > target.x - 32 && candidate.y < target.y + target.height + 40 && candidate.y + candidate.height > target.y - 40))
  return [...text, ...visual].slice(0, 12).map((target, index) => ({ ...target, id: index + 1 }))
}

export function targetPhrase(target: Target): string {
  const certainty = target.confidence < 60 ? 'Uncertain detection. ' : ''
  return `${certainty}Target ${target.id}: ${target.label}. Confidence ${target.confidence} percent.`
}
