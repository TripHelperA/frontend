// components/ForumContent.tsx
import { Ionicons } from "@expo/vector-icons";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import * as ImagePicker from "expo-image-picker";
import { Router, Stack } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ImageSourcePropType,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import {
    GENERATE_SIGNED_URL,
    GET_SHARABLE_ROUTES,
    GET_USER_ROUTES,
    UPDATE_ROUTE
} from "../../graphql/forum";
import ForumPostCard from "./ForumPostCard";

// ---------- Types ----------
type ForumPost = {
    id: string;
    image: ImageSourcePropType;
    title: string;
    description: string;
};

type ForumContentProps = {
    router: Router;
};

type RouteRecord = {
    routeId: string;
    title: string;
    description?: string | null;
    sharable: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    locations?: {
        placeId: string;
        isOnTheRoute: boolean;
        latitude?: number | null;
        longitude?: number | null;
    }[];
};

const client = generateClient();

// Central palette
const palette = {
    bg: "#F8FAFC",
    primary: "#0EA5E9",
    primaryDark: "#0284C7",
    text: "#0F172A",
    textMuted: "#64748B",
    hairline: "rgba(2, 132, 199, 0.12)",
};

const ForumContent: React.FC<ForumContentProps> = ({ router }) => {
    // Main forum posts (already sharable)
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errText, setErrText] = useState<string | null>(null);
    const [details, setDetails] = useState("");

    // Modal state
    const [addOpen, setAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Picker state (user’s non-sharable routes)
    const [myRoutesLoading, setMyRoutesLoading] = useState(false);
    const [myNonSharable, setMyNonSharable] = useState<RouteRecord[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

    // Optional cover image for the selected route
    const [imageUri, setImageUri] = useState<string | null>(null);

    // Header buttons
    const headerLeft = useMemo(
        () => (
            <Ionicons
                name="arrow-back"
                size={22}
                color="#FFFFFF"
                onPress={() => router.replace("/tabs/Home")}
                style={{ marginLeft: 12 }}
            />
        ),
        [router]
    );

    const headerRight = useMemo(
        () => (
            <View style={{ flexDirection: "row", marginRight: 8 }}>
                <Ionicons
                    name="search"
                    size={22}
                    color="#FFFFFF"
                    style={{ marginRight: 16 }}
                    onPress={() => {
                        // TODO: search action
                    }}
                />
                <Ionicons
                    name="add"
                    size={22}
                    color="#FFFFFF"
                    onPress={async () => {
                        setAddOpen(true);
                        // Load user’s non-sharable routes when opening the modal
                        setSelectedRouteId(null);
                        setImageUri(null);
                        await loadMyNonSharableRoutes();
                    }}
                />
            </View>
        ),
        []
    );

    // Load forum (sharable) routes and attach signed view URLs
    const loadRoutes = async () => {
        setLoading(true);
        setErrText(null);
        try {
            const { data, errors } = await client.graphql({ query: GET_SHARABLE_ROUTES });
            if (errors?.length) throw new Error(errors.map((e: any) => e.message).join("; "));

            const routes = (data?.getAllRoutes ?? []) as RouteRecord[];

            const withImages = await Promise.all(
                routes.map(async (r) => {
                    try {
                        const res = await client.graphql({
                            query: GENERATE_SIGNED_URL,
                            variables: { type: "route", id: r.routeId, mode: "view" },
                        });
                        const url = res?.data?.generateSignedUrl?.url as string | undefined;
                        return {
                            id: r.routeId,
                            title: r.title,
                            description: r.description ?? "",
                            image: url
                                ? { uri: url }
                                : require("../../assets/backgrounds/background1.jpg"),
                        } as ForumPost;
                    } catch {
                        return {
                            id: r.routeId,
                            title: r.title,
                            description: r.description ?? "",
                            image: require("../../assets/backgrounds/background1.jpg"),
                        } as ForumPost;
                    }
                })
            );

            setPosts(withImages);
        } catch (e: any) {
            console.warn("Forum load error:", e);
            setErrText(e?.message ?? "Failed to load routes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoutes();
    }, []);

    // Load current user's non-sharable routes
    const loadMyNonSharableRoutes = async () => {
        setMyRoutesLoading(true);
        try {
            const { userId } = await getCurrentUser(); // Cognito sub
            const { data, errors } = await client.graphql({
                query: GET_USER_ROUTES,
                variables: { userId },
            });
            if (errors?.length) throw new Error(errors.map((e: any) => e.message).join("; "));

            const mine = (data?.getUserRoutes ?? []) as RouteRecord[];
            // We consider "not sharable" as anything not equal to "true"
            const nonSharable = mine.filter((r) => (r.sharable ?? "").toLowerCase() !== "true");
            setMyNonSharable(nonSharable);
        } catch (e) {
            console.warn("Load my routes error:", e);
            setMyNonSharable([]);
        } finally {
            setMyRoutesLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Gallery permission is required.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
        });

        if (!result.canceled && result.assets?.length) {
            setImageUri(result.assets[0].uri);
        }
    };
    const closeModal = () => {
        if (!submitting) {
            setAddOpen(false);
            setSelectedRouteId(null);
            setImageUri(null);
            setDetails(""); // ← reset details so it doesn’t leak to next time
        }
    };

    // Make selected route sharable = "true" and optionally upload cover
    const handlePublishToForum = async () => {
        if (!selectedRouteId) {
            alert("Please select a route.");
            return;
        }

        const selected = myNonSharable.find((r) => r.routeId === selectedRouteId);
        if (!selected) {
            alert("Selected route not found.");
            return;
        }

        setSubmitting(true);
        try {
            // 1) Upload cover first (optional)
            if (imageUri) {
                const urlRes = await client.graphql({
                    query: GENERATE_SIGNED_URL,
                    variables: { type: "route", id: selected.routeId, mode: "upload" },
                });
                const putUrl = urlRes?.data?.generateSignedUrl?.url as string | undefined;
                if (putUrl) {
                    const imgResp = await fetch(imageUri);
                    const blob = await imgResp.blob();
                    const contentType = blob.type || "image/jpeg";
                    await fetch(putUrl, {
                        method: "PUT",
                        headers: { "Content-Type": contentType },
                        body: blob,
                    });
                }
            }

            // 2) Update route sharable -> "true"
            const locationsInput =
                selected.locations?.map((l) => ({
                    placeId: l.placeId,
                    isOnTheRoute: l.isOnTheRoute,
                })) ?? [];

            // Use the details from the modal (already prefilled when user selects a route)
            const descriptionToSave = details;

            await client.graphql({
                query: UPDATE_ROUTE,
                variables: {
                    routeId: selected.routeId,
                    input: {
                        title: selected.title,
                        description: details.trim() !== "" ? details.trim() : (selected.description ?? ""),
                        sharable: "true",
                        locations: locationsInput,
                    },

                },
            });

            // 3) Refresh forum list and close modal
            await loadRoutes();
            closeModal();
        } catch (e: any) {
            console.warn("Publish route error:", e);
            alert(e?.message ?? "Failed to publish route.");
        } finally {
            setSubmitting(false);
        }
    };

    // Navigate to detail with safe image param passing
    const handlePostPress = (post: ForumPost) => {
        const raw =
            typeof post.image === "number"
                ? String(post.image)
                : (post.image as any)?.uri ?? "";

        const isRemote = typeof post.image === "number" ? "0" : "1";
        const imageSource =
            typeof post.image === "number" ? raw : encodeURIComponent(raw);

        router.push({
            pathname: "/tabs/PostDetail",
            params: {
                title: post.title,
                description: post.description,
                imageSource,
                isRemote,
            },
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Route Forum",
                    headerTitleAlign: "center",
                    headerStyle: { backgroundColor: palette.primary },
                    headerTintColor: "#FFFFFF",
                    headerTitleStyle: { fontWeight: "700", letterSpacing: 0.3 },
                    headerLeft: () => headerLeft,
                    headerRight: () => headerRight,
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.container}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.eyebrow}>EXPLORE</Text>
                    <Text style={styles.title}>Routes & Experiences</Text>
                    <Text style={styles.subtitle}>
                        Browse inspiring community routes.
                    </Text>
                </View>

                {loading ? (
                    <View style={{ paddingTop: 24, alignItems: "center" }}>
                        <ActivityIndicator size="small" />
                        <Text style={{ marginTop: 8, color: palette.textMuted }}>
                            Loading…
                        </Text>
                    </View>
                ) : errText ? (
                    <View style={{ paddingHorizontal: 18 }}>
                        <Text style={{ color: "#B91C1C", fontWeight: "700" }}>
                            {errText}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ForumPostCard
                                imageSource={item.image}
                                title={item.title}
                                description={item.description}
                                router={router}
                                colors={palette}
                                onPress={() => handlePostPress(item)}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Add to Forum Modal */}
            <Modal
                visible={addOpen}
                animationType="slide"
                transparent
                onRequestClose={closeModal}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add to Forum</Text>
                        <Text style={styles.inputLabel}>
                            Select one of your existing routes (currently private)
                        </Text>

                        {/* Route picker list */}
                        <View style={styles.pickerBox}>
                            {myRoutesLoading ? (
                                <View style={{ paddingVertical: 12, alignItems: "center" }}>
                                    <ActivityIndicator />
                                </View>
                            ) : myNonSharable.length === 0 ? (
                                <Text style={{ color: palette.textMuted }}>
                                    You don’t have any private routes.
                                </Text>
                            ) : (
                                <FlatList
                                    data={myNonSharable}
                                    keyExtractor={(r) => r.routeId}
                                    style={{ maxHeight: 240 }}
                                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                                    renderItem={({ item }) => {
                                        const selected = selectedRouteId === item.routeId;
                                        return (
                                            <Pressable
                                                onPress={() => {
                                                    setSelectedRouteId(item.routeId);
                                                    setDetails(item.description ?? ""); // prefill
                                                }}
                                                style={[
                                                    styles.routeRow,
                                                    selected && {
                                                        borderColor: palette.primary,
                                                        backgroundColor: "rgba(14,165,233,0.06)",
                                                    },
                                                ]}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={[
                                                            styles.routeTitle,
                                                            selected && { color: palette.primaryDark },
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {item.title || "Untitled Route"}
                                                    </Text>
                                                    {!!item.description && (
                                                        <Text style={styles.routeDesc} numberOfLines={1}>
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </View>
                                                {selected ? (
                                                    <Ionicons
                                                        name="radio-button-on"
                                                        size={20}
                                                        color={palette.primary}
                                                    />
                                                ) : (
                                                    <Ionicons
                                                        name="radio-button-off"
                                                        size={20}
                                                        color={palette.textMuted}
                                                    />
                                                )}
                                            </Pressable>
                                        );
                                    }}
                                />
                            )}
                        </View>

                        {/* Details (description) input */}
                        <Text style={[styles.inputLabel, { marginTop: 10 }]}>Details</Text>
                        <TextInput
                            value={details}
                            onChangeText={setDetails}
                            placeholder="Add details about this route"
                            style={[styles.pickerBox, { height: 120, textAlignVertical: "top" }]}
                            multiline
                            placeholderTextColor={palette.textMuted}
                        />

                        {/* Optional cover image */}
                        <Text style={[styles.inputLabel, { marginTop: 10 }]}>
                            Cover image (optional)
                        </Text>
                        <Pressable onPress={pickImage} style={styles.imageButton}>
                            <Ionicons name="image" size={18} color="#FFFFFF" />
                            <Text style={styles.imageButtonText}>
                                {imageUri ? "Image selected" : "Select cover image"}
                            </Text>
                        </Pressable>

                        {/* Actions */}
                        <View style={styles.modalActions}>
                            <Pressable
                                onPress={closeModal}
                                disabled={submitting}
                                style={[styles.actionSecondary, submitting && { opacity: 0.6 }]}
                            >
                                <Text style={styles.actionSecondaryText}>Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={handlePublishToForum}
                                disabled={submitting || !selectedRouteId}
                                style={[
                                    styles.actionPrimary,
                                    (submitting || !selectedRouteId) && { opacity: 0.6 },
                                ]}
                            >
                                {submitting ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text style={styles.actionPrimaryText}>Share to Forum</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.bg },
    container: { flex: 1 },
    sectionHeader: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 8,
    },
    eyebrow: {
        color: palette.primaryDark,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: palette.text,
        marginTop: 2,
    },
    subtitle: {
        fontSize: 13.5,
        color: palette.textMuted,
        marginTop: 4,
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    // Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        paddingBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: palette.text,
        marginBottom: 8,
    },
    inputLabel: {
        color: palette.textMuted,
        fontSize: 12,
        fontWeight: "700",
        marginTop: 2,
        marginBottom: 6,
    },
    pickerBox: {
        borderWidth: 1,
        borderColor: palette.hairline,
        borderRadius: 12,
        padding: 10,
        backgroundColor: "#FFF",
    },
    routeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: palette.hairline,
    },
    routeTitle: {
        color: palette.text,
        fontWeight: "800",
        fontSize: 14.5,
    },
    routeDesc: {
        color: palette.textMuted,
        fontSize: 12.5,
        marginTop: 3,
    },
    imageButton: {
        marginTop: 8,
        alignSelf: "flex-start",
        backgroundColor: palette.primary,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    imageButtonText: {
        color: "#FFF",
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    modalActions: {
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },
    actionSecondary: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#E5E7EB",
    },
    actionSecondaryText: {
        color: palette.text,
        fontWeight: "800",
    },
    actionPrimary: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: palette.primary,
    },
    actionPrimaryText: {
        color: "#FFF",
        fontWeight: "800",
        letterSpacing: 0.2,
    },
});

export default ForumContent;
