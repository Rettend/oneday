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
    }),
    presetTypography(),
    presetAnimations(),
    presetShadcn({
      color: {
        base: 'rose',
        dark: {
          'background': '0.1213 0.0322 270.57',
          'foreground': '0.9771 0.0115 37.42',
          'card': '0.17 0.02 278',
          'card-foreground': '0.97 0.013 290',
          'popover': '0.16 0.02 280',
          'popover-foreground': '0.97 0.013 290',
          'primary': '0.925 0.0397 39.3',
          'primary-foreground': '0.1213 0.0322 270.57',
          'secondary': '0.2988 0.0342 286.54',
          'secondary-foreground': '0.925 0.0397 39.3',
          'muted': '0.23 0.01 288',
          'muted-foreground': '0.7 0.015 295',
          'accent': '0.2988 0.0342 286.54',
          'accent-foreground': '0.925 0.0397 39.3',
          'destructive': '0.64 0.2 22',
          'destructive-foreground': '0.97 0.01 290',
          'border': '0.8 0.02 290 / 12%',
          'input': '0.8 0.02 290 / 18%',
          'ring': '0.925 0.0397 39.3',
          'chart-1': '0.72 0.06 300',
          'chart-2': '0.75 0.06 330',
          'chart-3': '0.74 0.05 180',
          'chart-4': '0.78 0.06 40',
          'chart-5': '0.76 0.05 160',
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
