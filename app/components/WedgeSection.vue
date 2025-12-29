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

  wedge?: boolean;
  /**
   * Optional classes to apply to the wedge container.
   */
  wedgeClasses?: string | Record<string, boolean>;
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
    :class="[wedge ? 'top-wave-path' : '']"
    class="relative"
  >
    <div class="wedge" :class="wedgeClasses">
      <slot name="top" />
      <div
        v-if="backgroundPattern"
        :style="{
          backgroundImage: `url(${backgroundPattern.src})`,
          backgroundRepeat: 'repeat',
          backgroundSize: backgroundPattern.size || 'contain',

          maskImage:
            'linear-gradient(rgba(0,0,0,.2), black 50%, rgba(0,0,0,.2))',
        }"
        :class="backgroundPattern.class"
        class="-z-1 absolute inset-0 w-full h-full opacity-40"
      />
      <div
        :class="[
          orientation === 'vertical' ? '' : 'lg:grid-cols-2 lg:items-center',
        ]"
        class="max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-16 sm:py-24 lg:py-32 gap-8 sm:gap-16"
      >
        <div
          :class="reverse ? 'lg:order-last' : ''"
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
                class="font-display neon-text text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted"
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
      </div>

      <slot name="bottom" />
    </div>
  </component>
</template>

<style scoped>
.top-wave-path {
  clip-path: shape(
    from 0% 7.1px,
    smooth to 17.08% 37.3px,
    smooth to 42.6% 50px,
    smooth to 58.79% 9.5px,
    smooth to 82.7% 40px,
    smooth to 100% 11.9px,
    line to 100% 100%,
    line to 0% 100%,
    close
  );
}

.wedge-container {
  animation: topArrowAnim;
  animation-timeline: view();
}
@keyframes topArrowAnim {
  0% {
    clip-path: polygon(
      0 0,
      calc(50% - 0px) 0,
      50% 0,
      calc(50% + 0px) 0,
      100% 0,
      100% 100%,
      0 100%
    );
  }
  50% {
    clip-path: polygon(
      0 0,
      calc(50% - 0px - 50px) 0,
      50% calc(50px + 0px),
      calc(50% + 0px + 50px) 0,
      100% 0,
      100% 100%,
      0 100%
    );
  }

  100% {
    clip-path: polygon(
      0 0,
      calc(50% - 0px) 0,
      50% 0,
      calc(50% + 0px) 0,
      100% 0,
      100% 100%,
      0 100%
    );
  }
}
</style>
