import AvatarUploader from "@/components/tabs/AvatarUploader";
import Card from "@/components/tabs/Card";
import FooterText from "@/components/tabs/FooterText";
import Header from "@/components/tabs/Header";
import { ListRowChevron } from "@/components/tabs/ListRowChevron";
import SectionTitle from "@/components/tabs/SectionTitle";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, SafeAreaView, ScrollView, View } from "react-native";

export default function Profile() {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatarUri, setAvatarUri] = useState<string | undefined>();

    const loadAttributes = useCallback(async () => {
        try {
            const attrs = await fetchUserAttributes();
            setName(attrs.name ?? "");
            setLastName(attrs.family_name ?? "");
            setAvatarUri(attrs.picture ?? "");
        } catch (e) {
            console.warn("fetchUserAttributes error:", e);
        }
    }, []);

    // Load on first focus + every time we return to this screen
    useFocusEffect(
        useCallback(() => {
            loadAttributes();
        }, [loadAttributes])
    );

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission needed", "Please allow access to your photos to update your avatar.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
        });

        if (!result.canceled) {
            const uri = result.assets[0]?.uri;
            if (uri) setAvatarUri(uri);
            // TODO: upload to S3 and persist URL in your user profile if desired
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title="Profile" />

            <ScrollView>
                <View className="px-4">
                    <View className="py-3 pt-3 items-center">
                        <AvatarUploader uri={avatarUri} size={120} onPress={pickImage} />
                    </View>

                    <View className="py-3">
                        <SectionTitle>Personal Information</SectionTitle>
                        <Card>
                            <ListRowChevron
                                label="Name"
                                value={name}
                                onPress={() =>
                                    router.push({
                                        pathname: " /tabs/EditField",
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
                            <ListRowChevron label="Update Password" onPress={() => router.push("/tabs/UpdatePassword")} />
                        </Card>
                    </View>

                    <FooterText>App Version 2.24 #50491</FooterText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
