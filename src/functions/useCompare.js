import { computed, ref, unref } from "vue";
import { useRoute } from "vue-router";
import comarcas from "@/utils/dibarometre/comarcas";
import { trams } from "@/utils/dibarometre/trams";
import * as IDS from "@/utils/dibarometre/ids";

const allCompareOptions = {
  previous: "Edició 20-22",
  provincia: "Província de Barcelona",
  comarca: "Comarca",
  tram: "Tram de població",
};

export default function useCompare(options = {}) {
  const {
    tramId = ref(null),
    comarcaId = ref(null),
    compareId = ref("provincia"),
    element = ref("municipality"),
    smallMun = ref(false),
    previousYear = ref(null),
    showPreviousSurvey = ref(true),
    isSpecific = ref(false),
  } = options;

  const tram = computed(() => {
    return trams.find((tram) => tram.id === tramId.value);
  });

  const comarcaName = computed(() => comarcas[comarcaId.value]);

  const compareName = computed(() => {
    return allCompareOptions[compareId.value] || "";
  });

  const compareLabelEnd = computed(() => {
    switch (compareId.value) {
      case "previous":
        return `de l'edició 20-22`;
      case "provincia":
        return `de la província`;
      case "comarca":
        return `de la comarca`;
      case "tram":
        return `del tram de població`;
      default:
        return "";
    }
  });

  const compareLegendLabel = computed(() => {
    return (
      "La línea de punts vertical indica la mitjana " + compareLabelEnd.value
    );
  });

  const compareMarkLabel = computed(() => {
    return "mitjana " + compareLabelEnd.value;
  });

  const compareOptions = computed(() => {
    const options = [];

    if (element.value !== "province" && !isSpecific.value) {
      options.push({ id: "provincia", name: allCompareOptions["provincia"] });
    }

    if (
      element.value === "municipality" &&
      !smallMun.value &&
      !isSpecific.value
    ) {
      options.push(
        { id: "comarca", name: comarcaName.value },
        { id: "tram", name: tram.value?.label, label: tram.value?.name },
      );
    }

    if (previousYear.value && showPreviousSurvey.value) {
      options.unshift({
        id: "previous",
        name: allCompareOptions["previous"],
      });
    }

    return options.length ? options : null;
  });

  return {
    compareName,
    compareLegendLabel,
    compareOptions,
    compareMarkLabel,
  };
}
