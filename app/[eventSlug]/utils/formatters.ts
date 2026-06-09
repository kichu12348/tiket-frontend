export function formatEventDates(startDateStr: string, endDateStr: string) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formattedTime = `${startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} - ${endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  const monthShort = startDate
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const dayNumber = startDate.getDate().toString();

  return { formattedDate, formattedTime, monthShort, dayNumber };
}

export function parseLocationDetails(details: string | null): {
  address: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
  name?: string;
} {
  if (!details) return { address: "Location details hidden" };
  try {
    const parsed = JSON.parse(details);
    if (parsed && parsed.address) {
      return {
        address: parsed.address,
        placeId: parsed.placeId,
        lat: parsed.lat,
        lng: parsed.lng,
        city: parsed.city,
        state: parsed.state,
        country: parsed.country,
        name: parsed.name,
      };
    }
    return { address: details };
  } catch (e) {
    // If it's not a JSON string, just return it directly
    return { address: details };
  }
}
