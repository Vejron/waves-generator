<script lang="ts" setup>

</script>

<template>
  <div class="bg-red-300 h-100 section-clip-top">
    hej
  </div>
</template>

<style>
.section-clip-top {
  clip-path: shape(
    from 0 0,
    smooth to 20.00% 31px with 10.00% 0px,
    smooth to 40.00% 33px with 30.00% 6px,
    smooth to 60.00% 32px with 50.00% 5px,
    smooth to 80.00% 40px with 70.00% 10px,
    smooth to 100.00% 21px with 90.00% 0px,
    line to 100% 100%,
    line to 0 100%,
    close
  );
}
</style>