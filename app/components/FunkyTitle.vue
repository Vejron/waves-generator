<script lang="ts" setup>
defineSlots<{
  default: {};
}>();

const slots = useSlots()

if(slots.default) {
  // Do nothing, just to make sure the slot is used
  console.log('Using default slot in FunkyTitle');
}

</script>

<template>
  <h1 class="font-black text-[50px] md:text-[60px]">
    <span class="boxed">Unleash</span> Your Creativity with Funky Titles!
  </h1>
</template>

<style>
.boxed {
  position: relative;
  display: inline-block;
}

.boxed::after {
  content: '';
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='%230087E0FF' stroke-dasharray='20,20' stroke-dashoffset='18' stroke-linecap='square' stroke-width='6' rx='4' ry='4'/%3E%3C/svg%3E");
  transform: rotate(2deg);
  position: absolute;
  top: 2px;
  left: -12px;
  right: -12px;
  bottom: 2px;
  pointer-events: none;
}
</style>
