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
  const nativeEvent = (event as any)?.nativeEvent

  // Try multiple possible locations for the Cloudflare request object so this
  // keeps working even if the adapter changes how it wires things up.
  const request
    = (event?.request as Request & { cf?: Record<string, unknown> }) //
      ?? (nativeEvent?.request as Request & { cf?: Record<string, unknown> })
      ?? (nativeEvent?.context?.cloudflare?.request as Request & { cf?: Record<string, unknown> })
      ?? (nativeEvent?.node?.req as Request & { cf?: Record<string, unknown> })

  const cf = request?.cf as
    | (ConnectionInfo & {
      tlsVersion?: string
      httpProtocol?: string
      city?: string
      country?: string
      colo?: string
    })
    | undefined

  // Minimal diagnostics so we can see what's happening in Cloudflare logs.
  // eslint-disable-next-line no-console
  console.log('[getConnectionInfo] sources', {
    hasEvent: !!event,
    hasRequest: !!event?.request,
    hasNativeRequest: !!nativeEvent?.request,
    hasCloudflareRequest: !!nativeEvent?.context?.cloudflare?.request,
    hasNodeReq: !!nativeEvent?.node?.req,
    hasCf: !!cf,
  })

  if (!cf)
    return null

  const info: ConnectionInfo = {
    tlsVersion: cf.tlsVersion ?? null,
    httpProtocol: cf.httpProtocol ?? null,
    city: cf.city ?? null,
    country: cf.country ?? null,
    colo: cf.colo ?? null,
  }

  // eslint-disable-next-line no-console
  console.log('info', info)

  return info
}, getConnectionInfoId)
