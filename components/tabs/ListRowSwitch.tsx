import { Switch, Text } from "react-native";
import ListRow from "./ListRow";

export function ListRowSwitch({
    label,
    value,
    onValueChange,
}: { label: string; value: boolean; onValueChange: (v: boolean) => void }) {
    return (
        <ListRow className="border-t border-neutral-200">
            <Text className="text-xl text-neutral-900">{label}</Text>
            <Switch className="ml-auto" value={value} onValueChange={onValueChange} />
        </ListRow>
    );
}
