<template>
  <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-stone-900 p-6 text-white shadow-2xl">
    <div class="grid gap-8 lg:grid-cols-[320px,1fr]">
      <UCard class="border border-white/5 bg-white/5 text-slate-100 backdrop-blur" :ui="{ body: 'space-y-5' }">
        <template #header>
          <div class="space-y-2">
            <p class="text-sm uppercase tracking-[0.3em] text-slate-300">Tailwind v4 palette</p>
            <h2 class="text-2xl font-semibold text-white">OKLCH shade builder</h2>
            <p class="text-sm text-slate-300">
              Inspired by Matteo Frana's deep dive into Tailwind's <span class="text-sky-200">OKLCH curves</span> and the experiments behind <span class="text-amber-200">uihue.com</span>.
            </p>
          </div>
        </template>

        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Base hex color</label>
          <UInput v-model="hexInput" placeholder="#38bdf8" icon="ph:drop" size="md" class="font-mono uppercase tracking-wide" />
          <p v-if="inputError" class="text-xs text-rose-300">{{ inputError }}</p>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Token prefix</label>
          <UInput v-model="tokenName" placeholder="brand" icon="ph:hash" size="md" class="font-mono tracking-wide" />
        </div>

        <div class="flex gap-3">
          <UButton color="white" variant="soft" icon="ph:dice-five" class="flex-1 text-slate-900" @click="randomize">
            Surprise me
          </UButton>
          <UButton :disabled="!palette.length" icon="ph:copy" class="flex-1" @click="copyTheme">
            Copy @theme
          </UButton>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">@theme snippet</label>
          <pre class="mt-2 max-h-48 overflow-y-auto rounded-2xl bg-slate-900/70 p-4 text-[0.75rem] leading-relaxed text-slate-100">{{ themeSnippet }}</pre>
        </div>
      </UCard>

      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-xs uppercase tracking-[0.4em] text-slate-400">Shades</span>
          <span v-if="baseColor" class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-200">
            oklch({{ formatNumber(baseColor.l) }} {{ formatNumber(baseColor.c) }} {{ formatNumber(baseColor.h, 1) }})
          </span>
        </div>

        <div v-if="palette.length" class="grid gap-3 md:grid-cols-2">
          <div
            v-for="shade in palette"
            :key="shade.stop"
            class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg"
          >
            <div class="absolute inset-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100" :style="{ background: shade.hex }" />
            <div class="relative space-y-2 text-white drop-shadow">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold tracking-wide">{{ shade.stop }}</span>
                <span class="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{{ tokenLabel }}-{{ shade.stop }}</span>
              </div>
              <p class="font-mono text-sm">{{ shade.hex.toUpperCase() }}</p>
              <p class="font-mono text-xs text-white/90">{{ formatOklch(shade.oklch) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-300">
          Enter a valid 6-digit hex color to see Tailwind-style OKLCH shades.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export interface OklchColor {
  l: number
  c: number
  h: number
}

export interface TailwindShade {
  stop: number
  hex: string
  oklch: OklchColor
}
</script>

<script lang="ts" setup>
const SHADE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const BASE_LIGHTNESS: Record<(typeof SHADE_STOPS)[number], number> = {
  50: 0.97,
  100: 0.92,
  200: 0.85,
  300: 0.78,
  400: 0.7,
  500: 0.62,
  600: 0.55,
  700: 0.48,
  800: 0.4,
  900: 0.32,
  950: 0.26,
}

const LIGHTNESS_SMOOTHING: Record<(typeof SHADE_STOPS)[number], number> = {
  50: 0.35,
  100: 0.45,
  200: 0.6,
  300: 0.75,
  400: 0.9,
  500: 1,
  600: 1,
  700: 0.85,
  800: 0.65,
  900: 0.55,
  950: 0.5,
}

const BASE_CHROMA: Record<(typeof SHADE_STOPS)[number], number> = {
  50: 0.02,
  100: 0.04,
  200: 0.07,
  300: 0.11,
  400: 0.15,
  500: 0.18,
  600: 0.16,
  700: 0.13,
  800: 0.1,
  900: 0.08,
  950: 0.06,
}

const CHROMA_BLEND: Record<(typeof SHADE_STOPS)[number], number> = {
  50: 0.25,
  100: 0.35,
  200: 0.55,
  300: 0.7,
  400: 0.85,
  500: 1,
  600: 0.95,
  700: 0.8,
  800: 0.65,
  900: 0.5,
  950: 0.35,
}

const HUE_CURVE: Record<(typeof SHADE_STOPS)[number], number> = {
  50: 2.5,
  100: 2,
  200: 1.6,
  300: 1.2,
  400: 0.6,
  500: 0,
  600: -0.6,
  700: -1.2,
  800: -1.7,
  900: -2.1,
  950: -2.6,
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

const toast = useToast()

const hexInput = ref('#38bdf8')
const tokenName = ref('brand')

const normalizedHex = computed(() => normalizeHex(hexInput.value))

const baseColor = computed(() => {
  if (!normalizedHex.value) {
    return null
  }
  return hexToOklch(normalizedHex.value)
})

const palette = computed<TailwindShade[]>(() => {
  if (!baseColor.value) {
    return []
  }
  return buildPalette(baseColor.value)
})

const tokenLabel = computed(() => tokenName.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'brand')

const themeSnippet = computed(() => {
  if (!palette.value.length) {
    return '// waiting for a valid color'
  }
  const lines = palette.value
    .map((shade) => `  --color-${tokenLabel.value}-${shade.stop}: ${formatOklch(shade.oklch)};`)
    .join('\n')
  return `@theme {\n${lines}\n}`
})

const inputError = computed(() => (hexInput.value && !normalizedHex.value ? 'Please enter a valid 3 or 6 digit hex value.' : ''))

function randomize() {
  const random = Math.floor(Math.random() * 0xffffff)
  hexInput.value = `#${random.toString(16).padStart(6, '0')}`
}

async function copyTheme() {
  if (!palette.value.length) {
    return
  }
  try {
    await navigator.clipboard.writeText(themeSnippet.value)
    toast.add({ title: 'Copied!', description: 'Tailwind @theme block is on your clipboard.' })
  } catch (error) {
    toast.add({ title: 'Clipboard unavailable', description: 'Unable to copy right now.', color: 'rose' })
    console.error(error)
  }
}

function buildPalette(base: OklchColor): TailwindShade[] {
  const lDelta = base.l - BASE_LIGHTNESS[500]
  const baseChromaValue = BASE_CHROMA[500]
  const chromaRatio = baseChromaValue > 0 ? base.c / baseChromaValue : 0

  return SHADE_STOPS.map((stop) => {
    const smoothing = LIGHTNESS_SMOOTHING[stop]
    const targetL = clamp(BASE_LIGHTNESS[stop] + lDelta * smoothing, 0.02, 0.98)

    const blend = CHROMA_BLEND[stop]
    const referenceC = BASE_CHROMA[stop] * (chromaRatio || 1)
    const targetC = clamp(lerp(base.c, referenceC, blend), 0, 0.37)

    const hueShift = resolveHueShift(stop, base.h)
    const targetH = wrapHue(base.h + hueShift)

    const oklchColor: OklchColor = { l: targetL, c: targetC, h: targetH }
    const hex = oklchToHex(oklchColor)

    return { stop, hex, oklch: oklchColor }
  })
}

function resolveHueShift(stop: (typeof SHADE_STOPS)[number], baseHue: number) {
  const curveShift = HUE_CURVE[stop]
  const isWarm = baseHue >= 40 && baseHue <= 140
  const isCool = baseHue >= 200 && baseHue <= 300
  if (isWarm && stop >= 600) {
    return curveShift * 1.4
  }
  if (isCool && stop >= 600) {
    return curveShift * 1.3
  }
  return curveShift
}

function normalizeHex(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }
  if (!HEX_PATTERN.test(trimmed)) {
    return ''
  }
  let hex = trimmed.replace('#', '').toLowerCase()
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char.repeat(2)).join('')
  }
  return `#${hex}`
}

function hexToOklch(hex: string): OklchColor {
  const rgb = hexToRgb(hex)
  const oklab = rgbToOklab(rgb)
  return oklabToOklch(oklab)
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255
  return { r, g, b }
}

function rgbToOklab({ r, g, b }: { r: number; g: number; b: number }) {
  const rl = srgbToLinear(r)
  const gl = srgbToLinear(g)
  const bl = srgbToLinear(b)

  const l = Math.cbrt(0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl)
  const m = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl)
  const s = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl)

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

function oklabToOklch({ l, a, b }: { l: number; a: number; b: number }): OklchColor {
  const c = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) {
    h += 360
  }
  return { l, c, h }
}

function oklchToHex(color: OklchColor) {
  const hex = oklchToRgb(color)
  return `#${[hex.r, hex.g, hex.b]
    .map((channel) => Math.round(channel * 255))
    .map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, '0'))
    .join('')}`
}

function oklchToRgb({ l, c, h }: OklchColor) {
  const a = Math.cos((h * Math.PI) / 180) * c
  const b = Math.sin((h * Math.PI) / 180) * c
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const l3 = l_ * l_ * l_
  const m3 = m_ * m_ * m_
  const s3 = s_ * s_ * s_

  const rl = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  const gl = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

  return {
    r: linearToSrgb(rl),
    g: linearToSrgb(gl),
    b: linearToSrgb(bl),
  }
}

function srgbToLinear(value: number) {
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
}

function linearToSrgb(value: number) {
  const v = clamp(value, 0, 1)
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t
}

function wrapHue(value: number) {
  const mod = value % 360
  return mod < 0 ? mod + 360 : mod
}

function formatNumber(value: number, precision = 3) {
  return Number(value).toFixed(precision)
}

function formatOklch(color: OklchColor) {
  return `oklch(${formatNumber(color.l)} ${formatNumber(color.c)} ${formatNumber(color.h, 1)})`
}
</script>

<style scoped>
.font-mono {
  font-family: "IBM Plex Mono", "Space Grotesk", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>