<template>
  <div :class="{ 'pt-1': !compact }">
    <!-- LABEL (above bar) -->
    <div
      v-if="showName && !compact"
      class="ot-bar-name relative mb-1 truncate text-sm"
    >
      {{ item.name }}
    </div>

    <!-- BAR CONTAINER -->
    <div
      class="relative flex items-center"
      :class="{ rounded, [barClass]: true }"
      :style="{ background: bgColor }"
      @click="$emit('select', { target: $refs.colorBar, data: item })"
      @mouseover="$emit('hover', { target: $refs.colorBar, data: item })"
      @mouseleave="$emit('hover', null)"
    >
      <!-- LABEL (inside bar) -->
      <div
        class="ot-bar-label relative z-10 truncate"
        :class="{ 'py-1 px-1 text-xs': small, 'py-[6px] px-3 text-sm': !small }"
      >
        <!-- TW safelist is not working, so...: w-2 w-4 w-6 w-8 w-10 w-12 w-14 -->
        <!-- value -->
        <span
          v-if="showNumber && !numberRight"
          class="ot-bar-value mr-1.5 inline-block pl-1 text-right font-semibold transition-all"
          :class="[numSpanWidth]"
          >{{ format(item.value) }}</span
        >
        <span>&nbsp;</span>
        <!-- name -->
        <span v-if="showName && compact" class="ot-bar-name">{{
          item.name
        }}</span>
      </div>

      <!-- BAR COLOR -->
      <div
        class="ot-bar-color absolute inset-y-0 flex items-center"
        ref="colorBar"
        :class="{
          [item.class]: true,
          'text-xs': small,
          'text-sm': !small,
          rounded,
        }"
      >
        <!-- VALUE (right aligned) -->
        <div class="flex-grow">&nbsp;</div>
        <span
          v-if="showNumber && numberRight"
          class="ot-bar-value mr-1.5 inline-block pl-0.5 text-right transition-all"
          :class="[numSpanWidth]"
          >{{ format(item.value) }}</span
        >
        <span v-else>&nbsp;</span>
      </div>

      <!-- COMPARE MARK -->
      <div
        v-if="item.compare !== null && item.compare !== undefined"
        ref="compare"
        class="ot-bar-compare absolute inset-y-0 h-full w-1 -translate-x-0.5 rounded print:hidden"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import gsap from "gsap";

export default {
  name: "BarChartItem",
  props: {
    item: {
      type: Object,
      default: () => ({ id: "1", name: "Data 1", value: 30 }),
    },
    max: {
      type: Number,
      default: null, // value of full bar
    },
    color: {
      type: [String, Function],
      default: "#eee", // default color for all bars
    },
    compareColor: {
      type: [String, Function],
      default: "#00000099", // default color for all compare marks
    },
    compact: {
      type: Boolean,
      default: false, // show label inside bar
    },
    duration: {
      type: Number,
      default: 0.5, // time of animation in s
    },
    showName: {
      type: Boolean,
      default: true, // show name label
    },
    showNumber: {
      type: Boolean,
      default: true, // show value label
    },
    bgColor: {
      type: String,
      default: null, // color background of bar
    },
    delayEnter: {
      type: Number,
      default: 0,
    },
    small: {
      type: Boolean,
      default: false, // use thinner bar
    },
    numberRight: {
      type: Boolean,
      default: false, // right align number label inside bar
    },
    rounded: {
      type: Boolean,
      default: true, // round corners bar
    },
    format: {
      type: Function,
      default: (d) => `${d.toFixed(0)}%`, // format function for value label
    },
    barClass: {
      type: String,
      default: "",
    },
  },
  emits: ["hover", "select"],
  setup() {
    const colorBar = ref(null); // bar element
    const compare = ref(null); // compare mark element
    return { colorBar, compare };
  },
  mounted() {
    this.animateEnter();
  },
  watch: {
    item() {
      this.animateChange();
    },
  },
  computed: {
    barColor() {
      if (this.item.color) return this.item.color;
      if (typeof this.color === "function") return this.color(this.item.value);
      return this.color;
    },
    colorCompare() {
      if (this.item.compareColor) return this.item.compareColor;
      if (typeof this.compareColor === "function")
        return this.compareColor(this.item.compare);
      return this.compareColor;
    },
    // compute width for value label
    numSpanWidth() {
      const formattedNum = this.format(this.item.value);
      let size = 0;

      // num of decimals
      const parts = formattedNum.split("."); // change to comma if used for decimals
      const decimals = parts.length > 1 ? parts[1].length : 0;
      // num of characters used for unit
      const unitLength = formattedNum
        .split()
        .filter((e) => isNaN(+e) && e !== "." && e !== ",").length;

      const formattedMax = this.format(this.max);
      // console.log(formattedNum, formattedMax);

      // w-24 w-21 w-18 w-15 w-12 w-9 w-6 w-4

      if (formattedMax.length > 8) size = 24;
      else if (formattedMax.length > 7) size = 21;
      else if (formattedMax.length > 6) size = 18;
      else if (formattedMax.length > 5) size = 16;
      else if (formattedMax.length > 4) size = 12;
      else if (formattedMax.length > 3) size = 9;
      else if (formattedMax.length > 2) size = 6;
      else size = 4;

      // if (decimals) {
      //   size += decimals * 2 + 2;
      // }

      // if (unitLength) {
      //   size += unitLength * 2;
      // }

      return `w-${size}`;
    },
  },
  methods: {
    animateEnter() {
      // bar
      gsap.fromTo(
        this.$refs.colorBar,
        { width: "0%", backgroundColor: this.barColor },
        {
          duration: this.duration,
          delay: this.delayEnter,
          // ease: "power4.out",
          width: `max(${(this.item.value * 100) / this.max}%, 2px)`,
          backgroundColor: this.barColor,
        }
      );

      // compare
      if (this.item.compare) {
        gsap.fromTo(
          this.$refs.compare,
          { left: "0%", backgroundColor: this.colorCompare },
          {
            duration: this.duration,
            delay: this.delayEnter,
            // ease: "power4.out",
            left: `${(this.item.compare * 100) / this.max}%`,
            backgroundColor: this.colorCompare,
          }
        );
      }
    },
    animateChange() {
      // bar
      gsap.to(this.$refs.colorBar, {
        duration: this.duration,
        // ease: "back.inOut(1.7)",
        width: `max(${(this.item.value * 100) / this.max}%, 2px)`,
        backgroundColor: this.barColor,
      });

      // compare
      if (this.item.compare) {
        gsap.to(this.$refs.compare, {
          duration: this.duration,
          // ease: "back.inOut(1.7)",
          left: `${(this.item.compare * 100) / this.max}%`,
          backgroundColor: this.colorCompare,
        });
      }
    },
  },
};
</script>
