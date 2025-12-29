<script lang="ts" setup>
interface Image {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

const props = defineProps<{
  orientation?: "horizontal" | "vertical";
  reverse?: boolean;
  headline?: string;
  title?: string;
  description?: string;
  backgroundImage?: Image;
  backgroundPattern?: {
    src: string;
    size?: number | string;
  };
  descriptionLighten?: boolean;
  forceDark?: boolean;
  wave?: boolean;
  image?: Image;
}>();
</script>

<template>
  <UPageSection
    :class="{ 'force-dark': forceDark, 'top-wave-path': wave }"
    v-bind="props"
    :ui="{ description: descriptionLighten && 'mix-blend-plus-lighter' }"
  >
    <template v-if="$slots.top || backgroundImage || backgroundPattern" #top>
      <div
        v-if="backgroundImage"
        class="-z-1 absolute inset-0 w-full h-full darken-tint"
      >
        <NuxtImg
          format="webp"
          sizes="xs:100vw sm:100vw"
          :src="backgroundImage.src"
          :width="backgroundImage.width || 1920"
          :height="backgroundImage.height || 1080"
          :alt="backgroundImage.alt || 'Background Image'"
          class="object-cover w-full h-full"
        />
      </div>
      <div
        v-else-if="backgroundPattern"
        :style="{
          backgroundImage: `url(${backgroundPattern.src})`,
          backgroundRepeat: 'repeat',
          backgroundSize: backgroundPattern.size || 'contain',
          backgroundAttachment: 'fixed',
          maskImage: 'linear-gradient(transparent, black 50%, transparent)',
        }"
        class="-z-1 absolute inset-0 w-full h-full opacity-40"
      />
      <MDCSlot name="top" unwrap="p" />
    </template>
    <template v-if="$slots.headline" #headline>
      <MDCSlot name="headline" unwrap="p" />
    </template>
    <template v-if="$slots.title" #title>
      <MDCSlot name="title" unwrap="p" />
    </template>
    <template v-if="$slots.description" #description>
      <MDCSlot name="description" unwrap="p" />
    </template>
    <template v-if="$slots.links" #links>
      <MDCSlot name="links" unwrap="a" />
    </template>
    <template v-if="$slots.features" #features>
      <MDCSlot name="features" unwrap="p" />
    </template>
    <template #default>
      <NuxtImg
        v-if="image"
        :src="image.src"
        :alt="image.alt || 'section image'"
        :width="image.width || 600"
        :height="image.height || 400"
      />
      <MDCSlot name="default" unwrap="p" />
    </template>
    <template #bottom>
      <MDCSlot name="bottom" unwrap="p" />
    </template>
  </UPageSection>
</template>

<style scoped>
.top-wave-path {
  clip-path: shape(from 0.00% 2.7px, smooth to 11.60% 30.0px, smooth to 24.38% 19.2px, smooth to 37.50% 23.0px, smooth to 47.98% 23.4px, smooth to 62.96% 28.9px, smooth to 75.27% 30.0px, smooth to 88.98% 27.3px, smooth to 100.00% 20.2px, line to 100% 100%, line to 0% 100%, close);
  padding-top: 55px;
  margin-top: -55px;
}

.top-wave-path-inverted {
  clip-path: shape(
    from 0% 100%,
    line to 0% 92.9px,
    smooth to 17.08% 62.7px,
    smooth to 42.6% 50px,
    smooth to 58.79% 90.5px,
    smooth to 82.7% 60px,
    smooth to 100% 88.1px,
    line to 100% 100%,
    close
  );
}

.top-wave-path-animated {
  animation: waveAnimation;
  animation-timeline: view();
}

@keyframes waveAnimation {
  0%,
  100% {
    clip-path: shape(
        from 0% 0,
      smooth to 20% 0,
      smooth to 40% 0,
      smooth to 60% 0,
      smooth to 80% 0,
      smooth to 100% 0,
      line to 100% 100%,
      line to 0% 100%,
      close
      
    );
  }
  50% {
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
}

.darken-tint::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  pointer-events: none;
}
</style>
