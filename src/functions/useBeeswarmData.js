import calculations from "@/utils/indicators";

export default function useBeeswarmData(rawData, normalize = false) {
  const beeswarmData = computed(() => {
    const data = rawData.value.map((item) => ({
      id: item.municipality?.municipality_code || item.municipality_code,
      name: item.municipality?.municipality_name || item.municipality_name,
      value:
        calculations[
          item.indicator?.indicator_id || item.indicator_id
        ].calculation(item),
      municipality_code_6:
        item.municipality?.municipality_code_6 || item.municipality_code_6,
      meta: item,
    }));

    if (!normalize) {
      return data;
    }

    // normalize the values to be between 0 and 100
    const values = data.map((item) => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return data.map((item) => ({
      ...item,
      value: ((item.value - min) / (max - min)) * 100,
    }));
  });

  return beeswarmData;
}
