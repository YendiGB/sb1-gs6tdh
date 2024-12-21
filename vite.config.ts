import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      host: true
    },
    // Ensure environment variables are properly exposed
    define: {
      'process.env': process.env
    }
  };
});