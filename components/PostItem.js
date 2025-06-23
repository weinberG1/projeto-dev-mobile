import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function PostItem({ 
    post, 
    currentUserEmail, 
    onLikePress, 
    onDeletePress, 
    onAuthorPress,
    showActions = true
}) {
    const isLiked = post.likes?.includes(currentUserEmail);
    const isOwnPost = post.autor === currentUserEmail;

    return (
        <View style={styles.postCard}>
            <TouchableOpacity 
                style={styles.postHeader} 
                onPress={() => onAuthorPress && onAuthorPress(post.autor)}
            >
                <View style={styles.profileImagePlaceholder}>
                    {post.autorFoto ? (
                        <Image source={{ uri: post.autorFoto }} style={styles.profileImage} />
                    ) : (
                        <Text style={styles.profileInitial}>
                            {post.autorNome ? post.autorNome.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    )}
                </View>
                <Text style={styles.authorName}>{post.autorNome || post.autor}</Text>
            </TouchableOpacity>
            
            {post.foto && (
                <Image source={{ uri: post.foto }} style={styles.postImage} />
            )}
            
            <Text style={styles.postDescription}>{post.descricao}</Text>
            
            {post.localizacao && (
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={16} color="#888" />
                    <Text style={styles.locationText}>{post.localizacao}</Text>
                </View>
            )}
            
            {showActions && (
                <View style={styles.postFooter}>
                    <TouchableOpacity 
                        style={styles.likeButton} 
                        onPress={() => onLikePress && onLikePress(post.id)}
                    >
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isLiked ? "#e74c3c" : "#888"} 
                        />
                        <Text style={styles.likeCount}>
                            {post.likes?.length || 0}
                        </Text>
                    </TouchableOpacity>

                    {isOwnPost && (
                        <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={() => onDeletePress && onDeletePress(post.id)}
                        >
                            <Ionicons name="trash-outline" size={24} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        padding: 12
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 8
    },
    profileImagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#27428f',
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileInitial: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    authorName: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#27428f'
    },
    postImage: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 10
    },
    postDescription: {
        fontSize: 16,
        marginVertical: 10,
        paddingHorizontal: 8
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginBottom: 10
    },
    locationText: {
        fontSize: 14,
        color: '#888',
        marginLeft: 4
    },
    postFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8
    },
    likeCount: {
        marginLeft: 6,
        fontSize: 16,
        color: '#666'
    },
    deleteButton: {
        padding: 8
    }
});
