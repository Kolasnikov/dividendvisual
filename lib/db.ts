import { createClient, type Client, type InStatement } from '@libsql/client'

let _client: Client | null = null

function getDb(): Client {
  if (_client) return _client
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is not set')
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN is not set')
  }
  _client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  return _client
}

export const db = {
  execute(stmt: InStatement) {
    return getDb().execute(stmt)
  },
}
