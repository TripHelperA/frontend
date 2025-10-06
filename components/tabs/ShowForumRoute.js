// components/RouteMap.js
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import CustomCallout from "./CustomCallout";
import { openInGoogleMaps } from "./openMap";

export default function ShowForumRoute({
    googleMapsApiKey,
    initialRegion,
    initialData,
    showControls = true,
    defaultMode = "view",
    fixedStart,   // { latitude, longitude }
    fixedEnd,     // { latitude, longitude }
    //onChange
}) {
    const mapRef = useRef(null);

    const [allRouteData, setAllRouteData] = useState(initialData ?? []);
    useEffect(() => {
        if (initialData) setAllRouteData(initialData);
    }, [initialData]);

    const [mode, setMode] = useState(defaultMode);
    const [selectedId, setSelectedId] = useState(null);
    const [loading] = useState(false);

    const pressLock = useRef(false);
    const safeFlip = (fn) => {
        if (pressLock.current) return;
        pressLock.current = true;
        fn();
        setTimeout(() => {
            pressLock.current = false;
        }, 200);
    };

    const sortNumericByKey = (a, b) => Number(a[0]) - Number(b[0]);

    const markers = useMemo(() => {
        return Object.entries(allRouteData)
            .filter(([, v]) => v.isOnTheRoute)
            .sort(sortNumericByKey)
            .map(([id, v]) => ({ id, isOnTheRoute: true, google_place_id: v.google_place_id }));
    }, [allRouteData]);

    const suggestedMarkers = useMemo(() => {
        return Object.entries(allRouteData)
            .filter(([, v]) => v.isOnTheRoute === false)
            .sort(sortNumericByKey)
            .map(([id, v]) => ({ id, isOnTheRoute: true, google_place_id: v.google_place_id }));
    }, [allRouteData]);

    const selected = selectedId ? allRouteData[selectedId] : null;

    const addFromSuggested = (id) =>
        setAllRouteData((prev) => {
            const m = prev[id];
            if (!m || m.isOnTheRoute) return prev;
            const next = { ...prev, [id]: { ...m, isOnTheRoute: true } };
            //onChange?.(next);
            return next;
        });

    const removeFromRoute = (id) =>
        setAllRouteData((prev) => {
            const m = prev[id];
            if (!m || !m.isOnTheRoute) return prev;
            const next = { ...prev, [id]: { ...m, isOnTheRoute: false } };
            //onChange?.(next);
            return next;
        });

    const onPressGreen = (m) => {
        if (mode === "remove") {
            safeFlip(() => removeFromRoute(m.id));
            setSelectedId(null);
        } else {
            setSelectedId(m.id);
        }
    };

    const onPressRed = (m) => {
        if (mode === "add") {
            safeFlip(() => addFromSuggested(m.id));
            setSelectedId(m.id);
        } else {
            setSelectedId(m.id);
        }
    };

    // Build full route points: [fixedStart] + route markers + [fixedEnd]
    const routePoints = useMemo(() => {
        const mids = markers.map((m) => ({ latitude: m.latitude, longitude: m.longitude, isOnTheRoute: m.isOnTheRoute, google_place_id: m.google_place_id }));
        const pts = [];
        if (fixedStart?.latitude && fixedStart?.longitude) pts.push(fixedStart);
        pts.push(...mids);
        if (fixedEnd?.latitude && fixedEnd?.longitude) pts.push(fixedEnd);
        return pts;
    }, [fixedStart, fixedEnd, markers]);

    // ---- Reusable pretty button (transparent bg + border) ----
    const ControlButton = ({ title, onPress, disabled, active, style }) => (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.btn,
                active && styles.btnActive,
                disabled && styles.btnDisabled,
                pressed && !disabled && styles.btnPressed,
                style,
            ]}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
        >
            <Text
                style={styles.btnText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                maxFontSizeMultiplier={1.2}
            >
                {title}
            </Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation
            >
                {/* Fixed START (blue) */}
                {fixedStart?.latitude && fixedStart?.longitude && (
                    <Marker
                        coordinate={fixedStart}
                        pinColor="blue"
                        tracksViewChanges={false}
                    >
                        <Callout><Text>Start</Text></Callout>
                    </Marker>
                )}

                {/* Fixed END (blue) */}
                {fixedEnd?.latitude && fixedEnd?.longitude && (
                    <Marker
                        coordinate={fixedEnd}
                        pinColor="blue"
                        tracksViewChanges={false}
                    >
                        <Callout><Text>End</Text></Callout>
                    </Marker>
                )}

                {/* On-route markers (green) */}
                {markers.map((m) => (
                    <Marker
                        key={`r-${m.id}`}
                        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                        pinColor="green"
                        onPress={() => onPressGreen(m)}
                    >
                        <Callout>
                            <CustomCallout id={m.id} />
                        </Callout>
                    </Marker>
                ))}

                {/* Suggested markers (red) */}
                {suggestedMarkers.map((m) => (
                    <Marker
                        key={`s-${m.id}`}
                        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                        pinColor="red"
                        onPress={() => onPressRed(m)}
                    >
                        <Callout>
                            <CustomCallout id={m.id} />
                        </Callout>
                    </Marker>
                ))}

                {/* Directions: use [fixedStart] + markers + [fixedEnd] */}
                {routePoints.length > 1 && (
                    <MapViewDirections
                        origin={routePoints[0]}
                        destination={routePoints[routePoints.length - 1]}
                        waypoints={routePoints.slice(1, -1)}
                        apikey={googleMapsApiKey}
                        strokeWidth={3}
                        strokeColor="hotpink"
                    />
                )}
            </MapView>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" />
                </View>
            )}

            {showControls && (
                <View style={styles.controls}>
                    {/* Row 1: Add  View  Remove */}
                    <View style={styles.row}>
                        <ControlButton
                            title="Add"
                            onPress={() => setMode("add")}
                            disabled={loading || mode === "add"}
                            active={mode === "add"}
                            style={styles.rowBtn}
                        />
                        <ControlButton
                            title="View"
                            onPress={() => setMode("view")}
                            disabled={loading || mode === "view"}
                            active={mode === "view"}
                            style={styles.rowBtn}
                        />
                        <ControlButton
                            title="Remove"
                            onPress={() => setMode("remove")}
                            disabled={loading || mode === "remove"}
                            active={mode === "remove"}
                            style={styles.rowBtn}
                        />
                    </View>

                    {/* Row 2: centered "Open in Maps" */}
                    <View style={styles.row}>
                        <ControlButton
                            title="Open in Maps"
                            onPress={() => openInGoogleMaps(routePoints)}
                            disabled={routePoints.length < 2}
                            style={styles.openBtn}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },

    /* --- Controls container at bottom --- */
    controls: {
        position: "absolute",
        bottom: 40,
        left: 12,
        right: 12,
        gap: 10,
        padding: 10,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.25)",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },

    /* Buttons */
    btn: {
        flexShrink: 1,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.8)",
        backgroundColor: "transparent",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        minWidth: 90,
        alignItems: "center",
        justifyContent: "center",
    },
    btnText: {
        color: "#fff",
        fontWeight: "700",
        letterSpacing: 0.2,
        includeFontPadding: false,
    },
    btnActive: {
        borderColor: "#fff",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    btnDisabled: {
        opacity: 0.6,
    },
    btnPressed: {
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    rowBtn: {
        flex: 1,
    },
    openBtn: {
        alignSelf: "center",
        minWidth: 180,
    },
});