<script lang="ts" setup>
const MIN_POINTS = 3;
const MAX_POINTS = 14;
const MIN_DEPTH = 5;
const MAX_DEPTH = 45;

const PX_SCALE = 220;
const CURVE_SAMPLE_STEPS = 48;

const pointCount = ref(6);
const depth = ref(22);
const seed = ref(1);
const copyFeedback = ref("");

const sectionShape = computed(() =>
  createSectionShape({
    points: pointCount.value,
    depthPercent: depth.value,
    seed: seed.value,
  })
);

const clipPathShape = computed(() => sectionShape.value.clipPath);

const cssSnippet = computed(
  () => `.section-clip {\n  clip-path: ${clipPathShape.value};\n}`
);

const previewStyle = computed(() => ({
  clipPath: clipPathShape.value,
}));

const commands = computed(() => sectionShape.value.commands);

watch(pointCount, (value) => {
  const next = clamp(Math.round(value), MIN_POINTS, MAX_POINTS);
  if (next !== value) {
    pointCount.value = next;
  }
});

watch(depth, (value) => {
  const next = clamp(Math.round(value), MIN_DEPTH, MAX_DEPTH);
  if (next !== value) {
    depth.value = next;
  }
});

watch(seed, (value) => {
  const next = Math.max(1, Math.round(value));
  if (next !== value) {
    seed.value = next;
  }
});

function randomizeShape(): void {
  seed.value = seed.value + 1;
}

function resetControls(): void {
  pointCount.value = 6;
  depth.value = 22;
  seed.value = 1;
}

async function copyCss(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return;
  }
  try {
    await navigator.clipboard.writeText(cssSnippet.value);
    copyFeedback.value = "Copied!";
  } catch (error) {
    copyFeedback.value = "Copy failed";
    console.error(error);
  } finally {
    setTimeout(() => {
      copyFeedback.value = "";
    }, 1500);
  }
}

function createSectionShape({
  points,
  depthPercent,
  seed,
}: {
  points: number;
  depthPercent: number;
  seed: number;
}): SectionShape {
  const safePoints = clamp(Math.round(points), MIN_POINTS, MAX_POINTS);
  const depthRatio = clamp(depthPercent / 100, MIN_DEPTH / 100, MAX_DEPTH / 100);
  const random = seededRandom(seed);

  const anchors: Point[] = Array.from({ length: safePoints }, (_, index) => {
    const t = safePoints === 1 ? 0 : index / (safePoints - 1);
    const base = 0.05 + depthRatio * (0.4 + random() * 0.6);
    const edgeEase = 1 - Math.pow(Math.abs(0.5 - t) * 2, 1.4);
    return {
      x: clamp01(t),
      y: clamp01(base * (0.6 + edgeEase * 0.4)),
    };
  });

  if (!anchors.length) {
    return {
      clipPath: "none",
      commands: [],
    };
  }

  anchors[0]!.y = 0;
  let maxCurveY = anchors[0]!.y;

  const topSegments: Instruction[] = [];
  for (let i = 1; i < anchors.length; i += 1) {
    const current = anchors[i]!;
    const prev = anchors[i - 1]!;
    const span = Math.max(current.x - prev.x, 0.01);
    const control = {
      x: clamp01(prev.x + span / 2),
      y: clamp01(
        Math.min(prev.y, current.y) - depthRatio * (0.25 + random() * 0.35)
      ),
    };
    topSegments.push({ to: current, control });

    const previousControl = topSegments.length > 1 ? topSegments[topSegments.length - 2]!.control : null;
    const entryControlY = previousControl
      ? reflect(prev.y, previousControl.y)
      : prev.y;
    const segmentMaxY = cubicSegmentMaxY(prev.y, entryControlY, control.y, current.y);
    maxCurveY = Math.max(maxCurveY, clamp01(segmentMaxY));
  }

  const bottomOffset = clamp01(1 - maxCurveY); // ensures the mirrored bottom curve clears the deepest top point

  const bottomAnchors = anchors.map((anchor) => ({
    x: anchor.x,
    y: clamp01(anchor.y + bottomOffset),
  }));

  const bottomControls = topSegments.map((segment) => ({
    x: segment.control.x,
    y: clamp01(segment.control.y + bottomOffset),
  }));

  const seamPointRight: Point = { x: 1, y: 0.5, yUnit: "percent" };
  const seamPointLeft: Point = { x: 0, y: 0.5, yUnit: "percent" };
  const topLeftCorner: Point = { x: 0, y: 0 };

  const commandMeta: ShapeCommand[] = [];
  commandMeta.push({ kind: "from", point: anchors[0]!, edge: "top" });
  for (const segment of topSegments) {
    commandMeta.push({
      kind: "smooth",
      to: segment.to,
      control: segment.control,
      edge: "top",
    });
  }

  commandMeta.push({ kind: "line", point: seamPointRight, edge: "top" });
  commandMeta.push({ kind: "line", point: seamPointLeft, edge: "top" });
  commandMeta.push({ kind: "line", point: topLeftCorner, edge: "top" });
  commandMeta.push({ kind: "close" });

  const bottomStart = bottomAnchors[0]!;
  commandMeta.push({ kind: "move", point: bottomStart, edge: "bottom" });

  for (let i = 1; i < bottomAnchors.length; i += 1) {
    const nextAnchor = bottomAnchors[i]!;
    const control = bottomControls[i - 1]!;
    commandMeta.push({
      kind: "smooth",
      to: nextAnchor,
      control,
      edge: "bottom",
    });
  }

  commandMeta.push({ kind: "line", point: seamPointRight, edge: "top" });
  commandMeta.push({ kind: "line", point: seamPointLeft, edge: "top" });
  commandMeta.push({ kind: "close" });

  const renderedCommands = commandMeta.map(formatCommand);
  const clipPath = `shape(\n  ${renderedCommands.join(",\n  ")}\n)`;

  return {
    clipPath,
    commands: renderedCommands,
  };
}

function formatCommand(command: ShapeCommand): string {
  switch (command.kind) {
    case "from":
      return `from ${formatPoint(command.point, command.edge)}`;
    case "line":
      return `line to ${formatPoint(command.point, command.edge)}`;
    case "move":
      return `move to ${formatPoint(command.point, command.edge)}`;
    case "smooth":
      return `smooth to ${formatPoint(command.to, command.edge)} with ${formatPoint(
        command.control,
        command.edge
      )}`;
    case "close":
    default:
      return "close";
  }
}

function formatPoint(point: Point, edge: CommandEdge): string {
  return `${toPercent(point.x)} ${formatY(point, edge)}`;
}

function formatY(point: Point, edge: CommandEdge): string {
  if (point.yUnit === "percent") {
    return toPercent(point.y).replace(/\.00%$/, "%");
  }

  const clamped = clamp01(point.y);
  if (edge === "bottom") {
    const distanceFromBottom = clamp01(1 - clamped);
    const px = `${toPx(distanceFromBottom)}px`;
    return distanceFromBottom === 0 ? "100%" : `calc(100% - ${px})`;
  }

  return `${toPx(clamped)}px`;
}

function toPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function toPx(value: number): number {
  return Math.round(value * PX_SCALE);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function seededRandom(seed: number): () => number {
  let value = Math.sin(seed) * 10000;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function reflect(anchor: number, control: number): number {
  return anchor * 2 - control;
}

function cubicAt(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const oneMinusT = 1 - t;
  return (
    oneMinusT * oneMinusT * oneMinusT * p0 +
    3 * oneMinusT * oneMinusT * t * p1 +
    3 * oneMinusT * t * t * p2 +
    t * t * t * p3
  );
}

function cubicSegmentMaxY(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  steps = CURVE_SAMPLE_STEPS
): number {
  let max = Math.max(p0, p1, p2, p3);
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    max = Math.max(max, cubicAt(p0, p1, p2, p3, t));
  }
  return max;
}

type Point = {
  x: number;
  y: number;
  yUnit?: "percent";
};

type Instruction = {
  to: Point;
  control: Point;
};

type SectionShape = {
  clipPath: string;
  commands: string[];
};

type CommandEdge = "top" | "bottom";

type ShapeCommand =
  | { kind: "from"; point: Point; edge: CommandEdge }
  | { kind: "line"; point: Point; edge: CommandEdge }
  | { kind: "move"; point: Point; edge: CommandEdge }
  | { kind: "smooth"; to: Point; control: Point; edge: CommandEdge }
  | { kind: "close" };
</script>

<template>
  <div class="space-y-6">
    <UContainer class="flex flex-col gap-6 xl:flex-row">
      <UCard class="xl:w-96">
        <template #header>Section Controls</template>
        <div class="grid gap-6">
          <UFormField :label="`Top arcs (${pointCount})`" help="Number of control points">
            <USlider
              v-model="pointCount"
              :min="MIN_POINTS"
              :max="MAX_POINTS"
              :step="1"
            />
          </UFormField>

          <UFormField
            :label="`Depth (${depth}%)`"
            help="How far the waves drop toward the center"
          >
            <USlider v-model="depth" :min="MIN_DEPTH" :max="MAX_DEPTH" :step="1" />
          </UFormField>

          <UFormField label="Seed" help="Recreate the same shape later">
            <UInput v-model.number="seed" type="number" min="1" />
          </UFormField>

          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton
              icon="i-ph-confetti-duotone"
              color="primary"
              class="flex-1"
              @click="randomizeShape"
            >
              Randomize
            </UButton>
            <UButton
              variant="subtle"
              color="neutral"
              class="flex-1"
              @click="resetControls"
            >
              Reset
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard class="flex-1">
        <template #header>
          Section Preview
        </template>
        <div class="grid gap-6">
          <div class="section-preview border border-amber-100">
            <div class="section-clip" :style="previewStyle">
              <div class="section-content">
                <p class="text-lg font-semibold text-white">Mirrored clip-path</p>
                <p class="text-white/80 text-sm">
                  Top arcs are mirrored to the bottom edge so sections can fade into the
                  next block seamlessly.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-medium">CSS output</h3>
              <span class="text-xs text-muted">{{ copyFeedback }}</span>
              <div class="flex-1"></div>
              <UButton
                size="sm"
                icon="i-ph-clipboard-duotone"
                variant="subtle"
                @click="copyCss"
              >
                Copy CSS
              </UButton>
            </div>
            <pre class="clip-code"><code>{{ cssSnippet }}</code></pre>

            <div>
              <p class="mb-2 text-sm font-medium text-muted">Commands</p>
              <div class="space-y-1 text-xs font-mono text-muted">
                <p v-for="(command, index) in commands" :key="index">{{ command }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>

  <div class="bg-red-500 h-100 w-full section-clip-bottom1">1</div>
  <div class="bg-red-600 h-100 w-full section-clip-top">2</div>
</template>

<style scoped>

.slice {
  clip-path: shape(
    from 0 0,
    smooth to 100% 50px with 50% 10px,
    line to 100% 100%,
    smooth to 0 calc(100% - 50px) with 100% calc(100% - 10px),
    close
  )
}

.section-preview {
  width: 100%;
  background: color-mix(in srgb, var(--ui-muted) 40%, transparent);
}

.section-clip {
  position: relative;
  height: 420px;
  background-image: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.85),
    rgba(99, 102, 241, 0.9)
  );
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.25);
  overflow: hidden;
  transition: clip-path 200ms ease;
}

.section-clip-bottom {
  clip-path: shape(
    from 0 calc(100% - 62px),
    smooth to 20.00% calc(100% - 31px) with 10.00% calc(100% - 62px),
    smooth to 40.00% calc(100% - 29px) with 30.00% calc(100% - 56px),
    smooth to 60.00% calc(100% - 29px) with 50.00% calc(100% - 56px),
    smooth to 80.00% calc(100% - 21px) with 70.00% calc(100% - 42px),
    smooth to 100.00% calc(100% - 40px) with 90.00% calc(100% - 62px),
    line to 100.00% 0,
    line to 0 0,
    close
  );
}

.section-clip-top {
  clip-path: shape(
    from 0 0,
    smooth to 20.00% 31px with 10.00% 0px,
    smooth to 40.00% 33px with 30.00% 6px,
    smooth to 60.00% 32px with 50.00% 5px,
    smooth to 80.00% 40px with 70.00% 10px,
    smooth to 100.00% 21px with 90.00% 0px,
    line to 100% 100%,
    line to 0 100%,
    close
  );
}

.section-clip-example {
  clip-path: shape(
  from 0.00% 0px,
  smooth to 20.00% 31px with 10.00% 0px,
  smooth to 40.00% 33px with 30.00% 6px,
  smooth to 60.00% 32px with 50.00% 5px,
  smooth to 80.00% 40px with 70.00% 20px,
  smooth to 100.00% 21px with 90.00% 0px,
  line to 100.00% 50%,
  line to 0.00% 50%,
  line to 0.00% 0px,
  close,
  move to 0.00% calc(100% - 62px),
  smooth to 20.00% calc(100% - 31px) with 10.00% calc(100% - 62px),
  smooth to 40.00% calc(100% - 29px) with 30.00% calc(100% - 56px),
  smooth to 60.00% calc(100% - 29px) with 50.00% calc(100% - 56px),
  smooth to 80.00% calc(100% - 21px) with 70.00% calc(100% - 42px),
  smooth to 100.00% calc(100% - 40px) with 90.00% calc(100% - 62px),
  line to 100.00% 50%,
  line to 0.00% 50%,
  close
);
}

.section-content {
  position: absolute;
  inset: 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.clip-code {
  background-color: color-mix(in srgb, var(--ui-bg) 90%, transparent);
  border-radius: var(--radius-xl);
  padding: 1rem;
  overflow-x: auto;
}

.clip-code code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 0.85rem;
  white-space: pre;
}
</style>