<template>
  <ChartCard :show-info-icon="showInfoIcon">
    <template v-slot:header>
      <div v-if="showSegmentation">
        <div
          class="flex flex-col items-start justify-between gap-y-3 sm:gap-x-8 xl:flex-row xl:items-end print:hidden"
        >
          <div
            v-if="compareOptions && compareOptions.length > 1"
            class="flex flex-col"
          >
            <label class="ot-label" for="barchart-compare"
              ><OTText value="COMPARE_WITH"
            /></label>
            <ButtonSwitchResponsive
              id="barchart-compare"
              v-model="compareId"
              :options="compareOptions"
              class="h-[40px] p-1 px-0 text-xs"
              item-class="text-center transition font-semibold py-2 px-1 sm:px-4  focus:outline-none truncate sm:overflow-visible w-auto"
              item-active-class="text-main-80  ring-transparent ring-0 border-b border-main-80"
              slider-class="absolute  inset-y-0 my-0 bg-gray-100 ease-out transition-all"
              item-inactive-class="bg-gray-50 text-text-light hover:bg-gray-100 border-b border-gray-200"
              :inner-container-class="`grid grid-cols-${compareOptions.length} gap-1`"
            />
          </div>
          <div v-if="useFilter" class="flex w-full flex-col sm:w-auto">
            <label class="ot-label" for="barchart-segment"
              ><OTText value="SEGMENT_BY"
            /></label>
            <ButtonSwitchDibarometre
              id="barchart-segment"
              :model-value="segmentId"
              @update:model-value="setSegment"
              :options="segmentOptions"
              class="h-[40px] p-1 px-0 text-xs"
              item-class="text-center transition font-semibold py-2 px-1 sm:px-4  focus:outline-none truncate sm:overflow-visible w-auto xl:min-w-[120px]"
              item-active-class="text-main-80  ring-transparent ring-0 border-b border-main-80"
              slider-class="absolute  inset-y-0 my-1 bg-gray-100 ease-out transition-all xl:min-w-[120px]"
              item-inactive-class="bg-gray-50 text-text-light hover:bg-gray-100 border-b border-gray-200"
              inner-container-class="grid grid-cols-3 gap-1"
            />
          </div>
        </div>
      </div>
    </template>
    <template v-slot:body>
      <div
        class="relative pt-3 md:pt-0"
        :class="{ 'max-w-3xl': !showSegmentation }"
      >
        <div class="scroll-container pb-5">
          <div
            class="flex flex-col"
            :class="[segmentId === 'age' ? 'min-w-700px' : '']"
          >
            <!-- sort buttons -->
            <div v-if="segmentId !== 'total'" class="text-grey mb-2 md:ml-48">
              <div
                class="grid gap-x-6"
                :class="{
                  'grid-cols-2': processedData[0].values.length === 2,
                  'grid-cols-6': processedData[0].values.length === 6,
                }"
              >
                <button
                  v-for="(val, key) in selectedSegment.segments"
                  :key="key"
                  @click="setOrder(key)"
                  class="inline-flex w-full items-center border-none p-0 text-xs"
                  :class="[rank ? 'cursor-pointer' : 'cursor-default']"
                >
                  <span class="truncate">{{ val }}</span>
                  <svg
                    v-if="rank && orderBy === key && processedData.length > 1"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 transform transition-transform"
                    :class="[orderDir === -1 ? 'rotate-180' : 'rotate-0']"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <!-- <CompareMarkLabel
              v-show="compareOptions && segmentId === 'total' && !grid"
              :class="{ 'ml-36 sm:ml-44 md:ml-48': labelLeft }"
              :label="compareMarkLabel"
              :percent="comparePercent"
            /> -->

            <!-- bar chart -->
            <div class="relative pb-3">
              <div
                class="absolute bottom-6 right-0 top-0 grid gap-x-6 print:hidden"
                :class="{
                  'grid-cols-1': sums.length === 1,
                  'grid-cols-2': sums.length === 2,
                  'grid-cols-6': sums.length === 6,
                  'left-36 sm:left-44 md:left-48': labelLeft,
                  'left-0': !labelLeft,
                }"
              >
                <XAxis
                  v-for="segment in selectedSegment.segments"
                  :key="segment"
                  :class="{
                    'overflow-hidden':
                      sums.length > 1 || processedData.length === 1,
                  }"
                  :show-ticks="true"
                  :domain="domain"
                  :tick-values="tickValues"
                  :move-outer-ticks-inside="
                    sums.length > 1 || processedData.length === 1
                  "
                  :decimals="processedData.length === 1 ? 1 : 0"
                  class="print h-full text-transparent"
                />
              </div>
              <div
                class="overflow-y-hidden print:overflow-visible"
                :class="[
                  showMore || processedData.length <= 15 ? '' : 'h-600px',
                ]"
              >
                <BarChartDibarometre
                  class="font-semibold text-text-light"
                  :data="processedData"
                  compare-class="compare-mark"
                  :compare-label="compareName"
                  :label-left="labelLeft"
                  :label-class="
                    labelLeft
                      ? 'w-36 sm:w-44 md:w-48 text-right'
                      : 'truncate max-w-[340px]'
                  "
                  bar-space-class="pb-3"
                  :element-name="elementName"
                />
              </div>
              <div
                class="grid h-6 gap-x-6"
                :class="{
                  'grid-cols-1': sums.length === 1,
                  'grid-cols-2': sums.length === 2,
                  'grid-cols-6': sums.length === 6,
                  'ml-36 sm:ml-44 md:ml-48': labelLeft,
                  'ml-0': !labelLeft,
                }"
              >
                <XAxis
                  v-for="segment in selectedSegment.segments"
                  :key="segment"
                  :show-ticks="true"
                  :domain="domain"
                  :tick-values="tickValues"
                  :move-outer-ticks-inside="
                    sums.length > 1 || processedData.length === 1
                  "
                  :decimals="processedData.length === 1 ? 1 : 0"
                  :show-grid="false"
                  class="h-6"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- horizontal scroll button -->
        <button
          v-if="segmentId === 'age' && scrolled < scrollContainerWidth"
          class="absolute -top-1 right-0 rounded-full bg-white p-1 shadow sm:hidden"
          @click="scrollRight"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <!-- horizontal scroll button -->
        <button
          v-if="segmentId === 'age' && scrolled"
          class="absolute -top-1 left-0 rounded-full bg-white p-1 shadow sm:hidden"
          @click="scrollLeft"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div
        class="flex flex-col items-start justify-between gap-x-3 gap-y-3 md:flex-row md:items-end md:justify-start md:gap-x-10"
      >
        <button
          @click="showMore = !showMore"
          v-if="processedData.length > 15"
          class="flex items-center gap-x-1 text-sm text-secondary sm:text-base md:ml-48 md:gap-x-3 print:hidden"
        >
          <template v-if="!showMore"
            ><PlusCircleIcon class="h-5 w-5" /><span
              >Veure més respostes</span
            ></template
          >
          <template v-else
            ><MinusCircleIcon class="h-5 w-5" /><span
              >Veure menys respostes</span
            ></template
          >
        </button>
        <CompareLegend
          :class="
            processedData.length <= 15 && labelLeft ? 'sm:ml-44 md:ml-48' : ''
          "
          v-if="compareOptions && showSegmentation"
          :label="compareLegendLabel"
        />
      </div>
    </template>
  </ChartCard>
</template>

<script>
import ChartCard from "@/components/dibarometre/ChartCard.vue";
import BarChartDibarometre from "@/components/dibarometre/BarChartDibarometre.vue";
import XAxis from "@/components/dibarometre/XAxis.vue";
import ButtonSwitchDibarometre from "@/components/dibarometre/ButtonSwitchDibarometre.vue";
import ButtonSwitchResponsive from "@/components/dibarometre/ButtonSwitchResponsive.vue";
import CompareLegend from "@/components/dibarometre/CompareLegend.vue";
import CompareMarkLabel from "@/components/dibarometre/CompareMarkLabel.vue";

import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/vue/24/outline";

import segments from "@/utils/dibarometre/segments";

import colors from "@/utils/colors";

import useCompare from "@/functions/useCompare";

import { ref, toRefs } from "vue";

const orderOtherOptions = {
  Altres: 1,
  Res: 2,
  Tot: 3,
  "No ho sap": 4,
  "No contesta": 5,
};

export default {
  name: "BarChartCard",
  components: {
    ChartCard,
    BarChartDibarometre,
    XAxis,
    ButtonSwitchDibarometre,
    ButtonSwitchResponsive,
    PlusCircleIcon,
    MinusCircleIcon,
    CompareLegend,
    CompareMarkLabel,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Commodi, architecto.",
    },
    useFilter: {
      type: Boolean,
      default: true,
    },
    rank: {
      type: Boolean,
      default: true,
    },
    footer: {
      type: String,
      default: "",
    },
    smallMun: {
      type: Boolean,
      default: false,
    },
    element: {
      type: String,
      default: "municipality",
    },
    elementName: {
      type: String,
      default: "Municipi",
    },
    labelLeft: {
      type: Boolean,
      default: true,
    },
    grid: {
      type: Boolean,
      default: false,
    },
    showPreviousSurvey: {
      type: Boolean,
      default: true,
    },
    isSpecific: {
      type: Boolean,
      default: false, // whether question is specific for muni
    },
    percentageCoveredProvince: {
      type: Number,
      default: null,
    },
    percentageCoveredComarca: {
      type: Number,
      default: null,
    },
    percentageCoveredTram: {
      type: Number,
      default: null,
    },
    showInfoIcon: {
      type: Boolean,
      default: false,
    },
    infoIconText: {
      type: String,
      default: "",
    },
    previousYear: {
      type: Number,
      default: 2020,
    },
    tramId: {
      type: Number,
      default: null,
    },
    comarcaId: {
      type: Number,
      default: null,
    },
    answerId: {
      type: Number,
      default: null,
    },
    showSegmentation: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      segments: segments.sections_segments,
      segment: "numero_respostes_total",
      segmentId: "total",
      highlightColor: "#004897",
      barColor: "#739AC6",
      count: 0,
      orderBy: "",
      orderDir: 1,
      showMore: false,
      scrolled: 0,
      scrollContainerWidth: 300,
    };
  },
  setup(props) {
    const compareId = ref("provincia");

    const {
      element,
      smallMun,
      showPreviousSurvey,
      isSpecific,
      previousYear,
      tramId,
      comarcaId,
    } = toRefs(props);

    const {
      compareName,
      compareLegendLabel,
      compareOptions,
      compareMarkLabel,
    } = useCompare({
      tramId,
      comarcaId,
      compareId,
      previousYear,
      smallMun,
      showPreviousSurvey,
      isSpecific,
    });

    return {
      compareId,
      compareName,
      compareLegendLabel,
      compareOptions,
      compareMarkLabel,
    };
  },
  computed: {
    selectedSegment() {
      return this.segments.find((e) => e.id === this.segmentId);
    },
    segmentOptions() {
      return this.segments.map((e) => ({ name: e.buttonText, id: e.id }));
    },
    sums() {
      return Object.keys(this.selectedSegment.segments).map((key) =>
        this.data.reduce((acc, cur) => acc + cur[key], 0),
      );
    },
    provinceSums() {
      return Object.keys(this.selectedSegment.segments).map((key) =>
        this.data.reduce((acc, cur) => acc + cur[key + "_provincia"], 0),
      );
    },
    comarcaSums() {
      return !this.smallMun
        ? Object.keys(this.selectedSegment.segments).map((key) =>
            this.data.reduce((acc, cur) => acc + cur[key + "_comarca"], 0),
          )
        : [];
    },
    // only for large muns
    tramSums() {
      return !this.smallMun
        ? Object.keys(this.selectedSegment.segments).map((key) =>
            this.data.reduce((acc, cur) => acc + cur[key + "_tram"], 0),
          )
        : [];
    },
    previousSums() {
      return this.previousYear
        ? Object.keys(this.selectedSegment.segments).map((key) =>
            this.data.reduce((acc, cur) => acc + cur[key + "_previous"], 0),
          )
        : [];
    },
    processedData() {
      let data = [...this.data];
      // let totalCount = 0;

      if (this.rank) {
        let sortBy =
          this.orderBy || Object.keys(this.selectedSegment.segments)[0];

        let sortedData = data.sort(
          (a, b) => (b[sortBy] - a[sortBy]) * this.orderDir,
        );

        // store 'other' category
        const other = sortedData
          .filter((e) => e.valor_variable > 90)
          .map((e) => {
            return {
              ...e,
              order: orderOtherOptions[e.name],
            };
          })
          .sort((a, b) => a.valor_variable - b.valor_variable);

        // move 'other' category to end of array
        if (other.length) {
          const filteredData = sortedData.filter((e) => e.valor_variable < 90);
          data = [...filteredData, ...other];
        } else {
          data = sortedData;
        }
      } else {
        data.sort((a, b) => a.valor_variable - b.valor_variable);
      }

      return data
        .filter((e) => !this.answerId || e.valor_variable === this.answerId)
        .map((e) => {
          return {
            name: e.name,
            values: Object.keys(this.selectedSegment.segments).map(
              (segment, i) => {
                const count = e[segment];

                let compareSum = null;
                if (this.compareId === "provincia")
                  compareSum = this.provinceSums[i];
                else if (this.compareId === "comarca")
                  compareSum = this.comarcaSums[i];
                else if (this.compareId === "tram")
                  compareSum = this.tramSums[i];
                else if (this.compareId === "previous")
                  compareSum = this.previousSums[i];

                const value = (count / this.sums[i]) * 100;
                const compare =
                  this.compareOptions && this.showSegmentation
                    ? (e[segment + `_${this.compareId}`] / compareSum) * 100
                    : null;

                return {
                  name: segment,
                  count,
                  value,
                  color: colors.bar,
                  compare,
                };
              },
            ),
            id: e.valor_variable,
          };
        });
    },
    domain() {
      const max = Math.max(
        ...this.processedData.map((e) =>
          Math.max(...e.values.map((d) => Math.max(d.value, d.compare))),
        ),
      );

      return [0, max];
    },
    tickValues() {
      return this.segmentId === "age" || this.processedData.length === 1
        ? this.domain
        : null;
    },
    comparePercent() {
      // max value of all bars
      const max = Math.max(
        ...this.processedData.map((e) =>
          Math.max(
            ...e.values.map((d) => {
              if (d.compare) return Math.max(d.value, d.compare);
              else return d.value;
            }),
          ),
        ),
      );

      // compare value of first bar
      return this.processedData[0]?.values[0]?.compare
        ? (this.processedData[0].values[0].compare / max) * 100
        : 0;
    },
  },
  methods: {
    setSegment(id) {
      this.segmentId = id;
      this.orderBy = Object.keys(this.selectedSegment.segments)[0];
      this.orderDir = 1;
    },
    setOrder(val) {
      if (val === this.orderBy) {
        this.orderDir *= -1;
      } else {
        this.orderBy = val;
        this.orderDir = 1;
      }
    },
    scrollRight() {
      this.scrollContainer.scrollLeft += 200;
    },
    scrollLeft() {
      this.scrollContainer.scrollLeft -= 200;
    },
    setScrolled() {
      this.scrolled = this.scrollContainer.scrollLeft;
    },
  },
  watch: {
    smallMun() {
      if (
        this.smallMun &&
        (this.compareId === "tram" || this.compareId === "comarca")
      ) {
        if (this.previousYear && this.showPreviousSurvey) {
          this.compareId = "previous";
        } else this.compareId = "provincia";
      }
    },
    previousYear(newVal) {
      if (
        !newVal &&
        this.compareId === "previous" &&
        this.element !== "province"
      ) {
        this.compareId = "provincia";
      }
    },
    showPreviousSurvey(newVal) {
      if (!newVal && this.compareId === "previous") {
        this.compareId = "provincia";
      }
    },
  },
  mounted() {
    this.scrollContainer = document.querySelector(".scroll-container");
    this.scrollContainerWidth = this.scrollContainer?.offsetWidth;

    this.scrollContainer?.addEventListener("scroll", this.setScrolled);

    if (this.previousYear && this.showPreviousSurvey) {
      this.compareId = "previous";
    }
  },
  beforeUnmount() {
    this.scrollContainer?.removeEventListener("scroll", this.setScrolled);
  },
};
</script>

<style scoped>
@media (max-width: 640px) {
  .scroll-container {
    overflow-x: scroll;
    overflow-y: hidden;
    max-width: 100%;
  }
  .min-w-700px {
    min-width: 700px;
  }
}

.h-600px {
  height: 600px;
}

@media print {
  .h-600px {
    height: auto;
  }
}
</style>
