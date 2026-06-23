<template>
  <OTSelect
    :options="sdgOptions"
    v-model="model"
    :main-class="mainClass"
    :popover-class="popoverClass"
    class="h-full"
    :allow-search="false"
    :label="label"
  >
    <template #button-content="{ open, disabled, displayedName }"
      ><span
        class="flex items-center gap-2 truncate pr-4"
        :aria-live="open ? 'polite' : 'off'"
      >
        <span
          v-if="model"
          class="flex items-center justify-center rounded-full border-b border-transparent p-0"
          :class="{
            [`bg-sdg-${model}`]: true,
            [`text-gray-900`]: darkSDGs.includes(model),
            [`text-white`]: !darkSDGs.includes(model),
            [circleClass]: true,
          }"
          >{{ model }}</span
        ><span class="max-w-[calc(100vw-10rem)] truncate"
          ><OTText :value="model ? `SDGS.${model}.TITLE` : defaultText"
        /></span>
      </span>
      <ChevronDownIcon
        v-if="!disabled"
        class="h-5 w-5 flex-shrink-0"
        aria-hidden="true"
      />
    </template>

    <template #option-content="{ option, selected }">
      <div class="flex items-center justify-between leading-tight">
        <div class="relative mr-6 flex items-center gap-2">
          <span
            class="flex h-5 w-5 items-center justify-center rounded-full border-none p-0 text-xs"
            :class="{
              [`bg-sdg-${option.id}`]: true,
              [`text-gray-900`]: darkSDGs.includes(option.id),
              [`text-white`]: !darkSDGs.includes(option.id),
            }"
            >{{ option.id }}</span
          >{{ option.name }}
        </div>
        <div
          class="text-primary-500 absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <CheckIcon v-if="selected" class="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </template>
  </OTSelect>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ChevronDownIcon, CheckIcon } from "@heroicons/vue/20/solid";
import { darkSDGs } from "@/utils/helpers";

const { t } = useI18n();

const props = defineProps({
  mainClass: {
    type: String,
    default: "ot-btn bg-gray-100 border-none rounded-full pl-2.5",
  },
  popoverClass: {
    type: String,
    default: "w-full",
  },
  defaultText: {
    type: String,
    default: "NAVEGA_PER_ODS",
  },
  circleClass: {
    type: String,
    default: "h-5 w-5 text-xs",
  },
  label: {
    type: String,
    default: "",
  },
});

// array from 1 to 17
const sdgOptions = computed(() => {
  return Array.from({ length: 17 }, (_, i) => i + 1).map((i) => ({
    id: i,
    name: `${t(`SDGS.${i}.TITLE`)}`,
  }));
});

const model = defineModel();
</script>
