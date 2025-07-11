import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite';
import path from 'path'
import { version } from './package.json';

export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv(mode, process.cwd(), ""),
  };
  const processEnvValues = {
    "process.env": Object.entries(env).reduce((prev, [key, val]) => ({
      ...prev,
      [key]: val,
    }), {
      VERSION: version,
    }),
  };

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      }
    },
    define: processEnvValues,
  }
});
