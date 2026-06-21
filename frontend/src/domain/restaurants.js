const LOCATIONS = ["Indiranagar", "Koramangala", "HSR Layout", "MG Road", "Banjara Hills", "Powai", "Andheri West"];

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function deriveRestaurantsFromFood(items) {
  const byCategory = new Map();
  for (const it of items || []) {
    const cat = it?.category || "Popular";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(it);
  }

  const restaurants = Array.from(byCategory.entries()).map(([category, list]) => {
    const h = hashString(category);
    const rating = (38 + (h % 13)) / 10; // 3.8–5.0
    const location = LOCATIONS[h % LOCATIONS.length];
    const id = `cat-${slugify(category)}`;

    const images = list.map((x) => x.image).filter(Boolean);
    const heroImage =
      images[0] ||
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=60";

    return {
      id,
      slug: id,
      name: `${category} Hub`,
      category,
      rating: Math.min(5, Math.max(3.8, Number(rating.toFixed(1)))),
      location,
      heroImage,
      itemsCount: list.length
    };
  });

  restaurants.sort((a, b) => b.rating - a.rating);
  return restaurants;
}

export function restaurantMatchesQuery(r, q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return true;
  return `${r.name} ${r.location} ${r.category}`.toLowerCase().includes(query);
}

