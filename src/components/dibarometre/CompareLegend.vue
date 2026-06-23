<template>
  <div
    :class="[small ? 'gap-x-1' : 'gap-x-2 md:gap-x-3']"
    class="text-grey flex items-center"
  >
    <span
      :class="[small ? '!h-5' : '!h-6']"
      class="compare-mark rounded"
    ></span>
    <span class="text-xs">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: "CompareLegend",
  props: {
    label: {
      type: String,
      default: "",
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
