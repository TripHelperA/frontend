// components/RouteMap.js
import { generateClient } from "aws-amplify/api";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
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

/* ---------------- GraphQL ---------------- */
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

const GET_PLACE_INFO = /* GraphQL */ `
  query GetPlaceInfo($placeId: String!) {
    getPlaceInfo(input: $placeId) {
      title
      latitude
      longitude
      rating
      description
      photoURL
      reviews {
        authorName
        rating
        text
        relativeTime
      }
      # optionally supported by your backend:
      # url
      # website
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
    defaultSharable = "PRIVATE",
    onSuccess,
}) {
    const [title, setTitle] = useState(defaultTitle);
    const [description, setDescription] = useState(defaultDescription);
    const [sharable, setSharable] = useState(defaultSharable);
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
            const sharableValue = sharable === "PUBLIC" ? "true" : "false";
            const { data } = await client.graphql({
                query: SAVE_LOCATIONS,
                variables: {
                    input: {
                        title: title.trim(),
                        description: (description || "").trim() || null,
                        sharable: sharableValue,
                        locations: locationsInput,
                    },
                },
            });

            const routeId = data?.saveLocations?.routeId;
            if (routeId) onSuccess?.(routeId);
            onClose();
        } catch (e) {
            console.error("saveLocations error:", e);
            const msg =
                e?.errors?.[0]?.message || e?.message || "Failed to save route.";
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
    showSave,
    googleMapsApiKey = "AIzaSyB7CZSentLXI1cqLZP8GsxfKqA-5G5qm-k",
    initialRegion,
    initialData,
    showControls = true,
    defaultMode = "view",
    fixedStart, // { latitude, longitude, isOnTheRoute?, google_place_id? }
    fixedEnd,   // { latitude, longitude, isOnTheRoute?, google_place_id? }
}) {
    const mapRef = useRef(null);

    /* Save modal */
    const [saveVisible, setSaveVisible] = useState(false);

    /* View panel state */
    const [placePanelVisible, setPlacePanelVisible] = useState(false);
    const [placePanelLoading, setPlacePanelLoading] = useState(false);
    const [placePanelError, setPlacePanelError] = useState(null);
    const [placePanelData, setPlacePanelData] = useState(null);

    /* Route data */
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
                isOnTheRoute: true, // visual pin kept interactive but logically "suggested"
                google_place_id: v.google_place_id,
            }));
    }, [allRouteData]);

    /* -------- View panel loaders -------- */
    const fetchPlaceInfo = async (placeId) => {
        const { data } = await client.graphql({
            query: GET_PLACE_INFO,
            variables: { placeId },
        });
        return data?.getPlaceInfo ?? null;
    };

    const openPlacePanelForId = async (id) => {
        const m = allRouteData?.[id];
        if (!m || !m.google_place_id) {
            setPlacePanelData(null);
            setPlacePanelError("No place id found for this marker.");
            setPlacePanelVisible(true);
            return;
        }

        setSelectedId(id);
        setPlacePanelVisible(true);
        setPlacePanelLoading(true);
        setPlacePanelError(null);

        try {
            const info = await fetchPlaceInfo(m.google_place_id);
            setPlacePanelData(info);
        } catch (e) {
            console.error("getPlaceInfo error:", e);
            const msg =
                e?.errors?.[0]?.message || e?.message || "Failed to fetch place info.";
            setPlacePanelError(msg);
            setPlacePanelData(null);
        } finally {
            setPlacePanelLoading(false);
        }
    };

    const openPlacePanelForFixed = async (fixedObj) => {
        // Only acts in VIEW mode; otherwise no-op (immune to add/remove)
        if (mode !== "view") return;
        if (!fixedObj?.google_place_id) {
            setPlacePanelVisible(true);
            setPlacePanelData(null);
            setPlacePanelError("No place id found for this marker.");
            return;
        }
        setPlacePanelVisible(true);
        setPlacePanelLoading(true);
        setPlacePanelError(null);
        try {
            const info = await fetchPlaceInfo(fixedObj.google_place_id);
            setPlacePanelData(info);
        } catch (e) {
            console.error("getPlaceInfo error:", e);
            setPlacePanelError(e?.message || "Failed to fetch place info.");
            setPlacePanelData(null);
        } finally {
            setPlacePanelLoading(false);
        }
    };

    /* -------- Marker presses (MIDs only) -------- */
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
        } else if (mode === "view") {
            openPlacePanelForId(m.id);
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
        } else if (mode === "view") {
            openPlacePanelForId(m.id);
        } else {
            setSelectedId(m.id);
        }
    };

    /* -------- Polyline points -------- */
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

    /* -------- Reusable button with stronger feedback -------- */
    const ControlButton = ({ title, onPress, disabled, active, style }) => (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.btn,
                active && styles.btnActive,
                disabled && styles.btnDisabled,
                (pressed && !disabled) && styles.btnPressedStrong, // ⬅️ stronger pressed feedback
                style,
            ]}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
            <Text
                style={[styles.btnText, active && styles.btnTextActive, (disabled ? styles.btnTextDisabled : null)]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                maxFontSizeMultiplier={1.2}
            >
                {title}
            </Text>
        </Pressable>
    );

    /* -------- Helpers -------- */
    const getPrimaryUrl = (d) => d?.url || d?.website || d?.photoURL || null;

    const handleOpenUrl = async (rawUrl) => {
        if (!rawUrl) return;
        try {
            const supported = await Linking.canOpenURL(rawUrl);
            if (supported) await Linking.openURL(rawUrl);
        } catch (e) {
            console.warn("openURL error:", e);
            Alert.alert("Couldn't open link");
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation
            >
                {/* Fixed START (blue, immune to add/remove; viewable in View mode) */}
                {fixedStart?.latitude && fixedStart?.longitude && (
                    <Marker
                        coordinate={fixedStart}
                        pinColor="#1E90FF" // dodger blue
                        tracksViewChanges={false}
                        onPress={() => openPlacePanelForFixed(fixedStart)} // only acts in view mode
                    >
                        <Callout>
                            <Text>Start</Text>
                        </Callout>
                    </Marker>
                )}

                {/* Fixed END (blue, immune to add/remove; viewable in View mode) */}
                {fixedEnd?.latitude && fixedEnd?.longitude && (
                    <Marker
                        coordinate={fixedEnd}
                        pinColor="#1E90FF"
                        tracksViewChanges={false}
                        onPress={() => openPlacePanelForFixed(fixedEnd)} // only acts in view mode
                    >
                        <Callout>
                            <Text>End</Text>
                        </Callout>
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

                {/* Directions polyline */}
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

            {/* Controls */}
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
                            active={false}
                        />

                        <ControlButton
                            title="Save Route"
                            onPress={() => setSaveVisible(true)}
                            disabled={allValuesWithEnds.length < 2}
                            style={styles.openBtn}
                            active={false}
                        />
                    </View>
                </View>
            )}

            {/* ---- View Panel ---- */}
            {placePanelVisible && (
                <View style={viewPanelStyles.wrapper}>
                    <View style={viewPanelStyles.card}>
                        {/* Small PHOTO at the top */}
                        {!placePanelError && !placePanelLoading && placePanelData?.photoURL ? (
                            <Pressable
                                onPress={() => handleOpenUrl(getPrimaryUrl(placePanelData))}
                                style={viewPanelStyles.photoWrap}
                                android_ripple={{ color: "rgba(255,255,255,0.12)" }}
                            >
                                <Image
                                    source={{ uri: placePanelData.photoURL }}
                                    style={viewPanelStyles.photo}
                                    resizeMode="cover"
                                />
                            </Pressable>
                        ) : null}

                        {/* Header */}
                        <View style={viewPanelStyles.headerRow}>
                            <Text style={viewPanelStyles.headerText}>
                                {placePanelLoading
                                    ? "Loading place info..."
                                    : placePanelData?.title || "Place details"}
                            </Text>
                            <Pressable
                                onPress={() => setPlacePanelVisible(false)}
                                style={viewPanelStyles.closeBtn}
                            >
                                <Text style={viewPanelStyles.closeText}>✕</Text>
                            </Pressable>
                        </View>

                        {placePanelError ? (
                            <Text style={viewPanelStyles.error}>{placePanelError}</Text>
                        ) : placePanelLoading ? (
                            <ActivityIndicator />
                        ) : placePanelData ? (
                            <View style={{ gap: 6 }}>
                                {typeof placePanelData.rating === "number" && (
                                    <Text style={viewPanelStyles.rating}>
                                        Rating: {placePanelData.rating.toFixed(1)}
                                    </Text>
                                )}

                                {placePanelData.description ? (
                                    <Text numberOfLines={3} style={viewPanelStyles.desc}>
                                        {placePanelData.description}
                                    </Text>
                                ) : null}

                                {Array.isArray(placePanelData.reviews) &&
                                    placePanelData.reviews.length > 0 ? (
                                    <View style={{ marginTop: 6 }}>
                                        <Text style={viewPanelStyles.subhead}>Top review</Text>
                                        <Text style={viewPanelStyles.reviewAuthor}>
                                            {placePanelData.reviews[0]?.authorName || "Anonymous"}
                                            {placePanelData.reviews[0]?.rating != null
                                                ? ` • ${placePanelData.reviews[0].rating.toFixed(1)}★`
                                                : ""}
                                            {placePanelData.reviews[0]?.relativeTime
                                                ? ` • ${placePanelData.reviews[0].relativeTime}`
                                                : ""}
                                        </Text>
                                        <Text numberOfLines={4} style={viewPanelStyles.reviewText}>
                                            {placePanelData.reviews[0]?.text || ""}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        ) : (
                            <Text style={viewPanelStyles.desc}>No details available.</Text>
                        )}
                    </View>
                </View>
            )}

            {/* Save Route Modal */}
            <SaveRouteModal
                visible={saveVisible}
                onClose={() => setSaveVisible(false)}
                allValuesWithEnds={allValuesWithEnds}
                defaultTitle=""
                defaultDescription=""
                defaultSharable="PRIVATE"
                onSuccess={(routeId) => {
                    Alert.alert("Route Saved 🎉");
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
    btnTextActive: { color: "#fff" },
    btnTextDisabled: { color: "rgba(255,255,255,0.6)" },

    // Clear active highlight (thicker border + subtle fill)
    btnActive: {
        borderColor: "#fff",
        backgroundColor: "rgba(255,255,255,0.16)",
    },

    // Stronger pressed feedback so you feel the tap
    btnPressedStrong: {
        backgroundColor: "rgba(255,255,255,0.24)",
        borderColor: "#fff",
        borderWidth: 1.5,
    },

    btnDisabled: {
        opacity: 0.65,
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
    hint: { marginTop: 10, color: "rgba(255,255,255,0.75)", fontSize: 12 },
});

const viewPanelStyles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 20,
        paddingHorizontal: 12,
    },
    card: {
        backgroundColor: "rgba(18,18,18,0.95)",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    // thumbnail
    photoWrap: {
        alignSelf: "flex-start",
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        marginBottom: 6,
    },
    photo: {
        width: 120,
        height: 72,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    headerText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    closeBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    closeText: { color: "#fff", fontWeight: "800" },
    rating: { color: "#fff" },
    desc: { color: "rgba(255,255,255,0.9)" },
    subhead: { color: "#fff", fontWeight: "700", marginBottom: 2, marginTop: 2 },
    reviewAuthor: { color: "rgba(255,255,255,0.8)", marginBottom: 2 },
    reviewText: { color: "rgba(255,255,255,0.85)" },
    error: { color: "#fca5a5" },
});
