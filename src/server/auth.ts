import { DrizzleAdapter } from '@rttnd/gau/adapters/drizzle'
import { createAuth } from '@rttnd/gau/core'
import { Discord, GitHub, Google } from '@rttnd/gau/oauth'
import { serverEnv } from '~/env/server'
import { db } from './db'
import { Accounts, Users } from './db/schema'

export const auth = createAuth({
  adapter: DrizzleAdapter(db, Users, Accounts),
  providers: [
    GitHub({
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
    }),
    Discord({
      clientId: serverEnv.DISCORD_CLIENT_ID,
      clientSecret: serverEnv.DISCORD_CLIENT_SECRET,
    }),
    Google({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    }),
  ],
  jwt: {
    secret: serverEnv.AUTH_SECRET,
  },
})

export type Auth = typeof auth
