import type { Auth } from '~/server/auth'
import { useAuth as useAuthCore } from '@rttnd/gau/client/solid'

export const useAuth = () => useAuthCore<Auth>()
