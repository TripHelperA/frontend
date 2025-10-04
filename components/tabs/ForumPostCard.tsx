// components/ForumPostCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ImageBackground,
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type ForumPostCardProps = {
    imageSource: ImageSourcePropType;
    title: string;
    description: string;
    router: Router;
    onPress?: () => void; // ✅ New prop to override press behavior
    colors?: {
        bg: string;
        primary: string;
        primaryDark: string;
        text: string;
        textMuted: string;
        hairline: string;
    };
};

// Default palette (can be overridden via props)
const defaultPalette = {
    bg: "#F8FAFC",
    primary: "#0EA5E9",
    primaryDark: "#0284C7",
    text: "#0F172A",
    textMuted: "#64748B",
    hairline: "rgba(2, 132, 199, 0.12)",
};

const ForumPostCard: React.FC<ForumPostCardProps> = ({
    imageSource,
    title,
    description,
    router,
    onPress, // ✅ destructure here
    colors,
}) => {
    const palette = useMemo(() => colors ?? defaultPalette, [colors]);
    const [pressed, setPressed] = useState(false);

    // ✅ Default behavior if no custom onPress is provided
    const defaultPressHandler = () => {
        router.push({
            pathname: "post-detail",
            params: {
                imageSource:
                    typeof imageSource === "number"
                        ? imageSource.toString()
                        : (imageSource as any)?.uri ?? "",
                title,
                description,
            },
        });
    };

    const handlePress = onPress ?? defaultPressHandler; // ✅ use custom or default

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={({ pressed: p }) => [
                styles.card,
                {
                    transform: [{ scale: p || pressed ? 0.98 : 1 }],
                    borderColor: palette.hairline,
                },
            ]}
        >
            <View style={styles.imageWrapper}>
                <ImageBackground
                    source={imageSource}
                    style={styles.image}
                    imageStyle={styles.imageRadius}
                >
                    {/* Top-left subtle label */}
                    <View style={styles.topRow}>
                        <View
                            style={[
                                styles.badge,
                                { backgroundColor: "rgba(2,132,199,0.14)" },
                            ]}
                        >
                            <Ionicons
                                name="map-outline"
                                size={14}
                                color={palette.primary}
                            />
                            <Text
                                style={[
                                    styles.badgeText,
                                    { color: palette.primary },
                                ]}
                            >
                                Rota
                            </Text>
                        </View>
                    </View>

                    {/* Bottom gradient overlay for text readability */}
                    <LinearGradient
                        colors={[
                            "transparent",
                            "rgba(0,0,0,0.3)",
                            "rgba(0,0,0,0.55)",
                        ]}
                        style={styles.gradient}
                    >
                        <Text style={styles.cardTitle} numberOfLines={2}>
                            {title}
                        </Text>
                        <Text style={styles.cardDesc} numberOfLines={2}>
                            {description}
                        </Text>

                        {/* Right aligned subtle chevron CTA */}
                        <View style={styles.bottomRow}>
                            <View
                                style={[
                                    styles.chevronPill,
                                    {
                                        backgroundColor:
                                            "rgba(255,255,255,0.18)",
                                    },
                                ]}
                            >
                                <Text style={styles.chevronText}>İncele</Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color="#FFFFFF"
                                />
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        backgroundColor: "#FFFFFF",
    },
    imageWrapper: { width: "100%" },
    image: {
        width: "100%",
        aspectRatio: 16 / 9,
        justifyContent: "space-between",
    },
    imageRadius: { borderRadius: 20 },
    topRow: { padding: 12 },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        alignSelf: "flex-start",
        gap: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    gradient: {
        width: "100%",
        paddingHorizontal: 14,
        paddingTop: 28,
        paddingBottom: 14,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    cardTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: 0.2,
    },
    cardDesc: {
        color: "rgba(255,255,255,0.88)",
        fontSize: 13.5,
        marginTop: 4,
    },
    bottomRow: {
        marginTop: 8,
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    chevronPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        gap: 6,
    },
    chevronText: {
        color: "#FFFFFF",
        fontSize: 12.5,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
});

export default ForumPostCard;
