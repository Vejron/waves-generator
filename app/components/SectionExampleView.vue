<script lang="ts" setup>
const props = defineProps<{
  path: string;
  height: number;
  width: number;
}>();

const el = useTemplateRef("el");

const pathComputed = computed(() => el.value && props.path);

watch(
  pathComputed,
  (newPath) => {
    // replace the --top-mask-image with a new svg path
    if (el.value && newPath) {
      console.log("Path changed to:", newPath);
      const topMaskImage = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${props.width} ${props.height}"><path d="${newPath}"/></svg>')`;
      el.value.style.setProperty("--top-mask-image", topMaskImage);
      console.log("Updated top mask image to:", topMaskImage);
      const invertedPath = enclosePathAbove(newPath, props.width, props.height);
      console.log("Generated bottom mask image:", invertedPath);
      const bottomMaskImage = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${props.width} ${props.height}"><path d="${invertedPath}"/></svg>')`;
      el.value.style.setProperty("--bottom-mask-image", bottomMaskImage);
    }
  },
  { immediate: true }
);

watch(
  () => props.height,
  (newHeight) => {
    if (el.value) {
      el.value.style.setProperty("--top-mask-image-height", newHeight.toString());
      el.value.style.setProperty(
        "--bottom-mask-image-height",
        newHeight.toString()
      );
    }
  },
  { immediate: true }
);

watch(
  () => props.width,
  (newWidth) => {
    if (el.value) {
      el.value.style.setProperty("--top-mask-image-width", newWidth.toString());
      el.value.style.setProperty(
        "--bottom-mask-image-width",
        newWidth.toString()
      );
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="mask-container" ref="el">
    <div class="">
      <span class="hidden">The Content Above the Effect</span>
      <svg class="hidden" width="100%" height="40px" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1000 100"><path d="M0,100S32.06,0,326.72,0c255.72,0,358.35,119.2,673.28,77.47v22.53H0Z"/></svg>
    </div>

    <div
      
      class="mask-box pattern-background bg-elevated flex items-center"
    >
      <div class="h-100 border border-dashed rounded m-5 w-full"></div>
     
    </div>

    <div>
      <span class="hidden">The Content Below the Effect</span>
    </div>
  </div>
</template>

<style scoped>
.pattern-background {
  background-color: var(--ui-bg-elevated);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%237f30ff' fill-opacity='0.5' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.mask-container {

  /* The image used as a mask for the top of the container */
  --top-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,100S32.06,0,326.72,0c255.72,0,358.35,119.2,673.28,77.47v22.53H0Z"/></svg>');
  --top-mask-image-height: 100; /* The width of the top mask image */
  --top-mask-image-width: 1000; /* The height of the top mask image */

  /* Calculate the height of the top mask */
  --top-mask-height: calc(
    (var(--top-mask-image-height) / var(--top-mask-image-width) * 100) * 1cqw -
      2px
  );

  /* Define all the same for the bottom */
  --bottom-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M1000,0s-32.06,100-326.72,100C417.57,100,314.94-19.2,0,22.53V0h1000Z"/></svg>');
  --bottom-mask-image-height: 100; /* The width of the bottom mask image */
  --bottom-mask-image-width: 1000; /* The height of the bottom mask image */

  /* Calculate the height of the bottom mask */
  --bottom-mask-height: calc(
    (var(--bottom-mask-image-height) / var(--bottom-mask-image-width) * 100) *
      1cqw - 2px
  );
}

.mask-container {
  /* Define a container to use cqw instead of vw units */
  container-type: inline-size;

  /* Added bonus: apply padding to container above the .mask-box equal to the negative margin */
  & div:has(+ .mask-box) {
    padding-block-end: var(--top-mask-height);
  }

  /* Added bonus: apply padding to container below the .mask-box equal to the negative margin */
  & .mask-box + div {
    align-items: start;
    padding-block-start: var(--bottom-mask-height);
  }
}

.mask-box {
  /* Apply negative margin to the top and bottom */
  margin-block: calc(-1 * var(--top-mask-height))
    calc(-1 * var(--bottom-mask-height));

  /* Pad the container so content doesn't hit the masks */
  padding-block: var(--top-mask-height) var(--bottom-mask-height);

  /* Apply the three masks! */
  mask-image: var(--top-mask-image),
    linear-gradient(
      transparent var(--top-mask-height),
      black 0%,
      black calc(100% - var(--top-mask-height)),
      transparent calc(100% - var(--bottom-mask-height))
    ),
    var(--bottom-mask-image);
  mask-repeat: no-repeat;
  mask-position: top, top, bottom;
  mask-size: 100%, 100%, 100%; /* You may need to increase the width to 101% on the svg masks to compensate for strange sizing behavior in Firefox */
}
</style>
