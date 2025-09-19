import Feather from "@expo/vector-icons/Feather";
import { Image, TouchableOpacity, View } from "react-native";

type Props = {
    uri?: string;                  // current profile picture
    size?: number;                 // avatar size (default 100)
    onPress?: () => void;          // called when user wants to upload new photo
};

export default function AvatarUploader({
    uri,
    size = 100,
    onPress,
}: Props) {
    return (
        <View
            style={{ width: size, height: size }}
            className="relative items-center justify-center"
        >
            {/* Profile photo */}
            <Image
                source={
                    uri
                        ? { uri }
                        : require("@/assets/default-avatar.png") // fallback if no image
                }
                style={{ width: size, height: size }}
                className="rounded-full"
            />

            {/* Overlay button */}
            <TouchableOpacity
                onPress={onPress}
                className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full"
            >
                <Feather name="camera" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}
