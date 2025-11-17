import { query } from '@solidjs/router'
import { getRequestEvent } from 'solid-js/web'

interface ConnectionInfo {
  tlsVersion: string | null
  httpProtocol: string | null
  city: string | null
  country: string | null
  colo: string | null
}

const getConnectionInfoId = 'request:getConnectionInfo'

export const getConnectionInfo = query(async () => {
  'use server'
  const event = getRequestEvent()
  const request = event?.nativeEvent?.context?.cloudflare?.request

  const cf = request?.cf as
    | (ConnectionInfo & {
      tlsVersion?: string
      httpProtocol?: string
      city?: string
      country?: string
      colo?: string
    })
    | undefined

  if (!cf)
    return null

  const info: ConnectionInfo = {
    tlsVersion: cf.tlsVersion ?? null,
    httpProtocol: cf.httpProtocol ?? null,
    city: cf.city ?? null,
    country: cf.country ?? null,
    colo: cf.colo ?? null,
  }

  return info
}, getConnectionInfoId)
