// screens/Settings.tsx
import AvatarUploader from "@/components/tabs/AvatarUploader";
import Card from "@/components/tabs/Card";
import FooterText from "@/components/tabs/FooterText";
import Header from "@/components/tabs/Header";
import { ListRowChevron } from "@/components/tabs/ListRowChevron";
import SectionTitle from "@/components/tabs/SectionTitle";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, View } from "react-native";

export default function Profile() {

    const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

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
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title="Profile" />

            <ScrollView>
                <View className="px-4">
                    <View className="py-3 pt-3 items-center">
                        <AvatarUploader
                            uri={avatarUri}
                            size={120} // TODO: adjust the size
                            onPress={pickImage}
                        />
                    </View>

                    <View className="py-3">
                        <SectionTitle>Personal Information</SectionTitle>
                        <Card> {/* TODO: add onpress for updating the values */}
                            <ListRowChevron label="Username" value="petitJohn" />
                            <ListRowChevron label="Name" value="John" onPress={() => { }} />
                            <ListRowChevron label="Surname" value="cCc" onPress={() => { }} />
                        </Card>
                    </View>

                    <View className="py-3">
                        <SectionTitle>Login Information</SectionTitle>
                        <Card>
                            <ListRowChevron label="Email" value="zartzurt@gmail.com" />
                            <ListRowChevron label="Update Password" onPress={() => { }} />
                        </Card>
                    </View>

                    <FooterText>App Version 2.24 #50491</FooterText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
