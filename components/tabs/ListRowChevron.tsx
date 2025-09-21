import Feather from "@expo/vector-icons/Feather";
import { Text } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import ListRow from "./ListRow";

export function ListRowChevron({
    label,
    value,
    onPress,
}: {
    label: string;
    value?: string;
    onPress?: () => void;
}) {
    return (
        <ListRow
            onPress={onPress}
            Right={
                onPress ? <Feather name="chevron-right" color="#bcbcbc" style={{ height: hp("3%") }} /> : undefined
            }
            className="border-t border-neutral-200"
        >
            <Text className="text-xl text-neutral-900">{label}</Text>
            {value ? (
                <Text className="ml-auto mr-1 text-xl text-neutral-400">{value}</Text>
            ) : null}
        </ListRow>
    );
}
