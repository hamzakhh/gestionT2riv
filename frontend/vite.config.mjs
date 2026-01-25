import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    // ✅ IMPORTANT : toujours '/'
    base: '/',

    plugins: [
      react(),
      jsconfigPaths(),
    ],

    server: {
      port: 3000,
      host: true,
      open: true,

      // 🔹 Proxy API (DEV uniquement)
      proxy: {
        '/api': {
          target: 'https://gestiont2riv-tunisian.onrender.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 3000,
      host: true,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (!name) return 'assets/[name]-[hash][extname]';
            if (name.endsWith('.css')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.(woff2?|ttf|otf|eot)$/.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },

      // 🔹 Optimisation production
      ...(mode === 'production' && {
        minify: 'esbuild',
        esbuild: {
          drop: ['console', 'debugger'],
        },
      }),
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});
