import type { IncomingMessage, ServerResponse } from 'node:http'

export const MP_PLANS: Record<string, { id: string; name: string; monthly: number; yearlyPix: number }>

export function createCheckout(opts: {
  plan: string
  kind: string
  email: string
  tenantId?: string
}): Promise<{ init_point: string; id: string; kind: string }>

export function handleMpRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean>
