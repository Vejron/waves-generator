<script lang="ts">
export interface FunkyProps {
  borderColor?: string;
  highlightColor?: string;
  highlighted?: number;
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<FunkyProps>(), {
  borderColor: "var(--ui-primary)",
  highlightColor: "var(--ui-secondary)",
  highlighted: 3
});

const slots = useSlots()

const renderContent = () => {
  if (!slots.default) return null;
  
  const slotContent = slots.default();
  if (!slotContent || !slotContent[0] || !slotContent[0].children) return null;
  
  // Get the text content
  const text = slotContent[0].children.toString();
  const words = text.split(' ');
  
  if (words.length === 0) return null;
  
  // Create array of vnodes
  const children = [];
  
  // First word wrapped in boxed-container
  children.push(
    h('span', { class: 'boxed-container font-display' }, words[0])
  );
  
  // Add remaining words with spaces
  for (let i = 1; i < words.length; i++) {
    // Check if this is the highlighted word (1-indexed)
    if (i === props.highlighted - 1) {
      children.push(' ');
      children.push(h('span', { class: 'word-highlighted' }, words[i]));
    } else {
      children.push(' ' + words[i]);
    }
  }
  
  return h('div', children);
}
</script>

<template>
  <component :is="renderContent()" />
</template>

<style scoped lang="css">
.boxed-container {
  position: relative;
  display: inline-block;
}
.boxed-container::after {
  content: "";
  background-color: v-bind(borderColor);
  mask: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='black' stroke-dasharray='15' stroke-dashoffset='18' stroke-linecap='square' stroke-width='6' rx='4' ry='4'/%3E%3C/svg%3E");
  transform: rotate(2deg);
  position: absolute;
  top: -0.1em;
  left: -0.2em;
  right: -0.2em;
  bottom: -0.1em;
  pointer-events: none;
  animation: scroll-rotate;
  animation-range: 0% 100%;
  animation-timeline: view();
}

.word-highlighted {
  color: v-bind(highlightColor);
  animation: scroll-rotate;
  animation-timeline: view();
}

@keyframes scroll-rotate {
  0% { transform: rotate(4deg); opacity: 0; }
  25% { transform: rotate(2deg); opacity: 0.2; }
  50% { transform: rotate(-2deg); opacity: 0.7; }
  75% { transform: rotate(-2deg); opacity: 1; }
  100% { transform: rotate(-4deg); opacity: 1; }
}
</style>
