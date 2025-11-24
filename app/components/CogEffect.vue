<script lang="ts" setup>
import { useEventListener } from '@vueuse/core';

type GearSpec = {
  id: string
  teeth: number
  offsetAngle: number
  color: string
}

type GearShape = GearSpec & {
  pitchRadius: number
  outerRadius: number
  rootRadius: number
  path: string
  position: { x: number; y: number }
  phaseDeg: number
}

const gearSpecs: GearSpec[] = [
  { id: 'gear-10', teeth: 9, offsetAngle: 0, color: '#ffb703' },
  { id: 'gear-12', teeth: 14, offsetAngle: 0, color: '#023047' },
  { id: 'gear-15', teeth: 47, offsetAngle: 65, color: '#a13e1c' },
  { id: 'gear-20', teeth: 25, offsetAngle: -19, color: '#219ebc' },
]

const toothModule = 3.7
const meshClearance = 0

const scrollY = ref(0)

const baseRotation = computed(() => scrollY.value * 1.25)

const gearShapes = computed<GearShape[]>(() => {
  const centers: Array<{ x: number; y: number }> = []
  gearSpecs.forEach((spec, index) => {
    if (index === 0) {
      centers.push({ x: 0, y: 0 })
      return
    }
    const prevSpec = gearSpecs[index - 1]
    const prevPitch = prevSpec ? (prevSpec.teeth * toothModule) / 2 : 0
    const currentPitch = (spec.teeth * toothModule) / 2
    const distance = prevPitch + currentPitch + meshClearance
    const angle = degToRad(spec.offsetAngle)
    const prevCenter = centers[index - 1] ?? { x: 0, y: 0 }
    centers.push({
      x: prevCenter.x + Math.cos(angle) * distance,
      y: prevCenter.y + Math.sin(angle) * distance
    })
  })

  const xs = centers.map((center) => center.x)
  const ys = centers.map((center) => center.y)
  const minX = Math.min(...xs, 0)
  const maxX = Math.max(...xs, 0)
  const minY = Math.min(...ys, 0)
  const maxY = Math.max(...ys, 0)
  const offsetX = (minX + maxX) / 2
  const offsetY = (minY + maxY) / 2

  const baseShapes = gearSpecs.map((spec, index) => {
    const pitchRadius = (spec.teeth * toothModule) / 2
    const outerRadius = pitchRadius + toothModule * 0.75
    const rootRadius = Math.max(pitchRadius - toothModule * 1.2, toothModule * 0.6)
    const currentCenter = centers[index] ?? { x: 0, y: 0 }
    return {
      ...spec,
      pitchRadius,
      outerRadius,
      rootRadius,
      path: createGearPath(spec.teeth, pitchRadius, outerRadius, rootRadius),
      position: {
        x: currentCenter.x - offsetX,
        y: currentCenter.y - offsetY
      },
      phaseDeg: 0
    }
  })

  return baseShapes.map((gear, index, arr) => {
    if (index === 0) {
      const next = arr[index + 1]
      if (!next) return gear
      const dir = Math.atan2(next.position.y - gear.position.y, next.position.x - gear.position.x)
      return { ...gear, phaseDeg: radToDeg(dir) }
    }

    const prev = arr[index - 1]
    if (!prev) return gear
    const dir = Math.atan2(prev.position.y - gear.position.y, prev.position.x - gear.position.x)
    const valleyAngle = Math.PI / gear.teeth
    return { ...gear, phaseDeg: radToDeg(dir - valleyAngle) }
  })
})

const gearAngles = computed(() => {
  const angles: number[] = []
  const shapes = gearShapes.value
  shapes.forEach((gear, index) => {
    if (index === 0) {
      angles.push(baseRotation.value + (gear.phaseDeg ?? 0))
      return
    }
    const driver = shapes[index - 1]
    const driverAngle = angles[index - 1]
    if (!driver || driverAngle === undefined) {
      angles.push(gear.phaseDeg ?? 0)
      return
    }
    const ratio = driver.teeth / gear.teeth
    const meshOffset = (gear.phaseDeg ?? 0) + ratio * (driver.phaseDeg ?? 0)
    // Preserve angular offsets from both gears so the contact point stays aligned.
    angles.push(-driverAngle * ratio + meshOffset)
  })
  return angles
})

onMounted(() => {
  scrollY.value = window.scrollY || 0
  useEventListener(
    window,
    'scroll',
    () => {
      scrollY.value = window.scrollY || 0
    },
    { passive: true }
  )
})

function createGearPath(
  teeth: number,
  pitchRadius: number,
  outerRadius: number,
  rootRadius: number
) {
  const step = (Math.PI * 2) / teeth
  const flank = step * 0.30
  const plateau = step * 0.1

  const points: Array<{ x: number; y: number }> = []
  for (let i = 0; i < teeth; i += 1) {
    const baseAngle = i * step
    const angles = [
      { angle: baseAngle - flank, r: rootRadius },
      { angle: baseAngle - plateau, r: outerRadius },
      { angle: baseAngle + plateau, r: outerRadius },
      { angle: baseAngle + flank, r: rootRadius }
    ]
    angles.forEach(({ angle, r }) => {
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
    })
  }

  if (!points.length) return ''

  const start = points[0]
  if (!start) return ''
  const rest = points.slice(1)
  const commands = [`M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`]
  rest.forEach((point) => {
    commands.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
  })
  commands.push('Z')
  return commands.join(' ')
}

function radToDeg(rad: number) {
  return (rad * 180) / Math.PI
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}
</script>

<template>
  <section class="gear-hero">
    <svg
      class="gear-stage"
      viewBox="-260 -190 560 360"
      role="presentation"
      aria-hidden="true"
    >
      <g
        v-for="(gear, index) in gearShapes"
        :key="gear.id"
        class="gear"
        :style="{ '--gear-color': gear.color }"
        :transform="`translate(${gear.position.x} ${gear.position.y})`"
      >
        <g class="transition-transform duration-500 ease-out" :transform="`rotate(${gearAngles[index] ?? 0})`">
          <path class="gear__body" :d="gear.path" />
          <circle class="gear__hub" cx="0" cy="0" :r="gear.pitchRadius * 0.25" />
          <circle class="gear__axle" cx="0" cy="0" :r="gear.pitchRadius * 0.08" />
        </g>
      </g>
    </svg>
    <p class="gear-caption">
      Scroll to keep the cogs in sync — each gear responds to your scroll speed using a proper tooth ratio.
    </p>
  </section>
</template>

<style scoped>
.gear-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 4rem 1rem;
  min-height: 80vh;
  background: radial-gradient(circle at top, #1f2937 0%, #0b1120 60%);
  color: #f8fafc;
  overflow: hidden;
}

.gear-stage {
  width: min(900px, 100%);
  max-height: 400px;
}

.gear {
  transform-origin: center;
}

.gear__body {
  fill: color-mix(in srgb, var(--gear-color) 85%, #ffffff 15%);
  stroke: rgba(255, 255, 255, 0.35);
  stroke-width: 1.5;
  filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.35));
}

.gear__hub {
  fill: color-mix(in srgb, var(--gear-color) 45%, #0f172a 55%);
}

.gear__axle {
  fill: #f1f5f9;
}

.gear-caption {
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(248, 250, 252, 0.8);
}

@media (max-width: 640px) {
  .gear-hero {
    padding: 3rem 1rem;
  }

  .gear-stage {
    max-height: 300px;
  }
}
</style>