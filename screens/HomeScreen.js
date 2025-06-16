import { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    Modal,
    View,
    TextInput,
    Alert,
    StyleSheet
} from 'react-native';
import { DangerButton } from '../components/Buttons';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    addDoc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState([]);

    useEffect(() => {
        if (!user?.email) return;

        const q = query(
            collection(db, 'chats'),
            where('members', 'array-contains', user.email)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const userChats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setChats(userChats);
        });

        return () => unsubscribe();
    }, [user?.email]);

    const handleStartConversation = async () => {
        if (!email || !message) {
            Alert.alert('Erro', 'Preencha o e-mail e a mensagem.');
            return;
        }

        if (email.toLowerCase() === user.email.toLowerCase()) {
            Alert.alert('Erro', 'Você não pode iniciar uma conversa com você mesmo.');
            return;
        }

        const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            Alert.alert('Erro', 'Usuário não encontrado.');
            return;
        }

        const [email1, email2] = [user.email, email.toLowerCase()].sort();
        const chatKey = `${email1}_${email2}`;

        const chatQuery = query(collection(db, 'chats'), where('chatKey', '==', chatKey));
        const existingChats = await getDocs(chatQuery);

        let chatId;
        if (!existingChats.empty) {
            chatId = existingChats.docs[0].id;
        } else {
            const newChatRef = doc(collection(db, 'chats'));
            await setDoc(newChatRef, {
                members: [email1, email2],
                chatKey,
                created_at: serverTimestamp()
            });
            chatId = newChatRef.id;

            const messagesRef = collection(db, 'chats', chatId, 'messages');
            await addDoc(messagesRef, {
                from: user.email,
                text: message.trim(),
                timestamp: serverTimestamp()
            });
        }

        setIsModalVisible(false);
        setEmail('');
        setMessage('');
        navigation.navigate('Chat', { chatId });
    };

    const handleOpenChat = (chatId) => {
        navigation.navigate('Chat', { chatId });
    };

    const renderItem = ({ item }) => {
        const otherUserId = item.members.find(m => m !== user.email);

        return (
            <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenChat(item.id)}>
                <Text style={styles.chatTitle}>
                    {otherUserId || 'Usuário'}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Conversas</Text>

            <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                style={styles.startButton}>
                <Text style={styles.startButtonText}>Iniciar Conversa</Text>
            </TouchableOpacity>

            <FlatList
                data={chats}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TextInput
                            onChangeText={setEmail}
                            placeholder="E-mail do destinatário"
                            style={styles.input}
                            value={email}
                        />
                        <TextInput
                            onChangeText={setMessage}
                            multiline
                            placeholder="Digite sua mensagem..."
                            style={[styles.input, styles.messageInput]}
                            value={message}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleStartConversation} style={styles.confirmButton}>
                                <Text style={styles.buttonText}>Iniciar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Text style={{ textAlign: 'center', fontSize: 20 }}>Meu e-mail: {user && user.email}</Text>

            <View style={{ paddingHorizontal: 40 }}>
                <DangerButton
                    text="Sair da conta"
                    action={() => signOut(auth)}
                />
            </View>
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    startButton: {
        backgroundColor: '#172b4d',
        paddingVertical: 12,
        borderRadius: 10,
        marginHorizontal: 40,
        marginBottom: 20
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center'
    },
    chatItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    chatTitle: {
        fontSize: 18
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        width: '90%',
        borderRadius: 16
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12
    },
    messageInput: {
        height: 120,
        textAlignVertical: 'top'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cancelButton: {
        backgroundColor: '#888',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10
    },
    confirmButton: {
        backgroundColor: '#172b4d',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});