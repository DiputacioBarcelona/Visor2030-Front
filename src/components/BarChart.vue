<template>
  <transition-group
    name="flip-list"
    tag="ul"
    :class="{ 'space-y-0.5': small, 'space-y-1': !small }"
  >
    <li
      v-for="item in dataWithComponents"
      :key="item.name"
      :ref="
        (el) => {
          if (el) items[item.name] = el;
        }
      "
    >
      <slot v-bind="{ item, component: item.component }">
        <component :is="item.component" />
      </slot>
    </li>
  </transition-group>
</template>

<script setup>
import {
  ref,
  toRefs,
  watch,
  onBeforeUpdate,
  onMounted,
  computed,
  h,
} from "vue";
import BarChartItem from "./BarChartItem.vue";
import gsap from "gsap";

// PROPS
const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { id: "1", name: "Data 1", value: 60 },
      { id: "2", name: "Data 2", value: 40 },
    ],
  },
  max: {
    type: Number,
    default: null, // value of full bar
  },
  duration: {
    type: Number,
    default: 0.5, // time of animation in s
  },
  delayEnter: {
    type: Number,
    default: 0.5, // time of animation in s
  },
  color: {
    type: [String, Function],
    default: "#eee", // default color for all bars
  },
  compareColor: {
    type: [String, Function],
    default: "#00000099", // default color for all compare marks
  },
  small: {
    type: Boolean,
    default: false, // use thinner bars
  },
  compact: {
    type: Boolean,
    default: false, // show labels inside bars
  },
  showName: {
    type: Boolean,
    default: true, // show name labels
  },
  showNumber: {
    type: Boolean,
    default: true, // show value labels
  },
  numberRight: {
    type: Boolean,
    default: false, // right align value label inside bars
  },
  bgColor: {
    type: String,
    default: null, // color to paint background of bar
  },
  rounded: {
    type: Boolean,
    default: true, // round corners bars
  },
  format: {
    type: Function,
    default: (d) => `${d.toFixed(0)}%`, // format function for value label
  },
  barClass: {
    type: String,
    default: "",
  },
});

// EMITS
const emits = defineEmits(["hover", "select"]);

const { data, max } = toRefs(props);

// use given max or compute from data
const computedMax = computed(() => {
  return (
    max.value ||
    Math.max(...data.value.map((e) => Math.max(e.value, e.compare || 0)))
  );
});

// render function for emmiting the slot
const renderSlot = (item) => {
  return h(BarChartItem, {
    item,
    ...props,
    max: computedMax.value,
    delayEnter: firstPaint.value ? 0 : props.delayEnter,
    onHover: (e) => emits("hover", e),
    onSelect: (e) => emits("select", e),
  });
};

// FIRST PAINT
const firstPaint = ref(true);

onMounted(() => (firstPaint.value = false));

// DATA ANIMATION
const items = ref({});

onBeforeUpdate(() => {
  items.value = {};
});

const computedData = ref(data.value);

const dataWithComponents = computed(() => {
  if (!data.value) return [];
  return data.value.map((item) => ({
    ...item,
    component: renderSlot(item),
  }));
});

watch(data, (newVal, oldVal) => {
  // WHICH ARE EXITING
  const exit = oldVal.filter((e1) => !newVal.find((e2) => e2.name === e1.name));

  // only if there are exiting elements
  if (exit.length) {
    // first hide the exiting elements (if we do it with Vue's CSS animations,
    // the exiting elements move vertically, an unwanted side effect)
    exit.forEach((e) => {
      // console.log(items.value[e.name]);
      gsap.to(items.value[e.name], {
        duration: 0.5,
        opacity: 0,
      });
    });

    // and then we replace the data
    // which will update the current elements
    // and then trigger the entering Vue CSS transition animation
    setTimeout(() => {
      computedData.value = newVal;
    }, 500);
  }
  // otherwise, do it right away
  else computedData.value = newVal;
});
</script>

<style scoped>
.flip-list-move {
  @apply transition-transform;
  transition-duration: v-bind("duration") s;
  transition-delay: v-bind("duration") s;
}

/* LEAVE */

.flip-list-leave-to {
  opacity: 0;
}

.flip-list-leave-active {
  position: absolute;
  width: 100%;
}

/* ENTER */
.flip-list-enter-active {
  /* transition: opacity 500ms ease-in-out 1000ms; */
  transition-property: opacity;
  transition-timing-function: ease-in-out;
  transition-duration: v-bind("duration") s;
  transition-delay: v-bind("duration * 2") s;
}

.flip-list-enter-from {
  opacity: 0;
}

.flip-list-enter-to {
  opacity: 1;
}
</style>
