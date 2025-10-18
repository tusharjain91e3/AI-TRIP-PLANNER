type TripDetails = {
  location: string;
  days: number;
  companion?: string;
  activityPreferences: string[];
};

const COORDINATE_LOOKUP: Record<string, { lat: number; lng: number }> = {
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  "bengaluru, karnataka, india": { lat: 12.9716, lng: 77.5946 },
  "bangalore, karnataka, india": { lat: 12.9716, lng: 77.5946 },
  paris: { lat: 48.8566, lng: 2.3522 },
  "paris, france": { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5072, lng: -0.1276 },
  "london, united kingdom": { lat: 51.5072, lng: -0.1276 },
  "new york": { lat: 40.7128, lng: -74.006 },
  "new york city": { lat: 40.7128, lng: -74.006 },
  "new york, usa": { lat: 40.7128, lng: -74.006 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  tokyo: { lat: 35.6764, lng: 139.6501 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  bali: { lat: -8.3405, lng: 115.092 },
  rome: { lat: 41.9028, lng: 12.4964 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  delhi: { lat: 28.6139, lng: 77.209 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  goa: { lat: 15.2993, lng: 74.124 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  manali: { lat: 32.2432, lng: 77.1892 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  phuket: { lat: 7.9519, lng: 98.3381 },
  maldives: { lat: 3.2028, lng: 73.2207 },
  thailand: { lat: 15.87, lng: 100.9925 },
};

const getHashCoordinates = (location: string) => {
  const normalized = location.toLowerCase().trim();
  const hash = normalized
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const lat = Number((((hash % 120) - 60) + normalized.length * 0.3).toFixed(4));
  const lng = Number((((hash % 320) - 160) + normalized.length * 0.45).toFixed(4));

  return { lat, lng };
};

const getCoordinates = (location: string) => {
  if (!location) return { lat: 0, lng: 0 };

  const normalized = location.toLowerCase().trim();
  const segments = normalized.split(",").map((part) => part.trim());

  for (const segment of [normalized, ...segments]) {
    if (COORDINATE_LOOKUP[segment]) {
      return COORDINATE_LOOKUP[segment];
    }
  }

  return getHashCoordinates(normalized);
};

const extractTripDetails = (
  promptText: string,
  activityPreferences: string[] = [],
  companion?: string
): TripDetails => {
  const daysMatch = promptText.match(/(\d+)\s*day/iu);
  const locationMatch = promptText.split(/trip to/iu)[1];

  const days = daysMatch ? Math.max(1, parseInt(daysMatch[1], 10)) : 3;
  const location = locationMatch ? locationMatch.trim() : "your destination";

  return { location, days, activityPreferences, companion };
};

const getThemeDescriptor = (preferences: string[]) => {
  if (!preferences.length) return "balanced mix of culture, food, and easy adventures";

  const preference = preferences[0]?.toLowerCase();

  switch (preference) {
    case "adventure":
    case "adventurous":
      return "a healthy dose of light adventure and time outdoors";
    case "culturalexperiences":
    case "culture":
      return "immersive cultural touchpoints, creative workshops, and local traditions";
    case "historical":
      return "historic walks, heritage sites, and thoughtful storytelling";
    case "relaxationwellness":
      return "slow travel moments, mindful pauses, and wellness-friendly stops";
    case "shopping":
      return "market strolls, indie boutiques, and thoughtful souvenir stops";
    case "nightlife":
      return "great dining, relaxed lounges, and after-dark energy";
    case "sightseeing":
    default:
      return "landmark highlights mixed with neighborhood discoveries";
  }
};

const formatCompanion = (companion?: string) => {
  if (!companion) return "";

  const normalized = companion.trim().toLowerCase();
  if (!normalized.length) return "";

  switch (normalized) {
    case "solo":
      return "and workable for solo explorers";
    case "couple":
      return "with a relaxed pace for couples";
    case "family":
      return "with flexible options that families appreciate";
    case "group":
      return "and group-friendly throughout";
    default:
      return `with your ${normalized}`;
  }
};

const getSeasonalWindow = (location: string) => {
  if (!location) {
    return "Plan between late October and early March for comfortable temperatures and lighter crowds.";
  }

  const normalized = location.toLowerCase();

  if (/(goa|kerala|thailand|phuket|maldives|bali)/iu.test(normalized)) {
    return "Visit between November and March for sunny skies, mellow seas, and calmer humidity.";
  }

  if (/(shimla|manali|himachal|mountain|hill)/iu.test(normalized)) {
    return "Late March to June offers mild mountain weather, while October brings crisp skies without peak chill.";
  }

  if (/(dubai|abu dhabi|desert)/iu.test(normalized)) {
    return "November to March keeps daytime heat manageable and perfect for desert evenings.";
  }

  if (/(singapore|kuala lumpur|tropical)/iu.test(normalized)) {
    return "Plan for February to April when rainfall eases and humidity is gentler.";
  }

  if (/(europe|paris|london|rome|barcelona)/iu.test(normalized)) {
    return "Late April through June or September brings soft sunshine and thinner visitor lines.";
  }

  return "Shoulder months between March-May or September-November balance pleasant weather with fewer crowds.";
};

const createActivityList = (location: string, preferences: string[]) => {
  const focus = preferences[0]?.toLowerCase() ?? "sightseeing";
  const target = location || "the city";

  const baseActivities = [
    `Sunrise walk at ${target.split(",")[0]} Viewpoint to get a first panoramic impression of the region.`,
    `Guided neighborhood hop through ${target.split(",")[0]} backstreets to discover street art and hidden cafés.`,
    `Cycling loop around iconic landmarks of ${target.split(",")[0]} with plenty of photo stops.`,
    `Evening food crawl across ${target.split(",")[0]} markets to sample signature bites and desserts.`,
    `Half-day getaway to a scenic spot just outside ${target.split(",")[0]} for fresh air and slow moments.`,
  ];

  if (focus.includes("adventure")) {
    baseActivities.push(
      `Try a guided adventure session near ${target.split(",")[0]} such as hiking, canyoning, or easy rappelling.`
    );
  }

  if (focus.includes("culture") || focus.includes("histor")) {
    baseActivities.push(
      `Book a local storytelling walk through ${target.split(",")[0]} museums and heritage quarters.`
    );
  }

  if (focus.includes("relax")) {
    baseActivities.push(
      `Reserve a wellness block with spa or yoga options available across premium stays in ${target.split(",")[0]}.`
    );
  }

  return baseActivities.slice(0, Math.max(5, baseActivities.length));
};

const createCuisineList = (location: string) => {
  const base = location.split(",")[0] || "the city";

  return [
    `Breakfast at a classic ${base} café for regional breads, filter coffee, and local morning staples.`,
    `Seasonal tasting thali featuring heirloom recipes popular across ${base} households.`,
    `Street food crawl pairing iconic snacks from different neighborhoods within ${base}.`,
    `Dinner reservation at a chef-led kitchen reimagining ${base} classics with seasonal ingredients.`,
    `Dessert stop for traditional sweets and artisanal gelato inspired by ${base} flavours.`,
  ];
};

const createPackingChecklist = (location: string, preferences: string[]) => {
  const items = [
    "Lightweight daypack with rain cover",
    "Versatile footwear that works for walks and casual dinners",
    "Reusable water bottle and hydration sachets",
    "Power bank and multi-plug travel adapter",
    "Travel-size first aid kit with motion relief",
  ];

  const normalizedPrefs = preferences.map((p) => p.toLowerCase());

  if (normalizedPrefs.some((p) => p.includes("adventure"))) {
    items.push("Quick-dry layers and compact towel for outdoor segments");
    items.push("Action camera or phone harness for hands-free filming");
  }

  if (normalizedPrefs.some((p) => p.includes("relax"))) {
    items.push("Comfortable lounge wear for downtime at stays");
  }

  if (normalizedPrefs.some((p) => p.includes("night"))) {
    items.push("Dressy smart-casual outfit for evenings out");
  }

  if (normalizedPrefs.some((p) => p.includes("culture") || p.includes("histor"))) {
    items.push("Notebook or digital pen for museum and gallery notes");
  }

  return items;
};

const selectOption = (
  options: ((location: string) => string)[],
  index: number
) => {
  if (!options.length) return () => "";
  return options[index % options.length];
};

const MORNING_TEMPLATES = [
  (location: string) => `Ease into the day with a relaxed walk across ${location.split(",")[0]} lanes and a specialty coffee stop.`,
  (location: string) => `Start with a sunrise viewpoint near ${location.split(",")[0]} for soft light and city panoramas.`,
  (location: string) => `Join a local expert for an orientation walk that unlocks insider stories about ${location.split(",")[0]}.`,
];

const AFTERNOON_TEMPLATES = [
  (location: string) => `Head indoors for a hands-on workshop showcasing crafts and culinary secrets rooted in ${location.split(",")[0]}.`,
  (location: string) => `Spend the afternoon tracing landmark highlights around ${location.split(",")[0]} with plenty of photo pauses.`,
  (location: string) => `Break for a long lunch followed by museum hopping to understand how ${location.split(",")[0]} evolved.`,
];

const EVENING_TEMPLATES = [
  (location: string) => `Wind down at a rooftop or riverside lounge watching ${location.split(",")[0]} light up after dark.`,
  (location: string) => `Reserve a chef-led tasting dinner that celebrates the signature flavours of ${location.split(",")[0]}.`,
  (location: string) => `Join a storytelling night walk to see how ${location.split(",")[0]} transforms in the evening.`,
];

const addThemeNotes = (baseDescription: string, preferences: string[], companion?: string) => {
  const theme = getThemeDescriptor(preferences);
  const companionNote = formatCompanion(companion);

  return `${baseDescription} This plan leans into ${theme}${companionNote ? `, ${companionNote}` : ""}.`;
};

const buildItinerary = (details: TripDetails) => {
  const { location, days, activityPreferences, companion } = details;

  return Array.from({ length: days }, (_, dayIndex) => {
    const dayNumber = dayIndex + 1;
    const morningItem = selectOption(MORNING_TEMPLATES, dayIndex)(location);
    const afternoonItem = selectOption(AFTERNOON_TEMPLATES, dayIndex)(location);
    const eveningItem = selectOption(EVENING_TEMPLATES, dayIndex)(location);

    return {
      title: `Day ${dayNumber}`,
      activities: {
        morning: [
          {
            itineraryItem: morningItem,
            briefDescription: addThemeNotes(
              `${morningItem} Expect a gentle pace with plenty of time for photos and café breaks.`,
              activityPreferences,
              companion
            ),
          },
        ],
        afternoon: [
          {
            itineraryItem: afternoonItem,
            briefDescription: addThemeNotes(
              `${afternoonItem} Keep the schedule flexible so you can follow recommendations from locals you meet along the way.`,
              activityPreferences,
              companion
            ),
          },
        ],
        evening: [
          {
            itineraryItem: eveningItem,
            briefDescription: addThemeNotes(
              `${eveningItem} Wrap up with a slow walk back to your stay or extend the night with live music if you are up for it.`,
              activityPreferences,
              companion
            ),
          },
        ],
      },
    };
  });
};

const buildTopPlaces = (location: string) => {
  const base = location.split(",")[0] || "Destination";
  const { lat, lng } = getCoordinates(location);

  const places = [
    `${base} Heritage Quarter`,
    `${base} Riverside Promenade`,
    `${base} Creative Arts District`,
    `${base} Night Market`,
    `${base} Sunset Point`,
    `${base} Botanical Escape`,
  ];

  return places.slice(0, 5).map((name, index) => ({
    name,
    coordinates: {
      lat: Number((lat + index * 0.018).toFixed(4)),
      lng: Number((lng + index * 0.022).toFixed(4)),
    },
  }));
};

export const buildBatch1Fallback = (promptText: string) => {
  const { location, days, activityPreferences, companion } = extractTripDetails(promptText);
  const themeDescriptor = getThemeDescriptor(activityPreferences);
  const companionNote = formatCompanion(companion);

  return {
    abouttheplace: `A ${days}-day journey to ${location} promises layered experiences: neighbourhood walks, mindful pauses, and pockets of spontaneity. Expect welcoming hosts, easy-to-navigate districts, and the perfect balance between headline attractions and community-driven discoveries. This itinerary gives you curated anchors while leaving space for the unexpected, making it ideal for travellers who appreciate ${themeDescriptor}${companionNote ? `, ${companionNote}` : ""}.`,
    besttimetovisit: getSeasonalWindow(location),
  };
};

export const buildBatch2Fallback = (promptText: string, activityPreferences: string[] = []) => {
  const { location } = extractTripDetails(promptText, activityPreferences);

  return {
    adventuresactivitiestodo: createActivityList(location, activityPreferences),
    localcuisinerecommendations: createCuisineList(location),
    packingchecklist: createPackingChecklist(location, activityPreferences),
  };
};

export const buildBatch3Fallback = (
  promptText: string,
  activityPreferences: string[] = [],
  companion?: string
) => {
  const details = extractTripDetails(promptText, activityPreferences, companion);

  return {
    itinerary: buildItinerary(details),
    topplacestovisit: buildTopPlaces(details.location),
  };
};
