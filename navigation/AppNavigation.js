import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "../screens/ChatScreen";
import { AuthProvider } from "../context/AuthContext";
import HomeScreen from "../screens/HomeScreen";

export default function AppNavigator () {
    const Stack = createNativeStackNavigator();

    return (
        <AuthProvider>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </AuthProvider>
        
    )
}