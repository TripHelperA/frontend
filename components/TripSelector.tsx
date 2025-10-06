import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

type TripType = "oneway" | "roundtrip";

type Props = {
    onSwap?: () => void;
    onFromPress?: () => void;
    onToPress?: () => void;
};

export default function TripSelector({ onSwap, onFromPress, onToPress }: Props) {
    const [tripType, setTripType] = useState<TripType>("oneway");
    const [fromText, setFromText] = useState("");
    const [toText, setToText] = useState("");

    const swapPlaces = () => {
        setFromText(toText);
        setToText(fromText);
        if (onSwap) onSwap();
    };

    return (
        <View
            className="bg-white/95 rounded-2xl shadow-lg"
            style={{ width: wp("92%"), paddingVertical: hp("1.6%"), paddingHorizontal: wp("3.5%") }}
        >
            {/* Trip type toggle */}
            <View className="flex-row items-center" style={{ gap: wp("4%"), marginBottom: hp("1.4%") }}>
                <TouchableOpacity
                    onPress={() => setTripType("oneway")}
                    className="flex-row items-center"
                    activeOpacity={0.8}
                >
                    <View
                        className="mr-2 rounded-full items-center justify-center"
                        style={{
                            width: hp("3%"),
                            height: hp("3%"),
                            backgroundColor: tripType === "oneway" ? "#0B4D9A" : "rgba(11,77,154,0.15)",
                        }}
                    >
                        <Text className="text-white">→</Text>
                    </View>
                    <Text
                        className={tripType === "oneway" ? "text-[#0B4D9A] font-semibold" : "text-gray-500"}
                        style={{ fontSize: wp(4) }}
                    >
                        Tek Yön
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setTripType("roundtrip")}
                    className="flex-row items-center"
                    activeOpacity={0.8}
                >
                    <View
                        className="mr-2 rounded-full items-center justify-center"
                        style={{
                            width: hp("3%"),
                            height: hp("3%"),
                            backgroundColor: tripType === "roundtrip" ? "rgba(11,77,154,0.15)" : "rgba(11,77,154,0.08)",
                            borderWidth: tripType === "roundtrip" ? 1 : 0,
                            borderColor: "#0B4D9A",
                        }}
                    >
                        <Text style={{ color: "#0B4D9A" }}>↺</Text>
                    </View>
                    <Text
                        className={tripType === "roundtrip" ? "text-[#0B4D9A] font-semibold" : "text-gray-500"}
                        style={{ fontSize: wp(4) }}
                    >
                        Gidiş – Dönüş
                    </Text>
                </TouchableOpacity>
            </View>

            {/* From / To row */}
            <View
                className="w-full bg-white rounded-2xl flex-row items-center justify-between"
                style={{
                    paddingVertical: hp("1%"),
                    paddingHorizontal: wp("2%"),
                    borderWidth: 1,
                    borderColor: "rgba(11,77,154,0.15)",
                }}
            >
                {/* From */}
                <TouchableOpacity
                    onPress={onFromPress}
                    className="flex-1 bg-white rounded-xl justify-center"
                    style={{
                        height: hp("6.4%"),
                        paddingHorizontal: wp("3.5%"),
                        borderWidth: 1,
                        borderColor: "rgba(11,77,154,0.15)",
                    }}
                >
                    <Text
                        className={fromText ? "text-gray-900" : "text-gray-400"}
                        style={{ fontSize: wp(4.2) }}
                    >
                        {fromText || "● → Nereden"}
                    </Text>
                </TouchableOpacity>

                {/* Swap */}
                <View className="items-center justify-center" style={{ width: wp("10%") }}>
                    <TouchableOpacity
                        onPress={swapPlaces}
                        activeOpacity={0.85}
                        className="bg-white rounded-full items-center justify-center shadow"
                        style={{
                            width: hp("5.2%"),
                            height: hp("5.2%"),
                            borderWidth: 1,
                            borderColor: "rgba(11,77,154,0.15)",
                        }}
                    >
                        <Text style={{ color: "#0B4D9A", fontSize: wp(4.8) }}>⇄</Text>
                    </TouchableOpacity>
                </View>

                {/* To */}
                <TouchableOpacity
                    onPress={onToPress}
                    className="flex-1 bg-white rounded-xl justify-center"
                    style={{
                        height: hp("6.4%"),
                        paddingHorizontal: wp("3.5%"),
                        borderWidth: 1,
                        borderColor: "rgba(11,77,154,0.15)",
                    }}
                >
                    <Text
                        className={toText ? "text-gray-900" : "text-gray-400"}
                        style={{ fontSize: wp(4.2) }}
                    >
                        {toText || "→ Nereye"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
