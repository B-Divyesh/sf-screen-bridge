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

export function targetsFromWords(words: WordLike[], max = 12): Target[] {
  const unique = new Set<string>()
  return words
    .filter(word => word.text.trim().length > 0 && word.bbox.x1 > word.bbox.x0 && word.bbox.y1 > word.bbox.y0)
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
