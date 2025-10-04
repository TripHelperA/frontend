import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import "react-native-get-random-values";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "../global.css";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: 'us-east-1_VReJmlo0E',
            userPoolClientId: '3ua19s8mb4sevgh3rtq9qsv30p',
            // identityPoolId: 'us-east-1:66fd2d45-2924-4627-841b-86b59d9123b7',
            signUpVerificationMethod: 'code',
            loginWith: { username: true, email: true },
            userAttributes: { email: { required: true } },
            allowGuestAccess: false,
        },
    },
    API: {
        GraphQL: {
            endpoint: 'https://ebhkkagrsffbbjie4hqumjwtsq.appsync-api.us-east-1.amazonaws.com/graphql',
            region: 'us-east-1',
            // AppSync is USER POOL only in your stack:
            defaultAuthMode: 'userPool',
            // no apiKey here
        },
    },
});

export default function RootLayout() {
    return (
        <GluestackUIProvider>
            <Stack initialRouteName="login" screenOptions={{ headerShown: false }} />
        </GluestackUIProvider>
    )
}
