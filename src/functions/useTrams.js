import { useI18n } from "vue-i18n";
export default function useTrams() {
  const { t } = useI18n();

  const trams = computed(() => {
    // Petits: fins a 2.000 habitants
    // Mitjans: de 2.001 a 10.000 habitants
    // Grans: de 10.001 a 50.000 habitants
    // Molt grans: més de 50.000 habitants

    const tramOptions = [
      {
        id: "micro",
        name: t("TRAM_OPTIONS.micro"),
        min: 0,
        max: 500,
      },
      {
        id: "petits",
        name: t("TRAM_OPTIONS.petits"),
        min: 501,
        max: 2000,
      },
      {
        id: "mitjans",
        name: t("TRAM_OPTIONS.mitjans"),
        min: 2001,
        max: 10000,
      },
      {
        id: "grans",
        name: t("TRAM_OPTIONS.grans"),
        min: 10001,
        max: 50000,
      },
      {
        id: "molt-grans",
        name: t("TRAM_OPTIONS.molt-grans"),
        min: 50001,
      },
    ];

    //     Fins a 500 habitants
    // De 501 a 1.000 habitants
    // De 1.001 a 5.000 habitants
    // De 5.001 a 10.000 habitants
    // De 10.001 a 20.000 habitants
    // De 20.001 a 50.000 habitants
    // De 50.001 a 100.000 habitants
    // Més de 100.000 habitants

    return tramOptions;
  });

  return trams;
}
