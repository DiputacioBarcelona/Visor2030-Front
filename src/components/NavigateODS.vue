<template>
  <div class="flex items-center justify-between">
    <button
      class="ot-btn rounded-full border-none bg-gray-100 p-2 text-gray-400"
      :title="t('PREVIOUS_SDG')"
    >
      <ChevronLeftIcon class="h-5 w-5" @click="previousSDG" />
    </button>
    <div class="flex items-center gap-2 font-semibold text-gray-700">
      <img :src="`${basePath}img/icons/ODS${sdg}.svg`" alt="" />
      <OTText value="SDG" :options="{ sdg }" />.
      <OTText :value="`SDGS.${sdg}.TITLE`" />
    </div>
    <button
      class="ot-btn rounded-full border-none bg-gray-100 p-2 text-gray-400"
      :title="t('NEXT_SDG')"
    >
      <ChevronRightIcon class="h-5 w-5" @click="nextSDG" />
    </button>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { basePath } from "@/config";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const emit = defineEmits(["previous", "next"]);

const props = defineProps({
  sdg: {
    type: Number,
    required: true,
  },
});

// emit next
function nextSDG() {
  emit("next");
}

function previousSDG() {
  emit("previous");
}
</script>
