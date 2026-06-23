export default function useRuralitats(includeAll = false, t) {
  const municipalities = inject("municipalities");

  const ruralitatOptions = computed(() => {
    const ruralitats = new Map();
    // console.log(municipalities.value);
    municipalities.value.forEach((m) => {
      if (m.ruralitat) {
        if (!ruralitats.has(m.ruralitat.id)) {
          ruralitats.set(m.ruralitat.id, {
            ...m.ruralitat,
            municipalities: [m.municipality_code_6, m.municipality_code],
          });
        } else {
          ruralitats
            .get(m.ruralitat.id)
            .municipalities.push(m.municipality_code_6);
          ruralitats
            .get(m.ruralitat.id)
            .municipalities.push(m.municipality_code);
        }
      }
    });

    // return an array of objects with id and name sorted by comarca_name
    const ruralitatsArray = Array.from(ruralitats.values())
      .map((c) => ({
        id: c.id,
        name: c.name,
        highlighted: c.municipalities,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (includeAll) {
      ruralitatsArray.unshift({
        id: null,
        name: t("TOTES"),
        highlighted: [],
      });
    }

    return ruralitatsArray;
  });

  return ruralitatOptions;
}
