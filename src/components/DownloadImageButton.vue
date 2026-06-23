<template>
  <button
    @click="downloadImage"
    class="ot-btn ot-btn-soft px-2 py-1"
    @mouseenter="toggleButtonTooltip"
    @mouseleave="toggleButtonTooltip(null)"
    :title="t('DOWNLOAD_IMAGE')"
  >
    <PhotoIcon v-if="!loading" class="w-4" />
    <div v-if="loading">
      <div
        class="h-4 w-4 animate-spin rounded-full border-2 border-r-transparent hover:border-r-transparent"
        :class="[buttonTooltip.show ? 'border-white' : 'border-gray-900']"
      >
        <span class="sr-only">Loading...</span>
      </div>
    </div>
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
import { ref, toRefs } from "vue";
import { snapdom } from "@zumer/snapdom";
import { PhotoIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import useTooltip from "@/functions/useTooltip";

const [buttonTooltip, toggleButtonTooltip] = useTooltip();

const { t } = useI18n();

const props = defineProps({
  elementId: {
    type: String,
    default: "image-wrapper",
  },
  filename: {
    type: String,
    default: "capture",
  },
  btnClass: {
    type: String,
    default:
      "w-10 h-10 text-blue-700 border border-blue-400 bg-blue-50 rounded-lg",
  },
  title: {
    type: String,
    default: "Download image",
  },
});

const { elementId, filename } = toRefs(props);

const loading = ref(false);

const downloadImage = async () => {
  loading.value = true;

  const el = elementId.value ? document.getElementById(elementId.value) : null;

  if (el) {
    requestAnimationFrame(() => {
      setTimeout(async () => {
        await snapdom.download(el, {
          format: "png",
          filename: filename.value,
          embedFonts: true,
          backgroundColor: "#fff",
          // exclude elements with class image-hidden
          filter: (node) => !node.classList.contains("image-hidden"),
          //   compress: true,
        });

        loading.value = false;
      }, 0);
    });
  } else {
    console.warn("No element found by", elementId.value);
  }
};
</script>

<style scoped></style>
