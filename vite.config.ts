import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Malaky — Jeu de soirée',
        short_name: 'Malaky',
        description: 'Le party game des Malgaches. Action ou Vérité, Culture Générale, Défis express. 7500+ cartes.',
        theme_color: '#0A0F1E',
        background_color: '#0A0F1E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'fr',
        categories: ['games', 'entertainment'],
        icons: [
          { src: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' },
          { src: '/favicon.ico', sizes: '192x192', type: 'image/x-icon', purpose: 'any' },
          { src: '/favicon.ico', sizes: '512x512', type: 'image/x-icon', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static',
              expiration: { maxEntries: 20, maxAgeSeconds: 31536000 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/functions/,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-functions', networkTimeoutSeconds: 3 }
          }
        ]
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
