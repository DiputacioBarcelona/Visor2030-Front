<template>
  <div>
    <div class="mb-6 mt-8">
      <img
        :src="`${basePath}img/icons/currency-euro.svg`"
        alt="Hash icon"
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-4 border-dashed border-gray-500 md:mb-8" />

      <div class="flex items-start justify-between gap-6">
        <header>
          <h2 class="ot-title-2 mb-2">
            <OTText value="BUDGET" />
          </h2>
          <div class="ot-line text-sm tracking-wide">
            <OTText
              value="BUDGET_DESCRIPTION"
              :options="{ sdg: t(`SDGS.${sdg}.TITLE`) }"
              markdown
            />
          </div>
        </header>

        <!-- YEAR SELECTOR -->
        <div class="flex items-center justify-end">
          <div>
            <select
              class="ot-btn dark rounded-full border-gray-100 bg-main-80 text-xs text-white sm:hidden"
              v-model="year"
            >
              <option v-for="page in pages" :value="page.id">
                {{ page.name }}
              </option>
            </select>

            <OTSelect
              class="hidden rounded-full bg-gray-50 p-1 sm:block"
              main-class="w-24 rounded-full bg-main-80 ot-btn border-gray-100 pr-4 border-none py-2 text-white text-sm"
              v-model="year"
              :options="pages"
              :allow-search="false"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mb-8 mt-2 gap-4 sm:grid md:grid-cols-4">
      <div class="">
        <!-- <div class="text-sm font-medium mb-1 text-gray-500">
          <OTText value="TOTAL_BUDGET" />
        </div> -->
        <!-- text-sdg-1 text-sdg-2 text-sdg-3 text-sdg-4 text-sdg-5 text-sdg-6 text-sdg-7 text-sdg-8 text-sdg-9 text-sdg-10 text-sdg-11 text-sdg-12 text-sdg-13 text-sdg-14 text-sdg-15 text-sdg-16 text-sdg-17 -->
        <!-- <div class="font-semibold text-3xl relative" :class="`text-sdg-${sdg}`">
          <span>{{ number(totalAggregated, 2, { abbr: true }) }}</span
          >&#8239;<span class="text-xl">€</span>
          <LoadingSpinner
            :loading="loadingBudget || loadingWeight"
            class="inset-0"
            bg-color-class="bg-white/50"
            :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
          />
        </div> -->
        <div class="text-xl">
          <OTText
            value="BUDGET_SUMMARY"
            :options="{
              year,
              sdg,
              city: data?.name,
              value: number(totalAggregated, 2, { abbr: true }) + '&#8239;€',
              percent: number((totalAggregated * 100) / total, 1) + '&#8239;%',
            }"
            markdown
          />
        </div>
      </div>

      <div class="md:col-span-3">
        <div class="mb-4 text-sm">
          <OTText value="BUDGET_RANKING" />&nbsp;&nbsp;
          <span class="font-semibold"
            ><OTText value="SDG" :options="{ sdg }" /></span
          >&nbsp;&nbsp;
          <span class="font-semibold">{{ data?.name }}</span>
        </div>
        <BarChart
          :data="aggregatedData"
          :format="(d) => number(d, 2, { abbr: true }) + '€'"
          compact
          :color="colors.SDG_VARIANTS[sdg][30]"
          @hover="toggleTooltipBarchart"
        />

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

              <hr />

              <div><OTText value="PER_CAPITOLS" /></div>

              <div>
                <BarChart
                  :data="tooltipBarchart.data.meta"
                  :format="(d) => number(d, 2, { abbr: true }) + '€'"
                  compact
                  small
                  :color="colors.gray[200]"
                  :duration="0"
                  :delay-enter="0"
                />
              </div>

              <!-- <div class="space-y-2">
                <div v-for="item in tooltipBarchart.data.meta">
                  <div>
                    {{ item.Grup }} -
                    <OTText :value="`PROGRAMS.${item.Grup}`" />
                  </div>
                  <div class="text-lg">
                    <span class="font-medium">{{
                      number(item.budget * item.weight, 2)
                    }}</span
                    >&#8239;<span class="text-xl">€</span>
                  </div>
                </div>
              </div> -->
            </div>
          </div>
        </OTTooltip>
      </div>
    </div>

    <div class="my-8 grid gap-4 md:grid-cols-4">
      <div>
        <div class="mb-4 text-balance text-xs text-main-100">
          <OTText value="EXPLORE_BUDGET_EVOLUTION" :options="{ sdg }" />
        </div>

        <div class="grid grid-cols-1 gap-2">
          <!-- bg-sdg-1/20 bg-sdg-2/20 bg-sdg-3/20 bg-sdg-4/20 bg-sdg-5/20 bg-sdg-6/20 bg-sdg-7/20 bg-sdg-8/20 bg-sdg-9/20 bg-sdg-10/20 bg-sdg-11/20 bg-sdg-12/20 bg-sdg-13/20 bg-sdg-14/20 bg-sdg-15/20 bg-sdg-16/20 bg-sdg-17/20 hover:bg-sdg-1/20 hover:bg-sdg-2/20 hover:bg-sdg-3/20 hover:bg-sdg-4/20 hover:bg-sdg-5/20 hover:bg-sdg-6/20 hover:bg-sdg-7/20 hover:bg-sdg-8/20 hover:bg-sdg-9/20 hover:bg-sdg-10/20 hover:bg-sdg-11/20 hover:bg-sdg-12/20 hover:bg-sdg-13/20 hover:bg-sdg-14/20 hover:bg-sdg-15/20 hover:bg-sdg-16/20 hover:bg-sdg-17/20 -->

          <div class="grid grid-cols-1 gap-2 text-sm">
            <RouterLink
              :to="{
                name: 'municipi-sdg-budget',
                params: {
                  id,
                  targetId: undefined,
                  sdg: sdg,
                },
                query: route.query,
              }"
              class="bg-gray-50 py-4 pl-4 pr-2 hover:bg-gray-100"
              :class="{
                [`bg-sdg-${sdg}/20 hover:bg-sdg-${sdg}/20`]: !targetId,
              }"
            >
              <div class="leading-tight">
                <OTText value="TOTAL" />
              </div>
            </RouterLink>
          </div>

          <div v-for="target in targets" class="grid grid-cols-1 gap-2 text-sm">
            <RouterLink
              :to="{
                name: 'municipi-sdg-budget',
                params: {
                  id,
                  targetId: target.id.split('.')[1],
                  sdg: sdg,
                },
                query: route.query,
              }"
              class="bg-gray-50 py-4 pl-4 pr-2 hover:bg-gray-100"
              :class="{
                [`bg-sdg-${sdg}/20 hover:bg-sdg-${sdg}/20`]:
                  target.id === fullTargetId,
              }"
            >
              <div class="leading-tight">
                <OTText value="TARGET" :options="{ target: target.id }" />
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
      <div class="md:col-span-3">
        <div class="flex justify-between">
          <div class="mb-4 text-sm">
            <OTText value="BUDGET_EVOLUTION" />

            &nbsp;&nbsp;
            <span class="font-semibold"
              ><OTText value="BUDGET" />&nbsp;
              <OTText value="SDG" :options="{ sdg }" />.&nbsp;

              <span v-if="targetId">
                <OTText value="TARGET" :options="{ target: fullTargetId }"
              /></span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <DownloadCSVButton
              :data="lineChartData[0]"
              :filename="downloadFilename"
            />
            <!-- <DownloadSVGButton svg-id="linechart" /> -->
            <DownloadImageButton
              element-id="budget-line-chart"
              :filename="downloadFilename"
            />
          </div>
        </div>

        <ImageWrapper id="budget-line-chart">
          <div class="relative overflow-visible p-4">
            <div class="-ml-3 mb-4 flex items-center gap-1 text-xs">
              <ArrowUpIcon class="h-4 w-4" />
              €
            </div>

            <LineChart
              v-if="dataAvailable"
              :data="lineChartData"
              class="h-36 w-full md:h-64"
              xAxisStyle
              yAxisStyle
              showAllXTicks
              showYGrid
              force-zero
              :margin="{ top: 0, right: 0, bottom: 15, left: 0 }"
              :padding="{ top: 0, right: 0, bottom: 0, left: 7 }"
              :color="[colors.sdg[sdg], colors.gray[400], colors.gray[400]]"
              :dataset-stroke-dasharray="['1', '4,5', '1,3']"
              :hover-num="hoverNum"
              @hover="hoverLinechart"
              :format="(d) => number(d, 0, { abbr: true }) + '€'"
              id-label="linechart"
            />

            <!-- <div
            v-if="!dataAvailable && !loading"
            class="h-48 flex items-center justify-center"
          >
            <OTText value="NO_MUNICIPALITY_DATA" />
          </div> -->
            <LoadingSpinner
              :loading="loadingBudget"
              class="inset-0"
              bg-color-class="bg-white/50"
              :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
            />
          </div>
        </ImageWrapper>

        <!-- linechart legend -->
        <!-- border-sdg-1 border-sdg-2 border-sdg-3 border-sdg-4 border-sdg-5 border-sdg-6 border-sdg-7 border-sdg-8 border-sdg-9 border-sdg-10 border-sdg-11 border-sdg-12 border-sdg-13 border-sdg-14 border-sdg-15 border-sdg-16 border-sdg-17 -->
        <div class="mr-4 flex items-center justify-end gap-8 text-xs">
          <div class="inline-flex items-center gap-2">
            <div class="w-6 border-t-2" :class="`border-sdg-${sdg}`"></div>
            {{ data?.name }}
          </div>
          <!-- <div
            v-if="formattedComarcaData.length"
            class="inline-flex items-center gap-2"
          >
            <div class="w-6 border-t-2 border-gray-400 border-dotted"></div>
            {{ data?.comarca.comarca_name }}
          </div>
          <div
            v-if="formattedProvinceData.length"
            class="inline-flex items-center gap-2"
          >
            <div class="w-6 border-t-2 border-gray-400 border-dashed"></div>
            <OTText value="PROVINCIA_BARCELONA" />
          </div> -->
        </div>

        <OTTooltip :info="lineTooltip" ref="tooltipElement2" :smooth="false">
          <div class="relative flex items-start">
            <div v-if="lineTooltip.data" class="space-y-2 overflow-x-hidden">
              <div class="mt-0.5 text-base font-semibold">
                {{ lineTooltip.data.name }}
              </div>
              <hr />

              <div>
                <div class="mb-1 text-gray-500">
                  <OTText
                    :value="
                      targetId
                        ? `SDGS.${sdg}.TARGETS.${targetId}.DESCRIPTION`
                        : 'TOTAL'
                    "
                  />
                </div>
                <div class="text-2xl">
                  <span class="font-medium">{{
                    number(lineTooltip.data.value, 2)
                  }}</span
                  >&#8239;<span class="text-xl">€</span>
                </div>
              </div>

              <!-- <pre>{{ lineTooltip.data }}</pre> -->
            </div>
          </div>
        </OTTooltip>

        <div class="mt-2 text-sm">
          <OTText value="FONT_PRESSUPOST" />
          <a
            href="https://github.com/PopulateTools/gobierto-budgets-data"
            target="_blank"
            class="underline"
          >
            <OTText value="PRESSUPOST_LINK" />
          </a>
        </div>

        <!-- <pre class="ot-code">{{ linechartData }}</pre> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
// import useLoadData from "@/functions/useLoadData";
import { number } from "@/utils/filters";
import { useI18n } from "vue-i18n";
import colors from "@/utils/colors";
import useTooltip from "@/functions/useTooltip";
import useBudgetData from "@/functions/useBudgetData";
import { useRoute } from "vue-router";
import * as d3 from "d3";
import { ArrowUpIcon } from "@heroicons/vue/24/outline";
import { basePath } from "@/config";

const route = useRoute();

const { t } = useI18n();

const { id, year, sdg, fullTargetId, targetId } = useFilters();

const data = inject("entity");

useHead({
  title: () =>
    `${sdg.value} - ${t(`SDGS.${sdg.value}.TITLE`)} - ${t(`BUDGET`)} - ${data.value.municipality_name}`,
});

const {
  budgetData,
  filteredByYear,
  loadingBudget,
  weightData,
  loadingWeight,
  tableData,
  indexedProgramData,
  processedWeightData,
  aggregatedData,
  totalAggregated,
  years,
  total,
  indexedProgramDataByYear,
  processedWeightDataByYear,
  aggregatedDataByYear,
} = useBudgetData(true, false);

const targets = computed(() => {
  // order by id
  const list = [...aggregatedData.value].sort((a, b) => (a.id > b.id ? 1 : -1));

  return list;
});

const [tooltip, toggleTooltip] = useTooltip();

const dataAvailable = computed(() => {
  return filteredByYear.value.length > 0;
});

const downloadFilename = computed(() => {
  const target = targetId.value ? `_${fullTargetId.value}` : "";
  return `${t("BUDGET")}_${data.value?.name}_${t("SDG").trim()}${sdg.value}${target}`;
});

const lineChartData = computed(() => {
  // aggregatedDataByYear is a Map (where key is the year)

  const linechart = [];

  aggregatedDataByYear.value.forEach((targets, year) => {
    // targets is an array. every item has an id
    // if targetId is not null, then filter only the target with that id
    // if targetId is null, then aggregate all the targets

    const filtered = targetId.value
      ? targets.filter((e) => e.id === fullTargetId.value)
      : targets;

    // aggregate value
    const total = filtered.reduce((acc, e) => acc + e.value, 0);

    linechart.push({
      id: year,
      name: year,
      value: total,
    });
  });

  // sort by id
  return [linechart.sort((a, b) => (a.id > b.id ? 1 : -1))];
});

// hover main line
const hover = ref(null);

const hoverNum = computed(() => {
  if (hover.value === null) {
    // check the year.value index in the lineChartData

    return lineChartData.value[0].findIndex((e) => +e.id === +year.value);

    // return lineChartData.value[0].length - 1;
  }
  return hover.value.i;
});

const hoverLinechart = (e) => {
  hover.value = e;
  if (e?.target) {
    // force the update of the tooltip
    tooltipElement2.value.createPopper();
  }
  toggleLineTooltip(e);
  // toggleLinechartTooltip(e?.target, e?.data, e?.i);
};

const tooltipElement2 = ref(null);

const [lineTooltip, toggleLineTooltip] = useTooltip();

const treeMapData = computed(() => {
  const data = filteredByYear.value
    .filter((e) => {
      //   return true;
      // keep only if proram is not 4 digits
      return e.program.length !== 4;
    })
    .map((e) => {
      return {
        id: e.program,
        value: e.value,
        name: `${e.program} ${t(`PROGRAMS.${e.program}`)}`,
        // use the first 2 digits to get the color
        color: colors.treemap[e.program.slice(0, 2)],
      };
    });

  data.unshift({
    id: "root",
    value: null,
    color: "transparent",
  });

  // use d3 to create the hierarchical data. program is a string in the shape "123". every digit is a level. 123 has 12 as parent. 12 has 1 as parent etc. we don't have a top root

  const treeData = d3
    .stratify()
    .id((d) => d.id)
    .parentId((d) => {
      if (d.id === "root") {
        return "";
      }
      const parent = d.id.length > 1 ? d.id.slice(0, -1) : "root";

      return parent;
    })(data);

  // console.log(treeData);

  return treeData;
});

const columns = [
  //   { id: "year", name: "Any" },
  { id: "program", name: "ID Programa" },
  { id: "program_name", name: "Programa" },
  { id: "value", name: "Pressupost" },
];

const pages = computed(() => {
  return years
    .map((item) => {
      return {
        id: item,
        name: item,
        to: {
          name: "municipi-sdg-budget",
          params: {
            id: id.value,
            targetId: targetId.value,
          },
          query: {
            year: item,
          },
        },
      };
    })
    .reverse();
});

const active = computed(() => {
  return year.value;
});

const [tooltipBarchart, toggleTooltipBarchart] = useTooltip();
</script>

<style>
.budget-table td {
  @apply py-2;
}
</style>
