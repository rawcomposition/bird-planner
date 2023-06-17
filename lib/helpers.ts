import { Trip } from "lib/types";
import { toast } from "react-hot-toast";

export const englishCountries = [
  "US",
  "CA",
  "AU",
  "GB",
  "NZ",
  "IE",
  "GH",
  "SG",
  "BZ",
  "ZA",
  "IN",
  "DM",
  "MT",
  "AG",
  "KE",
  "JM",
  "GD",
  "GY",
  "BW",
  "LR",
  "BB",
  "CM",
  "NG",
  "GM",
  "TT",
  "BS",
];

export const isRegionEnglish = (region: string) => {
  const regionCode = region.split(",")[0];
  return englishCountries.includes(regionCode);
};

export function truncate(string: string, length: number): string {
  return string.length > length ? `${string.substring(0, length)}...` : string;
}

// Adapted from https://www.geodatasource.com/developers/javascript
export function distanceBetween(lat1: number, lon1: number, lat2: number, lon2: number, metric = true): number {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (metric) {
      dist = dist * 1.609344;
    }
    return parseFloat(dist.toFixed(2));
  }
}

export const markerColors = [
  "#bcbcbc",
  "#8f9ca0",
  "#9bc4cf",
  "#aaddeb",
  "#c7e466",
  "#eaeb1f",
  "#fac500",
  "#e57701",
  "#ce0d02",
  "#ad0002",
];

export const getMarkerColor = (count: number) => {
  if (count === 0) return markerColors[0];
  if (count <= 15) return markerColors[1];
  if (count <= 50) return markerColors[2];
  if (count <= 100) return markerColors[3];
  if (count <= 150) return markerColors[4];
  if (count <= 200) return markerColors[5];
  if (count <= 250) return markerColors[6];
  if (count <= 300) return markerColors[7];
  if (count <= 400) return markerColors[8];
  if (count <= 500) return markerColors[9];
  return markerColors[0];
};

export const getMarkerColorIndex = (count: number) => {
  const color = getMarkerColor(count);
  return markerColors.indexOf(color);
};

export const radiusOptions = [
  { label: "5 mi", value: 5 },
  { label: "10 mi", value: 10 },
  { label: "20 mi", value: 20 },
  { label: "50 mi", value: 50 },
  { label: "100 mi", value: 100 },
  { label: "250 mi", value: 250 },
  { label: "350 mi", value: 350 },
  { label: "500 mi", value: 500 },
];

export const getBounds = async (regionString: string) => {
  try {
    const regions = regionString.split(",");
    const boundsPromises = regions.map((region) =>
      fetch(`https://api.ebird.org/v2/ref/region/info/${region}?key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`).then((res) =>
        res.json()
      )
    );
    const boundsResults = await Promise.all(boundsPromises);
    const combinedBounds = boundsResults.reduce(
      (acc, bounds) => {
        return {
          minX: Math.min(acc.minX, bounds.bounds.minX),
          maxX: Math.max(acc.maxX, bounds.bounds.maxX),
          minY: Math.min(acc.minY, bounds.bounds.minY),
          maxY: Math.max(acc.maxY, bounds.bounds.maxY),
        };
      },
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );
    return combinedBounds;
  } catch (error) {
    toast.error("Error getting region info");
    return null;
  }
};

export const getLatLngFromBounds = (bounds?: Trip["bounds"]) => {
  if (!bounds) return { lat: null, lng: null };
  const { minX, minY, maxX, maxY } = bounds;
  const lat = (minY + maxY) / 2;
  const lng = (minX + maxX) / 2;
  return { lat, lng };
};

export const randomId = (length: number) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const translate = async (string: string) => {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      body: JSON.stringify({ text: string }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    if (!json.text) throw new Error();
    return json.text;
  } catch (error) {
    toast.error("Error translating");
    return string;
  }
};
