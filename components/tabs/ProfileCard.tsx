import Feather from "@expo/vector-icons/Feather";
import { Image, Text } from "react-native";
import ListRow from "./ListRow";

export default function ProfileCard({
    avatarUri,
    name,
    email,
    onPress,
}: { avatarUri: string; name: string; email: string; onPress?: () => void }) {
    return (
        <ListRow
            onPress={onPress}
            Right={<Feather name="chevron-right" size={22} color="#bcbcbc" />}
            className="rounded-xl"
        >
            <Image alt="" source={{ uri: avatarUri }} className="mr-3 w-1/5 aspect-square rounded-full sm:w-1/6 md:w-1/8" />
            <Text className="text-xl font-semibold text-neutral-900">{name}</Text>
            <Text className="ml-2 mt-0.5 text-xl text-neutral-500">{email}</Text>
        </ListRow>
    );
}
