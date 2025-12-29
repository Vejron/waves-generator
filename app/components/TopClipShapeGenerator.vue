<script setup lang="ts">
type ClipPoint = {
	id: number;
	x: number; // 0..1
	y: number; // px
};

const MIN_POINTS = 1;
const MAX_POINTS = 10;

const MIN_WAVE_HEIGHT = 40;
const MAX_WAVE_HEIGHT = 800;

const POINT_GAP = 0.02;

const waveHeight = ref(120);
const pointCount = ref(4);

let pointId = 0;
const points = ref<ClipPoint[]>(seedPoints(pointCount.value, waveHeight.value));

const stageRef = ref<HTMLElement | null>(null);
const draggingPointId = ref<number | null>(null);
const copyFeedback = ref("");

let activeHandle: HTMLElement | null = null;
let activePointerId: number | null = null;

const orderedPoints = computed(() => [...points.value].sort((a, b) => a.x - b.x));

const clipPathShape = computed(() => {
	const anchors = orderedPoints.value;
	if (!anchors.length) {
		return "";
	}

	const first = anchors[0];
	if (!first) {
		return "";
	}

	const parts: string[] = [];
	parts.push(`shape(from ${formatPercent(first.x)} ${formatPx(first.y)}`);

	for (let i = 1; i < anchors.length; i += 1) {
		const point = anchors[i]!;
		parts.push(`smooth to ${formatPercent(point.x)} ${formatPx(point.y)}`);
	}

	parts.push("line to 100% 100%", "line to 0% 100%", "close)");
	return parts.join(", ");
});

watch(waveHeight, (value) => {
	const next = clamp(value, MIN_WAVE_HEIGHT, MAX_WAVE_HEIGHT);
	if (next !== value) {
		waveHeight.value = next;
		return;
	}

	// Clamp existing points to new height.
	points.value = points.value.map((point, index, arr) => {
		const lockedX = lockEndpointX(index, arr.length, point.x);
		return {
			...point,
			x: lockedX,
			y: clamp(point.y, 0, next),
		};
	});
});

watch(pointCount, (value) => {
	const next = clamp(value, MIN_POINTS, MAX_POINTS);
	if (next !== value) {
		pointCount.value = next;
		return;
	}

	points.value = resamplePoints(orderedPoints.value, next);
});

function seedPoints(count: number, heightPx: number): ClipPoint[] {
	const target = clamp(Math.round(count), MIN_POINTS, MAX_POINTS);
	const height = clamp(heightPx, MIN_WAVE_HEIGHT, MAX_WAVE_HEIGHT);

	return Array.from({ length: target }, (_, index) => {
		const t = target === 1 ? 0.5 : index / (target - 1);
		return {
			id: nextPointId(),
			x: lockEndpointX(index, target, t),
			y: pleasantBaselinePx(t, height),
		};
	});
}

function lockEndpointX(index: number, length: number, x: number): number {
	if (length <= 1) {
		return 0.5;
	}
	if (index === 0) {
		return 0;
	}
	if (index === length - 1) {
		return 1;
	}
	return clamp01(x);
}

function pleasantBaselinePx(t: number, height: number): number {
	const ratio = 0.5 - Math.cos(t * Math.PI) * 0.25;
	return clamp(ratio * height, 0, height);
}

function pleasantWithNoisePx(t: number, height: number): number {
	const noiseRatio = (Math.random() - 0.5) * 0.25;
	const ratio = clamp01(0.5 - Math.cos(t * Math.PI) * 0.25 + noiseRatio);
	return clamp(ratio * height, 0, height);
}

function resamplePoints(existing: ClipPoint[], count: number): ClipPoint[] {
	if (!existing.length) {
		return seedPoints(count, waveHeight.value);
	}

	const sorted = [...existing].sort((a, b) => a.x - b.x);
	const height = waveHeight.value;

	return Array.from({ length: count }, (_, index) => {
		const t = count === 1 ? 0.5 : index / (count - 1);
		const x = lockEndpointX(index, count, t);
		return {
			id: nextPointId(),
			x,
			y: clamp(sampleY(sorted, x), 0, height),
		};
	});
}

function sampleY(sorted: ClipPoint[], x: number): number {
	if (!sorted.length) {
		return waveHeight.value / 2;
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
	return left.y + ratio * (right.y - left.y);
}

function nextPointId(): number {
	pointId += 1;
	return pointId;
}

function randomizePoints(): void {
	const height = waveHeight.value;
	const current = orderedPoints.value;
	if (!current.length) {
		points.value = seedPoints(pointCount.value, height);
		return;
	}

	points.value = current.map((point, index, arr) => {
		const t = arr.length === 1 ? 0.5 : index / (arr.length - 1);
		return {
			id: nextPointId(),
			x: lockEndpointX(index, arr.length, point.x),
			y: pleasantWithNoisePx(t, height),
		};
	});
}

function resetPoints(): void {
	points.value = seedPoints(pointCount.value, waveHeight.value);
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

	// Lock endpoint X so the clip always spans 0%..100%.
	if (orderedPoints.value.length > 1) {
		if (currentIndex === 0) {
			nextX = 0;
		} else if (currentIndex === orderedPoints.value.length - 1) {
			nextX = 1;
		} else {
			const prev = orderedPoints.value[currentIndex - 1];
			const next = orderedPoints.value[currentIndex + 1];

			if (prev) {
				nextX = Math.max(nextX, prev.x + POINT_GAP);
			}
			if (next) {
				nextX = Math.min(nextX, next.x - POINT_GAP);
			}
		}
	} else {
		nextX = 0.5;
	}

	const height = waveHeight.value;
	updatePointById(draggingPointId.value, {
		x: nextX,
		y: clamp(nextY * height, 0, height),
	});
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

function updatePointById(id: number, data: Partial<ClipPoint>): void {
	const updated = points.value.map((point) =>
		point.id === id ? { ...point, ...data } : point
	);
	updated.sort((a, b) => a.x - b.x);
	points.value = updated;
}

async function copyClipPath(value: string): Promise<void> {
	if (!value || typeof navigator === "undefined" || !navigator.clipboard) {
		return;
	}

	try {
		await navigator.clipboard.writeText(value);
		copyFeedback.value = "Copied!";
	} catch {
		copyFeedback.value = "Copy failed";
	} finally {
		window.setTimeout(() => {
			copyFeedback.value = "";
		}, 1500);
	}
}

function formatPercent(value01: number): string {
	const value = clamp01(value01) * 100;
	return `${value.toFixed(2)}%`;
}

function formatPx(valuePx: number): string {
	return `${Math.max(0, valuePx).toFixed(1)}px`;
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
				<template #header>Clip Controls</template>
				<div class="grid gap-6">
					<div class="flex gap-4 justify-between">
						<UFormField label="Wave height (px)">
							<UInput
								v-model.number="waveHeight"
								class="min-w-24"
								type="number"
								:min="MIN_WAVE_HEIGHT"
								:max="MAX_WAVE_HEIGHT"
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

			<UCard class="flex-1">
				<template #header>Clip Preview</template>

				<div class="relative overflow-hidden border border-muted rounded-sm h-64">
					<div
						class="absolute inset-0 clip-preview"
						:style="{ clipPath: clipPathShape }"
					/>

					<div
						ref="stageRef"
						class="absolute inset-x-0 top-0"
						:style="{ height: `${waveHeight}px` }"
					>
						<button
							v-for="point in orderedPoints"
							:key="point.id"
							class="control-handle"
							:style="{ left: `${point.x * 100}%`, top: `${(point.y / waveHeight) * 100}%` }"
							type="button"
							@pointerdown.prevent="startDrag(point.id, $event)"
						/>
					</div>
				</div>

				<div class="mt-5">
					<p class="mb-2">CSS clip-path value</p>
					<code class="path-output block bg-muted">{{ clipPathShape }}</code>
					<div class="copy-row mt-5">
						<UButton
							size="sm"
							color="neutral"
							variant="subtle"
							:disabled="!clipPathShape"
							@click="copyClipPath(clipPathShape)"
						>
							Copy clip-path
						</UButton>
						<span class="copy-feedback">{{ copyFeedback }}</span>
					</div>
				</div>
			</UCard>
		</UContainer>
	</div>
</template>

<style scoped>
.clip-preview {
	background: linear-gradient(
		135deg,
		var(--ui-primary),
		color-mix(in srgb, var(--ui-primary) 55%, var(--ui-bg))
	);
}

.control-handle {
	position: absolute;
	width: 1.2rem;
	height: 1.2rem;
	border-radius: 999px;
	border: 2px solid color-mix(in srgb, var(--ui-text) 35%, transparent);
	background: var(--ui-bg);
	box-shadow: 0 6px 14px color-mix(in srgb, var(--ui-text) 14%, transparent);
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
	color: var(--ui-primary);
}
</style>
