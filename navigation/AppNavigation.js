import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "../context/AuthContext.js";
import HomeScreen from "../screens/HomeScreen.js";
import ProfileScreen from "../screens/ProfileScreen.js";
import CreatePostScreen from "../screens/CreatePostScreen.js";

export default function AppNavigator () {
    const Stack = createNativeStackNavigator();

    return (
        <AuthProvider>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </AuthProvider>
        
    )
}