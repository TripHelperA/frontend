import { Text, TouchableOpacity } from "react-native";

type PrimaryButtonProps = {
    label: string;
    onPress: () => void;
};

export default function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="mt-6 items-center rounded-xl bg-neutral-900 py-3"
        >
            <Text className="text-base font-semibold text-white">{label}</Text>
        </TouchableOpacity>
    );
}
