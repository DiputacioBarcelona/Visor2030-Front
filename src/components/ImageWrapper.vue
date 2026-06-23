<template>
  <div :id="id" :style="{ padding: `0 sm:${margin}px`, margin: `0 sm:-${margin}px` }">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
    default: "image-wrapper",
  },
  margin: {
    type: Number,
    default: 24,
  },
});
</script>

<style scoped></style>
