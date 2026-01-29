import { getRequestEvent } from 'solid-js/web'

/**
 * Returns the current authenticated user's id, or throws if not signed in.
 */
export async function requireUserId(): Promise<string> {
  const event = getRequestEvent()

  if (!event?.locals?.getSession)
    throw new Error('Missing session helper on request event.')

  const session = await event.locals.getSession()
  const userId = session?.user?.id

  if (!userId)
    throw new Error('Not authenticated.')

  return userId
}
