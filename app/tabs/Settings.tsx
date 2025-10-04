import Card from "@/components/tabs/Card";
import DangerButtonRow from "@/components/tabs/DangerButtonRow";
import FooterText from "@/components/tabs/FooterText";
import Header from "@/components/tabs/Header";
import { ListRowChevron } from "@/components/tabs/ListRowChevron";
import { ListRowSwitch } from "@/components/tabs/ListRowSwitch";
import ProfileCard from "@/components/tabs/ProfileCard";
import SectionTitle from "@/components/tabs/SectionTitle";
import { fetchAuthSession, fetchUserAttributes, getCurrentUser, signOut } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";

import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, View } from "react-native";

// ---------- GraphQL ----------
const client = generateClient();

const GENERATE_SIGNED_URL = /* GraphQL */ `
  mutation GenerateSignedUrl($type: String!, $id: ID!, $mode: String!) {
    generateSignedUrl(type: $type, id: $id, mode: $mode) {
      url
      key
    }
  }
`;

// (kept) example mutation you already had
const MAIN_LOGIC = /* GraphQL */ `
  mutation mainLogicRequest($input: mainLogicUserInput!) {
    mainLogicRequest(input: $input)
  }
`;

export async function testMainLogicRequest() {
    // sanity: confirm we actually have a user + IdToken
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();
    if (!idToken) {
        console.warn("No IdToken — are you signed in?");
        return;
    }

    try {
        const resp = await client.graphql({
            query: MAIN_LOGIC,
            variables: {
                input: {
                    startingPlace: "New York",
                    endPlace: "Boston",
                    userInput: "fastest route",
                    title: "NYC to BOS test",
                },
            },
            authMode: "userPool",
        });

        console.log("Full GraphQL response:", JSON.stringify(resp, null, 2));
        return resp.data?.mainLogicRequest ?? null;
    } catch (e) {
        console.error("GraphQL call failed:", e);
        throw e;
    }
}

export default function Settings() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUri, setAvatarUri] = useState<string | undefined>();

    const loadAttributes = useCallback(async () => {
        try {
            const attrs = await fetchUserAttributes();
            setName(attrs.name ?? "");
            setLastName(attrs.family_name ?? "");
            setEmail(attrs.email ?? "");
        } catch (e) {
            console.warn("fetchUserAttributes error:", e);
        }
    }, []);

    // Fetch a presigned GET URL for the user's avatar from S3 via AppSync/Lambda
    const loadAvatarFromS3 = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            const userId = user.userId;

            const { data } = await client.graphql({
                query: GENERATE_SIGNED_URL,
                variables: { type: "user", id: userId, mode: "view" },
            });

            const signedViewUrl: string | undefined = data?.generateSignedUrl?.url ?? undefined;

            setAvatarUri(signedViewUrl);
        } catch (e) {
            console.warn("loadAvatarFromS3 error:", e);
            setAvatarUri(undefined);
        }
    }, []);

    // Load attributes + avatar whenever the screen focuses
    useEffect(() => {
        loadAttributes();
        loadAvatarFromS3();
    }, [loadAttributes, loadAvatarFromS3]);

    useFocusEffect(
        useCallback(() => {
            // Re-fetch to reflect any changes done on other screens
            loadAttributes();
        }, [loadAttributes, loadAvatarFromS3])
    );

    const handleSignout = async () => {
        try {
            await signOut();
            router.replace("/login/Login");
        } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Sign out failed", "Please try again.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title="Settings" />

            <ScrollView>
                <View className="px-4">
                    <View className="py-3 pt-1">
                        <SectionTitle>Profile</SectionTitle>
                        <Card>
                            <ProfileCard
                                // Use fetched avatar; your component can show a fallback if undefined
                                avatarUri={avatarUri}
                                name={`${name} ${lastName}`.trim()}
                                email={email}
                                onPress={() => router.replace("/tabs/Profile")}
                            />
                        </Card>
                    </View>

                    <View className="py-3">
                        <SectionTitle>Preferences</SectionTitle>
                        <Card>
                            <ListRowChevron label="Language" value="English" onPress={() => { router.push("/tabs/SelectLanguage"); }} />
                            <ListRowSwitch label="Email Notifications" value={emailNotifications} onValueChange={setEmailNotifications} />
                            <ListRowSwitch label="Push Notifications" value={pushNotifications} onValueChange={setPushNotifications} />
                        </Card>
                    </View>

                    <View className="py-3">
                        <SectionTitle>Resources</SectionTitle>
                        <Card>
                            <ListRowChevron
                                label="Contact Us"
                                onPress={async () => {
                                    const response = await testMainLogicRequest();
                                    console.log("Contact Us response:", response);
                                }}
                            />

                            <ListRowChevron label="Report Bug" onPress={() => { }} />
                            <ListRowChevron label="Rate in App Store" onPress={() => { }} />
                            <ListRowChevron label="Terms and Privacy" onPress={() => { }} />
                        </Card>
                    </View>

                    <View className="py-3">
                        <Card>
                            <DangerButtonRow label="Log Out" onPress={handleSignout} />
                        </Card>
                    </View>

                    <FooterText>App Version 2.24 #50491</FooterText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
