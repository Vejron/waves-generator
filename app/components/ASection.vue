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
   * The element or component this component should render as.
   * @defaultValue 'section'
   */
  as?: any;
  /**
   * The headline displayed above the title.
   */
  headline?: string;
  /**
   * The icon displayed above the title.
   * @IconifyIcon
   */
  icon?: string;
  title?: string;
  description?: string;
  /**
   * Display a list of Button under the description.
   * `{ size: 'lg' }`{lang="ts-type"}
   */
  links?: ButtonProps[];
  /**
   * Display a list of PageFeature under the description.
   */
  features?: PageFeatureProps[];
  /**
   * The orientation of the section.
   * @defaultValue 'vertical'
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Reverse the order of the default slot.
   * @defaultValue false
   */
  reverse?: boolean;

  /**
   * An optional image to display in the section.
   */
  image?: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };

  maskTop?: boolean;
  maskBottom?: boolean;
  /**
   * Optional classes to apply to the mask box container.
   */
  maskClasses?: string | Record<string, boolean>;
}

export interface PageSectionSlots {
  top(props?: {}): any;
  header(props?: {}): any;
  leading(props: {}): any;
  headline(props?: {}): any;
  title(props?: {}): any;
  description(props?: {}): any;
  body(props?: {}): any;
  features(props?: {}): any;
  footer(props?: {}): any;
  links(props?: {}): any;
  default(props?: {}): any;
  bottom(props?: {}): any;
}
</script>

<script setup lang="ts">
withDefaults(defineProps<PageSectionProps>(), {
  as: "section",
  orientation: "vertical",
  backgroundPattern: undefined,
  image: undefined,
  maskClasses: undefined,
  maskTop: false,
  maskBottom: false,
});
const slots = defineSlots<PageSectionSlots>();
</script>

<template>
  <component
    :is="as"
    :data-orientation="orientation"
    :class="[
      maskTop || maskBottom ? 'mask-container' : '',
      !maskTop ? 'mask-top-disabled' : '',
      !maskBottom ? 'mask-bottom-disabled' : '',
      reverse ? 'flex flex-col-reverse' : '',
    ]"
    class="relative"
  >
    <div class="bg-transparent"></div>
    <div class="mask-box" :class="maskClasses">
      <slot name="top" />
      <div
        v-if="backgroundPattern"
        :style="{
          backgroundImage: `url(${backgroundPattern.src})`,
          backgroundRepeat: 'repeat',
          backgroundSize: backgroundPattern.size || 'contain',
          backgroundAttachment: 'fixed',
          maskImage: 'linear-gradient(rgba(0,0,0,.2), black 50%, rgba(0,0,0,.2))',
        }"
        :class="backgroundPattern.class"
        class="-z-1 absolute inset-0 w-full h-full opacity-40"
      />
      <div
        :class="[
          orientation === 'vertical' ? '' : 'lg:grid-cols-2 lg:items-center',
          reverse ? 'lg:order-last' : ''
        ]"
        class="max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-16 sm:py-24 lg:py-32 gap-8 sm:gap-16"
      >
        <div
          v-if="
            !!slots.header ||
            icon ||
            !!slots.leading ||
            headline ||
            !!slots.headline ||
            title ||
            !!slots.title ||
            description ||
            !!slots.description ||
            !!slots.body ||
            features?.length ||
            !!slots.features ||
            !!slots.footer ||
            links?.length ||
            !!slots.links
          "
        >
          <div
            v-if="
              !!slots.header ||
              icon ||
              !!slots.leading ||
              headline ||
              !!slots.headline ||
              title ||
              !!slots.title ||
              description ||
              !!slots.description
            "
          >
            <slot name="header">
              <div
                v-if="icon || !!slots.leading"
                class="flex items-center mb-6"
                :class="orientation === 'vertical' ? 'justify-center' : ''"
              >
                <slot name="leading">
                  <UIcon
                    v-if="icon"
                    :name="icon"
                    class="size-10 shrink-0 text-primary"
                  />
                </slot>
              </div>

              <div
                v-if="headline || !!slots.headline"
                class="mb-3 font-semibold text-primary flex items-center gap-1.5"
                :class="orientation === 'vertical' ? 'justify-center' : ''"
              >
                <slot name="headline">
                  {{ headline }}
                </slot>
              </div>

              <h2
                v-if="title || !!slots.title"
                :class="orientation === 'vertical' ? 'text-center' : ''"
                class="text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted"
              >
                <slot name="title">
                  {{ title }}
                </slot>
              </h2>

              <div
                v-if="description || !!slots.description"
                class="text-base sm:text-lg text-muted"
                :class="[
                  orientation === 'vertical'
                    ? 'text-center text-balance'
                    : 'text-pretty',
                  title || !!slots.title ? 'mt-6' : '',
                ]"
              >
                <slot name="description">
                  {{ description }}
                </slot>
              </div>
            </slot>
          </div>

          <div
            v-if="!!slots.body || features?.length || !!slots.features"
            :class="
              orientation === 'vertical'
                ? 'sm:grid-cols-2 lg:grid-cols-3 gap-8'
                : 'gap-4'
            "
            class="mt-8"
          >
            <slot name="body">
              <ul v-if="features?.length || !!slots.features" class="grid">
                <slot name="features">
                  <UPageFeature
                    v-for="(feature, index) in features"
                    :key="index"
                    as="li"
                    v-bind="feature"
                  />
                </slot>
              </ul>
            </slot>
          </div>

          <div
            v-if="!!slots.footer || links?.length || !!slots.links"
            class="mt-8"
          >
            <slot name="footer">
              <div
                v-if="links?.length || !!slots.links"
                class="flex flex-wrap gap-x-6 gap-y-3"
              >
                <slot name="links">
                  <UButton
                    v-for="(link, index) in links"
                    :key="index"
                    size="lg"
                    v-bind="link"
                  />
                </slot>
              </div>
            </slot>
          </div>
        </div>

        <NuxtImg
          v-if="image"
          :src="image.src"
          :alt="image.alt || 'section image'"
          :width="image.width || 600"
          :height="image.height || 400"
          class="text-primary"
        />
        <slot v-if="!!slots.default" />

        <div v-else-if="orientation === 'horizontal'" class="hidden lg:block" />
      </div>

      <slot name="bottom" />
    </div>
    <div class=""></div>
  </component>
</template>

<style scoped>

.mask-container {
  /* Apply negative margin to the top and bottom if there is a mask add 1 px to avoid any gap artifacts */
   margin-top: calc(var(--top-mask-height) * -1 - 1px);
   margin-bottom: calc(var(--bottom-mask-height) * -1);
  /* Calculate the height of the top mask */
  --top-mask-height: calc(
    (var(--top-mask-image-height) / var(--top-mask-image-width) * 100) * 1cqw - 2px
  );

  /* Calculate the height of the bottom mask */
  --bottom-mask-height: calc(
    (var(--bottom-mask-image-height) / var(--bottom-mask-image-width) * 100) * 1cqw - 2px
  );
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

.mask-container.mask-top-disabled {
  --top-mask-height: 0px;
  --top-mask-image: none;
}

.mask-container.mask-bottom-disabled {
  --bottom-mask-height: 0px;
  --bottom-mask-image: none;
}

.mask-container .mask-box {
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
      black calc(100% - var(--bottom-mask-height)),
      transparent calc(100% - var(--bottom-mask-height))
    ),
    var(--bottom-mask-image);
  mask-repeat: no-repeat;
  mask-position: top, top, bottom;
  mask-size: 100%, 100%, 100%; /* You may need to increase the width to 101% on the svg masks to compensate for strange sizing behavior in Firefox */
}


</style>
