import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export function Header({ title, showBackButton = true }) {
    const navigation = useNavigation();
    
    return (
        <View style={styles.header}>
            {showBackButton && (
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#27428f" />
                </TouchableOpacity>
            )}
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

export function HomeHeader({ title, onProfilePress }) {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity 
                style={styles.profileButton}
                onPress={onProfilePress}
            >
                <Ionicons name="person-circle" size={32} color="#27428f" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        position: 'relative',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 15,
        padding: 5,
        zIndex: 10
    },
    profileButton: {
        position: 'absolute',
        right: 16,
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        color: '#27428f'
    }
}); 