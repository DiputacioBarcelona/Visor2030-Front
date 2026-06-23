<template>
  <section class="ot-section border-t bg-white/95 py-16">
    <div class="ot-container">
      <h2 class="ot-title-2"><OTText value="PROGRAMS_BUDGET" /></h2>

      <div class="sticky top-[84px] z-20 bg-white py-2 pt-0 md:top-[60px]">
        <RouterSwitch
          :options="pages"
          :active="active"
          class="hidden h-[40px] rounded-full bg-gray-100 p-1 text-xs sm:block"
          item-class="flex-grow rounded-full text-center transition font-medium py-2 px-1 sm:px-4 bg-transparent focus:outline-none truncate sm:overflow-visible w-auto"
          item-active-class="text-white ring-transparent ring-0"
          slider-class="absolute  inset-y-0 my-1 bg-gray-500 rounded-full ease-out transition-all "
          item-inactive-class="text-gray-600 hover:bg-gray-200"
          inner-container-class="gap-1"
          :use-o-t-text="false"
        />

        <select
          class="ot-btn w-full rounded-full border-gray-100 bg-gray-100 sm:hidden"
          v-model="year"
        >
          <option v-for="page in pages" :value="page.id">
            {{ page.name }}
          </option>
        </select>
      </div>

      <div class="relative">
        <TreeMap
          :data="treeMapData"
          class="h-[360px] w-full sm:h-[400px] sm:w-auto md:h-[600px]"
          unit="€"
          has-round-borders
          @hover="toggleTooltip"
        />

        <LoadingSpinner
          :loading="loadingBudget"
          class="inset-0"
          bg-color-class="bg-white/50"
          border-class="h-6 w-6 border-2 border-primary"
        />

        <OTTooltip :info="tooltip" ref="tooltipElement1" :smooth="false">
          <div class="relative flex items-start">
            <div v-if="tooltip?.data" class="space-y-2 overflow-x-hidden">
              <!-- <pre>{{ tooltip?.data.data }}</pre> -->

              <div class="mt-0.5 text-base font-semibold">
                {{ tooltip.data?.data?.id }} {{ tooltip.data?.data?.name }}
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
      <!-- 
      <TreeMap
        class="w-full aspect-square sm:aspect-auto sm:w-auto sm:h-[400px] md:h-[600px]"
        unit="€"
        has-round-borders
      /> -->

      <div class="relative mt-8">
        <OTTable :rows="tableData" :columns="columns" :items-per-page="300">
          <template #value="{ value }"
            ><div class="text-right">
              <TweeningNumber :num="value" :decimals="2" />&#8239;€
            </div>
          </template>
          <template #program="{ program }">
            {{ "--".repeat(program.length - 1) }}{{ program }}
          </template>
          <template #program_name="{ program }">
            <OTText :value="`PROGRAMS.${program}`" />
          </template>
        </OTTable>

        <LoadingSpinner
          :loading="loadingBudget"
          class="left-0 right-0 top-16"
          bg-color-class=""
          border-class="h-6 w-6 border-2 border-primary"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useLoadData from "@/functions/useLoadData";
import { number } from "@/utils/filters";
import { useI18n } from "vue-i18n";
import colors from "@/utils/colors";
import useTooltip from "@/functions/useTooltip";
import * as d3 from "d3";

const { t } = useI18n();

const { id, year } = useFilters();

const data = inject("entity");

useHead({
  // the number of the indicator, its name and then the name of the city
  title: () => `${t(`PROGRAMS_BUDGET`)} - ${data.value?.name}`,
  // meta: () => [
  //   {
  //     name: "description",
  //     content: "Municipi",
  //   },
  // ],
});

const muniFilter = computed(() => {
  return {
    "municipality.municipality_code": id.value,
    year: year.value,
  };
});

const { data: budgetData, loading: loadingBudget } = useLoadData(
  "getBudgets",
  { member: [] },
  false,
  muniFilter,
);

const tableData = computed(() => {
  return budgetData.value.member
    .map((e) => ({ ...e, id: e.program }))
    .sort((a, b) => {
      // compare program alphabetically
      if (a.program < b.program) {
        return -1;
      }
    });
});

const treeMapData = computed(() => {
  const data = budgetData.value.member
    .filter((e) => {
      //   return true;
      // keep only if proram is not 4 digits
      return e.program.length !== 4;
    })
    .map((e) => {
      return {
        id: e.program,
        value: e.value,
        name: t(`PROGRAMS.${e.program}`),
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

// until 2024
const years = [
  2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
  2023, 2024,
];

const pages = computed(() => {
  return years.map((item) => {
    return {
      id: item,
      name: item,
      to: {
        name: "municipi-programs",
        params: {
          id: id.value,
          year: item,
        },
      },
    };
  });
});

const active = computed(() => {
  return year.value;
});

const [tooltip, toggleTooltip] = useTooltip();
</script>
