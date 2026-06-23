<template>
  <div>
    <section
      v-if="['municipi'].includes(route.name)"
      class="bg-white pb-4 md:pb-4 print:pb-0"
    >
      <div class="ot-container relative">
        <header class="">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h1 class="ot-title-1 mb-0">
              {{ data?.name || "---" }}
            </h1>

            <button
              v-if="['municipi', 'municipi-indicator'].includes(route.name)"
              @click="print"
              class="ot-btn hidden gap-2 rounded-full border-none bg-gray-100 px-4 font-normal text-gray-600 md:flex print:hidden"
            >
              <ArrowDownTrayIcon class="w-4" />
              <OTText value="DESCARREGA_INFORME" />
            </button>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div
              class="flex flex-wrap items-center gap-4 gap-y-2 rounded bg-main-10 px-2 py-1 tracking-wide"
            >
              <div class="rounded text-sm font-semibold text-main-100">
                <span class="font-normal"><OTText value="COMARCA" />:</span>
                {{ data?.comarca.comarca_name }}
              </div>
              <div class="rounded text-sm font-semibold text-main-100">
                <span class="font-normal"><OTText value="POBLACIO" />:</span>
                {{ number(data?.population, 0) }}&#8239;<OTText
                  value="HABITANTS"
                />
              </div>
              <div class="rounded text-sm font-semibold text-main-100">
                <span class="font-normal"
                  ><OTText value="RENDA_FAMILIAR" />:</span
                >
                {{ number(renda?.value, 0) }}&#8239;€
              </div>
            </div>
            <button
              class="inline-flex items-center gap-1 rounded p-2 py-1 text-xs text-main-100 hover:bg-gray-100 print:text-white"
              @click="showModal = true"
            >
              <OTText value="SOURCE_CONTEXT" />
              <InformationCircleIcon class="h-5 w-5" />
            </button>
          </div>
        </header>

        <OTModal :is-open="showModal" @close="closeModal">
          <template #body>
            <h2 class="ot-title-2"><OTText value="SOURCE_CONTEXT" /></h2>
            <OTText
              value="SOURCE_CONTEXT_INFO"
              :options="{
                populationDate: data?.population_year,
                incomeDate: renda?.year,
              }"
              markdown
              md-class="prose "
            />
          </template>
        </OTModal>
      </div>
    </section>

    <RouterView />
  </div>
</template>

<script setup>
import useLoadData from "@/functions/useLoadData";
import useFilters from "@/functions/useFilters";
import { number } from "@/utils/filters";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";
import { useRoute } from "vue-router";

const route = useRoute();

const { id } = useFilters();

const municipalities = inject("municipalities");

const data = computed(() => {
  return (
    municipalities.value.find((item) => item.id === id.value) || { comarca: {} }
  );
});

const rendaFilter = computed(() => {
  return {
    "indicator.indicator_id": "1.2.2", // renda mediana
    "municipality.municipality_code": id.value,
  };
});

const { data: rendaValues } = useLoadData(
  "getValues",
  null,
  false,
  rendaFilter,
);

const renda = computed(() => {
  if (rendaValues.value) {
    return rendaValues.value.member.sort((a, b) => {
      return b.year - a.year;
    })[0];
  }
  return null;
});

provide("entity", data);

function print() {
  window.print();
}

const showModal = ref(false);

function closeModal() {
  showModal.value = false;
}
</script>
