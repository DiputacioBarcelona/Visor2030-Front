<template>
  <div>
    <transition-group name="flip-list-delay" tag="ul" class="relative">
      <li
        appear
        v-for="(item, i) in data"
        :key="item.name || i"
        class="border-b border-transparent text-xs"
        :class="[
          barPaddingBottomClass,
          {
            'flex items-center': textLeft,
          },
        ]"
      >
        <div
          v-if="showLabels"
          class="pr-3 text-right"
          :class="[labelClass, { 'w-20 sm:w-40': textLeft }]"
        >
          <span class="bg-white print:text-xs">{{ item.name }}</span>
        </div>

        <div
          class="flex overflow-hidden"
          :class="[
            barHeightClass,
            barRoundedClass,
            { 'space-x-4 md:space-x-8': !stacked, 'flex-grow': textLeft },
          ]"
        >
          <div
            v-for="(value, i) in item.values"
            :key="`${item.name}-${value.name}`"
            class="relative h-full transform border-r-[0.5px] border-white text-white transition duration-500 last:border-none"
            :class="[
              barRoundedClass,
              {
                'bg-gray-100': !stacked,
                'z-20 ': hover === value.name,
              },
            ]"
            :style="{
              'will-change': 'transform, width',
              'transition-property': 'transform, width',
              width: stacked
                ? `${value.value * computedMax[i]}%`
                : `${100 / options}%`,
            }"
          >
            <div
              class="flex h-full items-center justify-center transition duration-500"
              :class="{
                [colorClasses[value.name]]: true,
                [barRoundedClass]: !stacked,
                [hoverClass]: hover === value.name,
              }"
              :style="{
                'will-change': 'width',
                'transition-property': 'width',
                width: stacked
                  ? '100%'
                  : `${(value.value * 100) / computedMax[i]}%`,
              }"
              @mouseenter="showTooltip($event, value, item)"
              @mouseleave="hideTooltip"
            ></div>
          </div>
        </div>
      </li>
    </transition-group>
    <OTTooltip :info="tooltip" class="text-grey z-30">
      <div class="text-xs">
        <div class="font-semibold">
          {{ tooltip.name }}
        </div>
        <div>{{ tooltip.value }}%</div>
      </div>
    </OTTooltip>
  </div>
</template>

<script>
import { max } from "d3";
// import TweeningNumber from "@/components/TweeningNumber";
import OTTooltip from "@/components/OTTooltip.vue";

export default {
  name: "StackedBarChart",
  components: { OTTooltip },
  props: {
    data: {
      type: Array,
      default: () => [
        {
          name: "Data 1",
          values: [
            { name: "val 1", value: 60 },
            { name: "val 2", value: 40 },
          ],
        },
        {
          name: "Data 2",
          values: [
            { name: "val 1", value: 30 },
            { name: "val 2", value: 70 },
          ],
        },
      ],
    },
    max: {
      type: Array,
      default: null,
    },
    selected: {
      type: String,
      default: null,
    },
    activeClass: {
      type: String,
      default: "",
    },
    barClass: {
      type: String,
      default: "bg-gray-300",
    },
    compareClass: {
      type: String,
      default: "bg-gray-600 bg-opacity-50",
    },
    colorClasses: {
      type: Object,
      default: () => ({ "val 1": "bg-blue-500", "val 2": "bg-yellow-500" }),
    },
    stacked: {
      type: Number,
      default: 1,
    },
    unknownIndexPosition: {
      type: Number,
      default: 2,
    },
    textLeft: {
      type: Boolean,
      default: false,
    },
    hoverClass: {
      type: String,
      default: "", // "border-2 border-black"
    },
    transitionName: {
      type: String,
      default: "flip-list-delay",
    },
    barPaddingBottomClass: {
      type: String,
      default: "pb-3 md:pb-4",
    },
    barHeightClass: {
      type: String,
      default: "h-7 print:h-6",
    },
    barRoundedClass: {
      type: String,
      default: "rounded",
    },
    labelClass: {
      type: String,
      default: "",
    },
    showLabels: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      tooltip: {
        show: false,
        value: 0,
        name: "",
        target: null,
      },
      hover: null,
    };
  },
  computed: {
    computedMax() {
      if (this.stacked) return this.data[0].values.map(() => 1);
      if (this.max) return this.max;
      const maximums = [];
      this.data.forEach((e) => {
        e.values.forEach((e, i) => {
          if (!maximums[i]) maximums[i] = [];
          maximums[i].push(e.value);
        });
      });
      return maximums.map((e) => max(e));
    },
    options() {
      return this.data[0].values.length;
    },
  },
  methods: {
    showTooltip({ target }, value) {
      this.tooltip.target = target;
      this.tooltip.value = value.value.toFixed(1);
      this.tooltip.name = value.name;
      this.tooltip.year = value.year;
      this.tooltip.show = true;
    },
    hideTooltip() {
      this.tooltip.show = false;
    },
  },
};
</script>

<style scoped>
.flip-list-delay-move {
  @apply transition-transform delay-0;
}
</style>
