<template>
  <ChartCard>
    <template #header>
      <div
        v-if="showSegmentation"
        class="flex flex-col flex-wrap gap-x-10 gap-y-3 sm:flex-row md:flex-nowrap md:items-end md:justify-between md:gap-y-6 print:hidden"
      >
        <div class="flex flex-col">
          <label class="ot-label" for="stacked-segment"
            ><OTText value="SEGMENT_BY"
          /></label>
          <ButtonSwitchDibarometre
            id="stacked-segment"
            v-model="segment"
            :options="segmentOptions"
            class="h-[40px] p-1 px-0 text-xs"
            item-class="text-center transition font-semibold py-2 px-1 sm:px-4  focus:outline-none truncate sm:overflow-visible w-auto lg:min-w-[150px] xl:min-w-[200px]"
            item-active-class="text-main-80  ring-transparent ring-0 border-b border-main-80"
            slider-class="absolute  inset-y-0 my-1 bg-gray-100 ease-out transition-all"
            item-inactive-class="bg-gray-50 text-text-light hover:bg-gray-100 border-b border-gray-200"
            inner-container-class="grid grid-cols-3 gap-1"
          />
        </div>

        <div
          ref="compareToggle"
          v-if="previousYear"
          :class="{
            'opacity-50': !showPreviousSurvey || !questionInPreviousSurvey,
          }"
          class="flex items-center gap-x-2"
          @mouseenter="showDisabledTooltip = true"
          @mouseleave="showDisabledTooltip = false"
        >
          <OTToggle
            v-model="showPreviousYear"
            class="mb-2"
            :disabled="!showPreviousSurvey || !questionInPreviousSurvey"
            enabled-class="bg-main-80"
            small
            label-class="ot-label mb-0"
            ><OTText value="COMPARE_PREVIOUS"
          /></OTToggle>
        </div>

        <ChartSwitch
          class="hidden sm:flex"
          v-model="stacked"
          :options="groupingOptions"
        />

        <OTTooltip
          v-if="!showPreviousSurvey"
          :info="{
            target: $refs.compareToggle,
            show: showDisabledTooltip,
            data: {},
          }"
        >
          <span v-if="questionInPreviousSurvey && !isSpecific"
            >Per aquest municipi, no està disponible la comparativa perque ha
            canviat de tram de població.</span
          >
          <span v-else
            >Per aquesta pregunta, no està disponible la comparativa per què no
            era part de l'enquesta anterior.</span
          >
        </OTTooltip>
      </div></template
    >
    <template #body>
      <div>
        <div v-if="stacked" class="">
          <ColorLegend
            class="text-grey mb-6"
            :data="legend"
            display="horizontal"
          />
        </div>
        <div v-else class="text-grey mb-3 ml-40">
          <!-- sort buttons -->
          <div
            class="grid content-center gap-x-8"
            :class="{
              'grid-cols-6': axis.length === 6,
              'grid-cols-5': axis.length === 5,
              'grid-cols-4': axis.length === 4,
              'grid-cols-3': axis.length === 3,
            }"
          >
            <button
              v-for="item in legend"
              :key="item.name"
              @click="setOrder(item.name)"
              class="inline-flex w-full items-center justify-start gap-x-2 border-none p-0 text-xs"
            >
              <div
                class="mb-0.5 h-3 w-3 flex-shrink-0 rounded-full"
                :class="{
                  [item.colorClass]: true,
                }"
                :style="{ background: item.color, marginTop: '1.5px' }"
              >
                <!-- fill square with svg for print -->
                <svg class="hidden h-full w-full print:block">
                  <rect
                    width="0.75rem"
                    height="0.75rem"
                    rx="100%"
                    :fill="item.color"
                  />
                </svg>
              </div>
              <span class="truncate">{{ item.name }}</span>
              <svg
                v-if="orderBy === item.name"
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

        <div
          v-if="sortedData.length"
          class="relative pb-1"
          :class="{ 'max-w-3xl': !showSegmentation }"
        >
          <XAxis
            v-if="stacked"
            class="absolute right-0 h-full"
            :tick-values="[25, 50, 75]"
            :move-outer-ticks-inside="false"
            :class="showSegmentation ? 'left-20 sm:left-40' : 'left-0'"
          />

          <div v-else class="axis-width absolute right-0 h-full">
            <div
              class="grid h-full gap-x-4 md:gap-x-8"
              :class="{
                'grid-cols-6': axis.length === 6,
                'grid-cols-5': axis.length === 5,
                'grid-cols-4': axis.length === 4,
                'grid-cols-3': axis.length === 3,
              }"
            >
              <XAxis
                v-for="(max, i) in axis"
                :key="i"
                :domain="[0, max]"
                :tick-values="[0, max]"
                class="transition-all"
                :class="{ 'delay-0': !showPreviousYear }"
                :style="{
                  height: `calc(${
                    previousYear && showPreviousYear
                      ? 5.7 * sortedData[segment]?.data.length
                      : 2.8 * sortedData[segment]?.data.length
                  }rem)`,
                }"
              />
            </div>
          </div>
          <transition name="fade" mode="out-in">
            <div :key="segment" class="relative">
              <StackedBarChartDibarometre
                class="text-grey"
                :data="sortedData[segment]?.data"
                :text-left="true"
                transition-name="flip-list"
                :color-classes="colorClasses"
                :stacked="stacked"
                :max="axis"
                :bar-padding-bottom-class="
                  previousYear && showPreviousYear
                    ? 'pb-16 print:pb-10 last:pb-12'
                    : 'pb-3 md:pb-4 print:pb-2'
                "
                label-class="h-[28px] flex items-center justify-end"
                :show-labels="showSegmentation"
              />

              <StackedBarChartDibarometre
                v-if="previousYear && showPreviousYear"
                class="text-grey/60 absolute inset-0 top-9 border-red-500 pb-16"
                :data="sortedDataPrevious[segment]?.data"
                :text-left="true"
                transition-name="flip-list"
                :color-classes="colorClasses"
                :stacked="stacked"
                :max="axis"
                bar-padding-bottom-class="pb-[76px] print:pb-11 last:pb-0"
                bar-height-class="h-4"
                label-class="text-text-light"
              /></div
          ></transition>
        </div></div
    ></template>
  </ChartCard>
</template>

<script>
import XAxis from "@/components/dibarometre/XAxis.vue";
import ButtonSwitchDibarometre from "@/components/dibarometre/ButtonSwitchDibarometre.vue";
import ChartSwitch from "@/components/dibarometre/ChartSwitch.vue";
import StackedBarChartDibarometre from "@/components/dibarometre/StackedBarChartDibarometre.vue";
import ChartCard from "@/components/dibarometre/ChartCard.vue";
import ColorLegend from "@/components/dibarometre/ColorLegend.vue";
import OTToggle from "@/components/OTToggle.vue";
import OTTooltip from "@/components/OTTooltip.vue";

import segments from "@/utils/dibarometre/segments";
import * as IDS from "@/utils/dibarometre/ids";

import useCompare from "@/functions/useCompare";

// import { useYearStore } from "../stores/year";

import { toRefs } from "vue";
// import { storeToRefs } from "pinia";

import colors from "@/utils/colors";

export default {
  name: "StackedBarChartCard",
  components: {
    XAxis,
    ButtonSwitchDibarometre,
    ChartSwitch,
    StackedBarChartDibarometre,
    ChartCard,
    ColorLegend,
    OTToggle,
    OTTooltip,
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
    selectedElementName: {
      type: String,
      default: "",
    },
    showPreviousSurvey: {
      type: Boolean,
      default: true,
    },
    questionInPreviousSurvey: {
      type: Boolean,
      default: true, // does question exist in previous survey?
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
    year: {
      type: Number,
      default: 2023,
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
      colorClasses: {
        Molt: "bg-answer-1",
        Bastant: "bg-answer-2",
        "Normal / Regular": "bg-answer-3",
        Poc: "bg-answer-4",
        Gens: "bg-answer-5",
        "Ha millorat": "bg-answer-1",
        "Està igual": "bg-answer-3",
        "Ha empitjorat": "bg-answer-5",
        Millorarà: "bg-answer-1",
        "Seguirà igual": "bg-answer-3",
        Empitjorarà: "bg-answer-5",
        Més:
          this.data[0] &&
          (this.data[0].id_variable === "p6_2" ||
            this.data[0].id_variable === "p6_7" ||
            this.data[0].id_variable === "p6_12" ||
            this.data[0].id_variable === "p6_17")
            ? "bg-answer-1"
            : "bg-answer-5",
        Igual: "bg-answer-3",
        Menys:
          this.data[0] &&
          (this.data[0].id_variable === "p6_2" ||
            this.data[0].id_variable === "p6_7" ||
            this.data[0].id_variable === "p6_12" ||
            this.data[0].id_variable === "p6_17")
            ? "bg-answer-5"
            : "bg-answer-1",
        "Molt a prop": "bg-answer-1",
        "A prop": "bg-answer-2",
        "Ni a prop ni lluny": "bg-answer-3",
        Lluny: "bg-answer-4",
        "Molt lluny": "bg-answer-5",
        Massa:
          this.data[0] &&
          (this.data[0].id_variable === "p6_6" ||
            this.data[0].id_variable === "p6_11" ||
            this.data[0].id_variable === "p6_16" ||
            this.data[0].id_variable === "p6_18" ||
            this.data[0].id_variable === "p6_19")
            ? "bg-answer-3"
            : "bg-answer-1",
        Suficient: "bg-answer-1",
        "Ni suficient ni insuficient": "bg-answer-3",
        Insuficient: "bg-answer-5",
        "NS/NC": "bg-answer-none",
        "Molt bo": "bg-answer-1",
        Bo: "bg-answer-2",
        Dolent: "bg-answer-4",
        "Molt dolent": "bg-answer-5",
        "A la mateixa zona del municipi": "bg-answer-1",
        "A una altra zona del municipi": "bg-answer-2",
        "Fora del municipi": "bg-answer-4",
        "Molt bé": "bg-answer-1",
        Bé: "bg-answer-2",
        "Ni bé ni malament": "bg-answer-3",
        Malament: "bg-answer-4",
        "Molt malament": "bg-answer-5",
        Millor: "bg-answer-1",
        Pitjor: "bg-answer-5",
      },
      stacked: 1,
      groupingOptions: [
        { name: "grouped", id: 1, icon: "IconGrouped" },
        { name: "separate", id: 0, icon: "IconSeparate" },
      ],
      orderBy: "",
      orderDir: 1,
      axisKey: 0,
      segment: 0,
      segmentOptions: [
        { name: "Totals", id: 0 },
        { name: "Gènere", id: 1 },
        { name: "Edat", id: 2 },
      ],
      showPreviousYear: false,
      showDisabledTooltip: false,
    };
  },
  setup(props) {
    const { smallMun, isSpecific, previousYear, tramId, comarcaId } =
      toRefs(props);

    const { compareOptions } = useCompare({
      tramId,
      comarcaId,
      previousYear,
      smallMun,
      isSpecific,
    });

    return { compareOptions };
  },
  computed: {
    filteredAnswers() {
      const data = this.data
        // remove empty and ns/nc answers
        .filter((e) => e.name && e[IDS.ANSWER] != 8 && e[IDS.ANSWER] != 9)
        .sort((a, b) => a[IDS.ANSWER] - b[IDS.ANSWER]);

      return this.noAnswerData ? [...data, this.noAnswerData] : data;
    },
    // total amount of answers
    total() {
      return this.data.reduce(
        (acc, cur) => acc + cur.numero_respostes_total,
        0,
      );
    },
    totalPrevious() {
      return this.previousYear
        ? this.data.reduce(
            (acc, cur) => acc + cur.numero_respostes_total_previous,
            0,
          )
        : 0;
    },
    // amount of people with no answer
    noAnswerData() {
      // store ns / nc answers
      const data = this.data.filter(
        (e) => e.valor_variable == 8 || e.valor_variable == 9,
      );

      // merge them in 1 object
      if (data.length) {
        const obj = { name: "NS/NC" };

        Object.keys(segments.stacked_segments).forEach((segment) => {
          obj[segment] = data.reduce((acc, cur) => acc + cur[segment], 0);
        });

        if (this.previousYear) {
          Object.keys(segments.stacked_segments).forEach((segment) => {
            obj[segment + "_previous"] = data.reduce(
              (acc, cur) => acc + cur[segment + "_previous"],
              0,
            );
          });
        }

        return obj;
      } else {
        return null;
      }
    },
    processedData() {
      let filterFunction = () => true;

      if (
        this.smallMun ||
        this.element === "comarca" ||
        this.element === "tram"
      ) {
        filterFunction = (e) =>
          !e.id.endsWith("tram") && !e.id.endsWith("comarca");
      } else if (this.element === "province" || this.isSpecific) {
        filterFunction = (e) =>
          !e.id.endsWith("tram") &&
          !e.id.endsWith("comarca") &&
          !e.id.endsWith("provincia");
      }

      return segments.sections_segments.map((e) => {
        const stackedSegments = this.showSegmentation
          ? Object.keys(e.stacked_segments)
          : ["numero_respostes_total"];

        return {
          ...e,
          data: stackedSegments
            .map((key) => {
              const total = this.filteredAnswers.reduce(
                (acc, cur) => acc + cur[key],
                0,
              );

              let name = e.stacked_segments[key];

              if (name === "Municipi") {
                name = this.selectedElementName;
              } else if (name === "Província") {
                name =
                  this.compareOptions?.find((c) => c.id === "province")?.name ||
                  "Barcelona";
              } else if (name === "Comarca") {
                name = this.compareOptions?.find(
                  (c) => c.id === "comarca",
                )?.name;
              } else if (name === "Tram") {
                name = this.compareOptions?.find((c) => c.id === "tram")?.label;
              }

              return {
                id: key,
                name,
                values: this.filteredAnswers.map((answer) => {
                  return {
                    name: answer.name,
                    value: (answer[key] / total) * 100,
                    year: this.year,
                  };
                }),
              };
            })
            .filter(filterFunction),
        };
      });
    },
    processedDataPrevious() {
      if (
        !this.previousYear ||
        !this.showPreviousYear ||
        !this.showPreviousSurvey
      )
        return [];

      let filterFunction = () => true;

      if (
        this.smallMun ||
        this.element === "comarca" ||
        this.element === "tram"
      ) {
        filterFunction = (e) =>
          !e.id.endsWith("tram_previous") && !e.id.endsWith("comarca_previous");
      } else if (this.element === "province" || this.isSpecific) {
        filterFunction = (e) =>
          !e.id.endsWith("tram_previous") &&
          !e.id.endsWith("comarca_previous") &&
          !e.id.endsWith("provincia_previous");
      }

      return segments.sections_segments.map((e) => {
        return {
          ...e,
          data: Object.keys(e.stacked_segments)
            .map((key) => {
              const total = this.filteredAnswers.reduce(
                (acc, cur) => acc + cur[key + "_previous"],
                0,
              );

              const name = this.compareOptions?.find(
                (c) => c.id === "previous",
              )?.name;

              return {
                id: key + "_previous",
                name,
                values: this.filteredAnswers.map((answer) => {
                  return {
                    name: answer.name,
                    value: (answer[key + "_previous"] / total) * 100,
                    year: this.year,
                  };
                }),
              };
            })
            .filter(filterFunction),
        };
      });
    },
    sortedData() {
      return !this.stacked && this.orderBy
        ? this.processedData.map((e) => {
            return {
              ...e,
              data: [...e.data].sort(
                (a, b) =>
                  (b.values.find((d) => d.name === this.orderBy).value -
                    a.values.find((d) => d.name === this.orderBy).value) *
                  this.orderDir,
              ),
            };
          })
        : this.processedData;
    },
    sortedDataPrevious() {
      if (!this.previousYear) return [];
      return !this.stacked && this.orderBy
        ? this.processedDataPrevious.map((e, i) => {
            const data = this.sortedData[i].data;
            return {
              ...e,
              data: data.map((d) =>
                e.data.find((f) => d.id === f.id.replace("_previous", "")),
              ),
            };
          })
        : this.processedDataPrevious;
    },
    // get max values for each answer for separated view
    axis() {
      return this.filteredAnswers.map((_, i) => {
        const values = [
          ...this.processedData[this.segment]?.data.map(
            (e) => e.values[i].value,
          ),
        ];

        if (this.processedDataPrevious.length)
          values.push(
            ...this.processedDataPrevious[this.segment]?.data.map(
              (e) => e.values[i].value,
            ),
          );

        return Math.max(...values);
      });
    },
    legend() {
      return this.filteredAnswers.map((e) => {
        return {
          name: e.name,
          colorClass: this.colorClasses[e.name],
          color: colors.answer[this.colorClasses[e.name]?.split("-")[2]],
        };
      });
    },
  },
  methods: {
    setOrder(val) {
      if (val === this.orderBy) {
        // back to default order
        if (this.orderDir === -1) this.orderBy = "";
        // sort lowest to highest
        else this.orderDir = -1;
      } else {
        this.orderBy = val;
        // sort highest to lowest
        this.orderDir = 1;
      }
    },
  },
  watch: {
    segment() {
      this.axisKey++; // to trigger rerender of axis when number of bars changes
    },
  },
};
</script>

<style scoped>
.axis-width {
  width: calc(100% - 5rem);
}

@media (min-width: 640px) {
  .axis-width {
    width: calc(100% - 10rem);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
