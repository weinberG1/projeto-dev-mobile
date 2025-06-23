import { useEffect, useState } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Alert
} from 'react-native';
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
import { HomeHeader } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { PostItem } from '../components/PostItem';

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

    return (
        <ScreenContainer loading={loading}>
            <HomeHeader 
                title="Feed de Treinos" 
                onProfilePress={goToMyProfile}
            />
            
            <FlatList
                data={posts}
                renderItem={({ item }) => (
                    <PostItem
                        post={item}
                        currentUserEmail={user?.email}
                        onLikePress={handleLikePost}
                        onDeletePress={handleDeletePost}
                        onAuthorPress={handleProfilePress}
                    />
                )}
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20
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