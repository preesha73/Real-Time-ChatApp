import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this build configuration to fix the 'import.meta' warning
  // by targeting modern JavaScript environments.
  build: {
    target: 'es2020'
  }
})

