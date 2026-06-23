<template>
  <button
    class="ot-btn ot-btn-soft px-2 py-1"
    @click="downloadSVG"
    @mouseenter="toggleButtonTooltip"
    @mouseleave="toggleButtonTooltip(null)"
    :title="t('DOWNLOAD_IMAGE')"
  >
    <PhotoIcon class="w-4" />
  </button>

  <OTTooltip
    :info="buttonTooltip"
    class="font-regular"
    inner-class="rounded-lg border border-main-80 bg-main-80 text-white text-sm"
    arrow-class="border-main-80"
  >
    <div class="text-center text-xs">
      <OTText value="DOWNLOAD_IMAGE" />
    </div>
  </OTTooltip>
</template>

<script setup>
import { PhotoIcon, DocumentArrowDownIcon } from "@heroicons/vue/24/outline";
import useTooltip from "@/functions/useTooltip";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  svgId: {
    type: String,
    required: true,
  },
});

function downloadSVG() {
  const svgElement = document.getElementById(props.svgId);
  if (!svgElement) {
    console.warn(`SVG element with ID "${props.svgId}" not found.`);
    return;
  }

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add XML declaration if missing
  if (!source.startsWith("<?xml")) {
    source = '<?xml version="1.0" standalone="no"?>\n' + source;
  }

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "image.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const [buttonTooltip, toggleButtonTooltip] = useTooltip();
</script>
