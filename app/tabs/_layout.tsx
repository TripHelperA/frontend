import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#020617",
                tabBarInactiveTintColor: "#475569",
                headerStyle: {
                    backgroundColor: "#9ca3af",
                },
                headerShown: false,
                headerShadowVisible: false,
                headerTintColor: "#fff",
                tabBarStyle: {
                    backgroundColor: "#f8fafc",
                },
            }}
        >

            <Tabs.Screen
                name="Home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
                }}
            />
            <Tabs.Screen
                name="Forum"
                options={{
                    title: 'Forum',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
                }}
            />

            <Tabs.Screen
                name="Settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
            <Tabs.Screen
                name="SelectLanguage"
                options={{
                    href: null,
                    title: 'SelectLanguage',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
            <Tabs.Screen
                name="EditField"
                options={{
                    href: null,
                    title: 'EditField',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
            <Tabs.Screen
                name="UpdatePassword"
                options={{
                    href: null,
                    title: 'UpdatePassword',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
            <Tabs.Screen
                name="PostDetail"
                options={{
                    href: null,
                    title: 'PostDetail',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
            <Tabs.Screen
                name="PlanATrip"
                options={{
                    href: null,
                    title: 'PostDetail',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
        </Tabs>
    );
}
