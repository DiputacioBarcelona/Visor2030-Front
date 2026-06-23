import useLoadData from "@/functions/useLoadData";
import useFilters from "@/functions/useFilters";
import { useI18n } from "vue-i18n";
import colors from "@/utils/colors";
import * as d3 from "d3";

export default function useBudgetData(
  filterBySdg = false,
  filterByYear = true
) {
  const { id, year, sdg, filterSDG } = useFilters();

  const { t } = useI18n();

  const muniFilter = computed(() => {
    const filter = {
      "municipality.municipality_code": id.value,
    };

    if (filterByYear) {
      filter["year"] = year.value;
    }

    return filter;
  });

  const { data: budgetData, loading: loadingBudget } = useLoadData(
    "getBudgets",
    { member: [] },
    false,
    muniFilter
  );

  const dataByYears = computed(() => {
    return d3.group(budgetData.value.member, (d) => d.year);
  });

  const filteredByYear = computed(() => {
    return dataByYears.value.get(+year.value) || [];
  });

  const { data: weightData, loading: loadingWeight } =
    useLoadData("getWeights");

  const tableData = computed(() => {
    return (
      filteredByYear.value
        .map((e) => ({ ...e, id: e.program }))
        // only those with 3 digits in the id
        .filter((e) => e.id.length === 3)
        .filter((e) => {
          if (filterSDG.value) {
            return indexedWeightData.value[e.id]?.sdgs[0]?.values[
              filterSDG.value
            ];
          }
          return true;
        })
        .map((e) => {
          if (filterSDG.value) {
            // value will be only that one for the sdg
            const percent =
              indexedWeightData.value[e.id]?.sdgs[0]?.values[filterSDG.value]
                ?.value;

            e.value = (e.value * percent) / 100;
          }
          return e;
        })
        .sort((a, b) => {
          // compare program alphabetically
          if (a.program < b.program) {
            return -1;
          }
        })
    );
  });

  const indexedProgramDataByYear = computed(() => {
    const result = new Map();

    // create a map from dataByYears map
    dataByYears.value.forEach((value, key) => {
      const indexed = {};

      for (const item of value) {
        indexed[item.program] = item;
      }

      result.set(key, indexed);
    });

    return result;
  });

  const indexedProgramData = computed(() => {
    return indexedProgramDataByYear.value.get(+year.value) || {};
  });

  const filteredWeightData = computed(() => {
    if (filterBySdg) {
      // create an object with keys 1 to 17
      const weights = {};
      // every key contains an array with filtered objects where fields ODS_1 or ODS_2_1 or ODS_2_2 or ODS_2_3 or ODS_2_4 start with the key followed by a dot (it, 16.4 belongs in sdg 16)
      for (let i = 1; i <= 17; i++) {
        weights[i] = weightData.value.filter(
          (d) =>
            d["ODS_1"].startsWith(i + ".") ||
            d["ODS_2_1"].startsWith(i + ".") ||
            d["ODS_2_2"].startsWith(i + ".") ||
            d["ODS_2_3"].startsWith(i + ".") ||
            d["ODS_2_4"].startsWith(i + ".")
        );
      }

      return weights[sdg.value] || [];
    }

    return weightData.value;
  });

  const indexedWeightData = computed(() => {
    const indexed = {};

    for (const item of filteredWeightData.value) {
      // look at the props "ODS_1": "16.7",
      // "ODS_2_1"
      // "ODS_2_2"
      // "ODS_2_3"
      // "ODS_2_4"

      const ods = {};
      for (const key in item) {
        if (key.startsWith(`ODS_`)) {
          const target = item[key];
          const sdg = target.split(".")[0];

          if (sdg) {
            if (!ods[sdg])
              ods[sdg] = { id: sdg, name: t(`SDGS.${sdg}.TITLE`), value: 0 };
            ods[sdg].value += +item[`Pes_${key}`] * 100;
          }
        }
      }
      indexed[item.Grup] = {
        ...item,
        // prepared for stacked bar chart format
        sdgs: [
          { id: item.Grup, name: t(`PROGRAMS.${item.Grup}`), values: ods },
        ],
      };
    }

    return indexed;
  });

  const processedWeightDataByYear = computed(() => {
    const result = new Map();

    indexedProgramDataByYear.value.forEach((indexedProgramData, key) => {
      const groups = {};

      // go over the objects. if fields ODS_1 or ODS_2_1 or ODS_2_2 or ODS_2_3 or ODS_2_4 start with sgd.value plus a dot
      // create an object with Grup, Nom, target and weight
      for (const item of filteredWeightData.value) {
        for (const key in item) {
          if (key.startsWith(`ODS_`)) {
            if (!filterBySdg || item[key].startsWith(`${sdg.value}.`)) {
              let groupId = item[key];

              // if we are not filtering by sdg, we need only the sdg number, before the dot
              if (!filterBySdg) {
                groupId = groupId.split(".")[0] || "0";
              }

              if (!groups[groupId]) groups[groupId] = [];

              const weight = parseFloat(item[`Pes_${key}`]);
              const budget = indexedProgramData[item.Grup]?.value;
              if (budget === undefined) {
                // console.log(item.Grup, budget);
              }

              const value = budget * weight;
              const id = item.Grup;
              const name = `${id} - ${t(`PROGRAMS.${id}`)}`;
              if (value) {
                groups[groupId].push({
                  id,
                  name,
                  group: groupId,
                  weight,
                  budget,
                  value,
                });
              }
            }
          }
        }
      }

      result.set(key, groups);
    });

    return result;
  });

  const processedWeightData = computed(() => {
    return processedWeightDataByYear.value.get(+year.value) || {};
  });

  const aggregatedDataByYear = computed(() => {
    const result = new Map();

    processedWeightDataByYear.value.forEach((processedWeightData, key) => {
      const final = [];

      for (const key in processedWeightData) {
        // for each object in that array
        const total = processedWeightData[key].reduce((acc, item) => {
          // sum the weights
          return acc + item.value;
        }, 0);

        let name = "";

        if (!filterBySdg) {
          name = `${key}. ${t(`SDGS.${key}.TITLE`)}`;
        } else {
          name = `${key}. ${t(`SDGS.${key.split(".")[0]}.TARGETS.${key.split(".")[1]}.DESCRIPTION`)}`
        }

        // leave out the unassigned
        // if (key !== "0")
        final.push({
          id: key,
          name,
          group: key,
          value: total,
          color: !filterBySdg ? colors.sdg[key] : undefined,
          meta: processedWeightData[key].sort((a, b) => {
            return a.value > b.value ? -1 : 1;
          }),
        });
      }

      result.set(
        key,
        final
          // .filter((e) => e.value)
          .sort((a, b) => {
            return a.value > b.value ? -1 : 1;
          })
      );
    });

    return result;
  });

  const aggregatedData = computed(() => {
    return (
      aggregatedDataByYear.value.get(+year.value)?.filter((e) => e.value) || []
    );
  });

  const totalAggregated = computed(() => {
    return aggregatedData.value.reduce((acc, item) => {
      return acc + item.value;
    }, 0);
  });

  const aggregatedAssignedData = computed(() => {
    return aggregatedData.value.filter((e) => e.id !== "0");
  });

  const aggregatedUnassignedData = computed(() => {
    return aggregatedData.value.filter((e) => e.id === "0");
  });

  const total = computed(() => {
    return tableData.value.reduce((acc, item) => {
      return acc + item.value;
    }, 0);
  });

  const totalUnassigned = computed(() => {
    if (filterSDG.value) return 0;

    return aggregatedUnassignedData.value.reduce((acc, item) => {
      return acc + item.value;
    }, 0);
  });

  const totalAssigned = computed(() => {
    return total.value - totalUnassigned.value;
  });

  // until 2024
  const years = [
    "2010",
    "2011",
    "2012",
    "2013",
    "2014",
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
  ];

  return {
    budgetData,
    filteredByYear,
    loadingBudget,
    weightData,
    loadingWeight,
    tableData,
    indexedProgramData,
    filteredWeightData,
    processedWeightData,
    aggregatedData,
    total,
    years,
    aggregatedAssignedData,
    totalAssigned,
    totalUnassigned,
    indexedWeightData,
    totalAggregated,
    indexedProgramDataByYear,
    processedWeightDataByYear,
    aggregatedDataByYear,
  };
}
