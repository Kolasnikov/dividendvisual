import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { SearchResult } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim().toUpperCase()

  if (q.length < 1) {
    return NextResponse.json([])
  }

  const result = await db.execute({
    sql: `SELECT symbol, name, sector
          FROM companies
          WHERE symbol LIKE ? OR name LIKE ?
          LIMIT 10`,
    args: [`${q}%`, `%${q}%`],
  })

  const results: SearchResult[] = result.rows.map((r) => ({
    symbol: r.symbol as string,
    name: r.name as string,
    sector: r.sector as string | null,
  }))

  return NextResponse.json(results)
}
