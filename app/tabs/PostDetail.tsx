// app/post-detail.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
    Image,
    ImageSourcePropType,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const palette = {
    bg: "#F8FAFC",
    primary: "#0EA5E9",
    primaryDark: "#0284C7",
    text: "#0F172A",
    textMuted: "#64748B",
    hairline: "rgba(2,132,199,0.12)",
};

export default function PostDetail() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        title?: string;
        description?: string;
        imageSource?: string; // can be a numeric module id (as string) OR a remote/local uri
    }>();

    // Build an Image source that supports both 'numeric-as-string' and 'uri'
    const imageSource: ImageSourcePropType | undefined = useMemo(() => {
        const raw = params.imageSource ?? "";
        if (!raw) return undefined;

        // If it's a number serialized as string (e.g., "123"), convert back to number for <Image source={number} />
        if (/^\d+$/.test(raw)) {
            return Number(raw);
        }
        // Otherwise treat as URI
        return { uri: raw };
    }, [params.imageSource]);

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

            <ScrollView contentContainerStyle={styles.content}>
                {/* Top image */}
                <View style={styles.imageWrap}>
                    {imageSource ? (
                        <Image source={imageSource} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.image, styles.imagePlaceholder]}>
                            <Text style={{ color: palette.textMuted }}>Görsel yok</Text>
                        </View>
                    )}
                </View>

                {/* Title + description */}
                <View style={styles.body}>
                    <Text style={styles.title}>{params.title ?? "Başlık"}</Text>
                    {!!params.description && (
                        <Text style={styles.desc}>{params.description}</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.bg },
    content: { paddingBottom: 28 },
    imageWrap: {
        width: "100%",
        backgroundColor: "#FFF",
        borderBottomColor: palette.hairline,
        borderBottomWidth: 1,
    },
    image: {
        width: "100%",
        aspectRatio: 16 / 9, // keeps a nice banner ratio on top
    },
    imagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EEF2F7",
    },
    body: {
        paddingHorizontal: 18,
        paddingTop: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: palette.text,
        marginBottom: 8,
    },
    desc: {
        fontSize: 15,
        lineHeight: 22,
        color: palette.textMuted,
    },
});
