import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import presetAnimations from 'unocss-preset-animations'
import { presetShadcn } from 'unocss-preset-shadcn'
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
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetWind3(),
    presetTypography(),
    presetAnimations(),
    presetShadcn({
      color: {
        base: 'blue',
        name: 'tealFusion',
        light: {
          'card': '210 40% 98.6%',
          'primary': '190 90% 40%',
          'primary-foreground': '0 0% 98%',
          'destructive': '0 84.2% 60.2%',
          'ring': '190 92% 42%',
        },
        dark: {
          'card': '217.2 32.6% 10.5%',
          'primary': '190 85% 48%',
          'primary-foreground': '210 40% 98%',
          'accent-foreground': '210 40% 98%',
          'destructive': '0 82.8% 60.6%',
          'ring': '190 88% 46%',
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
        `
      },
    },
  ],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        "(components|src)/**/*.{js,ts}",
      ],
    },
  },
})
