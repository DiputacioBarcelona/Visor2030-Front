<template>
  <div class="">
    <div class="relative bg-white text-xs" @mouseleave="hideTooltip">
      <div class="mb-px flex h-6 items-center">
        <div
          v-if="showLabels"
          class="flex w-16 items-center space-x-2 px-2 py-1 sm:w-32"
        >
          <div class="w-16 flex-grow truncate text-left sm:w-32">
            <div class="flex items-center whitespace-nowrap"></div>
          </div>
        </div>
        <div class="heat-map-row ml-3 font-sans">
          <div
            v-for="(cat, i) in categories"
            :key="i"
            class="heat-map-head-square"
            :class="{ rotate: rotateHeaders }"
          >
            <div class="truncate">{{ cat }}</div>
          </div>
        </div>
      </div>

      <transition-group name="flip-list" tag="div" class="" appear>
        <div
          v-for="row in data"
          :key="row.name"
          class="mb-px flex h-8 items-center sm:h-10"
        >
          <div
            v-if="showLabels"
            class="w-18 flex items-center space-x-2 py-1 pl-2 pr-1 sm:w-32 sm:pr-2"
          >
            <div class="w-16 flex-grow truncate text-left sm:w-32">
              <div class="flex items-center justify-end whitespace-nowrap">
                <span
                  class="truncate text-xs font-semibold text-text-light sm:text-sm"
                  >{{ row.name }}</span
                >
              </div>
            </div>
          </div>
          <div class="heat-map-row sm:ml-3">
            <div
              v-for="(col, i) in row.values"
              :key="i"
              class="heat-map-square"
              :style="{
                'background-color': color(col),
                width: `${(100 * 100) / 60}%`,
              }"
              @mouseenter="showTooltip($event, row, i)"
            >
              <!-- <span class="">&nbsp;</span> -->
            </div>
          </div>
        </div>
      </transition-group>
      <OTTooltip :info="tooltip" class="z-30">
        <div class="text-xs">
          <div v-if="showLabels" class="font-semibold">{{ tooltip.title }}</div>
          <div>
            <div>{{ tooltip.value.toFixed(1) }}% de respostes</div>
            <div v-if="tooltip.province">
              ({{ tooltip.province.toFixed(1) }}% per la
              <span class="lowercase">{{ compareLabel }}</span
              >)
            </div>
          </div>
        </div>
      </OTTooltip>
    </div>
  </div>
</template>

<script>
import { scaleLinear, interpolateRgb, extent, max } from "d3";
// import colors from "@/utils/colors";
// import CountryFlag from "@/components/CountryFlag";
import OTTooltip from "@/components/OTTooltip.vue";
export default {
  components: {
    // CountryFlag,
    OTTooltip,
  },
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    colorRange: {
      type: Array,
      default: () => ["#ffffff", "#000000"],
    },
    rotateHeaders: {
      type: Boolean,
      default: false,
    },
    compareLabel: {
      type: String,
      default: "Província",
    },
    showLabels: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      regionId: null,
      tooltip: {
        show: false,
        left: 0,
        top: 0,
        bottom: 0,
        html: "",
        title: "",
        target: null,
        value: 0,
        province: 0,
      },
      orderBy: null,
      orderDir: true,
    };
  },
  computed: {
    interpolator() {
      return interpolateRgb(this.colorScale[0], this.colorScale[1]);
    },
    range() {
      return extent([0, ...this.data.map((row) => max(row.values))]);
    },
    colorScale() {
      return scaleLinear().domain(this.range).range(this.colorRange);
    },
  },
  methods: {
    color(val) {
      if (val === null || isNaN(val)) return "#ccc"; //colors.gray[50];
      return this.colorScale(val);
    },
    showTooltip({ target }, row, i) {
      this.tooltip.target = target;
      this.tooltip.value = row.values[i];
      this.tooltip.province = row.provinceValues ? row.provinceValues[i] : null;
      this.tooltip.title = row.name;
      this.tooltip.show = true;
    },
    hideTooltip() {
      this.tooltip.show = false;
    },
  },
};
</script>

<style>
.heat-map-row {
  @apply flex h-full  flex-grow space-x-0 sm:space-x-px;
}
.heat-map-square {
  @apply h-full cursor-default justify-center whitespace-nowrap text-center transition-colors duration-300;
}
.heat-map-head-square {
  @apply flex w-1 flex-grow transform items-center justify-center overflow-x-visible whitespace-nowrap px-0 py-0 text-xs;
}
.heat-map-head-square.active {
  @apply text-gray-900;
}
.heat-map-head-square.rotate {
  /* @apply rotate-45 -translate-x-1/2 origin-right justify-end; */
  @apply origin-left translate-x-1/2 -rotate-45 justify-start;
}
</style>
