import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";

const generateSignedUrlMutation = /* GraphQL */ `
  mutation GenerateSignedUrl($type: String!, $id: ID!, $mode: String!) {
    generateSignedUrl(type: $type, id: $id, mode: $mode) {
      url
      key
    }
  }
`;

export default function ProfileImage() {
    const client = generateClient();
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadImage = async () => {
            const user = await getCurrentUser();
            const userId = user.userId;

            const { data } = await client.graphql({
                query: generateSignedUrlMutation,
                variables: { type: "user", id: userId, mode: "view" },
            });
            setUrl(data.generateSignedUrl.url);
        };

        loadImage();
    }, []);

    if (!url) return <ActivityIndicator />;

    return (
        <View style={{ alignItems: "center" }}>
            <Image
                source={{ uri: url }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
            />
        </View>
    );
}
