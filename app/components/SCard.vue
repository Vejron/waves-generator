<template>
  <component
    :is="as"
    v-bind="$attrs"
    class="s-card relative isolate inline-flex w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
  >
    <div class="s-card__shadow" aria-hidden="true" />
    <div class="s-card__border" aria-hidden="true" />

    <div class="s-card__body backdrop-blur-xl">
      <div class="s-card__content">
        <slot name="header">
          <div
            v-if="icon || eyebrow"
            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary/70"
          >
            <UIcon
              v-if="icon"
              :name="icon"
              class="size-5 text-primary"
              aria-hidden="true"
            />
            <span>{{ eyebrow }}</span>
          </div>
        </slot>

        <slot name="title">
          <h3
            v-if="title"
            class="font-display text-2xl sm:text-3xl text-highlighted drop-shadow-lg"
          >
            {{ title }}
          </h3>
        </slot>

        <slot>
          <p v-if="description" class="text-base text-muted/90">
            {{ description }}
          </p>
        </slot>

        <div v-if="slots.footer" class="text-sm text-muted/80">
          <slot name="footer" />
        </div>

        <div v-if="actions?.length || slots.actions" class="s-card__actions">
          <slot name="actions">
            <UButton
              v-for="(action, index) in actions"
              :key="index"
              size="md"
              variant="soft"
              color="primary"
              v-bind="action"
            />
          </slot>
        </div>
      </div>
    </div>
  </component>
</template>

<script lang="ts">
import type { ButtonProps } from "@nuxt/ui";

export interface SCardProps {
  as?: any;
  title?: string;
  description?: string;
  icon?: string;
  eyebrow?: string;
  actions?: ButtonProps[];
}

export interface SCardSlots {
  header(props?: {}): any;
  title(props?: {}): any;
  default(props?: {}): any;
  footer(props?: {}): any;
  actions(props?: {}): any;
}
</script>

<script setup lang="ts">
withDefaults(defineProps<SCardProps>(), {
  as: "article",
  actions: () => [],
});

const slots = defineSlots<SCardSlots>();
</script>

<style scoped>
.s-card {
  --s-card-mask: url("/assets/masks/blob-mask.svg");
  --s-card-shape-path: path(
    "M279 219c-12 14-37-22-57-19s-11 47-24 47c-14-1-59-20-74-16-14 4-39 31-52 28-13-2-57-19-64-33-6-15 33-36 26-51-8-15-37-36-34-49 4-13 43-35 42-53 0-14-42-30-31-47C21 10 109-2 125 3c19 7 27 30 49 34s96-31 103-17c8 14-29 58-26 83 3 22 15 34 25 51s15 52 3 65"
  );
  --s-card-surface: rgba(5, 7, 18, 0.95);
  --s-card-outline: rgba(255, 255, 255, 0.08);
  --s-card-border: rgba(36, 230, 255, 0.85);
  --s-card-border-alt: rgba(255, 110, 199, 0.4);
  border-radius: 2rem;
}

/* Keep the irregular blob outline consistent on all engines */
.s-card__border,
.s-card__shadow,
.s-card__body {
  mask-image: var(--s-card-mask);
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: 100% 100%;
  -webkit-mask-image: var(--s-card-mask);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: 100% 100%;
  border-radius: 2rem;
}

.s-card__border {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, var(--s-card-border), var(--s-card-border-alt));
  transform: scale(1.03);
  opacity: 0.85;
  transition: transform 300ms ease, opacity 300ms ease;
}

.s-card__shadow {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(
      circle at 25% 20%,
      rgba(36, 230, 255, 0.35),
      transparent 55%
    ),
    radial-gradient(
      circle at 80% 10%,
      rgba(255, 110, 199, 0.35),
      transparent 60%
    );
  transform: translateY(10px) scale(1.08);
  filter: blur(26px);
  opacity: 0.65;
}

.s-card__body {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: clamp(1.5rem, 1rem + 1.5vw, 2.5rem);
  background: var(--s-card-surface);
  border: 1px solid var(--s-card-outline);
  box-shadow: 0 10px 45px rgba(5, 6, 15, 0.8);
  color: var(--ui-text, #f4f5f6);
}

.s-card__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.s-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

.s-card:is(:hover, :focus-visible) .s-card__border {
  transform: scale(1.06);
  opacity: 1;
}

@supports (shape-inside: path("M0 0")) {
  /* Use the blob's original path to shape flowing text for browsers that support CSS Shapes Level 2. */
  .s-card__content {
    display: block;
    shape-inside: var(--s-card-shape-path);
    shape-padding: 1.5rem;
    shape-margin: 0;
    max-height: 100%;
  }

  .s-card__content > * {
    margin-block: 1rem;
  }

  .s-card__content > :first-child {
    margin-block-start: 0;
  }

  .s-card__content > :last-child {
    margin-block-end: 0;
  }

  .s-card__actions {
    display: inline-flex;
  }
}
</style>