import { Text } from "react-native";
import ListRow from "./ListRow";

export default function DangerButtonRow({ label, onPress }: { label: string; onPress?: () => void }) {
    return (
        <ListRow onPress={onPress} className="items-center">
            <Text className="w-full text-center text-xl font-semibold text-red-600">{label}</Text>
        </ListRow>
    );
}
