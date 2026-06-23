<template>
  <section class="bg-white py-0 md:py-8">
    <div class="ot-container">
      <img
        :src="`${basePath}img/icons/currency-euro.svg`"
        alt=""
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-6 border-dashed border-gray-500" />

      <div class="mb-2">
        <header class="mb-2 flex flex-wrap items-center justify-between gap-4">
          <h2 class="ot-title-2 mb-0" id="budget">
            <OTText value="BUDGET" />
          </h2>

          <div class="ml-auto flex items-center justify-end gap-2 self-start">
            <!-- YEAR SELECTOR -->
            <div>
              <label for="year" class="sr-only"><OTText value="YEAR" /></label>
              <select
                class="ot-btn dark rounded-full border-gray-100 bg-main-80 text-sm text-white sm:hidden print:flex"
                v-model="year"
                id="year"
              >
                <option v-for="page in pages" :value="page.id">
                  {{ page.name }}
                </option>
              </select>

              <OTSelect
                class="hidden rounded-full bg-gray-50 p-1 sm:block print:hidden"
                main-class="w-24 rounded-full bg-main-80 ot-btn border-gray-100 pr-4 border-none py-2 text-white text-sm"
                v-model="year"
                :options="pages"
                :allow-search="false"
                label="year"
              />
            </div>

            <!-- SHOW SELECTOR -->
            <div class="flex justify-center print:hidden">
              <RouterSwitch
                :options="pagesShow"
                :active="activeShow"
                class="inline-flex rounded-full bg-gray-50 p-1 text-sm"
                item-class="w-24 flex-grow rounded-full text-center transition font-medium py-2 px-4 bg-transparent focus:outline-none truncate sm:overflow-visible rounded-full whitespace-nowrap z-20 ot-ring first:rounded-l-full last:rounded-r-full  focus-visible:ring-main-80/50 focus-visible:ring-4 focus-visible:ring-offset-0"
                item-active-class="text-white ring-transparent ring-0"
                slider-class="absolute inset-y-0 my-1 bg-main-80 rounded-full ease-out transition-all "
                item-inactive-class="text-gray-700 hover:bg-gray-200"
                inner-container-class="gap-1"
              />
            </div>
          </div>
        </header>

        <!-- TOTALS -->
        <div
          class="mb-2 divide-y text-sm md:divide-x md:divide-y-0 print:divide-x print:divide-y-0"
        >
          <div
            class="flex items-baseline justify-between gap-1 py-1 md:inline-flex md:py-0 md:pr-2 print:inline-flex print:py-0 print:pr-2"
          >
            <div><OTText value="TOTAL_BUDGET" />:</div>
            <div class="relative text-lg font-semibold">
              <span>{{ number(total, 2, { abbr: true }) }}</span
              >&#8239;<span>€</span>
              <LoadingSpinner
                :loading="loadingBudget || loadingWeight"
                class="inset-0"
                bg-color-class="bg-white/50"
                border-class="h-6 w-6 border-2"
              />
            </div>
          </div>

          <div
            class="flex items-baseline justify-between gap-1 py-1 md:inline-flex md:px-2 md:py-0 print:inline-flex print:px-2 print:py-0"
          >
            <div><OTText value="TOTAL_ASSIGNED_BUDGET" />:</div>
            <div class="relative text-lg font-semibold">
              <span>{{ number(totalAssigned, 2, { abbr: true }) }}</span
              >&#8239;<span>€</span>
              <LoadingSpinner
                :loading="loadingBudget || loadingWeight"
                class="inset-0"
                bg-color-class="bg-white/50"
                border-class="h-6 w-6 border-2"
              />
            </div>
          </div>

          <div
            class="flex items-baseline justify-between gap-1 py-1 md:inline-flex md:py-0 md:pl-2 print:inline-flex print:px-2 print:py-0"
          >
            <div><OTText value="TOTAL_UNASSIGNED_BUDGET" />:</div>
            <div class="relative text-lg font-semibold">
              <span>{{ number(totalUnassigned, 2, { abbr: true }) }}</span
              >&#8239;<span>€</span>
              <LoadingSpinner
                :loading="loadingBudget || loadingWeight"
                class="inset-0"
                bg-color-class="bg-white/50"
                border-class="h-6 w-6 border-2"
              />
            </div>
          </div>
        </div>

        <div class="flex items-end justify-between">
          <div class="ot-line text-sm tracking-wide">
            <OTText value="BUDGET_SUBTITLE" />
          </div>
          <div class="flex items-center gap-2">
            <DownloadCSVButton
              :data="show ? tableDownloadData : barChartData"
              :filename="budgetFilename"
            />
            <DownloadImageButton
              :element-id="
                show ? 'budget-table' : !view ? 'tree-map' : 'bar-chart'
              "
              :filename="budgetFilename"
            />
          </div>
        </div>
      </div>

      <div v-if="!show">
        <div>
          <!-- VIEW SELECTOR -->
          <div
            class="my-2 flex flex-wrap-reverse items-center justify-between gap-2 print:hidden"
          >
            <div class="text-balance text-xs text-main-100">
              <OTText value="CLICK_SDG" />
            </div>

            <div class="ml-auto flex flex-shrink-0 items-center gap-2 md:ml-0">
              <div class="flex-shrink-0 text-xs text-main-100">
                <OTText value="TIPUS_GRAFIC" />
              </div>
              <RouterSwitch
                :options="pagesView"
                :active="activeView"
                class="inline-flex rounded-full bg-gray-50 p-1 text-xs"
                item-class="flex-grow text-center transition font-medium py-2 px-4 bg-transparent focus:outline-none truncate sm:overflow-visible w-auto rounded-full whitespace-nowrap z-20 ot-ring first:rounded-l-full last:rounded-r-full  focus-visible:ring-main-80/50 focus-visible:ring-4 focus-visible:ring-offset-0"
                item-active-class="text-white ring-transparent ring-0"
                slider-class="absolute inset-y-0 my-1 bg-main-80 rounded-full ease-out transition-all "
                item-inactive-class="text-gray-700 hover:bg-gray-200"
                inner-container-class="gap-1"
                @hover="toggleOptionsTooltip"
              />
              <OTTooltip
                :info="optionsTooltip"
                :offset="[0, 9]"
                class="font-regular"
                inner-class="rounded-lg border border-main-80 bg-main-80 text-white text-sm"
                arrow-class="border-main-80"
              >
                <div class="w-16 text-center text-xs">
                  <OTText
                    v-if="optionsTooltip?.data?.title"
                    :value="optionsTooltip?.data?.title"
                  />
                </div>
              </OTTooltip>
            </div>
          </div>

          <!-- TREEMAP -->
          <div v-if="!view" class="relative">
            <ImageWrapper id="tree-map">
              <TreeMap
                :data="treeMapData"
                class="h-[360px] w-full sm:h-[400px] sm:w-auto md:h-[550px] print:h-[550px] print:scale-100"
                unit="€"
                :has-round-borders="false"
                use-gradients
                padding="0"
                @hover="toggleTooltip"
                @select="goToSDGBudget"
              />
            </ImageWrapper>

            <LoadingSpinner
              :loading="loadingBudget"
              class="inset-0"
              bg-color-class="bg-white/50"
              border-class="h-6 w-6 border-2 border-primary"
            />

            <OTTooltip :info="tooltip" ref="tooltipElement1" :smooth="false">
              <div class="relative flex items-start">
                <div v-if="tooltip?.data" class="space-y-2 overflow-x-hidden">
                  <div class="mt-0.5 text-base font-semibold">
                    {{ tooltip.data?.data?.name }}
                  </div>
                  <hr />

                  <div class="text-2xl">
                    <span class="font-medium">{{
                      number(tooltip.data?.data?.value, 2)
                    }}</span
                    >&#8239;<span class="text-xl">€</span>
                  </div>
                </div>
              </div>
            </OTTooltip>
          </div>

          <!--  BARCHART -->
          <div v-else>
            <ImageWrapper id="bar-chart">
              <BarChart
                :data="barChartData"
                :format="(d) => number(d, 2, { abbr: true }) + '€'"
                compact
                :color="colors.gray[200]"
                @hover="toggleTooltipBarchart"
                bar-class="hover:bg-gray-100 cursor-pointer"
                @select="goToSDGBudget"
              />
            </ImageWrapper>

            <OTTooltip
              :info="tooltipBarchart"
              ref="tooltipElement2"
              :smooth="false"
            >
              <div class="relative flex items-start">
                <div
                  v-if="tooltipBarchart?.data"
                  class="space-y-2 overflow-x-hidden"
                >
                  <div class="mt-0.5 text-base font-semibold">
                    {{ tooltipBarchart.data?.name }}
                  </div>
                  <hr />

                  <div class="text-2xl">
                    <span class="font-medium">{{
                      number(tooltipBarchart.data.value, 2)
                    }}</span
                    >&#8239;<span class="text-xl">€</span>
                  </div>
                </div>
              </div>
            </OTTooltip>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- SDG FILTER  -->
        <div class="my-4 flex items-center justify-center gap-4">
          <div class="text-xs text-gray-600">
            <OTText value="FILTER_BY_SDG" />
          </div>
          <RouterSwitch
            :options="pagesSDG"
            :active="activeSDG"
            class="hidden rounded-full bg-gray-100 p-1 text-xs lg:inline-flex"
            item-class="flex-grow rounded-full text-center transition font-medium py-2 px-4 bg-transparent focus:outline-none truncate sm:overflow-visible w-auto"
            item-active-class="text-white ring-transparent ring-0"
            slider-class="absolute inset-y-0 my-1 bg-gray-500 rounded-full ease-out transition-all "
            item-inactive-class="text-gray-700 hover:bg-gray-200"
            inner-container-class="gap-1"
          />
          <select
            :value="activeSDG"
            @change="filterSDG = $event.target.value"
            class="ot-btn dark w-24 rounded-full border-none border-gray-100 bg-main-80 py-2 pr-4 text-sm text-white lg:hidden"
          >
            <option v-for="page in pagesSDG" :key="page.id" :value="page.id">
              {{ page.name }}
            </option>
          </select>
        </div>

        <!-- TABLE -->
        <div v-if="tableData.length" class="relative mt-4">
          <ImageWrapper id="budget-table">
            <OTTable
              :rows="tableData"
              :columns="columns"
              :items-per-page="300"
              row-class="budget-table"
            >
              <template #header-value="{ name }"
                ><div class="flex-grow text-right">
                  {{ name }}
                </div>
              </template>

              <template #value="{ value }"
                ><div class="text-right">
                  <span>{{ number(value, 1, { abbr: true }) }}</span
                  >&#8239;€
                </div>
              </template>
              <template #program="{ program }">
                {{ "".repeat(program.length - 1) }}{{ program }}
              </template>
              <template #program_name="{ program }">
                <div class="max-w-md truncate xl:max-w-lg">
                  <OTText :value="`PROGRAMS.${program}`" />
                </div>
              </template>
              <template #distribution="{ program, value }">
                <div class="w-36">
                  <StackedBarChart
                    :data="indexedWeightData[program]?.sdgs || []"
                    :color="colors.sdg"
                    class="text-white"
                    :show-values="false"
                    :min-value-for-label="100"
                    @hover="toggleTooltipStacked"
                  />
                </div>
              </template>
            </OTTable>
          </ImageWrapper>

          <LoadingSpinner
            :loading="loadingBudget"
            class="left-0 right-0 top-16"
            bg-color-class=""
            border-class="h-6 w-6 border-2 border-primary"
          />
        </div>
        <div v-else class="py-4 text-gray-500">
          <OTText value="NO_DATE_FOR_BUDGET" />
        </div>

        <!-- TOOLTIP TABLE -->
        <OTTooltip :info="tooltipStacked" ref="tooltipElement3" :smooth="false">
          <div class="relative">
            <div
              v-if="tooltipStacked?.data"
              class="space-y-2 overflow-x-hidden"
            >
              <div class="mt-0.5 text-base font-semibold">
                {{ tooltipStacked.data?.name }}
              </div>
              <hr />

              <div v-for="ods in tooltipStacked.data.values">
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-full font-semibold text-white"
                    :class="`bg-sdg-${ods.id}`"
                  >
                    {{ ods.id }}
                  </div>
                  <div>{{ ods.name }}</div>
                </div>
                <div class="ml-8 text-xl">
                  <span class="font-medium">{{
                    number(
                      (ods.value *
                        indexedProgramData[tooltipStacked.data.id]?.value) /
                        100,
                      2,
                    )
                  }}</span
                  >&#8239;<span class="text-lg">€</span>
                </div>
              </div>
            </div>
          </div>
        </OTTooltip>
      </div>

      <div class="mt-2 text-sm">
        <OTText value="FONT_PRESSUPOST" />
        <a
          href="https://serviciostelematicosext.hacienda.gob.es/SGFAL/CONPREL"
          target="_blank"
          class="underline"
        >
          <OTText value="PRESSUPOST_LINK" />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import colors from "@/utils/colors";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import useBudgetData from "@/functions/useBudgetData";
import useTooltip from "@/functions/useTooltip";
import { number } from "@/utils/filters";
import * as d3 from "d3";
import { TableCellsIcon, ListBulletIcon } from "@heroicons/vue/24/outline";
import useLoadData from "@/functions/useLoadData";
import { basePath } from "@/config";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import useEntityType from "@/functions/useEntityType";

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const { id, year, view, show, filterSDG } = useFilters();

const data = inject("entity");
const entityType = useEntityType();

const breakpoints = useBreakpoints(breakpointsTailwind);
const smallerThanMd = breakpoints.smaller("md");

watch(smallerThanMd, (value) => {
  if (value) {
    view.value = "ranking";
  }
});

const {
  budgetData,
  loadingBudget,
  weightData,
  loadingWeight,
  tableData,
  indexedProgramData,
  processedWeightData,
  aggregatedData,
  aggregatedAssignedData,
  total,
  totalAssigned,
  totalUnassigned,
  years,
  indexedWeightData,
} = useBudgetData();

const budgetFilename = computed(() => {
  const selectedSdg = activeSDG.value === 0 ? t("ALL") : activeSDG.value;
  const display = show.value
    ? `${t("SDG", { sdg: selectedSdg })}_table`
    : !view.value
      ? "tree_map"
      : "bar_chart";
  return `${t("BUDGET")}_${data.value.name}_${year.value}_${display}`;
});

const tableDownloadData = computed(() => {
  const keysToBeRemoved = ["@id", "@type", "municipality"];

  return tableData.value.map((row) => {
    const cleaned = Object.fromEntries(
      Object.entries(row).filter(([k]) => !keysToBeRemoved.includes(k)),
    );

    cleaned.program = t(`PROGRAMS.${cleaned.program}`);
    return cleaned;
  });
});

const barChartData = computed(() => {
  return aggregatedAssignedData.value.map((item) => ({
    ...item,
    color: colors.SDG_VARIANTS[item.id]?.[30],
  }));
});

// treemap tooltip
const [tooltip, toggleTooltip] = useTooltip();

const treeMapData = computed(() => {
  const data = [...aggregatedAssignedData.value];

  data.unshift({
    id: "root",
    value: null,
    color: "transparent",
  });

  data.forEach((d) => {
    d.textColor = "#000000";
  });

  const treeData = d3
    .stratify()
    .id((d) => d.id)
    .parentId((d) => {
      if (d.id === "root") {
        return "";
      }
      return "root";
    })(data);

  return treeData;
});

const [tooltipBarchart, toggleTooltipBarchart] = useTooltip();

function goToSDGBudget(e) {
  router.push({
    name: `${entityType.value}-sdg-budget`,
    params: {
      id: id.value,
      sdg: e.data.id,
    },
    query: route.query,
  });
}

const pages = computed(() => {
  return years
    .map((item) => {
      return {
        id: item,
        name: item,
        to: {
          name: entityType.value,
          params: {
            id: id.value,
          },
          query: {
            ...route.query,
            year: item,
          },
        },
      };
    })
    .reverse();
});

const pagesView = computed(() => {
  return [
    {
      id: "composition",
      name: "",
      title: "COMPOSITION",
      to: {
        name: entityType.value,
        params: {
          id: id.value,
        },
        query: {
          ...route.query,
          view: null,
        },
      },
      icon: TableCellsIcon,
    },
    {
      id: "ranking",
      name: "",
      title: "RANKING",
      to: {
        name: entityType.value,
        params: {
          id: id.value,
        },
        query: {
          ...route.query,
          view: "ranking",
        },
      },
      icon: ListBulletIcon,
    },
  ];
});

const activeView = computed(() => {
  return !view.value ? "composition" : "ranking";
});

// OPTIONS TOOLTIP
const [optionsTooltip, toggleOptionsTooltip] = useTooltip();

const pagesShow = computed(() => {
  return [
    {
      id: "sdg",
      name: "SDG",
      to: {
        name: entityType.value,
        params: {
          id: id.value,
        },
        query: {
          ...route.query,
          show: undefined,
          sdg: undefined,
        },
      },
    },
    {
      id: "programs",
      name: "CHAPTERS",
      to: {
        name: entityType.value,
        params: {
          id: id.value,
        },
        query: {
          ...route.query,
          show: "programs",
        },
      },
    },
  ];
});

const activeShow = computed(() => {
  return !show.value ? "sdg" : "programs";
});

const pagesSDG = computed(() => {
  const sdgs = Array.from({ length: 17 }, (_, i) => {
    return {
      id: i + 1,
      name: (i + 1).toString(),
      to: {
        params: route.params,
        query: {
          ...route.query,
          sdg: i + 1,
        },
      },
    };
  });

  const all = {
    id: 0,
    name: "ALL",
    to: {
      params: route.params,
      query: {
        ...route.query,
        sdg: undefined,
      },
    },
  };

  return [all, ...sdgs];
});

const activeSDG = computed(() => {
  return !filterSDG.value ? 0 : filterSDG.value;
});

const columns = computed(() => [
  { id: "program", name: "Codi" },
  { id: "program_name", name: "Programa" },
  {
    id: "value",
    name: `Pressupost${filterSDG.value ? ` (ODS ${filterSDG.value})` : ""}`,
  },
  { id: "distribution", name: t("DISTRIBUTION") },
]);

const [tooltipStacked, toggleTooltipStacked] = useTooltip();
</script>
