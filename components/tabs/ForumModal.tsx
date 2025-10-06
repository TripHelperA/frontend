import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type RouteListItem = {
    routeId: string;
    title: string;
    description?: string | null;
};

type Palette = {
    bg: string;
    primary: string;
    primaryDark: string;
    text: string;
    textMuted: string;
    hairline: string;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (payload: { routeId: string; details: string; imageUri: string | null }) => void;

    // Data & loading provided by parent
    routes: RouteListItem[];
    loadingRoutes: boolean;
    onRefreshRoutes?: () => Promise<void> | void;

    // UI palette (pass your palette from parent)
    colors: Palette;

    // Submit button state from parent
    submitting?: boolean;
};

const AddToForumModal: React.FC<Props> = ({
    visible,
    onClose,
    onSubmit,
    routes,
    loadingRoutes,
    onRefreshRoutes,
    colors,
    submitting = false,
}) => {
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [details, setDetails] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);

    // When the modal opens, refresh and reset local state
    useEffect(() => {
        if (visible) {
            setSelectedRouteId(null);
            setDetails("");
            setImageUri(null);
            onRefreshRoutes?.();
        }
    }, [visible, onRefreshRoutes]);

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

    const handleSubmit = () => {
        if (!selectedRouteId) {
            alert("Please select a route.");
            return;
        }
        onSubmit({ routeId: selectedRouteId, details, imageUri });
    };

    const styles = useMemo(
        () =>
            StyleSheet.create({
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
                    color: colors.text,
                    marginBottom: 8,
                },
                inputLabel: {
                    color: colors.textMuted,
                    fontSize: 12,
                    fontWeight: "700",
                    marginTop: 2,
                    marginBottom: 6,
                },
                pickerBox: {
                    borderWidth: 1,
                    borderColor: colors.hairline,
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
                    borderColor: colors.hairline,
                },
                routeTitle: {
                    color: colors.text,
                    fontWeight: "800",
                    fontSize: 14.5,
                },
                routeDesc: {
                    color: colors.textMuted,
                    fontSize: 12.5,
                    marginTop: 3,
                },
                imageButton: {
                    marginTop: 8,
                    alignSelf: "flex-start",
                    backgroundColor: colors.primary,
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
                    color: colors.text,
                    fontWeight: "800",
                },
                actionPrimary: {
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                },
                actionPrimaryText: {
                    color: "#FFF",
                    fontWeight: "800",
                    letterSpacing: 0.2,
                },
            }),
        [colors]
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Add to Forum</Text>
                    <Text style={styles.inputLabel}>Select one of your existing routes (currently private)</Text>

                    {/* Route picker list */}
                    <View style={styles.pickerBox}>
                        {loadingRoutes ? (
                            <View style={{ paddingVertical: 12, alignItems: "center" }}>
                                <ActivityIndicator />
                            </View>
                        ) : routes.length === 0 ? (
                            <Text style={{ color: colors.textMuted }}>You don’t have any private routes.</Text>
                        ) : (
                            <FlatList
                                data={routes}
                                keyExtractor={(r) => r.routeId}
                                style={{ maxHeight: 240 }}
                                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                                renderItem={({ item }) => {
                                    const selected = selectedRouteId === item.routeId;
                                    return (
                                        <Pressable
                                            onPress={() => {
                                                setSelectedRouteId(item.routeId);
                                                setDetails(item.description ?? "");
                                            }}
                                            style={[
                                                styles.routeRow,
                                                selected && {
                                                    borderColor: colors.primary,
                                                    backgroundColor: "rgba(14,165,233,0.06)",
                                                },
                                            ]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={[styles.routeTitle, selected && { color: colors.primaryDark }]}
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
                                                <Ionicons name="radio-button-on" size={20} color={colors.primary} />
                                            ) : (
                                                <Ionicons name="radio-button-off" size={20} color={colors.textMuted} />
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
                        placeholderTextColor={colors.textMuted}
                    />

                    {/* Optional cover image */}
                    <Text style={[styles.inputLabel, { marginTop: 10 }]}>Cover image (optional)</Text>
                    <Pressable onPress={pickImage} style={styles.imageButton}>
                        <Ionicons name="image" size={18} color="#FFFFFF" />
                        <Text style={styles.imageButtonText}>
                            {imageUri ? "Image selected" : "Select cover image"}
                        </Text>
                    </Pressable>

                    {/* Actions */}
                    <View style={styles.modalActions}>
                        <Pressable
                            onPress={onClose}
                            disabled={submitting}
                            style={[styles.actionSecondary, submitting && { opacity: 0.6 }]}
                        >
                            <Text style={styles.actionSecondaryText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={submitting || !selectedRouteId}
                            style={[styles.actionPrimary, (submitting || !selectedRouteId) && { opacity: 0.6 }]}
                        >
                            {submitting ? <ActivityIndicator /> : <Text style={styles.actionPrimaryText}>Share to Forum</Text>}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AddToForumModal;
