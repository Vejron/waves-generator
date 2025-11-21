<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import SectionExampleView from "./SectionExampleView.vue";

type NormalizedPoint = {
  id: number;
  x: number;
  y: number;
};

const MIN_POINTS = 1;
const MAX_POINTS = 10;
const MIN_WIDTH = 300;
const MAX_WIDTH = 4000;
const MIN_HEIGHT = 40;
const MAX_HEIGHT = 800;
const POINT_GAP = 0.02;

const viewBoxWidth = ref(1000);
const viewBoxHeight = ref(100);
const pointCount = ref(4);

let pointId = 0;
const points = ref<NormalizedPoint[]>(seedPoints(pointCount.value));

const stageRef = ref<HTMLElement | null>(null);
const draggingPointId = ref<number | null>(null);
const copyFeedback = ref("");

let activeHandle: HTMLElement | null = null;
let activePointerId: number | null = null;

const orderedPoints = computed(() =>
  [...points.value].sort((a, b) => a.x - b.x)
);

const pathD = computed(() => {
  const width = viewBoxWidth.value;
  const height = viewBoxHeight.value;
  const anchors = orderedPoints.value;

  if (!anchors.length) {
    return "";
  }

  const scaled = anchors.map((point) => ({
    x: +(point.x * width).toFixed(2),
    y: +(point.y * height).toFixed(2),
  }));

  const firstPoint = scaled[0];
  if (!firstPoint) {
    return "";
  }

  let d = `M0,${height} L${firstPoint.x},${firstPoint.y}`;

  if (scaled.length === 1) {
    d += ` L${width},${firstPoint.y}`;
  } else {
    for (let i = 0; i < scaled.length - 1; i += 1) {
      const current = scaled[i]!;
      const nextPoint = scaled[i + 1]!;
      const p0 = scaled[i - 1] ?? current;
      const p1 = current;
      const p2 = nextPoint;
      const p3 = scaled[i + 2] ?? p2;

      const cp1x = +(p1.x + (p2.x - p0.x) / 6).toFixed(2);
      const cp1y = +(p1.y + (p2.y - p0.y) / 6).toFixed(2);
      const cp2x = +(p2.x - (p3.x - p1.x) / 6).toFixed(2);
      const cp2y = +(p2.y - (p3.y - p1.y) / 6).toFixed(2);
      if (i === 0) {
        d += ` S${cp2x},${cp2y} ${p2.x},${p2.y}`;
      } else {
        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
    }
  }

  d += ` L${width},${height} L0,${height} Z`;
  return d;
});

watch(viewBoxWidth, (value) => {
  const next = clamp(value, MIN_WIDTH, MAX_WIDTH);
  if (next !== value) {
    viewBoxWidth.value = next;
  }
});

watch(viewBoxHeight, (value) => {
  const next = clamp(value, MIN_HEIGHT, MAX_HEIGHT);
  if (next !== value) {
    viewBoxHeight.value = next;
  }
});

watch(pointCount, (value) => {
  const next = clamp(value, MIN_POINTS, MAX_POINTS);
  if (next !== value) {
    pointCount.value = next;
    return;
  }

  points.value = resamplePoints(orderedPoints.value, next);
});

function seedPoints(count: number): NormalizedPoint[] {
  const target = clamp(Math.round(count), MIN_POINTS, MAX_POINTS);
  return Array.from({ length: target }, (_, index) => {
    const t = target === 1 ? 0.5 : index / (target - 1);
    return {
      id: nextPointId(),
      x: t,
      y: pleasantBaseline(t),
    };
  });
}

function pleasantBaseline(t: number): number {
  const base = 0.5 - Math.cos(t * Math.PI) * 0.25;
  return clamp01(base);
}

function pleasantWithNoise(t: number): number {
  const noise = (Math.random() - 0.5) * 0.25;
  return clamp01(pleasantBaseline(t) + noise);
}

function resamplePoints(
  existing: NormalizedPoint[],
  count: number
): NormalizedPoint[] {
  if (!existing.length) {
    return seedPoints(count);
  }

  const sorted = [...existing].sort((a, b) => a.x - b.x);

  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0.5 : index / (count - 1);
    return {
      id: nextPointId(),
      x: t,
      y: sampleY(sorted, t),
    };
  });
}

function sampleY(sorted: NormalizedPoint[], x: number): number {
  if (!sorted.length) {
    return 0.5;
  }

  const first = sorted[0]!;
  if (x <= first.x) {
    return first.y;
  }

  const last = sorted[sorted.length - 1]!;
  if (x >= last.x) {
    return last.y;
  }

  let rightIndex = sorted.findIndex((point) => point.x >= x);
  if (rightIndex === -1) {
    rightIndex = sorted.length - 1;
  }

  const right = sorted[rightIndex]!;
  const left = sorted[rightIndex - 1]!;
  const span = Math.max(right.x - left.x, 1e-6);
  const ratio = (x - left.x) / span;
  return clamp01(left.y + ratio * (right.y - left.y));
}

function nextPointId(): number {
  pointId += 1;
  return pointId;
}

function randomizePoints(): void {
  const current = orderedPoints.value;
  if (!current.length) {
    points.value = seedPoints(pointCount.value);
    return;
  }

  points.value = current.map((point, index, arr) => {
    const t = arr.length === 1 ? 0.5 : index / (arr.length - 1);
    return {
      id: nextPointId(),
      x: t,
      y: pleasantWithNoise(t),
    };
  });
}

function resetPoints(): void {
  points.value = seedPoints(pointCount.value);
}

function startDrag(id: number, event: PointerEvent): void {
  if (!stageRef.value || typeof window === "undefined") {
    return;
  }

  draggingPointId.value = id;
  activeHandle = event.currentTarget as HTMLElement;
  activePointerId = event.pointerId;
  activeHandle?.setPointerCapture?.(event.pointerId);

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", stopDrag);
}

function handlePointerMove(event: PointerEvent): void {
  if (draggingPointId.value === null || !stageRef.value) {
    return;
  }

  const rect = stageRef.value.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  let nextX = (event.clientX - rect.left) / rect.width;
  let nextY = (event.clientY - rect.top) / rect.height;

  nextX = clamp01(nextX);
  nextY = clamp01(nextY);

  const currentIndex = orderedPoints.value.findIndex(
    (point) => point.id === draggingPointId.value
  );
  if (currentIndex === -1) {
    return;
  }

  const prev = orderedPoints.value[currentIndex - 1];
  const next = orderedPoints.value[currentIndex + 1];

  if (prev) {
    nextX = Math.max(nextX, prev.x + POINT_GAP);
  }
  if (next) {
    nextX = Math.min(nextX, next.x - POINT_GAP);
  }

  updatePointById(draggingPointId.value, { x: nextX, y: nextY });
}

function stopDrag(): void {
  if (typeof window !== "undefined") {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDrag);
  }

  if (activeHandle && activePointerId !== null) {
    activeHandle.releasePointerCapture?.(activePointerId);
  }

  activeHandle = null;
  activePointerId = null;
  draggingPointId.value = null;
}

function updatePointById(id: number, data: Partial<NormalizedPoint>): void {
  const updated = points.value.map((point) =>
    point.id === id ? { ...point, ...data } : point
  );
  updated.sort((a, b) => a.x - b.x);
  points.value = updated;
}

async function copyPath(): Promise<void> {
  if (
    !pathD.value ||
    typeof navigator === "undefined" ||
    !navigator.clipboard
  ) {
    return;
  }

  try {
    await navigator.clipboard.writeText(pathD.value);
    copyFeedback.value = "Copied!";
  } catch {
    copyFeedback.value = "Copy failed";
  } finally {
    window.setTimeout(() => {
      copyFeedback.value = "";
    }, 1500);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

onBeforeUnmount(() => {
  stopDrag();
});
</script>

<template>
  <div class="space-y-6">
    <UContainer class="flex flex-col gap-6 lg:flex-row">
      <UCard class="min-w-sm">
        <template #header>Wave Controls</template>
        <div class="grid gap-6">
          <div class="flex gap-4 justify-between">
            <UFormField label="Width">
              <UInput
                v-model.number="viewBoxWidth"
                class="min-w-20"
                type="number"
                :min="MIN_WIDTH"
                :max="MAX_WIDTH"
              />
            </UFormField>

            <USeparator class="mt-6" icon="i-lucide-x" />

            <UFormField label="Height">
              <UInput
                v-model.number="viewBoxHeight"
                class="min-w-20"
                type="number"
                :min="MIN_HEIGHT"
                :max="MAX_HEIGHT"
              />
            </UFormField>
          </div>
          <UFormField
            :label="'Control points (' + pointCount + ')'"
            help="1 to 10 draggable anchors"
          >
            <USlider
              v-model="pointCount"
              class="mt-3"
              :min="MIN_POINTS"
              :max="MAX_POINTS"
              :step="1"
            />
          </UFormField>

          <div class="flex justify-between gap-3">
            <UButton
              icon="i-heroicons-sparkles-20-solid"
              color="primary"
              @click="randomizePoints"
            >
              Randomize
            </UButton>
            <UButton variant="subtle" color="neutral" @click="resetPoints">
              Reset
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>Wave Preview</template>

        <div
          ref="stageRef"
          class="relative border border-muted rounded-sm overflow-hidden"
          :style="{ aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}` }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
            preserveAspectRatio="none"
          >
            <path class="svg-path" :d="pathD" />
          </svg>

          <button
            v-for="point in orderedPoints"
            :key="point.id"
            class="control-handle"
            :style="{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }"
            type="button"
            @pointerdown.prevent="startDrag(point.id, $event)"
          />
        </div>

        <div class="mt-5">
          <p class="mb-2">Path definition</p>
          <code class="path-output block bg-muted">{{ pathD }}</code>
          <div class="copy-row mt-5">
            <UButton
              size="sm"
              color="neutral"
              variant="subtle"
              :disabled="!pathD"
              @click="copyPath"
            >
              Copy path
            </UButton>
            <span class="copy-feedback">{{ copyFeedback }}</span>
          </div>
          <p class="viewbox-hint">
            viewBox="0 0 {{ viewBoxWidth }} {{ viewBoxHeight }}"
          </p>
        </div>
      </UCard>
    </UContainer>
    
    <template v-if="pathD">
      <SectionExampleView :height="viewBoxHeight" :width="viewBoxWidth" :path="pathD" />
      <SectionExampleView :height="viewBoxHeight" :width="viewBoxWidth" :path="pathD" />
      <SectionExampleView :height="viewBoxHeight" :width="viewBoxWidth" :path="pathD" />
    </template>
      
 
  </div>
</template>

<style scoped>
.svg-path {
  fill: rgb(59, 130, 246);
  transition: d 160ms ease, fill 160ms ease;
}

.control-handle {
  position: absolute;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 999px;
  border: 2px solid rgba(15, 23, 42, 0.6);
  background: #fff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  transform: translate(-50%, -50%);
  cursor: grab;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.control-handle:hover {
  transform: translate(-50%, -50%) scale(1.05);
}

.control-handle:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(0.95);
}

.path-panel {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.path-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: rgba(15, 23, 42, 0.7);
}

.path-output {
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo,
    monospace;
  font-size: 0.85rem;
  word-break: break-all;
  white-space: normal;
}

.copy-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.copy-feedback {
  min-height: 1.25rem;
  font-size: 0.85rem;
  color: rgb(16, 185, 129);
}

.viewbox-hint {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.7);
  margin: 0;
}

</style>
