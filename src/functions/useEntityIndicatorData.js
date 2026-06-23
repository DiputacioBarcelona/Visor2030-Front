import useLoadData from "./useLoadData";
import useFilters from "./useFilters";
import calculations from "@/utils/indicators";
import useBeeswarmData from "@/functions/useBeeswarmData";
import * as d3 from "d3";
import colors from "@/utils/colors";
import { useI18n } from "vue-i18n";
import * as IDS from "@/utils/ids";

export default function useEntityIndicatorData({
  primaryEndpoint, // 'getValues' | 'getComarcaValues' | 'getAggregationValues'
  secondaryEndpoints, // array: [{ endpoint, labelKey, useFilter? }]
  // e.g. for municipality:
  // [
  //   { endpoint: 'getComarcaValues', labelKey: 'COMARCA', useFilter: true },
  //   { endpoint: 'getProvinceValues', labelKey: 'PROVINCE' },
  // ]
  // for comarca:
  // [
  //   { endpoint: 'getProvinceValues', labelKey: 'PROVINCE' },
  // ]
  distributionEndpoint, // endpoint for beeswarm: 'getValues' | 'getComarcaValues'
  mapEndpoint, // endpoint for map municipalities: 'getValues' (filtered by comarca)
  mapFilter, // computed ref with the filter for the map endpoint — caller-provided
  entityRef, // the injected entity (municipality/comarca/aggregation computed ref)
}) {
  const { fullIndicatorId, subindicator, sdg, pieces, id } = useFilters();
  const { t } = useI18n();

  // Load primary endpoint values
  const {
    data: valuesData,
    loading,
    error,
  } = useLoadData(primaryEndpoint, { member: [] }, false);

  const formattedData = computed(() =>
    formatData(valuesData.value?.member || [], {
      fullIndicatorId: fullIndicatorId.value,
      subindicator: subindicator.value,
    }),
  );

  const lastData = computed(() => getLast(formattedData.value));

  const previousData = computed(() => {
    return formattedData.value[formattedData.value.length - 2] || {};
  });

  // Load secondary endpoint values
  const comarcaFilter = computed(() => {
    return {
      "indicator.indicator_id": fullIndicatorId.value,
      "comarca.comarca_code": entityRef.value?.comarca?.comarca_code,
    };
  });

  const filtersMap = {
    [IDS.COMARCA]: comarcaFilter,
  };

  const secondaryRaw = secondaryEndpoints.map((config) => {
    const filter = config.useFilter ? filtersMap[config.labelKey] : undefined;

    const { data, loading } = useLoadData(
      config.endpoint,
      { member: [] },
      false,
      filter,
    );

    return {
      config,
      data,
      loading,
    };
  });

  const secondarySeriesData = computed(() =>
    secondaryRaw.map(({ config, data, loading }) => {
      const formattedData = formatData(data.value?.member || [], {
        fullIndicatorId: fullIndicatorId.value,
        subindicator: subindicator.value,
      });

      return {
        labelKey: config.labelKey,
        formattedData,
        lastData: getLast(formattedData),
        loading: loading.value,
      };
    }),
  );

  // line chart
  const formatter = computed(() => {
    return calculations[fullIndicatorId.value] || {};
  });

  const calculator = computed(() => {
    return formatter.value.calculation || ((d) => d.value);
  });

  const secondaryChartData = computed(() =>
    secondarySeriesData.value.map((series) =>
      series.formattedData.map((v) => ({
        name: v.year,
        value: calculator.value(v),
        meta: v,
      })),
    ),
  );

  const muniData = computed(() =>
    formattedData.value.map((v) => ({
      name: v.year,
      value: calculator.value(v),
      meta: v,
    })),
  );

  const lineChartData = computed(() => {
    if (!formattedData.value.length) return [[{ name: "2023", value: 0 }]];
    const base = [muniData.value];

    const validSecondary = secondaryChartData.value.filter(
      (series) => series.length > 0,
    );

    return [...base, ...validSecondary];
  });

  const dashPatterns = {
    MUNICIPALITY: "1",
    [IDS.PROVINCE]: "4,5",
    [IDS.COMARCA]: "1,3",
  };

  const dashArray = computed(() => {
    const base = [dashPatterns.MUNICIPALITY];

    const secondary = secondarySeriesData.value
      .filter((s) => s.formattedData.length > 0)
      .map((s) => dashPatterns[s.labelKey] || "2,2");

    return [...base, ...secondary];
  });

  const dataAvailable = computed(() => {
    return formattedData.value.length > 0;
  });

  // line chart download data
  const hasSubindicators = computed(() => {
    return formatter.value.subindicators?.length > 0;
  });

  const formattedSubindicator = computed(() => {
    return subindicator.value || "0";
  });

  const prefixMap = {
    MUNICIPALITY: "mun",
    [IDS.COMARCA]: "com",
    [IDS.PROVINCE]: "prov",
  };

  const lineChartDownloadData = computed(() => {
    const finalData = new Map();
    const unitNum = hasSubindicators.value
      ? t(
          `SDGS.${sdg.value}.TARGETS.${pieces.value.target}.INDICATORS.${pieces.value.indicator}.SUBINDICATORS.${formattedSubindicator.value}.VALUES.1.UNIT`,
        )
      : t(
          `SDGS.${sdg.value}.TARGETS.${pieces.value.target}.INDICATORS.${pieces.value.indicator}.VALUES.1.UNIT`,
        );
    const unitDen = hasSubindicators.value
      ? t(
          `SDGS.${sdg.value}.TARGETS.${pieces.value.target}.INDICATORS.${pieces.value.indicator}.SUBINDICATORS.${formattedSubindicator.value}.VALUES.2.UNIT`,
        )
      : t(
          `SDGS.${sdg.value}.TARGETS.${pieces.value.target}.INDICATORS.${pieces.value.indicator}.VALUES.2.UNIT`,
        );
    const unitFinal = hasSubindicators.value
      ? t(
          `SDGS.${sdg.value}.TARGETS.${pieces.value.target}.INDICATORS.${pieces.value.indicator}.UNIT`,
        )
      : t(
          `SDGS.${sdg.value}.TARGETS.${pieces.value.target}.INDICATORS.${pieces.value.indicator}.UNIT`,
        );

    formattedData.value.forEach((item) => {
      finalData.set(item.year, {
        year: item.year,
        municipality_code: id.value,
        municipality_name: entityRef.value.name,
        mun_numerator_value: item.value,
        mun_denominator_value: item.value2,
        mun_final_value: calculator.value(item),
      });
    });

    secondarySeriesData.value.forEach((series) => {
      const prefix =
        prefixMap[series.labelKey] || series.labelKey.toLowerCase();

      if (!series.formattedData.length) return;

      series.formattedData.forEach((item) => {
        if (finalData.has(item.year)) {
          const yearData = finalData.get(item.year);
          yearData[`${prefix}_numerator_value`] = item.value;
          yearData[`${prefix}_denominator_value`] = item.value2;
          yearData[`${prefix}_final_value`] = calculator.value(item);

          // csv metadata
          if (series.labelKey === IDS.COMARCA) {
            yearData.comarca_code =
              entityRef.value?.comarca?.comarca_code?.padStart(2, "0") || "00";
            yearData.comarca_name = entityRef.value?.comarca?.comarca_name;
          }

          if (series.labelKey === IDS.PROVINCE) {
            yearData.province_code = 8;
            yearData.province_name = "Barcelona";
          }
        } else {
          const base = {
            year: item.year,
            [`${prefix}_numerator_value`]: item.value,
            [`${prefix}_denominator_value`]: item.value2,
            [`${prefix}_final_value`]: calculator.value(item),
          };

          if (series.labelKey === IDS.COMARCA) {
            base.comarca_code =
              entityRef.value?.comarca?.comarca_code?.padStart(2, "0") || "00";
            base.comarca_name = entityRef.value?.comarca?.comarca_name;
          }

          if (series.labelKey === IDS.PROVINCE) {
            base.province_code = 8;
            base.province_name = "Barcelona";
          }

          finalData.set(item.year, base);
        }
      });
    });

    const arrayData = Array.from(finalData.values()).sort(
      (a, b) => b.year - a.year,
    );
    arrayData.forEach((year) => {
      year.numerator_unit = unitNum;
      year.denominator_unit = unitDen;
      year.final_unit = unitFinal;
    });

    return arrayData;
  });

  // beeswarm — watchers disabled; fired explicitly once primaryEndpoint resolves
  const indicatorFilter = computed(() => ({
    "indicator.indicator_id": fullIndicatorId.value,
    year: lastData.value?.year ?? null,
  }));

  const {
    data: indicatorData,
    loading: loadingBeeswarm,
    loadData: loadBeeswarm,
  } = useLoadData(distributionEndpoint, { member: [] }, false, indicatorFilter, false, false);

  const filteredIndicatorData = computed(() => {
    return indicatorData.value.member.filter(
      filterBySubindicator(subindicator.value),
    );
  });

  const beeswarmData = useBeeswarmData(filteredIndicatorData);

  // map — watchers disabled; fired explicitly once primaryEndpoint resolves
  const finalMapFilter = computed(() => ({
    ...mapFilter.value,
    year: lastData.value?.year ?? null,
  }));

  const {
    data: comarcaMunicipalityValuesData,
    loading: loadingComarques,
    loadData: loadMap,
  } = useLoadData(mapEndpoint, { member: [] }, false, finalMapFilter, false, false);

  // Fire beeswarm + map only after the primary endpoint has resolved with a valid year.
  // immediate:true handles the initial load; subsequent fires handle indicator changes.
  watch(lastData, (val) => {
    if (val?.year) {
      loadBeeswarm();
      loadMap();
    }
  }, { immediate: true });

  const formattedMunicipalityComarcaData = computed(() => {
    const filteredData = comarcaMunicipalityValuesData.value.member
      .filter(yearFilter(fullIndicatorId.value))
      .filter(filterBySubindicator(subindicator.value))
      .map((v) => {
        return {
          value: v.value,
          value2: v.value2,
          year: v.year,
          municipality_code: v.municipality.municipality_code,
          municipality_code_6: v.municipality.municipality_code_6,
          municipality_name: v.municipality.municipality_name,
          // unit: v.indicator.unit,
        };
      });

    return sortByYear(filteredData, "descending");
  });

  const mapData = computed(() => {
    // from formattedComarcaData only grab the last year per municipality
    const lastYearData = formattedMunicipalityComarcaData.value.reduce(
      (acc, cur) => {
        if (
          !acc[cur.municipality_code_6] ||
          acc[cur.municipality_code_6].year < cur.year
        ) {
          acc[cur.municipality_code_6] = {};
          acc[cur.municipality_code_6].value = calculator.value(cur);
          acc[cur.municipality_code_6].meta = cur;
          acc[cur.municipality_code_6].name = cur.municipality_name;
        }
        return acc;
      },
      {},
    );

    return lastYearData;
  });

  const extent = computed(() => {
    return d3.extent(Object.values(mapData.value), (d) => d.value) || [0, 0];
  });

  const colorScale = computed(() => {
    // a sequential color scale from colors.map[sdg.value].min to colors.map[sdg.value].max
    const interpolator = d3.interpolateRgb(
      colors.map[sdg.value].min,
      colors.map[sdg.value].max,
    );
    return d3.scaleSequential(extent.value, interpolator);
  });

  return {
    formattedData,
    loading,
    error,
    lastData,
    previousData,
    secondarySeriesData,
    lineChartData,
    dashArray,
    dataAvailable,
    lineChartDownloadData,
    beeswarmData,
    loadingBeeswarm,
    mapData,
    loadingComarques,
    extent,
    colorScale,
  };
}

function yearFilter(fullIndicatorId) {
  return (row) => {
    // if indicator is 12.1.1 show data only from 2016 onwards
    if (fullIndicatorId === "12.1.1") {
      return row.year >= 2016;
    }
    // otherwise show all data
    return true;
  };
}

function filterBySubindicator(subindicator) {
  return (row) => {
    // default is null
    if (!subindicator) return !row.subindicator;
    // otherwise it's a number
    return row.subindicator?.toString() === subindicator;
  };
}

function sortByYear(data, direction = "ascending") {
  if (direction === "descending") {
    return data.sort((a, b) => b.year - a.year);
  }
  return data.sort((a, b) => a.year - b.year);
}

function formatData(data, { fullIndicatorId, subindicator }) {
  const filteredData = data
    .filter(yearFilter(fullIndicatorId))
    .filter(filterBySubindicator(subindicator))
    .map((v) => {
      return {
        value: v.value,
        value2: v.value2,
        year: v.year,
        // unit: v.indicator.unit,
      };
    });

  return sortByYear(filteredData);
}

function getLast(data) {
  return data[data.length - 1] || {};
}
