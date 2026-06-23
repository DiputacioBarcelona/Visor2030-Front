<template>
  <div class="flex flex-col">
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
          <!-- <XAxis
                class="text-gray-500 absolute -bottom-1 right-0 h-full"
                :class="labelLeft ? 'left-24 sm:left-32' : 'left-0'"
                :show-ticks="false"
                :domain="[0, 10]"
                :tick-values="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                unit=""
              /> -->
          <!-- :data="barChartDataPerSegment[segmentIndex].data" -->
          <BarChart
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
          />
        </div>

        <!-- <CompareLegend
              class="pt-6"
              :class="labelLeft ? 'ml-24 sm:ml-32' : ''"
              v-if="compareOptions"
              :label="compareLegendLabel"
            /> -->
      </div>
      <!-- heatmap -->
      <div v-else class="flex flex-col pt-3">
        <!-- <HeatMap
              :data="heatMapData"
              :categories="categories"
              :color-range="heatMapColors"
              :compare-label="compareName"
              class="text-grey"
            />
            <HeatMapLegend
              :class="labelLeft ? 'ml-24 sm:ml-32 pl-2' : ''"
              :domain="domain"
            >
              <div>
                La intensitat de color indica el % de respostes sobre el total
                <span v-if="segmentIndex">de cada segment</span>
              </div>
            </HeatMapLegend> -->
      </div>
    </transition>
  </div>
</template>

<script>
// import HeatMap from "@/components/HeatMap.vue";
// import HeatMapLegend from "@/components/HeatMapLegend.vue";
import BarChart from "@/components/BarChart.vue";
// import ButtonSwitch from "@/components/ButtonSwitch.vue";
// import ButtonSwitchResponsive from "@/components/ButtonSwitchResponsive.vue";
// import ChartSwitch from "@/components/ChartSwitch.vue";
// import XAxis from "@/components/XAxis.vue";
// import CompareLegend from "@/components/CompareLegend.vue";
// import CompareMarkLabel from "@/components/CompareMarkLabel.vue";

import segments from "@/utils/dibarometre/segments";

import colors from "@/utils/colors";

// import useCompare from "@/functions/useCompare";

import { ref, toRefs } from "vue";

export default {
  name: "BarChartHeatMapCard",
  components: {
    // ChartCard,
    // HeatMap,
    // HeatMapLegend,
    BarChart,
    // ButtonSwitch,
    // ButtonSwitchResponsive,
    // ChartSwitch,
    // XAxis,
    // CompareLegend,
    // CompareMarkLabel,
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
      segmentIndex: 1,
      heatMapColors: ["#DADADA", "#00689D"],
    };
  },
  setup(props) {
    // const yearStore = useYearStore();
    // const { previousYear } = storeToRefs(yearStore);

    const compareId = ref("provincia");

    const { element, smallMun, showPreviousSurvey, isSpecific } = toRefs(props);

    // const {
    //   compareName,
    //   compareLegendLabel,
    //   compareOptions,
    //   compareMarkLabel,
    // } = useCompare({
    //   compareId,
    //   element,
    //   //   previousYear,
    //   smallMun,
    //   showPreviousSurvey,
    //   isSpecific,
    // });

    return {
      //   previousYear,
      compareId,
      compareName: "",
      //   compareLegendLabel,
      compareOptions: [],
      //   compareMarkLabel,
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

        // const segmentTotalCompare = this.filteredAnswers.reduce(
        //   (acc, cur) => acc + cur[key + `_${this.compareId}`],
        //   0,
        // );

        return {
          name: segments.segments[key],
          values: this.filteredAnswers.map(
            (e) => (e[key] / segmentTotal) * 100,
          ),
          //   provinceValues: this.compareOptions
          //     ? this.filteredAnswers.map(
          //         (e) =>
          //           (e[key + `_${this.compareId}`] / segmentTotalCompare) * 100,
          //       )
          //     : null,
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
            // let sumCompare = 0;
            // let countCompare = 0;

            this.dataWithoutNsNc.forEach((d) => {
              count += d.valor_variable * d[key];
              sum += d[key];
              //   countCompare += d.valor_variable * d[key + `_${this.compareId}`];
              //   sumCompare += d[key + `_${this.compareId}`];
            });

            const value = count / sum;
            // const compare = this.compareOptions
            //   ? countCompare / sumCompare
            //   : null;

            return {
              id: key,
              name: segments.segments[key],
              value,
              //   compare,
              color: "#9BB9C8",
            };
          }),
        };
      });
    },
    // compare value of first bar, to position label
    // comparePercent() {
    //   return this.barChartDataPerSegment[this.segmentIndex].data[0]?.values[0]
    //     ?.compare
    //     ? (this.barChartDataPerSegment[this.segmentIndex].data[0].values[0]
    //         .compare /
    //         10) *
    //         100
    //     : 0;
    // },
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
