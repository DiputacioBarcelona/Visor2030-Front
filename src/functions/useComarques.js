import { useI18n } from "vue-i18n";

export default function useComarques(includeAll = false) {
  const municipalities = inject("municipalities");
  const { t } = useI18n();

  const comarcaOptions = computed(() => {
    const comarques = new Map();
    municipalities.value.forEach((m) => {
      if (!comarques.has(m.comarca.comarca_code)) {
        comarques.set(m.comarca.comarca_code, {
          ...m.comarca,
          municipalities: [m.municipality_code_6, m.municipality_code],
        });
      } else {
        comarques
          .get(m.comarca.comarca_code)
          .municipalities.push(m.municipality_code_6);
        comarques
          .get(m.comarca.comarca_code)
          .municipalities.push(m.municipality_code);
      }
    });

    // return an array of objects with id and name sorted by comarca_name
    const comarquesArray = Array.from(comarques.values())
      .map((c) => ({
        id: c.comarca_code,
        name: c.comarca_name,
        highlighted: c.municipalities,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (includeAll) {
      comarquesArray.unshift({
        id: null,
        name: t("TOTES"),
        highlighted: [],
      });
    }

    return comarquesArray;
  });

  return comarcaOptions;
}
