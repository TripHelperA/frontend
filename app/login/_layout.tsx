import { Stack } from "expo-router";

export default function LoginLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                animation: "fade_from_bottom",
            }}
        >
            <Stack.Screen
                name="WelcomeScreen"
            />
            <Stack.Screen
                name="Login"
            />
            <Stack.Screen
                name="Register"
            />
            <Stack.Screen
                name="ForgotPassword"
            />
        </Stack>
    );
}
