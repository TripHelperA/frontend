import { generateClient } from "aws-amplify/api";
import { useState } from "react";
import { StatusBar, View } from "react-native";
import { allMarkers } from "../../components/tabs/dummyData";
import RouteMapCaller from "../../components/tabs/RouteMapCaller";
import TripInputPanel from "../../components/tabs/TripInputPanel";

const client = generateClient();

const GET_START_END_PLACES = /* GraphQL */ `
  query GetStartEndPlaces($startPlace: String!, $endPlace: String!) {
    getStartEndPlaces(startPlace: $startPlace, endPlace: $endPlace) {
      latitude
      longitude
      isOnTheRoute
      placeId
    }
  }
`;

const MAIN_LOGIC_REQUEST = /* GraphQL */ `
  query MainLogicRequest($input: mainLogicUserInput!) {
    mainLogicRequest(input: $input) {
      latitude
      longitude
      isOnTheRoute
      placeId
    }
  }
`;

type BaseMarker = {
    latitude: number;
    longitude: number;
    isOnTheRoute: boolean;
    google_place_id: string;
};

type RawLoc = {
    latitude?: number | null;
    longitude?: number | null;
    isOnTheRoute?: boolean | null;
    placeId?: string | null;
    google_place_id?: string | null;
};

const DEFAULT_START: BaseMarker = {
    latitude: 52.47991,
    longitude: 13.52465,
    isOnTheRoute: true,
    google_place_id: "fallback_start",
};

const DEFAULT_END: BaseMarker = {
    latitude: 53.014194,
    longitude: 8.761399,
    isOnTheRoute: true,
    google_place_id: "fallback_end",
};

function toBaseMarker(loc?: RawLoc | null): BaseMarker | null {
    if (!loc || loc.latitude == null || loc.longitude == null) return null;
    const gpid = (loc.google_place_id ?? loc.placeId) ?? "";
    if (!gpid) return null;
    return {
        latitude: loc.latitude,
        longitude: loc.longitude,
        isOnTheRoute: loc.isOnTheRoute ?? true,
        google_place_id: gpid,
    };
}

function isSamePoint(a?: BaseMarker | null, b?: BaseMarker | null) {
    if (!a || !b) return false;
    return a.latitude === b.latitude && a.longitude === b.longitude;
}

export default function Map() {
    const [startMarker, setStartMarker] = useState<BaseMarker | null>(null);
    const [endMarker, setEndMarker] = useState<BaseMarker | null>(null);
    const [stopCount, setStopCount] = useState(0);

    // This will hold the AI-constructed route (ordered: start ... end)
    const [routeMarkers, setRouteMarkers] = useState<BaseMarker[]>([]);

    const [tripDetails, setTripDetails] = useState({
        from: "Ankara",
        to: "Istanbul",
    });

    // --- plain search: resolve start/end coordinates
    const handleSearch = async (data: { from: string; to: string; stops: string }) => {
        try {
            setTripDetails({ from: data.from, to: data.to });
            setStopCount(Number.parseInt(data.stops || "0", 10));

            const response = await client.graphql({
                query: GET_START_END_PLACES,
                variables: { startPlace: data.from, endPlace: data.to },
            });

            console.log("✅ GraphQL raw response (getStartEndPlaces):", JSON.stringify(response, null, 2));

            const arr: RawLoc[] = response.data?.getStartEndPlaces ?? [];
            console.log("✅ getStartEndPlaces (parsed array):", arr);

            const s = toBaseMarker(arr[0]) ?? null;
            const e = toBaseMarker(arr[1]) ?? null;

            console.log("✅ Normalized Start Marker:", s);
            console.log("✅ Normalized End Marker:", e);

            if (!s || !e) {
                console.warn("⚠️ getStartEndPlaces returned invalid markers:", arr);
            }

            setStartMarker(s);
            setEndMarker(e);
            // Reset AI route when user changes basic search
            setRouteMarkers([]);
        } catch (err) {
            console.error("❌ getStartEndPlaces error:", err);
        }
    };

    // --- AI search: call mainLogicRequest and build ordered route array
    const handleAiSearch = async (query: string) => {
        try {
            if (!startMarker || !endMarker) {
                console.warn("⚠️ AI search requires start/end markers. Run basic search first.");
                return;
            }

            const variables = {
                input: {
                    startingPlace: {
                        latitude: startMarker.latitude,
                        longitude: startMarker.longitude,
                    },
                    endPlace: {
                        latitude: endMarker.latitude,
                        longitude: endMarker.longitude,
                    },
                    userInput: query,
                    stopCount, // already parsed in handleSearch
                },
            };

            const response = await client.graphql({
                query: MAIN_LOGIC_REQUEST,
                variables,
            });

            console.log("🧠 mainLogicRequest raw response:", JSON.stringify(response, null, 2));

            const rawList: RawLoc[] = response.data?.mainLogicRequest ?? [];
            console.log("🧠 mainLogicRequest (parsed array):", rawList);

            // Normalize AI results to BaseMarker[]
            const aiMarkers = rawList
                .map(toBaseMarker)
                .filter((m): m is BaseMarker => !!m);

            // Remove any start/end duplicates that might already be in aiMarkers
            const middle = aiMarkers.filter(
                (m) => !isSamePoint(m, startMarker) && !isSamePoint(m, endMarker)
            );

            // Force start at index 0 and end at the last index
            const ordered: BaseMarker[] = [
                startMarker ?? DEFAULT_START,
                ...middle,
                endMarker ?? DEFAULT_END,
            ];

            setRouteMarkers(ordered);
            console.log("🧭 Final ordered routeMarkers:", ordered);
        } catch (err) {
            console.error("❌ mainLogicRequest error:", err);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />

            <TripInputPanel
                initialTripDetails={tripDetails}
                onSearch={handleSearch}
                onAiSearch={handleAiSearch}
            />

            <RouteMapCaller
                // If AI produced an ordered route, prefer it; otherwise use your defaults
                dataArray={routeMarkers.length ? routeMarkers : allMarkers}
                googleMapsApiKey={
                    process.env.GOOGLE_MAPS_API_KEY ||
                    "AIzaSyB7CZSentLXI1cqLZP8GsxfKqA-5G5qm-k"
                }
                initialRegion={{
                    latitude: (startMarker ?? DEFAULT_START).latitude,
                    longitude: (startMarker ?? DEFAULT_START).longitude,
                    latitudeDelta: 2,
                    longitudeDelta: 2,
                }}
                fixedStart={startMarker ?? DEFAULT_START}
                fixedEnd={endMarker ?? DEFAULT_END}
                defaultMode="view"
            />
        </View>
    );
}
