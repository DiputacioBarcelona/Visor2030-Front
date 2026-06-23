<template>
  <div>
    <InformationCircleIcon
      ref="link"
      class="h-5 w-5"
      @mouseenter="setTooltip({ target: link, data: {} })"
      @mouseleave="onLeave"
    />
    <OTTooltip :canBeHovered="true" v-if="tooltip.show" :info="tooltip">
      <div
        @mouseenter="onTooltipEnter"
        @mouseleave="onTooltipLeave"
        class="text-negre-70 space-y-1 text-sm"
      >
        <router-link
          class="underline"
          :to="{
            name: 'metodologia',
            params: { locale: $route.params.locale },
          }"
        >
          <OTText value="INFO_TOOLTIP_GROUPINGS" />
        </router-link>
      </div>
    </OTTooltip>
  </div>
</template>

<script setup>
import { InformationCircleIcon } from "@heroicons/vue/24/outline";
import useTooltip from "@/functions/useTooltip";

const link = ref(null);
const isHoveringTooltip = ref(false);
let closeTimeout = null;

const closeTooltip = () => {
  closeTimeout = setTimeout(() => {
    if (!isHoveringTooltip.value) {
      setTooltip(null);
    }
  }, 200);
};

const onLeave = () => {
  if (!isHoveringTooltip.value) {
    closeTooltip();
  }
};

const onTooltipEnter = () => {
  isHoveringTooltip.value = true;
  clearTimeout(closeTimeout);
};

const onTooltipLeave = () => {
  isHoveringTooltip.value = false;
  closeTooltip();
};

const [tooltip, setTooltip] = useTooltip();
</script>
