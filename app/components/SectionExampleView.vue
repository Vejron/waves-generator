<script lang="ts" setup>
const props = defineProps<{
  topMask: string;
  bottomMask: string;
  height: number;
  width: number;
}>();

const el = useTemplateRef("el");

const top = computed(() => el.value && props.topMask);
const bottom = computed(() => el.value && props.bottomMask);

watch(top, (mask) => {
  // replace the --top-mask-image with a new svg path
  if (el.value && mask) {
    el.value.style.setProperty("--top-mask-image", mask);
    console.log("Updated top mask image to:", mask);
  }
}, { immediate: true });

watch(bottom, (mask) => {
  // replace the --bottom-mask-image with a new svg path
  if (el.value && mask) {
    el.value.style.setProperty("--bottom-mask-image", mask);
    console.log("Updated bottom mask image to:", mask);
  }
}, { immediate: true });

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
    </div>

    <div
      
      class="mask-box bg-radial-[at_25%_25%] from-primary/18 to-bg to-80% flex items-center"
    >
      <div class="h-100 border border-dashed rounded m-5 w-full"></div>
     
    </div>

    <div class="bg-linear-t from-transparent to-primary/40">
      <span class="hidden">The Content Below the Effect</span>
    </div>
  </div>
</template>

<style scoped>
.pattern-background {
  background-color: var(--ui-bg);
  background-size: 200px;
  background-image: url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='black' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
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
  mask-image:
    
    var(--top-mask-image),
    linear-gradient(
      transparent var(--top-mask-height),
      black 0%,
      black calc(100% - var(--top-mask-height)),
      transparent calc(100% - var(--bottom-mask-height))
    ),
    var(--bottom-mask-image);

  mask-repeat: no-repeat;
  mask-position: top, top, bottom, top;
  mask-size: 100%, 100%, 100%; /* You may need to increase the width to 101% on the svg masks to compensate for strange sizing behavior in Firefox */
}
</style>
