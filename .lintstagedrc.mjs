export default {
  '*.{js,jsx,ts,tsx}': () => {
    return [
      'biome check .',
      'biome format --write .'
    ]
  },
  '*.{json,md,mdx,css,html}': () => {
    return 'biome format --write .'
  },
  '*.{ts,tsx}': () => 'tsc --noEmit --skipLibCheck'
}