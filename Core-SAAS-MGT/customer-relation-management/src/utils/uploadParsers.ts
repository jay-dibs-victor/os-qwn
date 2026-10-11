import { readSheet, type SheetData } from 'read-excel-file/browser'

type ParsedTable = {
  headers: string[]
  rows: string[][]
}

function trimCell(value: unknown) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  return s.length > 2000 ? s.slice(0, 2000) : s
}

function parseCsvLine(line: string) {
  const out: string[] = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      const next = line[i + 1]
      if (inQuotes && next === '"') {
        cur += '"'
        i++
        continue
      }
      inQuotes = !inQuotes
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }

  out.push(cur)
  return out.map((v) => v.trim())
}

function parseCsv(text: string, maxRows: number) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] } satisfies ParsedTable
  const headers = parseCsvLine(lines[0]).map(trimCell)
  const rows = lines.slice(1, maxRows + 1).map((line) => parseCsvLine(line).map(trimCell))
  return { headers, rows } satisfies ParsedTable
}

async function parseXlsx(file: File, maxRows: number) {
  const raw = (await readSheet(file, 1)) as SheetData<number>
  const table = raw
    .filter((r) => Array.isArray(r) && r.some((c) => String(c ?? '').trim().length > 0))
    .slice(0, maxRows + 1) as unknown[][]
  if (table.length === 0) return { headers: [], rows: [] } satisfies ParsedTable

  const headers = (table[0] ?? []).map(trimCell)
  const rows = table.slice(1).map((r) => r.map(trimCell))
  return { headers, rows } satisfies ParsedTable
}

export async function parseUploadTable(file: File, opts?: { maxRows?: number; maxBytes?: number }) {
  const maxRows = opts?.maxRows ?? 5000
  const maxBytes = opts?.maxBytes ?? 5 * 1024 * 1024

  if (file.size > maxBytes) {
    throw new Error(`File exceeds size limit (${Math.round(maxBytes / (1024 * 1024))}MB).`)
  }

  const lower = file.name.toLowerCase()
  if (lower.endsWith('.csv')) {
    const text = await file.text()
    return parseCsv(text, maxRows)
  }

  if (lower.endsWith('.xlsx')) {
    return await parseXlsx(file, maxRows)
  }

  throw new Error('Unsupported file type. Use CSV or XLSX.')
}
