import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import type { VariantProps } from 'class-variance-authority'

import type { JSX, ValidComponent } from 'solid-js'
import * as ButtonPrimitive from '@kobalte/core/button'
import { cva } from 'class-variance-authority'
import { splitProps } from 'solid-js'

import { cn } from '~/utils'

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary/90 text-primary-foreground hover:bg-primary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border/80 bg-background/70 text-foreground hover:border-primary/40 hover:bg-primary/6',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        invisible: 'bg-transparent hover:bg-transparent text-foreground/80 hover:text-foreground/100',
        muted: 'bg-background/50 ring-1 ring-border/60 backdrop-blur-md text-foreground/80 hover:text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps<T extends ValidComponent = 'button'> = ButtonPrimitive.ButtonRootProps<T>
  & VariantProps<typeof buttonVariants> & { class?: string | undefined, children?: JSX.Element }

function Button<T extends ValidComponent = 'button'>(props: PolymorphicProps<T, ButtonProps<T>>) {
  const [local, others] = splitProps(props as ButtonProps, ['variant', 'size', 'class'])
  return (
    <ButtonPrimitive.Root
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
