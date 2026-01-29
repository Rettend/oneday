import { routeAgentRequest } from '@rttnd/agents'

export { ChatAgent } from './agents/chat'

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const agentResponse = await routeAgentRequest(request, env)
    if (agentResponse)
      return agentResponse

    const url = new URL(request.url)
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Agent worker - use WebSocket to connect', { status: 200 })
  },
}
