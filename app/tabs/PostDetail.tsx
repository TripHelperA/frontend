// app/post-detail.tsx
import { Ionicons } from "@expo/vector-icons";
import { generateClient } from "aws-amplify/api";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
    ImageBackground,
    ImageSourcePropType,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

const client = generateClient();

const GET_ROUTE = /* GraphQL */ `
  query GetRoute($routeId: ID!) {
    getRoute(routeId: $routeId) {
      routeId
      title
      description
      sharable
      locations {
        latitude
        longitude
        placeId
        isOnTheRoute
      }
    }
  }
`;


const palette = {
    bg: "#F8FAFC",
    primary: "#0EA5E9",
    primaryDark: "#0284C7",
    text: "#0F172A",
    textMuted: "#64748B",
    hairline: "rgba(2,132,199,0.12)",
    card: "rgba(255,255,255,0.92)",
    glassStroke: "rgba(15, 23, 42, 0.06)",
    orange: "#F97316", // new accent color
};

export default function PostDetail() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        routeId?: string;
        title?: string;
        description?: string;
        imageSource?: string;
    }>();

    const imageSource: ImageSourcePropType | undefined = useMemo(() => {
        const raw = params.imageSource ?? "";
        if (!raw) return undefined;
        if (/^\d+$/.test(raw)) return Number(raw);
        return { uri: raw };
    }, [params.imageSource]);

    const readTime = useMemo(() => {
        const words = (params.description ?? "").trim().split(/\s+/).filter(Boolean)
            .length;
        if (!words) return undefined;
        const mins = Math.max(1, Math.round(words / 120));
        return `${mins} min read`;
    }, [params.description]);

    const headerLeft = useMemo(
        () => (
            <Ionicons
                name="arrow-back"
                size={22}
                color="#FFFFFF"
                onPress={() => router.back()}
                style={{ marginLeft: 12 }}
            />
        ),
        [router]
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    title: "Blog",
                    headerShown: true,
                    headerStyle: { backgroundColor: palette.primary },
                    headerTintColor: "#FFFFFF",
                    headerTitleAlign: "center",
                    headerTitleStyle: { fontWeight: "700", letterSpacing: 0.3 },
                    headerLeft: () => headerLeft,
                    headerShadowVisible: false,
                }}
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* HERO */}
                <View style={styles.heroWrap}>
                    {imageSource ? (
                        <ImageBackground source={imageSource} style={styles.heroImage}>
                            <LinearGradient
                                colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.55)"]}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={styles.heroBottom}>
                                <View style={styles.badgeRow}>
                                    {readTime ? (
                                        <View style={styles.badge}>
                                            <Ionicons name="time-outline" size={14} color="#0EA5E9" />
                                            <Text style={styles.badgeText}>{readTime}</Text>
                                        </View>
                                    ) : null}
                                </View>
                                <Text numberOfLines={3} style={styles.heroTitle}>
                                    {params.title ?? "Başlık"}
                                </Text>
                            </View>
                        </ImageBackground>
                    ) : (
                        <View style={[styles.heroImage, styles.imagePlaceholder]}>
                            <Text style={{ color: palette.textMuted }}>No image</Text>
                        </View>
                    )}
                </View>

                {/* FLOATING CARD */}
                <View style={styles.cardWrap}>
                    <View style={styles.card}>
                        {/* Body */}
                        {!!params.description ? (
                            <Text style={styles.desc}>{params.description}</Text>
                        ) : (
                            <Text style={[styles.desc, { fontStyle: "italic", opacity: 0.7 }]}>
                                Henüz açıklama eklenmemiş.
                            </Text>
                        )}

                        {/* Simple Orange Button */}
                        <Pressable
                            onPress={async () => {
                                try {
                                    const routeId =
                                        Array.isArray(params.routeId) ? params.routeId[0] : params.routeId;
                                    if (!routeId) {
                                        alert("Missing routeId");
                                        return;
                                    }

                                    const GET_ROUTE = /* GraphQL */ `
                                    query GetRoute($routeId: ID!) {
                                    getRoute(routeId: $routeId) {
                                        routeId
                                        title
                                        description
                                        locations {
                                        placeId
                                        isOnTheRoute
                                        }
                                    }
                                    }
                                `;

                                    const GET_PLACE_INFO = /* GraphQL */ `
                                    query GetPlaceInfo($input: String!) {
                                    getPlaceInfo(input: $input) {
                                        latitude
                                        longitude
                                    }
                                    }
                                `;

                                    // 1️⃣ Fetch the route
                                    const { data, errors } = await client.graphql({
                                        query: GET_ROUTE,
                                        variables: { routeId },
                                    } as const);
                                    if (errors?.length) throw new Error(errors.map(e => e.message).join("; "));
                                    const route = data?.getRoute;
                                    if (!route?.locations?.length) {
                                        alert("No locations found for this route.");
                                        return;
                                    }

                                    // 2️⃣ Parallelize all getPlaceInfo requests
                                    const results = await Promise.all(
                                        route.locations.map(async (loc: any) => {
                                            try {
                                                const res = await client.graphql({
                                                    query: GET_PLACE_INFO,
                                                    variables: { input: loc.placeId },
                                                });
                                                const info = res?.data?.getPlaceInfo;
                                                return info
                                                    ? {
                                                        latitude: info.latitude,
                                                        longitude: info.longitude,
                                                        isOnTheRoute: loc.isOnTheRoute,
                                                        google_place_id: loc.placeId,
                                                    }
                                                    : null;
                                            } catch (e) {
                                                console.warn("getPlaceInfo failed:", loc.placeId, e);
                                                return null;
                                            }
                                        })
                                    );

                                    // 3️⃣ Filter valid markers
                                    const dataArray = results.filter((x): x is NonNullable<typeof x> => !!x);
                                    if (!dataArray.length) {
                                        alert("Failed to resolve any coordinates.");
                                        return;
                                    }

                                    // 4️⃣ Define map setup
                                    const fixedStart = dataArray[0];
                                    const fixedEnd = dataArray[dataArray.length - 1];
                                    const initialRegion = {
                                        latitude: fixedStart.latitude,
                                        longitude: fixedStart.longitude,
                                        latitudeDelta: 0.25,
                                        longitudeDelta: 0.25,
                                    };

                                    // 5️⃣ Navigate
                                    const encode = (o: unknown) => encodeURIComponent(JSON.stringify(o));
                                    router.push({
                                        pathname: "/tabs/RouteMap",
                                        params: {
                                            dataArray: encode(dataArray),
                                            fixedStart: encode(fixedStart),
                                            fixedEnd: encode(fixedEnd),
                                            initialRegion: encode(initialRegion),
                                        },
                                    });
                                } catch (e: any) {
                                    console.warn("Error loading route:", e);
                                    alert(e?.message ?? "Failed to open route map.");
                                }
                            }}
                            style={styles.orangeButton}
                        >
                            <Text style={styles.orangeButtonText}>Get Route</Text>
                        </Pressable>

                    </View>
                </View>

                {/* Spacer */}
                <View style={{ height: 28 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const HERO_HEIGHT = 270;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.bg },
    scroll: { paddingBottom: 24 },

    heroWrap: {
        width: "100%",
        backgroundColor: "#FFF",
        borderBottomColor: palette.hairline,
        borderBottomWidth: 1,
    },
    heroImage: {
        width: "100%",
        height: HERO_HEIGHT,
    },
    imagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EEF2F7",
    },
    heroBottom: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
    },
    heroTitle: {
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: 0.2,
        lineHeight: 32,
        marginTop: 8,
        textShadowColor: "rgba(0,0,0,0.35)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 8,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: palette.hairline,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: palette.text,
        letterSpacing: 0.2,
    },

    cardWrap: {
        marginTop: -18,
        paddingHorizontal: 16,
    },
    card: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: palette.card,
        borderWidth: 1,
        borderColor: palette.glassStroke,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    desc: {
        fontSize: 16,
        lineHeight: 24,
        color: palette.text,
        marginTop: 4,
        marginBottom: 16,
    },

    orangeButton: {
        backgroundColor: palette.orange,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 4,
    },
    orangeButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.4,
    },
});
