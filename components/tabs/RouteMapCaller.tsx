import { useEffect, useMemo, useState } from "react";
import { StatusBar, View } from "react-native";
import RouteMap from "./RouteMap";

export type BaseMarker = {
    latitude: number;
    longitude: number;
    isOnTheRoute: boolean;
    google_place_id: string;
};
export type AllRouteData = Record<string, BaseMarker>;

type Props = {
    /** Initial markers (e.g., allMarkers) */
    dataArray: BaseMarker[];
    /** Google Maps API key */
    googleMapsApiKey: string;

    initialRegion: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    //fixedStart: { latitude: number; longitude: number };
    //fixedEnd: { latitude: number; longitude: number };
    fixedStart: BaseMarker;
    fixedEnd: BaseMarker;
    defaultMode?: "view" | "add" | "remove";
};

/** Helpers: array <-> record("1","2",...) */
function arrayToRecord(arr: BaseMarker[]): AllRouteData {
    return Object.fromEntries(arr.map((m, i) => [String(i + 1), m]));
}

function recordToArray(rec: AllRouteData): BaseMarker[] {
    return Object.keys(rec)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => rec[k]);
}

export default function RouteMapCaller({
    dataArray,
    googleMapsApiKey,
    initialRegion,
    fixedStart,
    fixedEnd,
    defaultMode = "view",
}: Props) {
    /** Derive initial record from array prop */
    const initialRecord = useMemo(() => arrayToRecord(dataArray), [dataArray]);

    // Keep internal state (same behavior as your App)
    const [routeData, setRouteData] = useState<AllRouteData>(initialRecord);

    // If parent passes a new data object, sync it in
    useEffect(() => {
        setRouteData(arrayToRecord(dataArray));
    }, [dataArray]);

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />
            <RouteMap
                googleMapsApiKey={googleMapsApiKey}
                initialRegion={initialRegion}
                initialData={routeData}
                defaultMode={defaultMode}
                fixedStart={fixedStart}
                fixedEnd={fixedEnd}
            />
        </View>
    );
}