import Header from "@/components/tabs/Header";
import { generateClient } from "aws-amplify/api";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

const DEFAULT_ATTRIBUTE_VAL = 5;

const ATTR_KEYS = [
    "algo_romantic",
    "algo_adventurous",
    "algo_relaxation",
    "algo_cultural",
    "algo_gastronomic",
    "algo_nature",
    "algo_entertaining",
    "algo_modern",
] as const;

type AttrKey = typeof ATTR_KEYS[number];
type Interest = { id: string; label: string; emoji: string; attribute: AttrKey };

const ALL_INTERESTS: Interest[] = [
    { id: "beach", label: "Beach", emoji: "🏖️", attribute: "algo_relaxation" },
    { id: "mountains", label: "Mountains", emoji: "⛰️", attribute: "algo_nature" },
    { id: "city_trips", label: "City Trips", emoji: "🏙️", attribute: "algo_modern" },
    { id: "road_trips", label: "Road Trips", emoji: "🚗", attribute: "algo_adventurous" },
    { id: "camping", label: "Camping", emoji: "🏕️", attribute: "algo_nature" },
    { id: "hiking", label: "Hiking", emoji: "🥾", attribute: "algo_adventurous" },
    { id: "cruises", label: "Cruises", emoji: "🛳️", attribute: "algo_romantic" },
    { id: "cultural", label: "Cultural Tours", emoji: "🏛️", attribute: "algo_cultural" },
    { id: "safari", label: "Safari", emoji: "🦁", attribute: "algo_nature" },
    { id: "skiing", label: "Skiing", emoji: "🎿", attribute: "algo_adventurous" },
    { id: "islands", label: "Island Hopping", emoji: "🏝️", attribute: "algo_romantic" },
    { id: "food", label: "Food Trips", emoji: "🍜", attribute: "algo_gastronomic" },
    { id: "adventure", label: "Adventure", emoji: "🪂", attribute: "algo_adventurous" },
    { id: "wellness", label: "Wellness Retreats", emoji: "🧘", attribute: "algo_relaxation" },
    { id: "festivals", label: "Festivals", emoji: "🎉", attribute: "algo_entertaining" },
    { id: "wildlife", label: "Wildlife", emoji: "🐘", attribute: "algo_nature" },
];

const MIN_REQUIRED = 3;

export default function PickInterests() {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Persist integer array across renders
    const attributeValuesRef = useRef<number[]>(
        Array(ATTR_KEYS.length).fill(DEFAULT_ATTRIBUTE_VAL)
    );

    // Fast map from interest id -> attribute index
    const INTEREST_TO_IDX: Record<string, number> = useMemo(
        () =>
            Object.fromEntries(
                ALL_INTERESTS.map((i) => [i.id, ATTR_KEYS.indexOf(i.attribute)])
            ) as Record<string, number>,
        []
    );

    const canContinue = selected.size >= MIN_REQUIRED;
    const remaining = useMemo(
        () => Math.max(0, MIN_REQUIRED - selected.size),
        [selected.size]
    );

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const client = generateClient();

    const updateUserMetricsMutation = /* GraphQL */ `
  mutation UpdateUserMetrics($metrics: [Int!]!) {
    updateUserMetrics(metrics: $metrics)
  }
`;



    const onContinue = async () => {
        const updatedValues = [...attributeValuesRef.current];

        selected.forEach(id => {
            const interest = ALL_INTERESTS.find(i => i.id === id);
            if (interest) {
                const idx = ATTR_KEYS.indexOf(interest.attribute as AttrKey);
                if (idx >= 0) {
                    updatedValues[idx] = updatedValues[idx] + 1;
                }
            }
        });
        console.log("selected ids:", [...selected]);
        console.log("payload metrics:", updatedValues);           // should be numbers, length 8
        console.log("type check:", updatedValues.map(v => typeof v)); // should be all "number"
        try {
            const result = await client.graphql({
                query: updateUserMetricsMutation,
                variables: { metrics: updatedValues },
            });

            console.log("Mutation result:", result.data.updateUserMetrics);
            router.replace("/tabs/Home");
        } catch (err) {
            console.error("Failed to update metrics", err);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <View className="flex-1 pl-3 pr-3 ">
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="pt-3 pb-3 rounded-full">
                        <Header title="Pick Your Interests" />
                    </View>

                    <Text className="pt-5  text-black font-semibold text-xl">
                        Select at least {MIN_REQUIRED} topics you're interested in
                    </Text>

                    {/* Chips */}
                    <View className="mt-4 flex-row flex-wrap">
                        {ALL_INTERESTS.map((item) => {
                            const isSelected = selected.has(item.id);
                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => toggle(item.id)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                    className={[
                                        "mr-2 mb-2 rounded-full px-4 py-2 border",
                                        isSelected ? "bg-red-600 border-red-600" : "bg-white border-neutral-300",
                                    ].join(" ")}
                                >
                                    <Text
                                        className={[
                                            "text-lg",
                                            isSelected ? "text-white font-bold" : "text-neutral-800",
                                        ].join(" ")}
                                    >
                                        {item.emoji} {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Helper line */}
                    <View className="mt-2">
                        {!canContinue ? (
                            <Text className="text-red-600 font-bold text-xl">
                                {remaining} more to go…
                            </Text>
                        ) : (
                            <Text className="text-green-700 text-xl font-bold">Great! You can continue.</Text>
                        )}
                    </View>
                </ScrollView>

                {/* Sticky footer button */}
                <View className="absolute left-0 right-0 bottom-0 p-4 bg-neutral-50 border-t border-neutral-200">
                    <Pressable
                        disabled={!canContinue}
                        onPress={onContinue}
                        className={[
                            "rounded-xl py-3 items-center",
                            canContinue ? "bg-red-600" : "bg-red-600/50",
                        ].join(" ")}
                    >
                        <Text className="text-white text-lg font-semibold">Continue</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
