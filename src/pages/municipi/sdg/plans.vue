<template>
  <div class="mb-6 mt-8">
    <img
      :src="`${basePath}img/icons/hash.svg`"
      alt="Hash icon"
      class="absolute -mt-2 bg-white pr-2"
    />
    <hr class="mb-4 border-dashed border-gray-500 md:mb-8" />

    <div class="">
      <header>
        <h2 class="ot-title-2 mb-2">
          <OTText value="PLANS_ESTRATEGICS" />
        </h2>
        <div class="ot-line text-sm tracking-wide">
          <OTText
            value="PLANS_ESTRATEGICS_DESCRIPTION"
            :options="{ sdg: t(`SDGS.${sdg}.TITLE`) }"
            markdown
          />
        </div>
      </header>
    </div>
  </div>

  <div class="mt-6">
    <div class="space-y-8">
      <div
        v-for="program in processedData.by_plan"
        class="rounded border p-4"
        :class="{
          'bg-main-10 bg-opacity-30':
            program[IDS.NOM_COMPLET] === 'aggregate_total',
        }"
      >
        <div class="mb-2">
          <h2
            v-if="program[IDS.NOM_COMPLET] === 'aggregate_total'"
            class="ot-title-3 mb-1 block"
          >
            <OTText :value="`${program[IDS.NOM_COMPLET]}_1`" />
            <span class="font-bold"
              ><OTText :value="`SDGS.${sdg}.TITLE`"
            /></span>
            <OTText :value="`${program[IDS.NOM_COMPLET]}_2`" />
          </h2>
          <h2 v-else class="ot-title-3 mb-1 block">
            {{ program[IDS.NOM_COMPLET] }} -
            <strong class="font-semibold">{{
              program[IDS.ANY_CENTRAL]
            }}</strong>
          </h2>
          <div
            v-if="program[IDS.NOM_COMPLET] !== 'aggregate_total'"
            class="mb-2 text-sm text-gray-500"
          >
            <OTText :value="`PLA_${program[IDS.ESCALA]}`" />
            <!-- ({{
              program[IDS.PERIODE]
            }}) -->
          </div>

          <div class="text-4xl">
            {{ number(program.total, 2) }}&#8239;<span class="text-2xl">%</span>
          </div>
        </div>
        <div class="mb-2 mt-4 text-main-80">
          <OTText
            :value="
              program[IDS.NOM_COMPLET] === 'aggregate_total'
                ? 'DESGLOSSAMENT_PLANS'
                : 'DESGLOSSAMENT_PLA'
            "
          />
        </div>
        <div class="grid grid-cols-4 gap-6">
          <div v-for="theme in program.themes">
            <h3 class="ot-title-4 mb-1 text-gray-500">{{ theme.theme }}</h3>
            <div class="text-2xl">
              {{ number(theme.value, 2) }}&#8239;<span class="text-lg">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <pre class="ot-code">{{ municipality }}</pre> -->
  </div>
</template>
<script setup>
import useFilters from "@/functions/useFilters";
import useLoadData from "@/functions/useLoadData";
import colors from "@/utils/colors";
import useTooltip from "@/functions/useTooltip";
import { number } from "@/utils/filters";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import * as IDS from "@/utils/ids";
import * as d3 from "d3";
import { basePath } from "@/config";
import usePlansData from "@/functions/usePlansData";

const { sdg } = useFilters();

const municipality = inject("entity");

const { t } = useI18n();

useHead({
  // the number of the indicator, its name and then the name of the city
  title: () =>
    `${sdg.value} - ${t(`SDGS.${sdg.value}.TITLE`)} - ${t(`PLANS_ESTRATEGICS`)} - ${municipality.value.municipality_name}`,
  // meta: () => [
  //   {
  //     name: "description",
  //     content: "Municipi",
  //   },
  // ],
});

const { data, loading, filteredData, processedData } = usePlansData();
</script>
