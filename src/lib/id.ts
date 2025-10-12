import { createHash } from 'crypto'

/**
 * Deterministyczne mapowanie Clerk userId (np. "user_abc123") na UUID v5-kompatybilny string.
 * Dzięki temu możemy zapisywać i filtrować po kolumnach typu UUID w bazie,
 * nie zmieniając istniejącego schematu.
 *
 * Algorytm: SHA1(namespace + clerkId) → ustawienie bitów wersji/warantu → format UUID.
 */
const NAMESPACE = 'f7a1d9c6-7e0b-4e8f-9b1a-111111111111'

export function clerkIdToUUID(clerkId: string): string {
  const ns = NAMESPACE.replace(/-/g, '')
  const input = (ns + '|' + clerkId).toLowerCase()
  const hash = createHash('sha1').update(input).digest('hex') // 40 hex chars

  // We need 32 hex chars for UUID (128 bits). Take first 32.
  let hex = hash.slice(0, 32).split('')

  // Set UUID version (position 12 = 0-based indexing) to '5' (UUID v5-like)
  hex[12] = '5'

  // Set the variant (position 16, high bits 10xx)
  const variantNibble = parseInt(hex[16], 16)
  const setVariant = (variantNibble & 0x3) | 0x8 // 10xx
  hex[16] = setVariant.toString(16)

  const s = hex.join('')
  // Format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`
}

/**
 * Jeżeli przekazano już prawidłowy UUID, zwróć go bez zmian.
 * Jeżeli jest to Clerk userId (np. zaczyna się od "user_"), zmapuj na UUID.
 */
export function ensureUUID(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRegex.test(id)) return id
  if (id && id.startsWith('user_')) return clerkIdToUUID(id)
  // Fallback: deterministycznie mapuj każde inne ID aby uniknąć błędu castu
  return clerkIdToUUID(id || 'anonymous')
}
