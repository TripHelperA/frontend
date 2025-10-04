// components/ForumPostCard.tsx
import { Ionicons } from '@expo/vector-icons';
import { Router } from 'expo-router';
import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ForumPostCardProps = {
    imageSource: ImageSourcePropType;
    title: string;
    description: string;
    reviews: number;
    rating: number;
    router: Router;
};

const ForumPostCard: React.FC<ForumPostCardProps> = ({
    imageSource,
    title,
    description,
    reviews,
    rating,
    router,
}) => {
    const handlePress = () => {
        router.push({
            pathname: 'post-detail',
            params: {
                imageSource: typeof imageSource === 'number' ? imageSource.toString() : (imageSource as any)?.uri ?? '',
                title,
                description,
                reviews: reviews.toString(),
                rating: rating.toString(),
            },
        });
    };

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={handlePress}>
            <Image source={imageSource} style={styles.image} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description} numberOfLines={2}>
                    {description}
                </Text>
                <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={star}
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={16}
                            color="#FFC107"
                            style={styles.star}
                        />
                    ))}
                    <Text style={styles.reviewsText}>{reviews} reviews</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        margin: 10,
    },
    textContainer: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    star: {
        marginRight: 2,
    },
    reviewsText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 5,
    },
});

export default ForumPostCard;
