// screens/Settings.tsx
import Card from "@/components/tabs/Card";
import DangerButtonRow from "@/components/tabs/DangerButtonRow";
import FooterText from "@/components/tabs/FooterText";
import Header from "@/components/tabs/Header";
import { ListRowChevron } from "@/components/tabs/ListRowChevron";
import { ListRowSwitch } from "@/components/tabs/ListRowSwitch";
import ProfileCard from "@/components/tabs/ProfileCard";
import SectionTitle from "@/components/tabs/SectionTitle";
import { router } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

export default function Settings() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title="Settings" />

            <ScrollView>
                <View className="px-4">
                    <View className="py-3 pt-1">
                        <SectionTitle>Account</SectionTitle>
                        <Card>
                            <ProfileCard
                                avatarUri="https://images.unsplash.com/photo-1633332755192-727a05c4013d?..."
                                name="John Doe"
                                email="john@example.com"
                                onPress={() => router.push("/tabs/Account")}
                            />
                        </Card>
                    </View>

                    <View className="py-3">
                        <SectionTitle>Preferences</SectionTitle >
                        <Card>
                            <ListRowChevron label="Language" value="English" onPress={() => { router.push("/tabs/SelectLanguage") }} />
                            <ListRowSwitch label="Email Notifications" value={emailNotifications} onValueChange={setEmailNotifications} />
                            <ListRowSwitch label="Push Notifications" value={pushNotifications} onValueChange={setPushNotifications} />
                        </Card>
                    </View>

                    <View className="py-3">
                        <SectionTitle>Resources</SectionTitle>
                        <Card>
                            <ListRowChevron label="Contact Us" onPress={() => { }} />
                            <ListRowChevron label="Report Bug" onPress={() => { }} />
                            <ListRowChevron label="Rate in App Store" onPress={() => { }} />
                            <ListRowChevron label="Terms and Privacy" onPress={() => { }} />
                        </Card>
                    </View>

                    <View className="py-3">
                        <Card>
                            <DangerButtonRow label="Log Out" onPress={() => { }} />
                        </Card>
                    </View>

                    <FooterText>App Version 2.24 #50491</FooterText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
