import { serverEnv } from '~/env/server'
import { decryptWithSecret, encryptWithSecret } from './utils'

export function encryptApiKey(raw: string) {
  return encryptWithSecret(serverEnv.AUTH_SECRET, raw)
}

export function decryptApiKey(stored: string) {
  return decryptWithSecret(serverEnv.AUTH_SECRET, stored)
}
