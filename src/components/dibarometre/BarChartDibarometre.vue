<template>
  <div class="pb-2">
    <transition-group name="flip-list" tag="div" class="">
      <div
        v-for="(section, index) in data"
        :key="section.id !== undefined ? section.id : section.name"
        class="avoid-page-break rounded"
        :class="[
          allowSelect ? 'cursor-pointer hover:bg-gray-50' : '',
          index === data.length - 1 ? '' : barSpaceClass,
        ]"
        @click="select(section)"
      >
        <!-- <div class="flex items-center justify-between"> -->
        <div
          class="flex"
          :class="[labelLeft ? 'items-center justify-between' : 'flex-col']"
        >
          <!-- label -->
          <div
            v-if="showLabels"
            :class="{
              [labelClass]: true,
              'flex justify-between': showValue,
              'md-0.5 md:mb-1': !labelLeft,
              truncate: data.length > 1,
            }"
            class="max-w-72 pl-1 pr-2 text-xs md:max-w-sm md:text-sm xl:pr-4"
          >
            <span
              class=""
              @mouseenter="showTooltipLabel($event, section.name)"
              @mouseleave="hideTooltip"
              >{{ section.name }}</span
            >
            <span v-if="showValue" class="ml-1"
              >{{
                unit === "%"
                  ? Math.round(section.values[0].value)
                  : section.values[0].value.toFixed(1)
              }}{{ unit }}</span
            >
          </div>
          <div class="flex flex-grow items-center justify-between space-x-6">
            <!-- bar -->
            <div
              class="relative flex-grow"
              v-for="value in section.values"
              :key="
                value.id !== undefined
                  ? value.id
                  : section.name + '-' + value.name
              "
              @mouseenter="
                showTooltip($event, section.name, value.value, value.compare)
              "
              @mouseleave="hideTooltip"
            >
              <div
                class="w-full overflow-hidden rounded"
                :class="{ [backgroundColorClass]: true }"
              >
                <div
                  class="h-7 transition-all duration-500 print:h-6"
                  :class="{
                    [barClass]: true,
                  }"
                  :style="{
                    width: `calc(${(value.value * 100) / computedMax}%)`,
                    background: value.color,
                  }"
                ></div>
              </div>
              <span
                v-if="value.compare !== undefined && value.compare !== null"
                class="absolute inset-y-0 h-full rounded transition-all"
                :class="[compareClass]"
                :style="{
                  left: `calc(${(value.compare * 100) / computedMax}% - 0.5px)`,
                }"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
    <OTTooltip :info="tooltip">
      <div class="text-xs font-normal text-text-normal">
        <div v-if="tooltip.compare !== null">
          <div class="font-semibold">{{ tooltip.name }}</div>
          <div>{{ elementName }}: {{ tooltip.value }}{{ unit }}</div>
          <div>
            <span class="">{{ compareLabel }}</span
            >: {{ tooltip.compare }}{{ unit }}
          </div>
        </div>
        <div v-else>
          <div v-if="showLabels" class="font-bold">{{ tooltip.name }}</div>
          <div>{{ tooltip.value }}{{ unit }}</div>
        </div>
      </div>
    </OTTooltip>

    <OTTooltip :info="tooltipLabel">
      <div class="text-xs font-normal text-text-normal">
        {{ tooltipLabel.name }}
      </div>
    </OTTooltip>
  </div>
</template>

<script>
import OTTooltip from "@/components/OTTooltip.vue";

export default {
  name: "BarChart",
  components: { OTTooltip },
  props: {
    data: {
      type: Array,
      default: () => [
        { name: "Data 1", values: [{ value: 45 }, { value: 30 }] },
        { name: "Data 2", values: [{ value: 30 }, { value: 60 }] },
      ],
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
      default: "compare-mark",
    },
    labelClass: {
      type: String,
      default: "w-36 sm:w-44 md:w-48",
    },
    backgroundColorClass: {
      type: String,
      default: "bg-grey-mig",
    },
    unit: {
      type: String,
      default: "%",
    },
    max: {
      type: Number,
      default: null,
    },
    roundDomain: {
      type: Boolean,
      default: false,
    },
    allowSelect: {
      type: Boolean,
      default: false,
    },
    showValue: {
      type: Boolean,
      default: false,
    },
    barSpaceClass: {
      type: String,
      default: "pb-3",
    },
    compareLabel: {
      type: String,
      default: "Província",
    },
    labelLeft: {
      type: Boolean,
      default: true,
    },
    showLabelsTooltip: {
      type: Boolean,
      default: true,
    },
    elementName: {
      type: String,
      default: "Municipi",
    },
    showLabels: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      tooltip: {
        target: null,
        show: false,
        name: "",
        value: 0,
      },
      tooltipLabel: {
        target: null,
        show: false,
        name: "",
      },
    };
  },
  computed: {
    computedMax() {
      if (this.max) return this.max;

      const max = Math.max(
        ...this.data.map((e) =>
          Math.max(
            ...e.values.map((d) => {
              if (d.compare) return Math.max(d.value, d.compare);
              else return d.value;
            }),
          ),
        ),
      );
      return this.roundDomain ? Math.ceil(max) : max;
    },
  },
  methods: {
    showTooltip({ target }, name, value, compare = null) {
      this.tooltip.target = target;
      this.tooltip.name = name;
      this.tooltip.value = value.toFixed(1);
      this.tooltip.compare = compare !== null ? compare.toFixed(1) : null;
      this.tooltip.show = true;
    },
    showTooltipLabel({ target }, name) {
      if (this.showLabelsTooltip && this.labelLeft && this.data.length > 1) {
        this.tooltipLabel.target = target;
        this.tooltipLabel.name = name;
        this.tooltipLabel.show = true;
      }
    },
    hideTooltip() {
      this.tooltip.show = false;
      this.tooltipLabel.show = false;
    },
    select(section) {
      if (this.allowSelect) this.$emit("select", section);
    },
  },
};
</script>

<style scoped>
.flip-list-move {
  @apply transition-transform delay-500 duration-500;
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
  transition: opacity 500ms ease-in-out 100ms;
}

.flip-list-enter-from {
  opacity: 0;
}

.flip-list-enter-to {
  opacity: 1;
}
</style>
