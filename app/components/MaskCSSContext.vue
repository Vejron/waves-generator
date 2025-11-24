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
  document?.body.style.setProperty("--top-mask-image", mask || 'none');
 /*  if (el.value && mask) {
    el.value.style.setProperty("--top-mask-image", mask);
    console.log("Updated top mask image to:", mask);
  } */
}, { immediate: true });

watch(bottom, (mask) => {
  // replace the --bottom-mask-image with a new svg path
  document?.body.style.setProperty("--bottom-mask-image", mask || 'none');
  /* if (el.value && mask) {
    el.value.style.setProperty("--bottom-mask-image", mask);
    console.log("Updated bottom mask image to:", mask);
  } */
}, { immediate: true });

watch(
  () => props.height,
  (newHeight) => {
    
      document?.body.style.setProperty("--top-mask-image-height", newHeight.toString());
      document?.body.style.setProperty(
        "--bottom-mask-image-height",
        newHeight.toString()
      );
   
  },
  { immediate: true }
);

watch(
  () => props.width,
  (newWidth) => {
  
      document?.body.style.setProperty("--top-mask-image-width", newWidth.toString());
      document?.body.style.setProperty(
        "--bottom-mask-image-width",
        newWidth.toString()
      );
   
  },
  { immediate: true }
);
</script>

<template>
  <div ref="el">
    <slot />
  </div>
</template>