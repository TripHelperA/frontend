import { TouchableOpacity, View } from "react-native";

type Props = {
    children: React.ReactNode;
    onPress?: () => void;
    Right?: React.ReactNode;
    className?: string;
};

export default function ListRow({ children, onPress, Right, className }: Props) {
    const Comp = onPress ? TouchableOpacity : View;
    return (
        <View className="bg-white">
            <Comp
                //@ts-ignore for union type View/Touchable
                onPress={onPress}
                className={`w-full flex-row items-center justify-start pl-4 pr-3 py-3 ${className ?? ""}`}
            >
                <View className="flex-row items-center flex-1">{children}</View>
                {Right}
            </Comp>
        </View>
    );
}
