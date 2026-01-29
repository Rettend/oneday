const encoder = new TextEncoder()
const decoder = new TextDecoder()

async function importKey(secret: string) {
  const secretBytes = encoder.encode(secret)
  const hash = await crypto.subtle.digest('SHA-256', secretBytes)

  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptWithSecret(secret: string, raw: string): Promise<string> {
  const key = await importKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = encoder.encode(raw)
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded,
  )

  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return btoa(String.fromCharCode(...combined))
}

export async function decryptWithSecret(secret: string, stored: string): Promise<string> {
  const key = await importKey(secret)
  const binary = atob(stored)
  const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)))
  const iv = bytes.slice(0, 12)
  const ciphertext = bytes.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext,
  )

  return decoder.decode(decrypted)
}
