// app/tabs/Profile.tsx
import Card from "@/components/tabs/Card";
import FooterText from "@/components/tabs/FooterText";
import Header from "@/components/tabs/Header";
import { ListRowChevron } from "@/components/tabs/ListRowChevron";
import SectionTitle from "@/components/tabs/SectionTitle";

import { fetchUserAttributes, getCurrentUser } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";

import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Button, Image, SafeAreaView, ScrollView, View } from "react-native";

// Buffer polyfill for React Native
if (!(global as any).Buffer) (global as any).Buffer = Buffer;

// ---- GraphQL (Amplify v2 client style) ----
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
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Load text attributes from Cognito (name, family_name)
    const loadAttributes = useCallback(async () => {
        try {
            const attrs = await fetchUserAttributes();
            setName(attrs.name ?? "");
            setLastName(attrs.family_name ?? "");
            // We intentionally do NOT use attrs.picture (it may be stale or an expired URL).
        } catch (e) {
            console.warn("fetchUserAttributes error:", e);
        }
    }, []);

    // Fetch a presigned GET URL for the user's avatar from S3 via AppSync/Lambda
    const loadAvatarFromS3 = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            const userId = user.userId;

            const { data } = await client.graphql({
                query: GENERATE_SIGNED_URL,
                variables: { type: "user", id: userId, mode: "view" },
            });

            // Expecting a presigned GET url from backend
            const signedViewUrl = data.generateSignedUrl.url;
            setAvatarUrl(signedViewUrl);
        } catch (e) {
            console.warn("loadAvatarFromS3 error:", e);
            // If there's no image yet, just show nothing
            setAvatarUrl(null);
        }
    }, []);

    // Load attributes + avatar each time screen focuses
    useFocusEffect(
        useCallback(() => {
            loadAttributes();
            loadAvatarFromS3();
        }, [loadAttributes, loadAvatarFromS3])
    );

    // Pick image, upload via presigned PUT, then refresh presigned GET for display
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

            // (Simple path) Treat upload as JPEG to match your presign (ensure your Lambda presigns with ContentType "image/jpeg")
            const contentType = "image/jpeg";

            const user = await getCurrentUser();
            const userId = user.userId;

            // 1) Presign for UPLOAD (PUT)
            const { data: up } = await client.graphql({
                query: GENERATE_SIGNED_URL,
                variables: { type: "user", id: userId, mode: "upload" },
            });

            const uploadUrl = up.generateSignedUrl.url;

            // 2) Read picked file and upload
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const body = Buffer.from(base64, "base64");

            const res = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": contentType },
                body,
            });
            if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);

            // 3) Get a fresh presigned GET for viewing
            const { data: view } = await client.graphql({
                query: GENERATE_SIGNED_URL,
                variables: { type: "user", id: userId, mode: "view" },
            });

            setAvatarUrl(view.generateSignedUrl.url);
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
                                label="Name"
                                value={name}
                                onPress={() =>
                                    router.push({
                                        pathname: "/tabs/EditField", // ✅ removed leading space
                                        params: { field: "name", value: name },
                                    })
                                }
                            />
                            <ListRowChevron
                                label="Surname"
                                value={lastName}
                                onPress={() =>
                                    router.push({
                                        pathname: "/tabs/EditField",
                                        params: { field: "surname", value: lastName },
                                    })
                                }
                            />
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
