<script setup lang="ts">
const data = ref("hej hopp");
</script>

<template>
  <UPageHero
    title="Generate clip-paths"
    description="Create custom clip-paths with adjustable parameters for your web designs. Use the controls to adjust the SVG clip-path parameters. Drag the control points on the preview to shape the clip-path. Click 'Copy path' to copy the SVG path definition to your clipboard for use in your web designs."
  >
    <template #bottom>
      <!--  <ClipPathNext />  -->
      <!-- <ClipPathSectionGenerator class="mb-12"></ClipPathSectionGenerator> -->
      <!--  <ClipPathGenerator />  -->
      <TopClipShapeGenerator />
    </template>
  </UPageHero>
  <ISection
    class=""
    headline="About Clippy"
    title="Create custom clip-paths for your web designs"
    description="Clippy is a web application that allows you to create custom SVG clip-paths with adjustable parameters. Use the controls to adjust the clip-path shape and copy the SVG path definition for use in your web designs."
   
   
  />
  <ISection
    class="bg-zinc-800"
    headline="About Clippy"
    title="Create custom clip-paths for your web designs"
    description="Clippy is a web application that allows you to create custom SVG clip-paths with adjustable parameters. Use the controls to adjust the clip-path shape and copy the SVG path definition for use in your web designs."
    :background-pattern="{
      src: 'assets/patterns/signal.svg',
      size: '200px',
      parallax: 'up'
    }"
    wave
  />
  <ISection
    class="bg-linear-to-b from-default to-muted"
    headline="About Clippy"
    title="Create custom clip-paths for your web designs"
    description="Clippy is a web application that allows you to create custom SVG clip-paths with adjustable parameters. Use the controls to adjust the clip-path shape and copy the SVG path definition for use in your web designs."
    :image="{
      src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29kZXJ8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
      alt: 'Code on a computer screen',
      width: 800,
      height: 600
    }"
    wave
  />
  <ISection
    class="bg-default"
    headline="About Clippy 2"
    title="Create custom clip-paths for your web designs"
    description="Clippy is a web application that allows you to create custom SVG clip-paths with adjustable parameters. Use the controls to adjust the clip-path shape and copy the SVG path definition for use in your web designs."
    wave
  />
</template>
