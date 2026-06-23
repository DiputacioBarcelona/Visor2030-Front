<template>
  <div>
    <section class="-mt-4 bg-main-80 py-10 text-white md:-mt-8">
      <div class="ot-container">
        <header>
          <h1 class="ot-title-1 text-white"><OTText value="METODOLOGIA" /></h1>
          <div class="ot-line prose text-xl text-white">
            <OTText value="METODOLOGIA_DESC" markdown />
          </div>
        </header>
      </div>
    </section>

    <section class="py-6 md:py-16">
      <div class="ot-container">
        <div class="flex flex-col items-center gap-8 md:flex-row">
          <div>
            <img
              src="/img/sdg-circle.svg"
              alt="Visor 2030"
              class="w-[64px] md:w-[164px]"
            />
          </div>
          <div>
            <h2 class="text-3xl font-semibold">
              <OTText value="METODOLOGIA_PAGE.LOCALITZACIO" />
            </h2>
            <div class="ot-line prose tracking-wide">
              <OTText value="METODOLOGIA_PAGE.LOCALITZACIO_DESC" markdown />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-6 md:py-16">
      <div class="ot-container">
        <div class="grid gap-4 md:grid-cols-2 md:gap-12">
          <div>
            <h2 class="text-3xl font-semibold">
              <OTText value="METODOLOGIA_PAGE.SELECCIO_INDICADORS" />
            </h2>
            <div class="ot-line prose tracking-wide">
              <OTText
                value="METODOLOGIA_PAGE.SELECCIO_INDICADORS_DESC"
                markdown
              />
            </div>

            <div>
              <button
                class="ot-btn rounded-full bg-white px-6 py-2 text-sm font-semibold text-main-80 hover:bg-main-80 hover:text-white"
                @click="showModal = true"
              >
                <OTText value="METODOLOGIA_PAGE.CONSULTEU_DETALLS" />
              </button>
            </div>
          </div>
          <div>
            <div class="ot-line prose text-sm tracking-wide text-main-100">
              <OTText
                value="METODOLOGIA_PAGE.SELECCIO_INDICADORS_TEXT"
                markdown
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-6 md:py-16">
      <div class="ot-container">
        <h2 class="text-3xl font-semibold">
          <OTText value="METODOLOGIA_PAGE.PONDERACIO" />
        </h2>
        <div class="ot-line prose tracking-wide">
          <OTText value="METODOLOGIA_PAGE.PONDERACIO_DESC" markdown />
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="bg-gray-100 p-4">
            <h3 class="">
              <OTText value="METODOLOGIA_PAGE.PONDERACIO_1_TITLE" />
            </h3>
            <div class="prose text-sm tracking-wide">
              <OTText value="METODOLOGIA_PAGE.PONDERACIO_1_DESC" markdown />
            </div>
          </div>

          <div class="bg-gray-100 p-4">
            <h3 class="">
              <OTText value="METODOLOGIA_PAGE.PONDERACIO_2_TITLE" />
            </h3>
            <div class="prose text-sm tracking-wide">
              <OTText value="METODOLOGIA_PAGE.PONDERACIO_2_DESC" markdown />
            </div>
          </div>

          <div class="bg-gray-100 p-4">
            <h3 class="">
              <OTText value="METODOLOGIA_PAGE.PONDERACIO_3_TITLE" />
            </h3>
            <div class="prose text-sm tracking-wide">
              <OTText value="METODOLOGIA_PAGE.PONDERACIO_3_DESC" markdown />
            </div>
          </div>

          <div class="bg-gray-100 p-4">
            <h3 class="">
              <OTText value="METODOLOGIA_PAGE.PONDERACIO_4_TITLE" />
            </h3>
            <div class="prose text-sm tracking-wide">
              <OTText value="METODOLOGIA_PAGE.PONDERACIO_4_DESC" markdown />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-6 md:py-16">
      <div class="ot-container">
        <div class="grid gap-4 md:grid-cols-2 md:gap-12">
          <div>
            <h2 class="text-3xl font-semibold">
              <OTText value="METODOLOGIA_PAGE.INDEX_SINTETIC" />
            </h2>
            <div class="ot-line prose tracking-wide">
              <OTText value="METODOLOGIA_PAGE.INDEX_SINTETIC_DESC" markdown />
            </div>
          </div>
          <div>
            <div
              class="ot-line prose bg-gray-100 p-4 text-sm tracking-wide text-main-100"
            >
              <OTText
                value="METODOLOGIA_PAGE.INDEX_SINTETIC_FORMULA"
                markdown
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-6 md:py-16">
      <div class="ot-container">
        <div class="grid items-center gap-4 md:grid-cols-2 md:gap-12">
          <div>
            <h2 class="text-3xl font-semibold">
              <OTText value="METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS" />
            </h2>
            <div class="ot-line prose tracking-wide">
              <OTText
                value="METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS_DESC"
                markdown
              />
            </div>
          </div>
          <div>
            <button
              class="ot-btn rounded-full bg-white px-6 py-2 text-sm font-semibold text-main-80 hover:bg-main-80 hover:text-white"
              @click="showTerritorialModal = true"
            >
              <OTText
                value="METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS_CONSULTA"
              />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-6 md:py-16">
      <div class="ot-container">
        <div class="grid gap-12 md:grid-cols-3">
          <div>
            <h3 class="font-semibold">
              <OTText value="METODOLOGIA_PAGE.COBERTURA_TITLE" />
            </h3>
            <div class="ot-line prose text-sm tracking-wide">
              <OTText value="METODOLOGIA_PAGE.COBERTURA_DESC" markdown />
            </div>
          </div>

          <div>
            <h3 class="font-semibold">
              <OTText value="METODOLOGIA_PAGE.ACTUALITZACIO_TITLE" />
            </h3>
            <div class="ot-line prose text-sm tracking-wide">
              <OTText value="METODOLOGIA_PAGE.ACTUALITZACIO_DESC" markdown />
            </div>
          </div>

          <div>
            <h3 class="font-semibold">
              <OTText value="METODOLOGIA_PAGE.NOTA_TITLE" />
            </h3>
            <div class="ot-line prose text-sm tracking-wide">
              <OTText value="METODOLOGIA_PAGE.NOTA_DESC" markdown />
            </div>
          </div>
        </div>
      </div>
    </section>

    <OTModal :is-open="showModal" @close="closeModal">
      <template #body>
        <!-- <h2 class="ot-title-2"><OTText value="SOURCE_CONTEXT" /></h2> -->
        <div v-if="!detail">
          <OTTable
            :columns="columns"
            :rows="tableData"
            :items-per-page="100"
            default-sort="indicator_id"
            row-class="indicator-table"
          >
            <template #indicator_id="row">
              <div class="flex items-center gap-2">
                <div
                  class="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                  :class="{
                    [`bg-sdg-${row.indicator_id.split('.')[0]}`]: true,
                  }"
                >
                  {{ row.indicator_id.split(".")[0] }}
                </div>
                <div class="w-12 rounded bg-gray-100 px-1 tabular-nums">
                  {{ row.indicator_id }}
                </div>
              </div>
            </template>

            <template #name="row">
              <button
                class="ot-btn-link hover:underline"
                @click="detail = row.indicator_id"
              >
                <OTText :value="row.name" />
              </button>
            </template>
            <!-- <template #targetName="row">
            <OTText :value="row.targetName" />
          </template> -->
          </OTTable>
        </div>
        <div v-else>
          <div class="mb-4">
            <button
              @click="detail = null"
              class="ot-btn gap-2 border-none bg-gray-200 pl-3 text-xs"
            >
              <ChevronLeftIcon class="h-5 w-5" />
              <OTText value="METODOLOGIA_PAGE.BACK_TO_LIST" />
            </button>
          </div>
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
            <!-- <div
              class="flex items-center justify-center rounded p-1 px-3 text-white"
              :class="{
                [`bg-sdg-${detail.split('.')[0]}`]: true,
              }"
            >
              {{ detail }}
            </div> -->
            <OTText :value="detailName" />
          </h2>
          <hr />

          <dl class="divide-y divide-gray-100">
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="SDG" />
              </dt>
              <dd
                class="mt-1 flex items-center gap-2 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0"
              >
                <div
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                  :class="{
                    [`bg-sdg-${detail.split('.')[0]}`]: true,
                  }"
                >
                  {{ indicator.sdg }}
                </div>
                <OTText :value="indicator.sdgName" />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="TARGET" />
              </dt>
              <dd
                class="mt-1 flex items-center gap-2 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0"
              >
                <div
                  class="flex h-6 shrink-0 items-center justify-center rounded-full px-2 text-white"
                  :class="{
                    [`bg-sdg-${detail.split('.')[0]}`]: true,
                  }"
                >
                  {{ indicator.target }}
                </div>
                <OTText :value="indicator.targetName" />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="NOM_SINTETIC" />
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <OTText :value="indicator.name" />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="NOM_COMPLET" />
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <OTText :value="indicator.indicatorDescription" />
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="SOURCE" />
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <OTText
                  :value="indicator.source"
                  markdown
                  md-class="prose text-sm"
                />
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="UNITAT_FINAL" />
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <OTText :value="indicator.unit" />
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="SENTIT" />
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <OTText :value="indicator.sentit" />
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="WEIGHT" :options="{ sdg: indicator.sdg }" />
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <OTText :value="indicator.weight" />%
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                <OTText value="DIMENSION_WEIGHT" />
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <OTText :value="indicator.dimension_weight" />%
              </dd>
            </div>
          </dl>
        </div>
      </template>
    </OTModal>
    <OTModal
      :is-open="showTerritorialModal"
      @close="showTerritorialModal = false"
    >
      <template #body>
        <div
          v-for="grouping in territorialGroupings"
          :key="grouping.id"
          class="pb-4"
        >
          <p class="font-semibold">
            <OTText
              :value="`METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS_ITEMS.${grouping.id}.title`"
            />
          </p>

          <p v-if="grouping.id === 'lit'">
            <OTText
              :value="`METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS_ITEMS.${grouping.id}.description.1`"
            />
            <span
              ><a
                href="https://territori.gencat.cat/ca/inici/index.html"
                target="_blank"
                class="underline"
                ><OTText
                  :value="`METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS_ITEMS.${grouping.id}.description.2`" /></a
            ></span>
            <span
              ><OTText
                :value="`METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS_ITEMS.${grouping.id}.description.3`"
            /></span>
          </p>
          <p v-else>
            <OTText
              :value="`METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS_ITEMS.${grouping.id}.description`"
              markdown
            />
          </p>
          <div v-if="grouping.id === 'rur'">
            <OTText :value="`METODOLOGIA_PAGE.${grouping.source.text}`"
              /><span>: <OTText :value="`METODOLOGIA_PAGE.AGRUPACIONS_TERRITORIALS_ITEMS.${grouping.id}.source`"
                /></span>
          </div>
          <div v-else-if="grouping.id === 'ind'">
            <div v-for="(text, i) in grouping.source.text" :key="i">
              <a
                :href="grouping.source?.url[i]"
                target="_blank"
                class="underline"
                ><OTText :value="`METODOLOGIA_PAGE.${text}`"
              /></a>
            </div>
          </div>
          <div v-else-if="grouping.source?.text">
            <a :href="grouping.source?.url" target="_blank" class="underline"
              ><OTText :value="`METODOLOGIA_PAGE.${grouping.source.text}`"
            /></a>
          </div>
        </div>
      </template>
    </OTModal>

    <!-- <pre class="ot-code">{{ simplified }}</pre> -->
  </div>
</template>

<script setup>
import useLoadData from "@/functions/useLoadData";
// import useTooltip from "@/functions/useTooltip";
// import colors from "@/utils/colors";
// import { number } from "@/utils/filters";
// import * as d3 from "d3";
import { useI18n } from "vue-i18n";
import sdgs from "@/assets/sdgs.json";
import { ChevronLeftIcon } from "@heroicons/vue/24/outline";

const { t } = useI18n();

useHead({
  title: () => t(`METODOLOGIA`),
});

const showModal = ref(false);

const showTerritorialModal = ref(false);

function closeModal() {
  showModal.value = false;
}

const simplified = computed(() => {
  const result = {};

  for (const [key, value] of Object.entries(sdgs.SDGS)) {
    const targets = {};
    for (const [key2, value2] of Object.entries(value.TARGETS)) {
      targets[key2] = {
        DESCRIPTION: value2.DESCRIPTION,
      };
    }
    result[key] = {
      TARGETS: targets,
    };
  }

  return { SDGS: result };
});

const targets = inject("targets");

const detail = ref(null);

const detailName = computed(() => {
  if (!detail.value) return null;
  const [sdg, target, indicatorId] = detail.value.split(".");
  return `SDGS.${sdg}.TARGETS.${target}.INDICATORS.${indicatorId}.TITLE`;
});

const columns = computed(() => {
  return [
    {
      id: "indicator_id",
      name: "ID",
      sort: sorting,
    },
    {
      id: "name",
      name: t("INDICATOR"),
    },
    // {
    //   id: "targetName",
    //   name: t("TARGET"),
    // },
  ];
});

const tableData = computed(() => {
  // targets.value is a list of objects with indicators prop.
  // flatten the list of indicators and sort them by indicator_id
  if (!targets.value) return [];
  const indicators = targets.value
    .map((target) => target.indicators)
    .flat()
    .map((indicator) => {
      const [sdg, target, indicatorId] = indicator.indicator_id.split(".");
      return {
        ...indicator,
        name: `SDGS.${sdg}.TARGETS.${target}.INDICATORS.${indicatorId}.TITLE`,
        targetName: `SDGS.${sdg}.TARGETS.${target}.DESCRIPTION`,
        sdgName: `SDGS.${sdg}.TITLE`,
      };
    })
    .sort(sorting);

  return indicators;
});

const indicator = computed(() => {
  if (!detail.value) return null;
  const [sdg, target, indicatorId] = detail.value.split(".");

  const info = tableData.value.find(
    (item) => item.indicator_id === detail.value,
  );
  return {
    ...info,
    sdgName: `SDGS.${sdg}.TITLE`,
    targetName: `SDGS.${sdg}.TARGETS.${target}.DESCRIPTION`,
    sdg: sdg,
    target: `${sdg}.${target}`,
    indicatorDescription: `SDGS.${sdg}.TARGETS.${target}.INDICATORS.${indicatorId}.DESCRIPTION`,
    source: `SDGS.${sdg}.TARGETS.${target}.INDICATORS.${indicatorId}.SOURCE`,
    unit: `SDGS.${sdg}.TARGETS.${target}.INDICATORS.${indicatorId}.UNIT`,
    sentit: info.sign ? "SENTIT_POSITIU" : "SENTIT_NEGATIU",
  };
});

const territorialGroupings = [
  {
    id: "amb",
    source: {
      text: null,
      url: null,
    },
  },
  {
    id: "rmb",
    source: {
      text: "AMBITS_PLANEJAMENT",
      url: "https://www.idescat.cat/codis/?id=50&n=28",
    },
  },
  {
    id: "com",
    source: {
      text: "AMBITS_PLANEJAMENT",
      url: "https://www.idescat.cat/codis/?id=50&n=28",
    },
  },
  {
    id: "pen",
    source: {
      text: "AMBITS_PLANEJAMENT",
      url: "https://www.idescat.cat/codis/?id=50&n=28",
    },
  },
  {
    id: "val",
    source: {
      text: "FONT_DADES",
      url: "https://www.idescat.cat/codis/?id=50&n=10",
    },
  },
  {
    id: "ind",
    source: {
      text: ["REGIM_GENERAL", "AUTONOMS"],
      url: [
        "https://www.idescat.cat/pub/?id=afic&n=14983",
        "https://www.idescat.cat/pub/?id=afic&n=14995",
      ],
    },
  },
  {
    id: "munt",
    source: {
      text: "FONT_DADES",
      url: "https://analisi.transparenciacatalunya.cat/Urbanisme-infraestructures/Indicadors-de-dades-b-siques-territorials-segons-e/375x-2wzk/about_data",
    },
  },
  {
    id: "lit",
    source: {
      text: "FONT_DADES",
      url: "https://analisi.transparenciacatalunya.cat/Urbanisme-infraestructures/Indicadors-de-dades-b-siques-territorials-segons-e/375x-2wzk/about_data",
    },
  },
  {
    id: "int",
    source: {
      text: "FONT_DADES",
      url: "https://analisi.transparenciacatalunya.cat/Urbanisme-infraestructures/Indicadors-de-dades-b-siques-territorials-segons-e/375x-2wzk/about_data",
    },
  },
  {
    id: "rur",
    source: {
      text: "FONT_DADES",
      url: null,
    },
  },
  {
    id: "micro",
    source: {
      text: "FONT_DADES",
      url: "https://www.diba.cat/ca/web/municipis",
    },
  },
  {
    id: "macro",
    source: {
      text: "FONT_DADES",
      url: "https://www.diba.cat/ca/web/municipis",
    },
  },
];

function sorting(a, b) {
  // indicator_id is like 1.2.3. split and compare each part as a number
  const aId = a.indicator_id.split(".").map((d) => Number(d));
  const bId = b.indicator_id.split(".").map((d) => Number(d));
  return aId[0] - bId[0] || aId[1] - bId[1] || aId[2] - bId[2];
}
</script>

<style>
.ot-markdown.prose ul {
  margin-top: 0;
  padding-inline-start: 1rem;
}
</style>
