import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native";
import RouteMapCaller, { BaseMarker } from "../../components/tabs/RouteMapCaller";

function decodeParam<T>(v?: string | string[]) {
    const s = Array.isArray(v) ? v[0] : v;
    if (!s) return undefined;
    try { return JSON.parse(decodeURIComponent(s)) as T; } catch { return undefined; }
}

export default function RouteMapScreen() {
    const params = useLocalSearchParams<{
        dataArray?: string;
        fixedStart?: string;
        fixedEnd?: string;
        initialRegion?: string;
    }>();

    const dataArray = decodeParam<BaseMarker[]>(params.dataArray) ?? [];
    const fixedStart = decodeParam<BaseMarker>(params.fixedStart) ?? dataArray[0];
    const fixedEnd = decodeParam<BaseMarker>(params.fixedEnd) ?? dataArray[dataArray.length - 1] ?? dataArray[0];

    const initialRegion = decodeParam<{
        latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number;
    }>(params.initialRegion) ?? {
        latitude: fixedStart?.latitude ?? 39.92077,
        longitude: fixedStart?.longitude ?? 32.85411,
        latitudeDelta: 2,
        longitudeDelta: 2,
    };

    const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyB7CZSentLXI1cqLZP8GsxfKqA-5G5qm-k";

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen options={{ title: "Route Map", headerTitleAlign: "center" }} />
            <RouteMapCaller
                dataArray={dataArray}
                googleMapsApiKey={googleMapsApiKey}
                initialRegion={initialRegion}
                fixedStart={fixedStart}
                fixedEnd={fixedEnd}
                defaultMode="view"
            />
        </SafeAreaView>
    );
}
