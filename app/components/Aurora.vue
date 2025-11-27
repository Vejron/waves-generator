<template>
  <div class="-z-1 absolute inset-0 pointer-events-none overflow-hidden">
    <div
      class="filter blur-[10px] absolute max-h-80 -inset-[10px] opacity-50 will-change-transform aurora-background-gradient-after aurora-gradient-animation"
    />
  </div>
</template>

<script setup lang="ts">
interface AuroraBackgroundProps {
  radialGradient?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<AuroraBackgroundProps>(), {
  radialGradient: true,
});
</script>

<style scoped>
.aurora-background-gradient-after {
  --white: white;
  --transparent: transparent;
  --white-gradient: repeating-linear-gradient(
    100deg,
    var(--white) 0%,
    var(--white) 7%,
    var(--transparent) 10%,
    var(--transparent) 12%,
    var(--white) 16%
  );
  --dark-gradient: repeating-linear-gradient(
    100deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.8) 7%,
    var(--transparent) 10%,
    var(--transparent) 12%,
    rgba(0, 0, 0, 0.8) 16%
  );
  --aurora: repeating-linear-gradient(
    100deg,
    var(--color-green-500) 10%,
    var(--color-indigo-300) 15%,
    var(--color-green-300) 20%,
    var(--color-violet-200) 25%,
    var(--color-blue-400) 30%
  );
}

.aurora-background-gradient-after::after {
  content: "";
  position: absolute;
  inset: 10px;
  background-image: var(--white-gradient), var(--aurora);
  background-size: 130%, 140%;
  mix-blend-mode: difference;
  mask-image: radial-gradient(
    ellipse at 50% 50%,
    #000 10%,
    var(--transparent) 70%
  );
}

.aurora-background-gradient-after:is(:where(.dark) *)::after,
.aurora-background-gradient-after:is(:where(.dark))::after {
  background-image: var(--dark-gradient), var(--aurora);
}

.aurora-gradient-animation::after {
  animation: animate-aurora 60s linear infinite;
}

@keyframes animate-aurora {
  0% {
    background-position: 50% 50%, 50% 50%;
  }
  100% {
    background-position: 350% 50%, 350% 50%;
  }
}
</style>
