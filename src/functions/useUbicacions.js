export default function useUbicacions(includeAll = false, t) {
  const municipalities = inject("municipalities");

  const ubicacioOptions = computed(() => {
    const ubicacions = new Map();
    // console.log(municipalities.value);
    municipalities.value.forEach((m) => {
      if (m.ubicacio) {
        if (!ubicacions.has(m.ubicacio.id)) {
          ubicacions.set(m.ubicacio.id, {
            ...m.ubicacio,
            municipalities: [m.municipality_code_6, m.municipality_code],
          });
        } else {
          ubicacions
            .get(m.ubicacio.id)
            .municipalities.push(m.municipality_code_6);
          ubicacions
            .get(m.ubicacio.id)
            .municipalities.push(m.municipality_code);
        }
      }
    });

    // return an array of objects with id and name sorted by comarca_name
    const ubicacionsArray = Array.from(ubicacions.values())
      .map((c) => ({
        id: c.id,
        name: c.name,
        highlighted: c.municipalities,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (includeAll) {
      ubicacionsArray.unshift({
        id: null,
        name: t("TOTES"),
        highlighted: [],
      });
    }

    return ubicacionsArray;
  });

  return ubicacioOptions;
}
