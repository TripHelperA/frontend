// screens/Settings.tsx
import Card from "@/components/tabs/Card";
import FooterText from "@/components/tabs/FooterText";
import Header from "@/components/tabs/Header";
import { ListRowChevron } from "@/components/tabs/ListRowChevron";
import ProfileCard from "@/components/tabs/ProfileCard";
import SectionTitle from "@/components/tabs/SectionTitle";
import { router } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

export default function Settings() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title="Account" onPressLeft={() => { router.replace("/tabs/Settings") }} />

            <ScrollView>
                <View className="px-4">
                    <View className="py-3 pt-1">
                        <SectionTitle>Account</SectionTitle>
                        <Card>  {/* TODO: add change profile picture */}
                            <ProfileCard
                                avatarUri="https://images.unsplash.com/photo-1633332755192-727a05c4013d?..."
                                name="John Doe"
                                email="john@example.com"

                            />
                        </Card>
                    </View>

                    <View className="py-3">
                        <SectionTitle>Personal Information</SectionTitle>
                        <Card> {/* TODO: add onpress for updating the values */}
                            <ListRowChevron label="Username" value="petitJohn" />
                            <ListRowChevron label="Name" value="John" onPress={() => { }} />
                            <ListRowChevron label="Surname" value="cCc" onPress={() => { }} />
                        </Card>
                    </View>

                    <View className="py-3">
                        <SectionTitle>Login Information</SectionTitle>
                        <Card>
                            <ListRowChevron label="Email" value="zartzurt@gmail.com" />
                            <ListRowChevron label="Update Password" onPress={() => { }} />
                        </Card>
                    </View>

                    <FooterText>App Version 2.24 #50491</FooterText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
