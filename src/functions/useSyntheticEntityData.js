import useLoadData from "./useLoadData";
import colors from "@/utils/colors";

export default function useSyntheticEntityData({ endpoint, params }) {
  const { data, loading, error } = useLoadData(endpoint, null, false, params);

  const filteredSynthData = computed(() => {
    const final = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
      13: 0,
      14: 0,
      15: 0,
      16: 0,
      17: 0,
      pau: 0,
      persones: 0,
      planeta: 0,
      prosperitat: 0,
    };
  
    if (!data.value) return final;
  
    data.value.forEach((item) => {
      if (item.sdg) {
        final[item.sdg] = item.value;
      } else {
        final[item.dimension] = item.value;
      }
    });
  
    return final;
  });

  const roseChartData = computed(() => {
    // array with 17 positions
    return Array.from({ length: 17 }, (_, i) => {
      const id = i + 1;
      return {
        id: id,
        name: `ODS ${id}`,
        value: filteredSynthData.value[id] || 0,
        color: colors.sdg[id],
      };
    });
  });

  const globalIndex = computed(() => {
    // take pau, persones, planeta, prosperitat from the filteredSynthData. some might be undefined.
    // sum the values that are not undefined and divide by the amount of values that are not undefined
    const values = ["pau", "persones", "planeta", "prosperitat"];
    const sum = values.reduce((acc, item) => {
      if (filteredSynthData.value[item] !== undefined) {
        return acc + filteredSynthData.value[item];
      }
      return acc;
    }, 0);
  
    const count = values.reduce((acc, item) => {
      if (filteredSynthData.value[item] !== undefined) {
        return acc + 1;
      }
      return acc;
    }, 0);
  
    // console.log(sum, count);
  
    return sum / count;
  });

  return {
    synthData: data,
    loadingSynthData: loading,
    filteredSynthData,
    roseChartData,
    globalIndex,
  };
}
