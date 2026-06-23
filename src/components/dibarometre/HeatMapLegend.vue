<template>
  <div class="flex flex-col gap-x-6 gap-y-2 md:flex-row md:items-center">
    <div class="flex items-center gap-x-2 text-xs">
      <span>{{ Math.round(domain[0]) }}%</span>
      <GradientLegend
        class="h-2 w-40 overflow-hidden rounded"
        :color-scale="[colors.heatmap.min, colors.heatmap.max]"
      />
      <span>{{ Math.round(domain[1]) }}%</span>
    </div>

    <div class="text-xs">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import GradientLegend from "./GradientLegend.vue";

import colors from "@/utils/colors";

const props = defineProps({
  domain: Array,
});
</script>

<style lang="scss" scoped></style>
