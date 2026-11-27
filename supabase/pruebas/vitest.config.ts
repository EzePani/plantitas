import { defineConfig } from 'vitest/config'

// Pruebas contra una base de verdad levantada en esta máquina: `supabase start` y después `npm run test:base`
export default defineConfig({ test: { environment: 'node', include: ['supabase/pruebas/*.test.ts'], testTimeout: 60_000, hookTimeout: 60_000, fileParallelism: false } })
