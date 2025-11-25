<template>
  <div class="mask-1">
    <UPageHero
      title="Generate Waves"
      description="Create custom svg waveforms with adjustable parameters for your web designs. Use the controls to adjust the SVG wave parameters. Drag the control points on the preview to shape the wave. Click 'Copy path' to copy the SVG path definition to your clipboard for use in your web designs."
    >
    </UPageHero>

    <ASection
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
      class="margin-container"
      orientation="horizontal"
      :background-pattern="{
        src: 'assets/patterns/circuit-board.svg',
        size: '200px',
        class: 'bg-elevated',
      }"
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',
        width: 600,
        height: 400,
      }"
      title="Waves surf"
      description="Experience the thrill of riding the perfect wave with our expertly crafted surfboards"
    >
      <template #top>
        <svg class="absolute top-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" >
          <path
            class="path"
            fill="none"
            stroke="red"
            stroke-width="1rem"
            stroke-linecap="square"
            vector-effect="non-scaling-stroke"
            pathLength="1"
            d="M0,33.38 L0,33.38 S69.49,63 114.39,59.48 C159.29,55.96 223.8,10.38 269.41,12.27 C315.03,14.16 350.18,70.92 388.08,70.81 C425.98,70.7 439.63,12.58 496.81,11.59 C554,10.6 675.24,64.23 731.19,64.88 C787.14,65.53 787.69,15.25 832.49,15.51 C877.29,15.77 972.08,57.93 1000,66.41"
          />
        </svg>
      </template>
    </ASection>
    <ASection
      class="margin-container"
      orientation="horizontal"
      mask-classes="bg-elevated bg-gradient-to-b from-black via-black/40 to-black"
      :image="{
        src: 'assets/heroes/example.svg',
        alt: 'Wave image',
        width: 600,
        height: 400,
      }"
      title="Waves surf"
      description="Experience the thrill of riding the perfect wave with our expertly crafted surfboards"
    >
    </ASection>
    <ASection
      class="margin-container"
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

<style scoped>
.path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: dash 5s linear alternate infinite;
}

@keyframes dash {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.margin-container {
  margin-bottom: calc(var(--bottom-mask-height) * -1.01);
  margin-top: calc(var(--top-mask-height) * -1);
}
.mask-1 {
  --top-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,100%20L0,33.38%20S69.49,63%20114.39,59.48%20C159.29,55.96%20223.8,10.38%20269.41,12.27%20C315.03,14.16%20350.18,70.92%20388.08,70.81%20C425.98,70.7%20439.63,12.58%20496.81,11.59%20C554,10.6%20675.24,64.23%20731.19,64.88%20C787.14,65.53%20787.69,15.25%20832.49,15.51%20C877.29,15.77%20972.08,57.93%201000,66.41%20L1000,100%20L0,100%20Z"/></svg>');
  --top-mask-image-width: 1000; /* The height of the top mask image */
  --top-mask-image-height: 100; /* The width of the top mask image */

  /* Define all the same for the bottom */
  --bottom-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,0%20L0,100%20L0,33.38%20S69.49,63%20114.39,59.48%20C159.29,55.96%20223.8,10.38%20269.41,12.27%20C315.03,14.16%20350.18,70.92%20388.08,70.81%20C425.98,70.7%20439.63,12.58%20496.81,11.59%20C554,10.6%20675.24,64.23%20731.19,64.88%20C787.14,65.53%20787.69,15.25%20832.49,15.51%20C877.29,15.77%20972.08,57.93%201000,66.41%20L1000,0%20Z"/></svg>');
  --bottom-mask-image-height: 100; /* The width of the bottom mask image */
  --bottom-mask-image-width: 1000; /* The height of the bottom mask image */
}
</style>
