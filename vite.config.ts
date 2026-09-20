import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type ViteDevServer } from 'vite'

type MpHandler = (req: IncomingMessage, res: ServerResponse) => Promise<boolean>

function mpApi() {
  let handler: MpHandler | undefined
  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!handler) {
      const mod = await import('./server/mp.mjs' as string) as { handleMpRequest: MpHandler }
      handler = mod.handleMpRequest
    }
    const handled = await handler(req, res)
    if (!handled) next()
  }
  return {
    name: 'mp-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server: ViteDevServer) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), mpApi()],
  base: process.env.NODE_ENV === 'production' ? '/nevoalaje/' : './',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.monkeycode-ai.live'],
  },
})
