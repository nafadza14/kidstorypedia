import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Serves POST /api/ai during `npm run dev` using the same handler as the
 * Vercel function, so the Gemini key stays server-side in both places.
 */
function devApi(env: Record<string, string>): Plugin {
  return {
    name: 'kidstorypedia-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        let raw = '';
        for await (const chunk of req) raw += chunk;
        const { handleAI } = await server.ssrLoadModule('/server/ai.ts');
        const result = await handleAI(JSON.parse(raw || '{}'), env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY, 'dev');
        res.statusCode = result.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.body));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), devApi(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['motion'],
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
