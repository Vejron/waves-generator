<script lang="ts">
import type { ButtonProps, PageFeatureProps } from "@nuxt/ui";

/**
 * This component represents a section of a page with various customizable properties.
 * It can include a background pattern, headline, title, description, links, features,
 * and an optional image. It supports different orientations and can reverse the order of its content.
 *
 * A special "mask" mode is available, allowing for decorative masks to be applied to the top and bottom of the section.
 * The mask images are defined using CSS custom properties, which should be set in the parent component or globally.
 */

export interface PageSectionProps {
  backgroundPattern?: {
    /**
     * The image source for the background pattern.
     */
    src: string;
    /**
     * The size of the background pattern.
     * @defaultValue 'contain'
     */
    size?: string;
    /**
     *
     * Extra classes for the background pattern container.
     */
    class?: string | Record<string, boolean>;
  };

  /**
   * An optional image to display in the section.
   */
  image?: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}
</script>

<script setup lang="ts">
withDefaults(defineProps<PageSectionProps>(), {
  backgroundPattern: undefined,
  image: undefined,
  maskClasses: undefined,
  maskTop: false,
  maskBottom: false,
});
</script>

<template>
  <div class="relative max-w-xl">
    <ShadRipple
      :brightness="0.3"
      :radial-falloff="0"
      class="absolute! top-0 inset-0 mask"
    />
    <NuxtImg
      :src="image?.src"
      :alt="image?.alt || 'Decorative image'"
      :width="image?.width || 300"
      :height="image?.height || 200"
      class="block mx-auto relative"
    />
  </div>
</template>

<style scoped>
.mask {
  mask-image: radial-gradient(circle at center, black, black 40%, transparent 70%);
  /* mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='285.8' height='259.7'%3E%3Cpath fill='black' d='M279 219c-12 14-37-22-57-19s-11 47-24 47c-14-1-59-20-74-16-14 4-39 31-52 28-13-2-57-19-64-33-6-15 33-36 26-51-8-15-37-36-34-49 4-13 43-35 42-53 0-14-42-30-31-47C21 10 109-2 125 3c19 7 27 30 49 34s96-31 103-17c8 14-29 58-26 83 3 22 15 34 25 51s15 52 3 65'/%3E%3C/svg%3E"); */
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}
</style>
