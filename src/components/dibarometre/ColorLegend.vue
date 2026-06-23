<template>
  <div
    class="text-xs"
    :class="[
      display === 'horizontal'
        ? 'flex flex-wrap items-center gap-x-2 gap-y-1 md:gap-x-8'
        : 'space-y-1',
    ]"
  >
    <div
      v-for="item in data"
      :key="item.name"
      class="flex items-center gap-x-1 sm:gap-x-2"
    >
      <!-- color -->
      <div
        class="mb-0.5 h-3 w-3 rounded-full sm:h-4 sm:w-4"
        :class="{
          [item.colorClass]: true,
          [item.borderClass]: !!item.borderClass,
        }"
        :style="{ background: item.color, marginTop: '1.5px' }"
      >
        <!-- fill square with svg for print -->
        <svg v-if="usePrintStyles" class="h-full w-full">
          <rect
            width="0.75rem"
            height="0.75rem"
            rx="0.125rem"
            :fill="item.color"
          />
        </svg>
      </div>
      <!-- label -->
      <div>{{ item.name }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ColorLegend",
  props: {
    data: {
      type: Array,
      default: () => [
        { name: "Category 1", colorClass: "bg-blue-500" },
        { name: "Category 2", colorClass: "bg-yellow-500" },
      ],
    },
    display: {
      type: String,
      default: "vertical",
    },
    usePrintStyles: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
