import { useI18n } from "vue-i18n";

export default function useOtherGroupings(includeAll = false) {
  const { t } = useI18n();
  const otherGroupingsOptions = computed(() => {
    const options = [
      {
        id: "territorial_region",
        name: t("REGION"),
        children: [
          { id: "comarques-centrals", name: t("GROUPING.comarques-centrals") },
          { id: "penedes", name: t("GROUPING.penedes") },
          { id: "valles", name: t("GROUPING.valles") },
        ],
      },

      {
        id: "ubicacio",
        name: t("UBICACIO"),
        children: [
          { id: "muntanya", name: t("GROUPING.muntanya") },
          { id: "litoral", name: t("GROUPING.litoral") },
          { id: "interior", name: t("GROUPING.interior") },
        ],
      },
      {
        id: "ruralitat",
        name: t("RURALITAT"),
        children: [
          { id: "rural", name: t("GROUPING.rural") },
          { id: "no-rural", name: t("GROUPING.no-rural") },
        ],
      },
      { id: "amb", name: t("GROUPING.amb") },
      { id: "rmb", name: t("GROUPING.rmb") },
      { id: "industrials", name: t("GROUPING.industrials") },
    ];

    if (includeAll) {
      options.unshift({
        id: null,
        name: t("TOTES"),
      });
    }

    return options;
  });

  return otherGroupingsOptions;
}
