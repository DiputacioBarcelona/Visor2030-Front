import useLoadData from "@/functions/useLoadData";
import useFilters from "@/functions/useFilters";
import * as IDS from "@/utils/ids";
import * as d3 from "d3";
import { useI18n } from "vue-i18n";

export default function usePlansData() {
  const { t } = useI18n();
  const { sdg } = useFilters();

  const { data, loading } = useLoadData("getMunicipalityPlans");

  const municipality = inject("entity");

  // Filter data by chosen municipality
  // It must include all plans that contain:
  // 1. The municipality name in "Municipi" column when the scale is "M"
  // 2. The municipality name in "Municipi" column when the scale is "B" (barri)
  // 3. The municipality name in "Municipis Escala I" column when the scale is "I"
  // 4. The comarca name in "Comarca" column when the scale is "C"
  const filteredData = computed(() => {
    return data.value.filter((item) => {
      return (
        ((item[IDS.ESCALA] === "M" || item[IDS.ESCALA] === "B") &&
          item[IDS.MUNICIPI]
            .split("-")
            .map((name) => name.trim())
            .includes(municipality.value.name)) ||
        (item[IDS.ESCALA] === "I" &&
          item[IDS.MUN_INTER]
            .split(",")
            .map((name) => name.trim())
            .includes(municipality.value.name)) ||
        (item[IDS.ESCALA] === "C" &&
          item[IDS.COMARCA]
            .split(",")
            .map((name) => name.trim())
            .includes(municipality.value.comarca.comarca_name))
      );
    });
  });

  const processedData = computed(() => {
    // keep columns:
    // "Nom complet"
    // "Any central"
    // "Període"
    // "ESCALA"
    // "Total"
    // and any column starting with  "ODS10 - ", where 10 is the sdg
    const columns = [
      IDS.NOM_COMPLET,
      IDS.ANY_CENTRAL,
      IDS.PERIODE,
      IDS.ESCALA,
      IDS.TOTAL,
    ];
    const sdgColumns = Object.keys(filteredData.value[0] || {}).filter(
      (key) => {
        if (sdg.value) return key.startsWith(`ODS${sdg.value} -`);
        // starts with ODS and does not contain " - "

        return key.startsWith(`ODS`) && !key.includes(" - ");
      },
    );

    // console.log(sdgColumns);
    const availablePeriods = new Set();

    const items = filteredData.value.map((item, i) => {
      const newItem = { themes: [] };
      columns.forEach((column) => {
        newItem[column] =
          column === IDS.TOTAL ? parseNumber(item[column]) : item[column];
        if (column === IDS.PERIODE) {
          availablePeriods.add(item[column]);
        }
      });

      // for each sdgColumns, push an entry to newItem.themes
      sdgColumns.forEach((column) => {
        let theme = column.trim();
        if (sdg.value) {
          theme = column.replace(`ODS${sdg.value} -`, "").trim();
        }

        const thesdg = column.split(" - ")[0].replace("ODS", "");

        newItem.themes.push({
          theme,
          rawValue: parseNumber(item[column]),
          sdg: thesdg,
        });
      });

      // total: aggregate all values from themes
      const total = newItem.themes.reduce((acc, theme) => {
        return acc + theme.rawValue;
      }, 0);

      // Change value by the percentage of the value
      newItem.themes.forEach((theme) => {
        if (newItem[IDS.TOTAL]) {
          theme.value = (theme.rawValue * 100) / newItem[IDS.TOTAL];
        } else {
          theme.value = 0;
        }
      });

      newItem.total = (total * 100) / newItem[IDS.TOTAL];

      newItem.name = `${newItem[IDS.NOM_COMPLET]} (${newItem[IDS.ANY_CENTRAL]})`;
      newItem.id = i + 1; // The id 0 will be the total aggregate

      return newItem;
    });

    const totalAggregate = createAggregate(items, 0, "total", t);

    // Aggregations by period
    const sortedAvailablePeriods = Array.from(availablePeriods).sort(
      (a, b) => b.split("-")[0] - a.split("-")[0],
    );
    const periodAggregates = [];
    sortedAvailablePeriods.forEach((period, index) => {
      const filteredItems = items.filter((i) => i[IDS.PERIODE] === period);
      periodAggregates.push(
        createAggregate(filteredItems, index + 1, period, t),
      );
    });

    const cleanedItems = items.map((item) => {
      return {
        ...item,
        themes: item.themes.map(({ theme, sdg, value }) => ({
          theme,
          sdg,
          value,
        })),
      };
    });

    const sortedItems = cleanedItems.sort((a, b) => {
      // // first by type (MUNICIPAL, INTERMUNICIPAL, COMARCAL), and then by year
      // const typeA = a[IDS.ESCALA] === "M" ? 1 : a[IDS.ESCALA] === "I" ? 2 : 3;
      // const typeB = b[IDS.ESCALA] === "M" ? 1 : b[IDS.ESCALA] === "I" ? 2 : 3;
      // if (typeA !== typeB) {
      //   return typeA - typeB;
      // }
      // // then by year

      // Now they only want them sorted by year
      const yearA = a[IDS.ANY_CENTRAL];
      const yearB = b[IDS.ANY_CENTRAL];
      if (yearA !== yearB) {
        return yearB - yearA;
      }
      return 0;
    });

    return {
      by_plan: [totalAggregate, ...sortedItems],
      by_period: [totalAggregate, ...periodAggregates],
    };
  });

  // watch(data, (newData) => {
  //   console.log(filteredData.value);
  // });

  return {
    data,
    loading,
    filteredData,
    processedData,
  };
}

const parseNumber = (value) => {
  if (!value) return 0;
  return parseFloat(value.replace(",", "."));
};

function createAggregate(items, id, label, t) {
  // === AGGREGATE OBJECT ===
  const aggregate = {
    id: id,
    name: label,
    [IDS.NOM_COMPLET]: `aggregate_${label}`,
    [IDS.ANY_CENTRAL]: null,
    [IDS.PERIODE]: label,
    [IDS.ESCALA]: label,
    [IDS.TOTAL]: 0,
    themes: [],
    total: 0,
  };

  const themeMap = new Map();

  items.forEach((item) => {
    // comarcal plans have a weight of 0.5 when doing the aggregation
    const weighting = item[IDS.ESCALA] === "C" ? 0.5 : 1;

    aggregate[IDS.TOTAL] += weighting * item[IDS.TOTAL];

    item.themes.forEach((theme) => {
      const key = `${theme.theme}`;
      if (!themeMap.has(key)) {
        themeMap.set(key, {
          sdg: theme.sdg,
          theme: theme.theme,
          rawValue: 0,
        });
      }
      themeMap.get(key).rawValue += weighting * theme.rawValue;
    });
  });

  // Convert raw values to % of total
  aggregate.themes = Array.from(themeMap.values()).map(
    ({ sdg, theme, rawValue }) => {
      return {
        theme,
        sdg,
        value: (rawValue * 100) / aggregate[IDS.TOTAL],
      };
    },
  );

  aggregate.total = aggregate.themes.reduce(
    (acc, theme) => acc + theme.value,
    0,
  );

  return aggregate;
}
