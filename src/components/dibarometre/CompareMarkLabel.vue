<template>
  <div
    class="hidden h-5 text-xs text-text-light md:block"
    ref="compareMarkLabelContainer"
  >
    <div
      class="transition-transform"
      :style="{
        transform: `translateX(${leftCompareLabel})`,
      }"
    >
      <span ref="compareMarkLabelEl" class="inline-block">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, toRefs, onBeforeUnmount, computed, ref } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  percent: {
    type: Number,
    default: 0,
  },
});

const { percent } = toRefs(props);

const compareLabelWidth = ref(165);
const compareMarkLabelEl = ref(null);

// left position for compare label above first bar
const leftCompareLabel = computed(() => {
  // position compare label in middle of compare mark,
  // but no more than 100% of container width
  return `min(calc(${percent.value}% - ${
    compareLabelWidth.value / 2
  }px), 100% - ${compareLabelWidth.value}px)`;
});

// store width of compare label above first bar
const setCompareLabelWidth = () => {
  compareLabelWidth.value =
    compareMarkLabelEl.value?.getBoundingClientRect().width || 0;
};

const resizeObserver = ref(null);

onMounted(() => {
  if (window.ResizeObserver) {
    resizeObserver.value = new ResizeObserver(() => {
      setCompareLabelWidth();
    });
    resizeObserver.value.observe(compareMarkLabelEl.value);
  } else {
    // for IE
    window.addEventListener("resize", setCompareLabelWidth);
  }
});

onBeforeUnmount(() => {
  if (window.ResizeObserver) {
    resizeObserver.value.unobserve(compareMarkLabelEl.value);
  } else {
    // for IE
    window.removeEventListener("resize", setCompareLabelWidth);
  }
});
</script>

<style scoped></style>
