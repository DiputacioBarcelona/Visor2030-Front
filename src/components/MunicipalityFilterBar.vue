<template>
  <div class="grid items-baseline gap-4 self-end sm:grid-cols-5 md:col-start-2">
    <div class="col-span-4 justify-self-end"><InformationTooltip /></div>
  </div>

  <div
    class="grid items-baseline gap-4 self-center sm:grid-cols-5 md:col-start-2"
  >
    <div class="flex-grow">
      <div class="mx-3 mb-1 flex items-center justify-between gap-2 text-xs">
        <label for="comarca"><OTText value="COMARCA" /></label>
        <button v-if="comarca" @click="comarca = undefined">
          <XMarkIcon class="w-3" />
        </button>
      </div>
      <OTSelect
        :options="filteredComarcaOptions"
        v-model="comarca"
        main-class="ot-btn rounded-full bg-gray-100 border-none "
        popover-class="w-[200px]"
        :allow-search="true"
        :default-option-name="t('TOTES')"
        label="comarca"
        :placeholder="t('CERCA')"
      />
    </div>

    <div class="flex-grow">
      <div class="mx-3 mb-1 flex items-center justify-between gap-2 text-xs">
        <label for="tram"><OTText value="TRAM" /></label>
        <button v-if="tram" @click="tram = undefined">
          <XMarkIcon class="w-3" />
        </button>
      </div>
      <OTSelect
        :options="filteredTramOptions"
        v-model="tram"
        main-class="ot-btn rounded-full bg-gray-100 border-none"
        popover-class="w-[300px]"
        :allow-search="false"
        :default-option-name="t('TOTS')"
        label="tram"
        :placeholder="t('CERCA')"
      />
    </div>

    <div class="flex-grow">
      <div class="mx-3 mb-1 flex items-center justify-between gap-2 text-xs">
        <label for="municipi"><OTText value="MUNICIPI" /></label>
        <button v-if="municipi.length" @click="municipi = []">
          <XMarkIcon class="w-3" />
        </button>
      </div>
      <OTSelect
        :options="filteredMunicipalityOptions"
        v-model="municipi"
        main-class="ot-btn rounded-full bg-gray-100 border-none"
        popover-class="w-[200px]"
        :allow-search="true"
        :default-option-name="t('TOTS')"
        label="municipi"
        right
        options-text="municipis"
        :placeholder="t('CERCA')"
      />
    </div>

    <div class="flex-grow">
      <div class="mx-3 mb-1 flex items-center justify-between gap-2 text-xs">
        <label for="other"><OTText value="OTHER_GROUPINGS" /></label>
        <button v-if="gr.length" @click="gr = []">
          <XMarkIcon class="w-3" />
        </button>
      </div>
      <OTSelect
        :options="filteredOtherGroupingOptions"
        v-model="gr"
        main-class="ot-btn rounded-full bg-gray-100 border-none "
        popover-class="w-[275px]"
        :allow-search="false"
        :default-option-name="t('TOTES')"
        label="other"
        :placeholder="t('CERCA')"
        :options-text="t('OPTIONS')"
        :leaf-only="true"
        popover-height="max-h-[310px]"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import useFilters from "@/functions/useFilters";
import useFilterOptions from "@/functions/useFilterOptions";

const { t } = useI18n();

const { comarca, tram, municipi, gr } = useFilters();

const {
  filteredMunicipalityOptions,
  filteredComarcaOptions,
  filteredTramOptions,
  filteredOtherGroupingOptions,
} = useFilterOptions();
</script>
