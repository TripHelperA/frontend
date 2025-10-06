// app/tabs/Profile.tsx
import Card from "@/components/tabs/Card";
import FooterText from "@/components/tabs/FooterText";
import Header from "@/components/tabs/Header";
import { ListRowChevron } from "@/components/tabs/ListRowChevron";
import SectionTitle from "@/components/tabs/SectionTitle";

import { fetchUserAttributes, getCurrentUser } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";

import { useFocusEffect } from "@react-navigation/native";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Image, SafeAreaView, ScrollView, View } from "react-native";

// ---- Polyfills ----
if (!(global as any).Buffer) (global as any).Buffer = Buffer;

// ---- GraphQL (Amplify v2 style) ----
const client = generateClient();

const GENERATE_SIGNED_URL = /* GraphQL */ `
    mutation GenerateSignedUrl($type: String!, $id: ID!, $mode: String!) {
        generateSignedUrl(type: $type, id: $id, mode: $mode) {
        url
        key
        }
    }
    `;

export default function Profile() {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const loadAttributes = useCallback(async () => {
        try {
            const attrs = await fetchUserAttributes();
            console.log("Cognito attributes:", attrs);
            setName(attrs.name ?? "");
            setLastName(attrs.family_name ?? "");
            setEmail(attrs.email ?? "");
        } catch (e) {
            console.warn("fetchUserAttributes error:", e);
        }
    }, []);

    const loadAvatarFromS3 = useCallback(async () => {
        try {
            const { userId } = await getCurrentUser();
            const { data } = await client.graphql({
                query: GENERATE_SIGNED_URL,
                variables: { type: "user", id: userId, mode: "view" },
            });

            const signedViewUrl = data?.generateSignedUrl?.url ?? null;
            setAvatarUrl(signedViewUrl);
        } catch (e) {
            console.warn("loadAvatarFromS3 error:", e);
            setAvatarUrl(null);
        }
    }, []);

    useEffect(() => {
        loadAttributes();
        loadAvatarFromS3();
    }, [loadAttributes, loadAvatarFromS3]);

    useFocusEffect(
        useCallback(() => {
            loadAttributes();
        }, [loadAttributes, loadAvatarFromS3])
    );

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission needed", "Please allow access to your photos.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.9,
            });
            if (result.canceled) return;

            const asset = result.assets[0];
            const uri = asset?.uri;
            if (!uri) return;

            const { userId } = await getCurrentUser();
            const { data: up } = await client.graphql({
                query: GENERATE_SIGNED_URL,
                variables: { type: "user", id: userId, mode: "upload" },
            });

            const uploadUrl = up.generateSignedUrl.url;
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const body = Buffer.from(base64, "base64");

            const res = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": "image/jpeg" },
                body,
            });
            if (!res.ok) throw new Error(`Upload failed (${res.status})`);

            await loadAvatarFromS3(); // refresh UI
            Alert.alert("✅ Uploaded", "Profile image uploaded successfully!");
        } catch (err) {
            console.error("Upload error:", err);
            Alert.alert("Error", "Failed to upload image.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title="Profile" />
            <ScrollView>
                <View className="px-4">
                    <View className="px-4 items-center">
                        {avatarUrl && (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: 120, height: 120, borderRadius: 60 }}
                            />
                        )}
                        <Button title="Change Avatar" onPress={pickImage} />
                    </View>

                    <View className="py-3">
                        <SectionTitle>Personal Information</SectionTitle>
                        <Card>
                            <ListRowChevron
                                label="First Name"
                                value={name}
                                onPress={() =>
                                    router.push({
                                        pathname: "/tabs/EditField",
                                        params: { field: "name", value: name },
                                    })
                                }
                            />
                            <ListRowChevron
                                label="Family Name"
                                value={lastName}
                                onPress={() =>
                                    router.push({
                                        pathname: "/tabs/EditField",
                                        params: { field: "surname", value: lastName },
                                    })
                                }
                            />
                            <ListRowChevron label="Email" value={email} />
                        </Card>
                    </View>

                    <View className="py-3">
                        <SectionTitle>Login Information</SectionTitle>
                        <Card>
                            <ListRowChevron
                                label="Update Password"
                                onPress={() => router.push("/tabs/UpdatePassword")}
                            />
                        </Card>
                    </View>

                    <FooterText>App Version 2.24 #50491</FooterText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
