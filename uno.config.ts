import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { presetShadcn } from '@rttnd/unocss-preset-shadcn'
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import presetAnimations from 'unocss-preset-animations'
import { minify } from './src/utils'

export default defineConfig({
  shortcuts: [
    {
      code: 'rounded-sm bg-muted-foreground/20 px-1 font-mono',
    },
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        speedometer: FileSystemIconLoader(
          './src/assets/speedometer',
          svg => svg.replace(/^<svg /, '<svg fill="currentColor" '),
        ),
      },
    }),
    presetTypography(),
    presetAnimations(),
    presetShadcn({
      color: {
        base: 'rose',
        dark: {
          'background': '0.14 0.015 30',
          'foreground': '0.958 0.012 44',
          'card': '0.18 0.018 30',
          'card-foreground': '0.96 0.012 44',
          'popover': '0.17 0.016 28',
          'popover-foreground': '0.96 0.012 44',
          'primary': '0.92 0.033 32',
          'primary-foreground': '0.14 0.015 30',
          'secondary': '0.31 0.032 25',
          'secondary-foreground': '0.92 0.033 32',
          'muted': '0.24 0.012 28',
          'muted-foreground': '0.68 0.014 38',
          'accent': '0.31 0.032 28',
          'accent-foreground': '0.92 0.033 32',
          'destructive': '0.62 0.19 25',
          'destructive-foreground': '0.96 0.012 44',
          'border': '0.94 0.02 30 / 12%',
          'input': '0.94 0.02 30 / 18%',
          'ring': '0.92 0.033 32',
          'chart-1': '0.72 0.06 25',
          'chart-2': '0.75 0.06 10',
          'chart-3': '0.74 0.05 45',
          'chart-4': '0.78 0.06 5',
          'chart-5': '0.76 0.05 35',
        },
      },
    }),
  ],
  preflights: [
    {
      getCSS: () => {
        return minify`
          html, body {
            padding: 0;
            margin: 0;
            height: 100dvh;
            width: 100dvw;
            overflow-x: hidden;
            scroll-behavior: smooth;
          }

          body {
            font-family: 'Josefin Sans Variable', sans-serif;
          }

          ::-webkit-scrollbar {
            width: 12px;
          }

          ::-webkit-scrollbar-thumb {
            border-radius: 9999px;
            border: 4px solid transparent;
            background-clip: content-box;
            @apply bg-muted;
          }

          ::-webkit-scrollbar-corner { 
            display: none; 
          }

          @keyframes collapsible-down {
            from { height: 0; }
            to { height: var(--kb-collapsible-content-height); }
          }

          @keyframes collapsible-up {
            from { height: var(--kb-collapsible-content-height); }
            to { height: 0; }
          }

          /* View Transitions */
          @keyframes fade-in {
            from { opacity: 0; }
          }

          @keyframes fade-out {
            to { opacity: 0; }
          }

          @keyframes slide-from-right {
            from {
              opacity: 0;
              transform: translateX(1rem);
            }
          }

          @keyframes slide-from-left {
            from {
              opacity: 0;
              transform: translateX(-1rem);
            }
          }

          @keyframes slide-to-left {
            to {
              opacity: 0;
              transform: translateX(-1rem);
            }
          }

          @keyframes slide-to-right {
            to {
              opacity: 0;
              transform: translateX(1rem);
            }
          }

          /* Default page transition: subtle fade */
          ::view-transition-old(root) {
            animation: 180ms cubic-bezier(0.4, 0, 1, 1) both fade-out;
          }

          ::view-transition-new(root) {
            animation: 220ms cubic-bezier(0, 0, 0.2, 1) both fade-in;
          }
        `
      },
    },
  ],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        '**/*.{js,ts}',
      ],
    },
  },
})
