<template>
  <ChartCard>
    <template v-slot:header>
      <div
        class="flex flex-col items-start gap-y-3 sm:gap-x-4 md:flex-row md:flex-wrap md:gap-y-4 lg:items-center xl:flex-nowrap print:hidden"
        :class="showSegmentation ? 'lg:justify-between' : 'lg:justify-end'"
      >
        <div
          v-if="compareOptions && compareOptions.length > 1 && showSegmentation"
          class="flex flex-col"
        >
          <label class="ot-label" for="heatmap-compare"
            ><OTText value="COMPARE_WITH"
          /></label>
          <ButtonSwitchResponsive
            id="heatmap-compare"
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

        <div v-if="showSegmentation" class="flex w-full flex-col sm:w-auto">
          <label class="ot-label" for="heatmap-segment"
            ><OTText value="SEGMENT_BY"
          /></label>
          <ButtonSwitchDibarometre
            id="heatmap-segment"
            v-model="segmentIndex"
            :options="segmentOptions"
            class="h-[40px] p-1 px-0 text-xs"
            item-class="text-center transition font-semibold py-2 px-1 sm:px-4  focus:outline-none truncate sm:overflow-visible w-auto"
            item-active-class="text-main-80  ring-transparent ring-0 border-b border-main-80"
            slider-class="absolute  inset-y-0 my-1 bg-gray-100 ease-out transition-all"
            item-inactive-class="bg-gray-50 text-text-light hover:bg-gray-100 border-b border-gray-200"
            inner-container-class="grid grid-cols-3 gap-1"
          />
        </div>

        <ChartSwitch v-model="chart" :options="chartOptions" />
      </div>
    </template>
    <template v-slot:body>
      <div v-if="data.length" class="flex flex-col">
        <transition name="fade" mode="out-in">
          <!-- bar chart -->
          <div v-if="chart === 'BarChart'">
            <!-- <CompareMarkLabel
              v-if="compareOptions"
              :label="compareMarkLabel"
              :percent="comparePercent"
              :class="{ 'ml-24 sm:ml-32': labelLeft }"
            /> -->

            <div class="relative mb-6 pb-3">
              <XAxis
                class="absolute -bottom-1 right-0 h-full"
                :class="
                  labelLeft && showSegmentation
                    ? 'left-24 sm:left-32'
                    : 'left-0'
                "
                :show-ticks="true"
                :domain="[0, 10]"
                :tick-values="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                unit=""
              />
              <BarChartDibarometre
                class="font-semibold text-text-light"
                :data="barChartDataPerSegment[segmentIndex].data"
                unit=""
                :label-class="
                  labelLeft ? 'w-24 sm:w-32 text-right text-grey' : 'text-grey'
                "
                compare-class="compare-mark"
                background-color-class="bg-gray-100"
                :max="10"
                :compare-label="compareName"
                :show-label-tooltip="false"
                :element-name="elementName"
                :label-left="labelLeft"
                bar-space-class="pb-3 sm:pb-6"
                :show-labels="showSegmentation"
              />
            </div>

            <CompareLegend
              :class="labelLeft ? 'sm:ml-32' : ''"
              v-if="compareOptions && showSegmentation"
              :label="compareLegendLabel"
            />
          </div>
          <!-- heatmap -->
          <div v-else class="flex flex-col">
            <HeatMap
              :data="heatMapData"
              :categories="categories"
              :color-range="heatMapColors"
              :compare-label="compareName"
              class="text-grey"
              :show-labels="showSegmentation"
            />
            <HeatMapLegend
              class="mt-6"
              :class="labelLeft && showSegmentation ? 'sm:ml-32' : ''"
              :domain="domain"
            >
              <div>
                La intensitat de color indica el % de respostes sobre el total
                <span v-if="segmentIndex">de cada segment</span>
              </div>
            </HeatMapLegend>
          </div>
        </transition>
      </div>
    </template>
  </ChartCard>
</template>

<script>
import ChartCard from "@/components/dibarometre/ChartCard.vue";
import HeatMap from "@/components/dibarometre/HeatMap.vue";
import HeatMapLegend from "@/components/dibarometre/HeatMapLegend.vue";
import BarChartDibarometre from "@/components/dibarometre/BarChartDibarometre.vue";
import ButtonSwitchDibarometre from "@/components/dibarometre/ButtonSwitchDibarometre.vue";
import ButtonSwitchResponsive from "@/components/dibarometre/ButtonSwitchResponsive.vue";
import ChartSwitch from "@/components/dibarometre/ChartSwitch.vue";
import XAxis from "@/components/dibarometre/XAxis.vue";
import CompareLegend from "@/components/dibarometre/CompareLegend.vue";
import CompareMarkLabel from "@/components/dibarometre/CompareMarkLabel.vue";

import segments from "@/utils/dibarometre/segments";

import colors from "@/utils/colors";

import useCompare from "@/functions/useCompare";

import { ref, toRefs } from "vue";

export default {
  name: "BarChartHeatMapCard",
  components: {
    ChartCard,
    HeatMap,
    HeatMapLegend,
    BarChartDibarometre,
    ButtonSwitchDibarometre,
    ButtonSwitchResponsive,
    ChartSwitch,
    XAxis,
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
    showSegmentation: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      chart: "BarChart",
      chartOptions: [
        { name: "barchart", id: "BarChart", icon: "IconGrouped" },
        { name: "heatmap", id: "HeatMap", icon: "IconSeparate" },
      ],
      highlightColor: "#AF6993", // pink
      barColor: "#739AC6", // light blue
      segmentIndex: 0,
      heatMapColors: [colors.heatmap.min, colors.heatmap.max],
    };
  },
  setup(props) {
    const compareId = ref("provincia");

    const {
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
    segmentOptions() {
      return segments.sections_segments.map((e, i) => ({
        name: e.buttonText,
        id: i,
      }));
    },
    sortedData() {
      return [...this.data].sort((a, b) => a.valor_variable - b.valor_variable);
    },
    dataWithoutNsNc() {
      return this.data.filter((e) => e.valor_variable < 90);
    },
    filteredAnswers() {
      let data = this.sortedData.filter(
        (e) => e.name !== "No ho sap" && e.name !== "No contesta",
      );

      if (this.dataNsNc) data.push({ name: "ns/nc", ...this.dataNsNc });
      return data;
    },
    // create new object with ns/nc data
    dataNsNc() {
      const data = this.sortedData.filter(
        (e) => e.name === "No ho sap" || e.name === "No contesta",
      );

      return data.length
        ? data.reduce((obj, cur) => {
            Object.keys(segments.segments).forEach((cat) => {
              obj[cat] ? (obj[cat] += cur[cat]) : (obj[cat] = cur[cat]);
            });

            Object.keys(segments.segments).forEach((cat) => {
              obj[cat + `_${this.compareId}`]
                ? (obj[cat + `_${this.compareId}`] +=
                    cur[cat + `_${this.compareId}`])
                : (obj[cat + `_${this.compareId}`] =
                    cur[cat + `_${this.compareId}`]);
            });

            return obj;
          }, {})
        : null;
    },
    heatMapData() {
      const segmentsHeatmap =
        segments.sections_segments[this.segmentIndex].segments;

      return Object.keys(segmentsHeatmap).map((key) => {
        const segmentTotal = this.filteredAnswers.reduce(
          (acc, cur) => acc + cur[key],
          0,
        );

        const segmentTotalCompare = this.filteredAnswers.reduce(
          (acc, cur) => acc + cur[key + `_${this.compareId}`],
          0,
        );

        return {
          name: segments.segments[key],
          values: this.filteredAnswers.map(
            (e) => (e[key] / segmentTotal) * 100,
          ),
          provinceValues: this.compareOptions
            ? this.filteredAnswers.map(
                (e) =>
                  (e[key + `_${this.compareId}`] / segmentTotalCompare) * 100,
              )
            : null,
        };
      });
    },
    categories() {
      return this.filteredAnswers.map((e) => e.name);
    },
    domain() {
      let values = [];
      this.heatMapData.forEach((e) => {
        values.push(...e.values);
      });
      return [Math.min(...values), Math.max(...values)];
    },
    barChartDataPerSegment() {
      return segments.sections_segments.map((section) => {
        // process bar chart data for each section (total, gender, age)
        return {
          ...section,
          data: Object.keys(section.segments).map((key) => {
            // for each segment calculate average grade

            let sum = 0;
            let count = 0;
            let sumCompare = 0;
            let countCompare = 0;

            this.dataWithoutNsNc.forEach((d) => {
              count += d.valor_variable * d[key];
              sum += d[key];
              countCompare += d.valor_variable * d[key + `_${this.compareId}`];
              sumCompare += d[key + `_${this.compareId}`];
            });

            const value = count / sum;
            const compare =
              this.compareOptions && this.showSegmentation
                ? countCompare / sumCompare
                : null;

            return {
              name: segments.segments[key],
              values: [
                {
                  value,
                  compare,
                  color: colors.bar,
                },
              ],
            };
          }),
        };
      });
    },
    // compare value of first bar, to position label
    comparePercent() {
      return this.barChartDataPerSegment[this.segmentIndex].data[0]?.values[0]
        ?.compare
        ? (this.barChartDataPerSegment[this.segmentIndex].data[0].values[0]
            .compare /
            10) *
            100
        : 0;
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
    if (this.previousYear && this.showPreviousSurvey) {
      this.compareId = "previous";
    } else {
      this.compareId = "provincia";
    }
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
