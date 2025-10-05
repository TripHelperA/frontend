// components/RouteMap.js
import { generateClient } from "aws-amplify/api";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import CustomCallout from "./CustomCallout";
import { openInGoogleMaps } from "./openMap";

/* ---------------- GraphQL: saveLocations ---------------- */
const client = generateClient();

const SAVE_LOCATIONS = /* GraphQL */ `
  mutation SaveLocations($input: LocationSaveInput!) {
    saveLocations(input: $input) {
      routeId
      locations {
        latitude
        longitude
        placeId
        isOnTheRoute
      }
    }
  }
`;

/* ---------------- SaveRouteModal (inline component) ---------------- */
function SaveRouteModal({
    visible,
    onClose,
    allValuesWithEnds,
    defaultTitle = "",
    defaultDescription = "",
    defaultSharable = "PRIVATE", // <-- use "PUBLIC" | "PRIVATE"
    onSuccess,
}) {
    const [title, setTitle] = useState(defaultTitle);
    const [description, setDescription] = useState(defaultDescription);
    const [sharable, setSharable] = useState(defaultSharable); // "PUBLIC" | "PRIVATE"
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (visible) {
            setTitle(defaultTitle);
            setDescription(defaultDescription);
            setSharable(defaultSharable);
            setErrorMsg(null);
            setSubmitting(false);
        }
    }, [visible, defaultTitle, defaultDescription, defaultSharable]);

    const locationsInput = useMemo(() => {
        return (allValuesWithEnds ?? []).map((m) => ({
            placeId: m.google_place_id ?? m.placeId ?? "unknown_place",
            isOnTheRoute: typeof m.isOnTheRoute === "boolean" ? m.isOnTheRoute : true,
            latitude: m.latitude,
            longitude: m.longitude,
        }));
    }, [allValuesWithEnds]);

    const canSubmit =
        title.trim().length > 0 && locationsInput.length >= 2 && !submitting;

    const handleDone = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setErrorMsg(null);

        try {
            // Map PUBLIC → "true", PRIVATE → "false"
            const sharableValue = sharable === "PUBLIC" ? "true" : "false";

            const { data } = await client.graphql({
                query: SAVE_LOCATIONS,
                variables: {
                    input: {
                        title: title.trim(),
                        description: (description || "").trim() || null,
                        sharable: sharableValue,
                        locations: locationsInput, // [{ placeId, isOnTheRoute, latitude, longitude }]
                    },
                },
            });

            const routeId = data?.saveLocations?.routeId;
            if (routeId) onSuccess?.(routeId);
            onClose();
        } catch (e) {
            console.error("saveLocations error:", e);
            const msg = e?.errors?.[0]?.message || e?.message || "Failed to save route.";
            setErrorMsg(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={modalStyles.backdrop}>
                <View style={modalStyles.card}>
                    <Text style={modalStyles.title}>Give a Title to Your Route</Text>

                    <TextInput
                        placeholder="e.g., Ankara → İstanbul Day Trip"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={title}
                        onChangeText={setTitle}
                        style={modalStyles.input}
                        autoFocus
                    />

                    <TextInput
                        placeholder="Description (optional)"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={description}
                        onChangeText={setDescription}
                        style={[modalStyles.input, modalStyles.inputMultiline]}
                        multiline
                        numberOfLines={3}
                    />

                    {/* Toggle strictly between PUBLIC and PRIVATE */}
                    <Pressable
                        onPress={() => setSharable((s) => (s === "PRIVATE" ? "PUBLIC" : "PRIVATE"))}
                        style={modalStyles.toggle}
                    >
                        <Text style={modalStyles.toggleText}>Visibility: {sharable}</Text>
                    </Pressable>

                    {errorMsg ? <Text style={modalStyles.error}>{errorMsg}</Text> : null}

                    <View style={modalStyles.actions}>
                        <Pressable
                            style={[modalStyles.btn, modalStyles.btnGhost]}
                            onPress={onClose}
                            disabled={submitting}
                        >
                            <Text style={modalStyles.btnText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                modalStyles.btn,
                                canSubmit ? modalStyles.btnPrimary : modalStyles.btnDisabled,
                            ]}
                            onPress={handleDone}
                            disabled={!canSubmit}
                        >
                            {submitting ? (
                                <ActivityIndicator />
                            ) : (
                                <Text style={modalStyles.btnText}>Done</Text>
                            )}
                        </Pressable>
                    </View>

                    <Text style={modalStyles.hint}>
                        {locationsInput.length} stops will be saved (including start and end).
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

/* ---------------- Main Map Component ---------------- */
export default function RouteMap({
    googleMapsApiKey,
    initialRegion,
    initialData,
    showControls = true,
    defaultMode = "view",
    fixedStart,
    fixedEnd,
}) {
    const mapRef = useRef(null);

    const [saveVisible, setSaveVisible] = useState(false);

    const [allRouteData, setAllRouteData] = useState(initialData ?? {});
    useEffect(() => {
        if (initialData) setAllRouteData(initialData);
    }, [initialData]);

    const [mode, setMode] = useState(defaultMode);
    const [selectedId, setSelectedId] = useState(null);
    const [loading] = useState(false);

    const allValuesWithEnds = useMemo(() => {
        const mids = Object.entries(allRouteData)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([, v]) => v);

        return [
            ...(fixedStart?.latitude && fixedStart?.longitude ? [{ ...fixedStart }] : []),
            ...mids,
            ...(fixedEnd?.latitude && fixedEnd?.longitude ? [{ ...fixedEnd }] : []),
        ];
    }, [allRouteData, fixedStart, fixedEnd]);

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
            .map(([id, v]) => ({
                id,
                latitude: v.latitude,
                longitude: v.longitude,
                isOnTheRoute: true,
                google_place_id: v.google_place_id,
            }));
    }, [allRouteData]);

    const suggestedMarkers = useMemo(() => {
        return Object.entries(allRouteData)
            .filter(([, v]) => v.isOnTheRoute === false)
            .sort(sortNumericByKey)
            .map(([id, v]) => ({
                id,
                latitude: v.latitude,
                longitude: v.longitude,
                isOnTheRoute: true,
                google_place_id: v.google_place_id,
            }));
    }, [allRouteData]);

    const onPressGreen = (m) => {
        if (mode === "remove") {
            safeFlip(() => {
                setAllRouteData((prev) => {
                    const item = prev[m.id];
                    if (!item || !item.isOnTheRoute) return prev;
                    return { ...prev, [m.id]: { ...item, isOnTheRoute: false } };
                });
            });
            setSelectedId(null);
        } else {
            setSelectedId(m.id);
        }
    };

    const onPressRed = (m) => {
        if (mode === "add") {
            safeFlip(() => {
                setAllRouteData((prev) => {
                    const item = prev[m.id];
                    if (!item || item.isOnTheRoute) return prev;
                    return { ...prev, [m.id]: { ...item, isOnTheRoute: true } };
                });
            });
            setSelectedId(m.id);
        } else {
            setSelectedId(m.id);
        }
    };

    const routePoints = useMemo(() => {
        const mids = markers.map((m) => ({
            latitude: m.latitude,
            longitude: m.longitude,
            isOnTheRoute: m.isOnTheRoute,
            google_place_id: m.google_place_id,
        }));
        const pts = [];
        if (fixedStart?.latitude && fixedStart?.longitude) pts.push(fixedStart);
        pts.push(...mids);
        if (fixedEnd?.latitude && fixedEnd?.longitude) pts.push(fixedEnd);
        return pts;
    }, [fixedStart, fixedEnd, markers]);

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
                {fixedStart?.latitude && fixedStart?.longitude && (
                    <Marker coordinate={fixedStart} pinColor="blue" tracksViewChanges={false}>
                        <Callout>
                            <Text>Start</Text>
                        </Callout>
                    </Marker>
                )}

                {fixedEnd?.latitude && fixedEnd?.longitude && (
                    <Marker coordinate={fixedEnd} pinColor="blue" tracksViewChanges={false}>
                        <Callout>
                            <Text>End</Text>
                        </Callout>
                    </Marker>
                )}

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

                    <View style={styles.row}>
                        <ControlButton
                            title="Open in Maps"
                            onPress={() => openInGoogleMaps(routePoints)}
                            disabled={routePoints.length < 2}
                            style={styles.openBtn}
                        />

                        <ControlButton
                            title="Save Route"
                            onPress={() => setSaveVisible(true)}
                            disabled={allValuesWithEnds.length < 2}
                            style={styles.openBtn}
                        />
                    </View>
                </View>
            )}

            <SaveRouteModal
                visible={saveVisible}
                onClose={() => setSaveVisible(false)}
                allValuesWithEnds={allValuesWithEnds}
                defaultTitle=""
                defaultDescription=""
                defaultSharable="PRIVATE"  // <-- fixed here
                onSuccess={(routeId) => {
                    Alert.alert("Saved 🎉", `Route saved with id: ${routeId}`);
                }}
            />
        </View>
    );
}

/* ---------------- Styles ---------------- */
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
    rowBtn: { flex: 1 },
    openBtn: { alignSelf: "center", minWidth: 180 },
});

const modalStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        padding: 18,
    },
    card: {
        width: "100%",
        maxWidth: 520,
        backgroundColor: "#121212",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#fff",
        marginBottom: 10,
    },
    inputMultiline: { textAlignVertical: "top" },
    toggle: {
        paddingVertical: 8,
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        marginBottom: 10,
    },
    toggleText: { color: "#fff", fontWeight: "600" },
    error: { color: "#fca5a5", marginBottom: 8 },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    btn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        minWidth: 100,
    },
    btnGhost: { borderColor: "rgba(255,255,255,0.4)" },
    btnPrimary: { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.12)" },
    btnDisabled: { opacity: 0.6, borderColor: "rgba(255,255,255,0.25)" },
    btnText: { color: "#fff", fontWeight: "700" },
    hint: {
        marginTop: 10,
        color: "rgba(255,255,255,0.75)",
        fontSize: 12,
    },
});
