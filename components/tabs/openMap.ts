
// ../src/hooks/openMap.ts
import { Linking } from "react-native";

type Pt = { latitude: number; longitude: number };

const MAX_MIDS_WEB = 23;  // conservative; Google may still trim
const MAX_MIDS_APP = 8;   // app-friendly cap (keeps routes reliable)

function fmt(p: Pt) {
    return `${p.latitude.toFixed(6)},${p.longitude.toFixed(6)}`;
}

/**
 * Opens Google Maps and *starts navigation* (no preview) for the route.
 * - Uses the universal https URL with `dir_action=navigate` so the app autostarts nav.
 * - Caps waypoints (mids) to keep the app happy.
 * - Never sends "optimize:true" (it becomes a bogus stop in-app).
 */
export async function openInGoogleMaps(points: Pt[]) {
    if (!points || points.length < 2) return;

    const origin = fmt(points[0]);
    const destination = fmt(points[points.length - 1]);

    // Use the app-safe cap to avoid issues when the universal link opens the app.
    const mids = points.slice(1, -1).slice(0, MAX_MIDS_APP);
    const midsParam = mids.length ? `&waypoints=${encodeURIComponent(mids.map(fmt).join("|"))}` : "";

    // Universal deep link that autostarts navigation in the Google Maps app
    const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&origin=${encodeURIComponent(origin)}` +
        `&destination=${encodeURIComponent(destination)}` +
        `${midsParam}` +
        `&travelmode=driving&dir_action=navigate`;

    await Linking.openURL(url);
}
