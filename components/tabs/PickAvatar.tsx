import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Button, Image, View } from "react-native";

// mutation inline — same style as your PickInterests
const generateSignedUrlMutation = /* GraphQL */ `
  mutation GenerateSignedUrl($type: String!, $id: ID!, $mode: String!) {
    generateSignedUrl(type: $type, id: $id, mode: $mode) {
      url
      key
    }
  }
`;

export default function PickAvatar() {
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const client = generateClient();

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission needed", "Please allow photo access.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
        });

        if (result.canceled) return;
        const uri = result.assets[0]?.uri;
        if (!uri) return;

        setAvatarUri(uri);

        try {
            // get user id
            const user = await getCurrentUser();
            const userId = user.userId;

            // 1️⃣ ask backend for signed upload URL
            const { data } = await client.graphql({
                query: generateSignedUrlMutation,
                variables: { type: "user", id: userId, mode: "upload" },
            });

            const { url, key } = data.generateSignedUrl;
            console.log("Signed URL:", url, key);

            // 2️⃣ upload image
            const file = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const blob = Buffer.from(file, "base64");

            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "image/jpeg" },
                body: blob,
            });

            if (!res.ok) throw new Error("Upload failed");
            Alert.alert("✅ Uploaded!", "Profile image saved.");
        } catch (err) {
            console.error("Upload failed:", err);
            Alert.alert("Error", "Failed to upload image.");
        }
    };

    return (
        <View style={{ alignItems: "center", gap: 16 }}>
            {avatarUri && (
                <Image
                    source={{ uri: avatarUri }}
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                />
            )}
            <Button title="Pick Profile Image" onPress={pickImage} />
        </View>
    );
}
