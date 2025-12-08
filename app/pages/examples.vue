<script setup lang="ts">
import {
  useElementBounding,
  useTransition,
  TransitionPresets,
} from "@vueuse/core";
const rippleEl = ref<HTMLElement | null>(null);
const rippleBounds = useElementBounding(rippleEl);
/* const normalized01ElementInViewport = computed(() => {
  if (!rippleBounds.height.value) return 0;
  const viewportHeight = window.innerHeight;
  const elementTop = rippleBounds.top.value;
  const elementBottom = rippleBounds.bottom.value;

  const visibleTop = Math.max(elementTop, 0);
  const visibleBottom = Math.min(elementBottom, viewportHeight);

  const visibleHeight = Math.max(visibleBottom - visibleTop, 0);
  return Math.min(visibleHeight / rippleBounds.height.value, 1);
}); */

const normalized01ElementCenterInViewport = computed(() => {
  if (!rippleBounds.height.value) return 0;
  const viewportHeight = window.innerHeight;
  const elementCenter = rippleBounds.top.value + rippleBounds.height.value / 2;

  const distanceToCenter = Math.abs(viewportHeight / 2 - elementCenter);
  const maxDistance = viewportHeight / 2 + rippleBounds.height.value / 2;

  return Math.max(0, 1 - distanceToCenter / maxDistance);
});

const output = useTransition(normalized01ElementCenterInViewport, {
  duration: 400,
  easing: TransitionPresets.easeInExpo,
});
</script>

<template>
  <div class="mask-1">
    <UPageHero
      :ui="{ title: 'font-display gradient-text' }"
      title="Generate Waves"
      description="Create custom svg waveforms with adjustable parameters for your web designs. Use the controls to adjust the SVG wave parameters. Drag the control points on the preview to shape the wave. Click 'Copy path' to copy the SVG path definition to your clipboard for use in your web designs."
    >
      <div class="flex justify-center">
        <ImageDecorator
          :image="{
            src: 'assets/products/link.webp',
            alt: 'Wave image',
            width: 600,
            height: 400,
          }"
        ></ImageDecorator>
      </div>

    <div class="w-2xl h-100 bg-amber-300 clipper relative">
      <div class="bg-red-300 h-[35px] w-full absolute top-0"></div>
    </div>
    </UPageHero>

    <SCard
      class="max-w-sm mx-auto my-8 min-h-80"
      title="Waves Generator"
      description="Generate custom SVG waveforms with adjustable parameters for your web designs."
    />

    <ASection
      orientation="horizontal"
      :reverse="true"
      mask-bottom
      mask-classes="bg-primary/16"
      icon="ph:waves"
      title="Waves Generator"
      description="Generate custom SVG waveforms with adjustable parameters for your web designs."
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',
        width: 600,
        height: 400,
      }"
    >
    </ASection>
    <ASection
      orientation="horizontal"
      mask-top
      mask-bottom
      mask-classes="bg-secondary"
      icon="ph:waves"
      title="Waves Generator"
      description="Generate custom SVG waveforms with adjustable parameters for your web designs."
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',
        width: 600,
        height: 400,
      }"
    >
    </ASection>
    <ASection
      orientation="horizontal"
      mask-top
      mask-classes="bg-primary"
      icon="ph:waves"
      title="Waves Generator"
      description="Generate custom SVG waveforms with adjustable parameters for your web designs."
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',
        width: 600,
        height: 400,
      }"
    >
    </ASection>

    <ASection
      mask-bottom
      mask-classes="bg-secondary"
      orientation="horizontal"
      icon="ph:waves"
      title="Waves Generator"
      description="Generate custom SVG waveforms with adjustable parameters for your web designs."
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',
        width: 600,
        height: 400,
      }"
    >
    </ASection>

    <ASection
      mask-top
      mask-bottom
      orientation="horizontal"
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',

        height: 300,
      }"
      title="Waves surf"
    >
      <template #description>
        Experience the thrill of riding the perfect wave with our expertly
        crafted surfboards. Whether you're a beginner or a seasoned pro, our
        boards are designed to deliver unmatched performance and style on every
        wave.
      </template>
      <template #top>
        <ShadVeroni
          :style="{
            maskImage:
              'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.3) 50%, rgba(0,0,0,0))',
          }"
          class="absolute! top-0 h-full w-full -z-2"
        />
      </template>

      <!-- <Stars class="max-h-1/2"></Stars> -->
      <!-- <template #bottom>
        <svg
          class="absolute bottom-0 svgg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
        >
          <path
            class="d"
            fill="none"
            stroke="red"
            stroke-width="1rem"
            stroke-linecap="square"
            vector-effect="non-scaling-stroke"
            pathLength="1"
            d="M0,33.38 L0,33.38 S69.49,63 114.39,59.48 C159.29,55.96 223.8,10.38 269.41,12.27 C315.03,14.16 350.18,70.92 388.08,70.81 C425.98,70.7 439.63,12.58 496.81,11.59 C554,10.6 675.24,64.23 731.19,64.88 C787.14,65.53 787.69,15.25 832.49,15.51 C877.29,15.77 972.08,57.93 1000,66.41"
          />
        </svg>
      </template> -->
    </ASection>

    <ASection
      ref="rippleEl"
      :reverse="true"
      mask-top
      mask-bottom
      orientation="horizontal"
      mask-classes=""
      :image="{
        src: 'assets/products/link.webp',
        alt: 'Wave image',
        width: 600,
        height: 400,
      }"
      title="Ripples effect"
    >
      <template #description>
        Dive into a world of mesmerizing ripples with our dynamic ripple effect.
        Perfect for adding a touch of elegance and fluidity to your designs,
        this effect simulates the gentle undulations of water, creating a
        captivating visual experience.
      </template>
      <template #top>
        <ShadRipple
          :intensity="output"
          :valley-opacity="0"
          :fade-strength="0.1"
          class="absolute! top-0 h-full w-full -z-1"
        />
      </template>
    </ASection>

    <ASection
      reverse
      mask-top
      mask-bottom
      orientation="horizontal"
      mask-classes=""
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',
        width: 600,
        height: 400,
      }"
      title="Arches effect"
      description="Experience the thrill of riding the perfect wave with our expertly crafted surfboards"
    >
      <template #top>
        <ShadArches
          :brightness="output"
          class="absolute! top-0 h-full w-full -z-2"
        />
      </template>
    </ASection>

    <!-- <div class="h-80 bg-red-500">sdsdsd</div> -->

    <ASection
      mask-top
      mask-classes="bg-primary/10"
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',
        width: 1600,
        height: 400,
      }"
      title="Waves surf"
      description="Experience the thrill of riding the perfect wave with our expertly crafted surfboards"
    >
    </ASection>
  </div>
</template>

<style>
.mask-1 {
  --top-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,100%20L0,33.38%20S69.49,63%20114.39,59.48%20C159.29,55.96%20223.8,10.38%20269.41,12.27%20C315.03,14.16%20350.18,70.92%20388.08,70.81%20C425.98,70.7%20439.63,12.58%20496.81,11.59%20C554,10.6%20675.24,64.23%20731.19,64.88%20C787.14,65.53%20787.69,15.25%20832.49,15.51%20C877.29,15.77%20972.08,57.93%201000,66.41%20L1000,100%20L0,100%20Z"/></svg>');
  --top-mask-image-width: 1000; /* The height of the top mask image */
  --top-mask-image-height: 100; /* The width of the top mask image */

  /* Define all the same for the bottom */

  --bottom-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,0%20L0,100%20L0,33.38%20S69.49,63%20114.39,59.48%20C159.29,55.96%20223.8,10.38%20269.41,12.27%20C315.03,14.16%20350.18,70.92%20388.08,70.81%20C425.98,70.7%20439.63,12.58%20496.81,11.59%20C554,10.6%20675.24,64.23%20731.19,64.88%20C787.14,65.53%20787.69,15.25%20832.49,15.51%20C877.29,15.77%20972.08,57.93%201000,66.41%20L1000,0%20Z"/></svg>');
  --bottom-mask-image-height: 100;
  --bottom-mask-image-width: 1000;
}

@media (min-width: 1024px) {
  .mask-1 {
    --top-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 100"><path d="M0,100%20L0,81.51%20S292.86,39.74%20399.12,35.62%20C505.38,31.5%20539.69,60.61%20637.56,56.81%20C735.43,53.01%20883.5,13.34%20986.33,12.84%20C1089.16,12.34%201136.23,54.69%201254.56,53.8%20C1372.89,52.91%201581.74,6.66%201696.31,7.5%20C1810.88,8.34%201840.28,55.24%201941.99,58.81%20C2043.7,62.38%202196.49,26.54%202306.6,28.94%20C2416.7,31.34%202487.52,66.65%202602.62,73.2%20C2717.72,79.75%202931.42,69.07%203000,68.24%20L3000,100%20L0,100%20Z"/></svg>');
    --top-mask-image-width: 3000; /* The height of the top mask image */

    /* Define all the same for the bottom */
    --bottom-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 100"><path d="M0,0%20L0,100%20L0,81.51%20S292.86,39.74%20399.12,35.62%20C505.38,31.5%20539.69,60.61%20637.56,56.81%20C735.43,53.01%20883.5,13.34%20986.33,12.84%20C1089.16,12.34%201136.23,54.69%201254.56,53.8%20C1372.89,52.91%201581.74,6.66%201696.31,7.5%20C1810.88,8.34%201840.28,55.24%201941.99,58.81%20C2043.7,62.38%202196.49,26.54%202306.6,28.94%20C2416.7,31.34%202487.52,66.65%202602.62,73.2%20C2717.72,79.75%202931.42,69.07%203000,68.24%20L3000,0%20Z"/></svg>');
    --bottom-mask-image-width: 3000;
  }
}

.clipper {
  clip-path: shape(
    /* draw top clip shape */
    from 0% 0px,
    smooth to 50% 30px with 25% 50px,
    smooth to 100% 30px with 75% 0px,
    line to 100% 50%,
    line to 0% 50%,
    line to 0% 0%,
    /* end top clip shape */
    /* draw bottom clip shape */
    move to 0% calc(100% - 35px),
    smooth to 50% calc(100% - 35px + 30px) with 25% calc(100% - 35px + 50px),
    smooth to 100% calc(100% - 35px + 30px) with 75% calc(100% - 35px + 0px),
    line to 100% 50%,
    line to 0% 50%,
    /* end bottom clip shape */
  );
}

.clipper-yes {
  clip-path: shape(
    /* draw top clip shape */
    from 0% 0px,
    smooth to 50% 30px with 25% 50px,
    smooth to 100% 30px with 75% 0px,
    line to 100% 50%,
    line to 0% 50%,
    line to 0% 0%,
    /* end top clip shape */
    /* draw bottom clip shape */
    line to 0% 80%,
    smooth to 50% calc(80% + 30px) with 25% calc(80% + 50px),
    smooth to 100% calc(80% + 30px) with 75% calc(80% + 0px),
    line to 100% 50%,
    line to 0% 50%,
    /* end bottom clip shape */
  );
}
</style>
