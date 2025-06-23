import { useEffect, useState } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebase';
import {
    collection,
    query,
    orderBy,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user?.email) return;
        
        loadPosts();
        
        // Configura um listener para atualizações em tempo real da coleção posts
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('timestamp', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postData);
            setLoading(false);
            setRefreshing(false);
        });
        
        return () => unsubscribe();
    }, [user?.email]);

    const loadPosts = async () => {
        try {
            setRefreshing(true);
            const postsRef = collection(db, 'posts');
            const q = query(postsRef, orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const postData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setPosts(postData);
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLikePost = async (postId) => {
        if (!user?.email) return;
        
        try {
            const postRef = doc(db, 'posts', postId);
            const post = posts.find(p => p.id === postId);
            
            if (post?.likes?.includes(user.email)) {
                // Remove o like se já curtiu
                await updateDoc(postRef, {
                    likes: arrayRemove(user.email)
                });
            } else {
                // Adiciona o like se não curtiu
                await updateDoc(postRef, {
                    likes: arrayUnion(user.email)
                });
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        Alert.alert(
            "Confirmar exclusão",
            "Tem certeza que deseja excluir esta publicação?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'posts', postId));
                            // O listener onSnapshot já vai atualizar a lista
                        } catch (error) {
                            console.error('Erro ao excluir post:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a publicação');
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleProfilePress = (email) => {
        navigation.navigate('Profile', { email });
    };

    const goToMyProfile = () => {
        navigation.navigate('Profile', { email: user.email });
    };

    const goToCreatePost = () => {
        navigation.navigate('CreatePost');
    };

    const renderItem = ({ item }) => {
        const isLiked = item.likes?.includes(user.email);
        const isOwnPost = item.autor === user.email;
        
        return (
            <View style={styles.postCard}>
                <TouchableOpacity 
                    style={styles.postHeader} 
                    onPress={() => handleProfilePress(item.autor)}
                >
                    <View style={styles.profileImagePlaceholder}>
                        {item.autorFoto ? (
                            <Image source={{ uri: item.autorFoto }} style={styles.profileImage} />
                        ) : (
                            <Text style={styles.profileInitial}>
                                {item.autorNome ? item.autorNome.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.authorName}>{item.autorNome || item.autor}</Text>
                </TouchableOpacity>
                
                {item.foto && (
                    <Image source={{ uri: item.foto }} style={styles.postImage} />
                )}
                
                <Text style={styles.postDescription}>{item.descricao}</Text>
                
                {item.localizacao && (
                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={16} color="#888" />
                        <Text style={styles.locationText}>{item.localizacao}</Text>
                    </View>
                )}
                
                <View style={styles.postFooter}>
                    <TouchableOpacity 
                        style={styles.likeButton} 
                        onPress={() => handleLikePost(item.id)}
                    >
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isLiked ? "#e74c3c" : "#888"} 
                        />
                        <Text style={styles.likeCount}>
                            {item.likes?.length || 0}
                        </Text>
                    </TouchableOpacity>

                    {isOwnPost && (
                        <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={() => handleDeletePost(item.id)}
                        >
                            <Ionicons name="trash-outline" size={24} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#27428f" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.title}>Feed de Treinos</Text>
                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={goToMyProfile}
                >
                    <Ionicons name="person-circle" size={32} color="#27428f" />
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                refreshing={refreshing}
                onRefresh={loadPosts}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum post encontrado.</Text>
                        <Text style={styles.emptySubText}>Sem treinos para exibir.</Text>
                    </View>
                }
            />

            <TouchableOpacity 
                style={styles.fabButton}
                onPress={goToCreatePost}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15,
        position: 'relative',
        paddingHorizontal: 16
    },
    profileButton: {
        position: 'absolute',
        right: 16,
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#27428f'
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20
    },
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
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666'
    },
    emptySubText: {
        fontSize: 16,
        color: '#888',
        marginTop: 8
    },
    fabButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#27428f',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3
    }
});