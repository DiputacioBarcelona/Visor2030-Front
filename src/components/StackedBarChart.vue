<template>
  <transition-group name="flip-list-delay" tag="ul" class="space-y-1.5">
    <li
      v-for="item in data"
      :key="item.id"
      :class="{
        'flex items-center pb-1': textLeft,
      }"
      class="group"
    >
      <!-- LABEL -->
      <!-- <div class="mb-0.5 truncate text-sm" :class="{ 'w-32': textLeft }">
        <slot v-bind="{ item }">{{ item.name }}</slot>
      </div> -->

      <!-- BAR -->
      <!-- was causing issues with a transition group -->
      <div
        class="flex h-3 overflow-hidden"
        :class="{
          'gap-x-4 md:gap-x-8': !stacked,
          'flex-grow': textLeft,
          rounded: rounded,
        }"
        @click="$emit('select', { target: $event.target, data: item })"
        @mouseenter="$emit('hover', { target: $event.target, data: item })"
        @mouseleave="$emit('hover', null)"
      >
        <!-- SEGMENTS -->
        <div
          v-for="(value, key, i) in item.values"
          :key="`${item.id}-${value.id}`"
          :ref="(el) => setRefs(el, item.id, value.id)"
          class="pointer-events-none relative z-10 h-full"
          :class="{
            'border-r border-white last:border-none': whiteBorder && stacked,
            rounded: rounded,
          }"
          :style="{
            background: stacked ? null : bgColor,
          }"
        >
          <!-- COLOR -->
          <div
            v-show="value.value"
            class="color flex h-full items-center py-0 text-xs"
            :class="{
              rounded: !stacked && rounded,
              'justify-center': stacked,
              'justify-end': !stacked,
            }"
            :style="{
              background: value.color || color[value.id],
            }"
          >
            <span
              class="value opacity-0 group-hover:opacity-100"
              :class="[
                (value.value * 100) / computedMax[i] < 80
                  ? 'translate-x-full pl-1'
                  : 'pr-1',
              ]"
              v-if="(showValues && !stacked) || value.value >= minValueForLabel"
              >{{ Math.round(value.value) }}%</span
            >
          </div>

          <!-- label for 0 values that otherwise would be hidden -->
          <span
            v-show="!stacked && !value.value"
            class="value pl-1 text-xs opacity-0 group-hover:opacity-100"
            >{{ Math.round(value.value) }}%</span
          >

          <!-- COMPARE MARK -->
          <div
            v-show="
              !stacked && value.compare !== null && value.compare !== undefined
            "
            class="compare absolute inset-y-0 w-px -translate-x-[0.5px] rounded bg-gray-800 print:hidden"
          ></div>
        </div>
      </div>
    </li>
  </transition-group>
</template>

<script>
import { animate } from "motion";

export default {
  name: "StackedBarChart",
  props: {
    data: {
      type: Array,
      default: () => [
        {
          id: "data-1",
          name: "Data 1",
          values: {
            val1: { id: "val1", name: "val 1", value: 60 },
            val2: { id: "val2", name: "val 2", value: 40 },
          },
        },
        {
          id: "data-2",
          name: "Data 2",
          values: {
            val1: { id: "val1", name: "val 1", value: 30 },
            val2: { id: "val2", name: "val 2", value: 70 },
          },
        },
      ],
    },
    max: {
      type: [Array, Number],
      default: null, // fixed max for separate bar chart view
    },
    color: {
      type: Object,
      default: () => ({ val1: "#eee", val2: "#ccc" }), // color for each segment
    },
    bgColor: {
      type: String,
      default: "#f3f4f6",
    },
    stacked: {
      type: Boolean,
      default: true, // change view from stacked to separate bar charts
    },
    textLeft: {
      type: Boolean,
      default: false, // align labels on the left
    },
    rounded: {
      type: Boolean,
      default: true, // use rounded corners
    },
    whiteBorder: {
      type: Boolean,
      default: true, // show a white border between segments
    },
    showValues: {
      type: Boolean,
      default: true,
    },
    minValueForLabel: {
      type: Number,
      default: 4,
    },
  },
  data() {
    return {
      segments: {},
    };
  },
  computed: {
    computedMax() {
      if (this.stacked) return Object.keys(this.data[0].values).map(() => 1);

      // for separate bar charts view
      // use given max or calculate max for each category
      if (this.max) return this.data.map((e) => this.max);

      const maximums = [];

      this.data.forEach((e) => {
        Object.keys(e.values).forEach((key, i) => {
          if (!maximums[i]) maximums[i] = [];
          maximums[i].push(e.values[key].value);
        });
      });

      return maximums.map((e) => Math.max(...e));
    },
    // number of categories
    options() {
      return Object.keys(this.data[0].values).length;
    },
  },
  methods: {
    animateChange(data) {
      // animate width for each segment
      data.forEach((d) => {
        if (this.segments[d.id]) {
          let i = 0; // store index to get value computedMax

          for (const val in d.values) {
            const segmentEl = this.segments[d.id][val];

            const segmentValue = d.values[val].value;

            const colorEl = segmentEl.querySelector(".color");

            animate(
              segmentEl,
              { width: `${this.stacked ? segmentValue : 100 / this.options}%` },
              { duration: 0.5 }
            );

            animate(
              colorEl,
              {
                width: `${
                  this.stacked
                    ? 100
                    : (segmentValue * 100) / this.computedMax[i]
                }%`,
              },
              { duration: 0.5 }
            );

            if (!this.stacked) {
              const compareValue = d.values[val].compare;

              if (compareValue !== null && compareValue !== undefined) {
                const compareEl = segmentEl.querySelector(".compare");

                if (compareEl) {
                  animate(
                    compareEl,
                    {
                      left: `${(compareValue * 100) / this.computedMax[i]}%`,
                    },
                    { duration: 0.5 }
                  );
                }
              }
            }

            i++;
          }
        }
      });
    },
    animateEnter() {
      this.animateChange(this.data);
    },
    setRefs(el, item, value) {
      // add value entry
      if (this.segments[item]) this.segments[item][value] = el;
      // initialize item entry
      else this.segments[item] = { [value]: el };
    },
  },
  watch: {
    data(newVal) {
      this.animateChange(newVal);
    },
    stacked() {
      this.animateChange(this.data);
    },
    // start animation when refs are set
    segments: {
      handler() {
        this.animateEnter();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.flip-list-delay-move {
  @apply transition-transform delay-500 duration-500;
}
</style>
