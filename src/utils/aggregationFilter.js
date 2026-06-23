/** Check if a municipality belongs to a given aggregation slug */
export function municipalityMatchesSlug(municipality, slug) {
  return municipality.aggregations?.some((agg) => agg.slug === slug);
}

/** Filter municipalities that match ALL selected slugs */
export function filterByAggregationSlugs(municipalities, slugs) {
  return slugs.reduce(
    (acc, slug) => acc.filter((m) => municipalityMatchesSlug(m, slug)),
    municipalities,
  );
}
