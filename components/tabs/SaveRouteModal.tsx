// components/SaveRouteModal.tsx
import { generateClient } from "aws-amplify/api";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

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

type AnyMarker = {
    latitude: number;
    longitude: number;
    isOnTheRoute?: boolean;
    google_place_id?: string;
    placeId?: string;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    allValuesWithEnds: AnyMarker[];
    defaultTitle?: string;
    defaultDescription?: string;
    defaultSharable?: "PUBLIC" | "PRIVATE";
    onSuccess?: (routeId: string) => void;
};

export default function SaveRouteModal({
    visible,
    onClose,
    allValuesWithEnds,
    defaultTitle = "",
    defaultDescription = "",
    defaultSharable = "PRIVATE",
    onSuccess,
}: Props) {
    const [title, setTitle] = useState(defaultTitle);
    const [description, setDescription] = useState(defaultDescription);
    const [sharable, setSharable] = useState<"PUBLIC" | "PRIVATE">(defaultSharable);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const locationsInput = useMemo(() => {
        return (allValuesWithEnds ?? []).map((m) => ({
            placeId: m.google_place_id ?? m.placeId ?? "unknown_place",
            isOnTheRoute: m.isOnTheRoute ?? true,
            latitude: m.latitude,
            longitude: m.longitude,
        }));
    }, [allValuesWithEnds]);

    const canSubmit = title.trim().length > 0 && locationsInput.length >= 2 && !submitting;

    const handleDone = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setErrorMsg(null);
        try {
            // If needed, your resolver can map PUBLIC->true, PRIVATE->false when storing.
            const { data } = await client.graphql({
                query: SAVE_LOCATIONS,
                variables: {
                    input: {
                        title: title.trim(),
                        description: description.trim() || null,
                        sharable, // String per schema
                        locations: locationsInput,
                    },
                },
            });

            const routeId = data?.saveLocations?.routeId;
            if (routeId) onSuccess?.(routeId);
            onClose();
        } catch (e: any) {
            console.error("saveLocations error:", e);
            setErrorMsg(e?.errors?.[0]?.message ?? e?.message ?? "Failed to save route.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Give a Title to Your Route</Text>

                    <TextInput
                        placeholder="e.g., Ankara → İstanbul Day Trip"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        autoFocus
                    />

                    <TextInput
                        placeholder="Description (optional)"
                        value={description}
                        onChangeText={setDescription}
                        style={[styles.input, styles.inputMultiline]}
                        multiline
                        numberOfLines={3}
                    />

                    <Pressable
                        onPress={() => setSharable((s) => (s === "PRIVATE" ? "PUBLIC" : "PRIVATE"))}
                        style={styles.toggle}
                    >
                        <Text style={styles.toggleText}>Visibility: {sharable}</Text>
                    </Pressable>

                    {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

                    <View style={styles.actions}>
                        <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose} disabled={submitting}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.btn, canSubmit ? styles.btnPrimary : styles.btnDisabled]}
                            onPress={handleDone}
                            disabled={!canSubmit}
                        >
                            {submitting ? <ActivityIndicator /> : <Text style={styles.btnText}>Done</Text>}
                        </Pressable>
                    </View>

                    <Text style={styles.hint}>
                        {locationsInput.length} stops will be saved (including start and end).
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
    title: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 },
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
