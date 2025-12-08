<script lang="ts" setup>
const MIN_POINTS = 3;
const MAX_POINTS = 24;
const MIN_DEPTH = 2;
const MAX_DEPTH = 45;

const pointCount = ref(8);
const depth = ref(18);
const seed = ref(1);
const copyFeedback = ref("");

const startPoint = ref<Point>({ x: 0.5, y: 0.5 });
const segments = ref<Instruction[]>([]);
const stageRef = ref<HTMLElement | null>(null);

type HandleKind = "start" | "anchor" | "control";
type HandleMeta = {
	kind: HandleKind;
	index: number;
};

type HandleDisplay = HandleMeta & {
	id: string;
	x: number;
	y: number;
};

const activeHandle = ref<HandleMeta | null>(null);
let activeHandleEl: HTMLElement | null = null;
let activePointerId: number | null = null;

const clipPathShape = computed(() => {
	if (!segments.value.length) {
		return "none";
	}
	return formatShape(startPoint.value, segments.value);
});

const cssSnippet = computed(() => `.blob-shape {\n  clip-path: ${clipPathShape.value};\n}`);

const instructions = computed(() => segments.value);

const previewStyle = computed(() => ({
	clipPath: clipPathShape.value,
}));

const handles = computed<HandleDisplay[]>(() => {
	const output: HandleDisplay[] = [
		{
			id: "start-handle",
			kind: "start",
			index: -1,
			x: startPoint.value.x,
			y: startPoint.value.y,
		},
	];

	segments.value.forEach((segment, index) => {
		output.push({
			id: `anchor-${index}`,
			kind: "anchor",
			index,
			x: segment.to.x,
			y: segment.to.y,
		});
		output.push({
			id: `control-${index}`,
			kind: "control",
			index,
			x: segment.control.x,
			y: segment.control.y,
		});
	});

	return output;
});

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

watch(
	[pointCount, depth, seed],
	() => {
		const generated = createBlobShape({
			points: pointCount.value,
			depthPercent: depth.value,
			seed: seed.value,
		});
		startPoint.value = generated.start;
		segments.value = generated.segments;
	},
	{ immediate: true }
);

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

function shuffleSeed(): void {
	seed.value = seed.value + 1;
}

function resetSettings(): void {
	pointCount.value = 8;
	depth.value = 18;
	seed.value = 1;
}

function onHandlePointerDown(handle: HandleDisplay, event: PointerEvent): void {
	if (!stageRef.value || typeof window === "undefined") {
		return;
	}
	activeHandle.value = { kind: handle.kind, index: handle.index };
	activeHandleEl = event.currentTarget as HTMLElement;
	activePointerId = event.pointerId;
	activeHandleEl?.setPointerCapture?.(event.pointerId);
	window.addEventListener("pointermove", onPointerMove);
	window.addEventListener("pointerup", stopDragging);
}

function onPointerMove(event: PointerEvent): void {
	if (!stageRef.value || !activeHandle.value) {
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
	updateHandlePosition(activeHandle.value, nextX, nextY);
}

function stopDragging(): void {
	if (typeof window !== "undefined") {
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", stopDragging);
	}
	if (activeHandleEl && activePointerId !== null) {
		activeHandleEl.releasePointerCapture?.(activePointerId);
	}
	activeHandleEl = null;
	activePointerId = null;
	activeHandle.value = null;
}

function updateHandlePosition(handle: HandleMeta, x: number, y: number): void {
	if (handle.kind === "start") {
		startPoint.value = { x, y };
		return;
	}
	segments.value = segments.value.map((segment, index) => {
		if (index !== handle.index) {
			return segment;
		}
		if (handle.kind === "anchor") {
			return { ...segment, to: { x, y } };
		}
		return { ...segment, control: { x, y } };
	});
}

onBeforeUnmount(() => {
	stopDragging();
});

type Point = { x: number; y: number };

type Instruction = {
	to: Point;
	control: Point;
};

type BlobShape = {
	start: Point;
	segments: Instruction[];
};

function createBlobShape({
	points,
	depthPercent,
	seed,
}: {
	points: number;
	depthPercent: number;
	seed: number;
}): BlobShape {
	const safePoints = clamp(Math.round(points), MIN_POINTS, MAX_POINTS);
	const depthRatio = clamp(depthPercent / 100, MIN_DEPTH / 100, MAX_DEPTH / 100);
	const random = seededRandom(seed);

	const controls = Array.from({ length: safePoints }, (_, index) => {
		const angle = (index / safePoints) * Math.PI * 2;
		const radius = 0.5 - random() * depthRatio;
		return {
			x: clamp01(0.5 + radius * Math.cos(angle)),
			y: clamp01(0.5 + radius * Math.sin(angle)),
		};
	});

	const anchors = controls.map((point, index, arr) => {
		const next = arr[(index + 1) % arr.length]!;
		return {
			x: clamp01((point.x + next.x) / 2),
			y: clamp01((point.y + next.y) / 2),
		};
	});

	const startAnchor = anchors[anchors.length - 1]!;

	const segments = controls.map((control, index) => ({
		to: anchors[index]!,
		control,
	}));

	return {
		start: startAnchor,
		segments,
	};
}

function formatShape(start: Point, instructionSet: Instruction[]): string {
	const lines = instructionSet
		.map(
			(instruction) =>
				`  curve to ${formatPoint(instruction.to)} with ${formatPoint(instruction.control)}`
		)
		.join(",\n");

	return `shape(\n  from ${formatPoint(start)},\n${lines}\n)`;
}

function formatPoint(point: Point): string {
	return `${toPercent(point.x)} ${toPercent(point.y)}`;
}

function toPercent(value: number): string {
	return `${(value * 100).toFixed(2)}%`;
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
</script>

<template>
	<div class="space-y-6">
		<UContainer class="flex flex-col gap-6 xl:flex-row">
			<UCard class="xl:w-96">
				<template #header>Blob Controls</template>
				<div class="grid gap-6">
					<UFormField
						:label="`Control points (${pointCount})`"
						help="More points create smoother blobs"
					>
						<USlider
							v-model="pointCount"
							:min="MIN_POINTS"
							:max="MAX_POINTS"
							:step="1"
						/>
					</UFormField>

					<UFormField
						:label="`Depth (${depth}%)`"
						help="Adjusts how far points can move toward the center"
					>
						<USlider v-model="depth" :min="MIN_DEPTH" :max="MAX_DEPTH" :step="1" />
					</UFormField>

					<UFormField label="Seed" help="Use the same value to re-create a blob">
						<UInput v-model.number="seed" type="number" min="1" />
					</UFormField>

					<div class="flex flex-col gap-3 sm:flex-row">
						<UButton
							icon="i-ph-sparkle-duotone"
							color="primary"
							class="flex-1"
							@click="shuffleSeed"
						>
							New shape
						</UButton>
						<UButton
							variant="subtle"
							color="neutral"
							class="flex-1"
							@click="resetSettings"
						>
							Reset
						</UButton>
					</div>
				</div>
			</UCard>

			<UCard class="flex-1">
				<template #header>Clip Path Preview</template>

				<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)]">
					<div
						class="relative isolate w-full overflow-hidden rounded-2xl border border-muted/40 bg-muted/40"
						style="aspect-ratio: 1"
					>
						<div class="absolute inset-5">
							<div ref="stageRef" class="clip-stage relative h-full w-full">
								<div
									class="clip-surface absolute inset-0 rounded-[1.75rem] bg-linear-135 from-primary/30 via-primary/60 to-primary/20 shadow-lg transition-all"
									:style="previewStyle"
								>
									<div class="absolute inset-0 clip-preview-grid"></div>
									<div class="absolute inset-8 flex flex-col gap-3 text-white">
										<p class="text-xl font-semibold tracking-tight">clip-path: shape()</p>
										<p class="text-sm text-white/80">
											Works with any element. Resize to keep experimenting with responsive blobs
											directly in CSS.
										</p>
									</div>
								</div>

								<button
									v-for="handle in handles"
									:key="handle.id"
									class="clip-handle"
									:class="[
										handle.kind === 'start' ? 'clip-handle--start' : '',
										handle.kind === 'anchor' ? 'clip-handle--anchor' : '',
										handle.kind === 'control' ? 'clip-handle--control' : '',
									]"
									:style="{
										left: `${handle.x * 100}%`,
										top: `${handle.y * 100}%`,
									}"
									type="button"
									:aria-label="`Drag ${handle.kind} handle`"
									@pointerdown.prevent="onHandlePointerDown(handle, $event)"
								/>
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
							<p class="mb-2 text-sm font-medium text-muted">Segments</p>
							<div class="space-y-1 text-xs font-mono text-muted">
								<p v-for="(segment, index) in instructions" :key="index">
									curve ➜ {{ formatPoint(segment.to) }} with {{ formatPoint(segment.control) }}
								</p>
							</div>
						</div>
					</div>
				</div>
			</UCard>
		</UContainer>
	</div>
</template>

<style scoped>
.clip-preview-grid {
	background-image: linear-gradient(0deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
	background-size: 20px 20px;
}

.clip-stage {
	position: relative;
}

.clip-surface {
	will-change: clip-path;
	backdrop-filter: blur(4px);
}

.clip-handle {
	position: absolute;
	z-index: 1;
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 999px;
	border: 2px solid rgba(255, 255, 255, 0.85);
	background: rgba(15, 23, 42, 0.85);
	box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
	transform: translate(-50%, -50%);
	cursor: grab;
	transition: transform 120ms ease, box-shadow 120ms ease;
}

.clip-handle:hover {
	transform: translate(-50%, -50%) scale(1.05);
}

.clip-handle:active {
	cursor: grabbing;
	transform: translate(-50%, -50%) scale(0.95);
}

.clip-handle--control {
	background: rgba(52, 211, 153, 0.85);
	border-color: rgba(16, 185, 129, 0.9);
}

.clip-handle--start {
	background: rgba(59, 130, 246, 0.9);
	border-style: dashed;
}

.clip-handle--anchor {
	background: rgba(14, 165, 233, 0.9);
	border-color: rgba(56, 189, 248, 1);
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
