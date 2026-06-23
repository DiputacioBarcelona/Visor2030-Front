<template>
  <button
    class="ot-btn ot-btn-soft px-2 py-1"
    @click="downloadCSV"
    @mouseenter="toggleButtonTooltip"
    @mouseleave="toggleButtonTooltip(null)"
    :title="t('DOWNLOAD_IMAGE')"
  >
    <DocumentArrowDownIcon class="w-4" />
  </button>

  <OTTooltip
    :info="buttonTooltip"
    class="font-regular"
    inner-class="rounded-lg border border-main-80 bg-main-80 text-white text-sm"
    arrow-class="border-main-80"
  >
    <div class="text-center text-xs">
      <OTText value="DOWNLOAD_DATA" />
    </div>
  </OTTooltip>
</template>

<script setup>
import useTooltip from "@/functions/useTooltip";
import { DocumentArrowDownIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { dsvFormat } from "d3";

const { t, locale } = useI18n();

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
});

const { data, filename } = toRefs(props);

function downloadCSV() {
  // format numbers according to locale
  const formattedData = data.value.map((entry) =>
    Object.fromEntries(
      Object.entries(entry).map(([key, value]) => {
        if (typeof value === "string" || !value) {
          return [key, value];
        }
        const formattedValue =
          locale.value !== "en" ? String(value).replace(".", ",") : value;
        return [key, formattedValue];
      }),
    ),
  );

  // convert data to csv string
  const separator = locale.value !== "en" ? ";" : ",";
  const csv = dsvFormat(separator).format(formattedData);

  // create blob for csv file format
  const blob = new Blob([csv], { type: "text/csv;" });

  // create an object for downloading url
  const url = window.URL.createObjectURL(blob);

  // create a hidden anchor tag to download url
  const a = document.createElement("a");

  // set download attributes and file name
  a.setAttribute("href", url);
  a.setAttribute("download", `${filename.value}.csv`);

  // download
  a.click();
}

const [buttonTooltip, toggleButtonTooltip] = useTooltip();
</script>
