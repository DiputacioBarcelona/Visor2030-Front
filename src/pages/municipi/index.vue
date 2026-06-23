<template>
  <div>
    <div class="mb-16">
      <div class="top-[56px] z-20 bg-white py-2 md:sticky print:hidden">
        <div class="ot-container">
          <div class="mb-1 text-xs text-main-100">
            <OTText value="CONSULTEU_CAPES_INFO" />
          </div>
          <div class="flex flex-wrap gap-2">
            <RouterLink
              to="#points"
              class="ot-btn gap-2 border-none bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600 md:px-6 md:py-2 md:text-sm"
            >
              <OTText value="POINTS_BY_SDG" />
            </RouterLink>

            <RouterLink
              to="#budget"
              class="ot-btn gap-2 border-none bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600 md:px-6 md:py-2 md:text-sm"
            >
              <OTText value="BUDGET" />
            </RouterLink>

            <RouterLink
              to="#plans"
              class="ot-btn gap-2 border-none bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600 md:px-6 md:py-2 md:text-sm"
            >
              <OTText value="PLANS_ESTRATEGICS" />
            </RouterLink>

            <RouterLink
              to="#valoration"
              class="ot-btn gap-2 border-none bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600 md:px-6 md:py-2 md:text-sm"
              @click="scrollToValoration"
            >
              <OTText value="VALORATION_TITLE" />
            </RouterLink>
          </div>
        </div>
      </div>

      <RoseChartSection />
      <BudgetSection />
      <PlansSection />
      <ValorationSection />
    </div>

    <RouterView
      v-slot="{ Component }"
      class="relative z-10 mt-[500px] md:mt-[660px]"
    >
      <!-- mt-[365px] -->
      <transition name="slideUp">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<script setup>
const data = inject("entity");

useHead({
  title: () => `${data.value?.name}`,
});

function scrollToValoration() {
  if (window.innerWidth >= 768) return;

  const el = document.getElementById("valoration");
  if (!el) return;

  const offset = 150;
  const scrollToEl = () => {
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: "smooth",
    });
  };

  let timeout;
  const observer = new ResizeObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      scrollToEl();
      observer.disconnect();
    }, 300);
  });

  ["points", "budget", "plans"].forEach((id) => {
    const section = document.getElementById(id)?.closest("section");
    if (section) observer.observe(section);
  });

  setTimeout(() => observer.disconnect(), 5000);
}
</script>
