<template>
  <div>
    <section class="-mt-4 bg-main-80 py-10 text-white md:-mt-8">
      <div class="ot-container">
        <header>
          <h1 class="ot-title-1 text-white">
            <OTText value="AVIS_LEGAL_PAGE.TITLE" />
          </h1>
        </header>
      </div>
    </section>

    <section class="py-6 md:py-16">
      <div class="ot-container">
        <OTText value="AVIS_LEGAL_PAGE.TEXT" markdown md-class="prose" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import sdgs from "@/assets/sdgs.json";

const { t } = useI18n();

useHead({
  title: () => t(`AVIS_LEGAL_PAGE.TITLE`),
});
</script>
