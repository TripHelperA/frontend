import { useEffect, useMemo, useState } from "react";
import { StatusBar, View } from "react-native";
import ShowForumRoute from "./ShowForumRoute.js";

export type BaseMarkerForum = { isOnTheRoute: boolean; google_place_id: string };
export type AllRouteData = Record<string, BaseMarkerForum>;

type Props = {
    /** Array form you provide (e.g., [{...}, {...}, ...]) */
    dataArray: BaseMarkerForum[];

    /** Called with updated array when user edits inside the map */
    onArrayChange?: (nextArray: BaseMarkerForum[]) => void;

    /** Google Maps API key */
    googleMapsApiKey: string;

    /** Map options (same shapes you already use) */
    initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    fixedStart?: { latitude: number; longitude: number };
    fixedEnd?: { latitude: number; longitude: number };

    /** Whatever modes ShowForumRoute supports */
    defaultMode?: "view" | "add" | "remove";
};

/** Helpers: array <-> record("1","2",...) */
function arrayToRecord(arr: BaseMarkerForum[]): AllRouteData {
    return Object.fromEntries(arr.map((m, i) => [String(i + 1), m]));
}

function recordToArray(rec: AllRouteData): BaseMarkerForum[] {
    return Object.keys(rec)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => rec[k]);
}

export default function ShowForumRouteFromArray({
    dataArray,
    googleMapsApiKey,
    initialRegion = {
        latitude: 52.47991,
        longitude: 13.52465,
        latitudeDelta: 2,
        longitudeDelta: 2,
    },
    fixedStart = { latitude: 52.47991, longitude: 13.52465 },
    fixedEnd = { latitude: 53.014194, longitude: 8.761399 },
    defaultMode = "view",
}: Props) {
    /** Derive initial record from array prop */
    const initialRecord = useMemo(() => arrayToRecord(dataArray), [dataArray]);

    /** Keep local record state so ShowForumRoute can update it */
    const [recordData, setRecordData] = useState<AllRouteData>(initialRecord);

    /** If parent replaces array prop, sync local record */
    useEffect(() => {
        setRecordData(arrayToRecord(dataArray));
    }, [dataArray]);

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />
            <ShowForumRoute
                googleMapsApiKey={googleMapsApiKey}
                initialRegion={initialRegion}
                initialData={recordData}   // <- what ShowForumRoute expects
                defaultMode={defaultMode}
                fixedStart={fixedStart}
                fixedEnd={fixedEnd}
            />
        </View>
    );
}