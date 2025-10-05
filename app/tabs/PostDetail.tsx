// app/post-detail.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
    ImageBackground,
    ImageSourcePropType,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

const palette = {
    bg: "#F8FAFC",
    primary: "#0EA5E9",
    primaryDark: "#0284C7",
    text: "#0F172A",
    textMuted: "#64748B",
    hairline: "rgba(2,132,199,0.12)",
    card: "rgba(255,255,255,0.92)",
    glassStroke: "rgba(15, 23, 42, 0.06)",
};

export default function PostDetail() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        title?: string;
        description?: string;
        imageSource?: string; // numeric module id (as string) OR a remote/local uri
    }>();

    // Image source supports both 'numeric-as-string' and 'uri'
    const imageSource: ImageSourcePropType | undefined = useMemo(() => {
        const raw = params.imageSource ?? "";
        if (!raw) return undefined;
        if (/^\d+$/.test(raw)) return Number(raw);
        return { uri: raw };
    }, [params.imageSource]);

    // Quick read-time estimator (200 wpm)
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
                    title: "Gönderi",
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
                                {/* Badges */}
                                <View style={styles.badgeRow}>
                                    {readTime ? (
                                        <View style={styles.badge}>
                                            <Ionicons name="time-outline" size={14} color="#0EA5E9" />
                                            <Text style={styles.badgeText}>{readTime}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Title over the image */}
                                <Text numberOfLines={3} style={styles.heroTitle}>
                                    {params.title ?? "Başlık"}
                                </Text>
                            </View>
                        </ImageBackground>
                    ) : (
                        <View style={[styles.heroImage, styles.imagePlaceholder]}>
                            <Text style={{ color: palette.textMuted }}>Görsel yok</Text>
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

    // HERO
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

    // FLOATING CARD
    cardWrap: {
        marginTop: -18, // pulls card into the hero for a “floating” feel
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

    // Meta row (under title)
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    metaGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: palette.hairline,
        marginHorizontal: 10,
    },
    metaText: {
        fontSize: 13,
        color: palette.textMuted,
        fontWeight: "600",
    },

    // Body text
    desc: {
        fontSize: 16,
        lineHeight: 24,
        color: palette.text,
        marginTop: 4,
    },
});
