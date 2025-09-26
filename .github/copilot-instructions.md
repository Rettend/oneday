# IMPORTANT

- Never try to fix linter errors and warnings yourself, they are autofixable, so just leave them and let me do it, you don't even need to mention them.
  - Don't fix these: unexpected console statement, input order, unocss class order, indentation, etc
- The terminal is Windows CMD, so Linux commands are not available.
- We don't care about backwards compatibility whatsoever, no one uses the app, we change what we want. It's more important to create the best implementation, instead of worrying about breaking changes
- Do not run the dev, build, test, lint scripts, I run them

## SolidJS

### Errors

- eslint solid/reactivity: The reactive variable 'props.x' should be used within JSX, a tracked scope (like createEffect), or inside an event handler function, or else changes will be ignored.
  - if you want the signal to be reactive, use createMemo
  - if you also want to mutate the signal, use createWritableMemo
  - otherwise just use untrack
