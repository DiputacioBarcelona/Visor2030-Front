<template>
  <div>
    <ButtonSwitchDibarometre
      v-bind="$props"
      v-if="!showSelect"
      class="hidden md:inline-block"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
    />
    <OTSelect
      class="text-grey block"
      :class="{ 'w-52 md:hidden': !showSelect }"
      main-class="bg-grey-mig py-2 px-4 rounded-3xl font-medium text-xs text-text-normal"
      popover-class="w-full"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
      :allow-search="false"
    />
  </div>
</template>

<script setup>
import ButtonSwitchDibarometre from "./ButtonSwitchDibarometre.vue";
// import OTSelect from "./OTSelect.vue";

defineProps({
  ...ButtonSwitchDibarometre.props,
  options: {
    type: Array,
  },
  modelValue: {
    type: [String, Number],
  },
  showSelect: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped></style>
