<template>
  <div class="w-full border-b bg-white py-6">
    <Disclosure v-slot="{ open }" :default-open="defaultOpen">
      <DisclosureButton
        class="flex w-full items-center justify-between gap-x-2 rounded-lg py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-opacity-75"
        :class="{ [btnClass]: true }"
      >
        <div class="flex items-center gap-x-2">
          <img :src="`${basePath}img/icons/question.svg`" alt="" />
          <span> {{ title }} </span>
        </div>
        <MinusIcon
          v-if="open"
          class="h-4 w-4 flex-shrink-0 text-primary transition-transform"
        />
        <PlusIcon
          v-else
          class="h-4 w-4 flex-shrink-0 text-primary transition-transform"
        />
      </DisclosureButton>

      <!-- <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      > -->
      <DisclosurePanel
        static
        :class="{ [panelClass]: true, hidden: !open }"
        class="print:block"
      >
        <slot></slot>
      </DisclosurePanel>
      <!-- </transition> -->
    </Disclosure>
  </div>
</template>

<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { MinusIcon, PlusIcon } from "@heroicons/vue/24/outline";
import { basePath } from "@/config";

defineProps({
  title: {
    type: String,
    default: "",
  },
  btnClass: {
    type: String,
    default: "bg-white",
  },
  panelClass: {
    type: String,
    default: "pt-6 pb-2",
  },
  defaultOpen: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped></style>
