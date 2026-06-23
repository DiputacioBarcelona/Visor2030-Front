<template>
  <section class="page-break bg-white py-8">
    <div class="ot-container">
      <img
        :src="`${basePath}img/icons/chat-left.svg`"
        alt=""
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-6 border-dashed border-gray-500" />

      <div class="mb-2">
        <header class="mb-2 flex flex-wrap items-center justify-between gap-4">
          <h2 class="ot-title-2 mb-0" id="valoration">
            <OTText value="VALORATION" />
          </h2>
        </header>

        <div class="ot-line text-sm tracking-wide">
          <OTText value="VALORATION_SUBTITLE" />
        </div>
      </div>

      <ValorationQuestions v-if="showValoration" />

      <div v-else class="my-16">
        <OTText
          value="DIBAROMETRE_NO_DATA"
          :options="{ municipi: data?.name }"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import { basePath } from "@/config";

const { id } = useFilters();

const data = inject("entity");

const showValoration = computed(() => {
  return id.value !== "08019";
});
</script>
